import { Prisma } from '@prisma/client';
import prisma from '../config/database.js';
import { generatePaymentReference } from '../utils/numberGenerator.js';
import {
  isRazorpayConfigured,
  createRazorpayOrder,
  verifyPaymentSignature,
  createRazorpayRefund,
} from './razorpayService.js';
import { sendPaymentReceiptEmail, sendPaymentFailedEmail } from './emailService.js';

/**
 * Records a manual payment (Cash, Bank Transfer, UPI, Cheque)
 */
export async function recordManualPayment({
  invoiceId,
  amount,
  method,
  transactionId,
  paymentDate,
  notes,
  userId,
}) {
  if (!invoiceId) {
    throw new Error('Invoice ID is required.');
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { customer: true },
  });

  if (!invoice) {
    throw new Error('Invoice not found.');
  }

  if (invoice.status === 'VOID') {
    throw new Error('Cannot record payments against a VOID invoice.');
  }

  if (invoice.status === 'PAID' || Number(invoice.amountDue) <= 0) {
    throw new Error('Invoice is already fully paid.');
  }

  const paymentDecimal = new Prisma.Decimal(amount);
  if (paymentDecimal.lessThanOrEqualTo(0)) {
    throw new Error('Payment amount must be greater than zero.');
  }

  if (paymentDecimal.greaterThan(invoice.amountDue)) {
    throw new Error(
      `Payment amount (₹${paymentDecimal}) exceeds outstanding balance (₹${invoice.amountDue}).`
    );
  }

  // Prevent duplicate external transaction reference
  if (transactionId && transactionId.trim()) {
    const existingTx = await prisma.payment.findUnique({
      where: { transactionId: transactionId.trim() },
    });
    if (existingTx) {
      throw new Error(`A payment with transaction reference "${transactionId}" has already been recorded.`);
    }
  }

  const paymentReference = await generatePaymentReference();
  const dateOfPayment = paymentDate ? new Date(paymentDate) : new Date();

  // Run in transaction with extended timeout
  const result = await prisma.$transaction(
    async (tx) => {
      // 1. Create Payment record
      const payment = await tx.payment.create({
        data: {
          paymentReference,
          invoiceId: invoice.id,
          customerId: invoice.customerId,
          amount: paymentDecimal,
          currency: invoice.currency || 'INR',
          method: method || 'BANK_TRANSFER',
          status: 'SUCCESSFUL',
          transactionId: transactionId ? transactionId.trim() : null,
          paymentDate: dateOfPayment,
          notes: notes ? notes.trim() : null,
          recordedById: userId || null,
        },
      });

      // 2. Compute new balances
      const updatedAmountPaid = invoice.amountPaid.add(paymentDecimal);
      const updatedAmountDue = invoice.totalAmount.sub(updatedAmountPaid);
      const isFullyPaid = updatedAmountDue.lessThanOrEqualTo(0);

      const updatedInvoice = await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          amountPaid: updatedAmountPaid,
          amountDue: Prisma.Decimal.max(new Prisma.Decimal(0), updatedAmountDue),
          status: isFullyPaid ? 'PAID' : 'PARTIALLY_PAID',
          paidAt: isFullyPaid ? new Date() : null,
        },
        include: { customer: true },
      });

      return { payment, invoice: updatedInvoice };
    },
    {
      maxWait: 10000,
      timeout: 30000,
    }
  );

  // Send receipt email
  try {
    await sendPaymentReceiptEmail({
      payment: result.payment,
      invoice: result.invoice,
      customer: invoice.customer,
    });
  } catch (err) {
    console.error('Failed to send payment receipt email:', err.message);
  }

  return result;
}

/**
 * Initiates Razorpay checkout by creating an order and pending payment record
 */
export async function initiateRazorpayPayment({ invoiceId, customerId, customerEmail }) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { customer: true },
  });

  if (!invoice) {
    throw new Error('Invoice not found.');
  }

  if (customerId && invoice.customerId !== customerId) {
    throw new Error('Unauthorized to pay this invoice.');
  }

  if (invoice.status === 'VOID') {
    throw new Error('This invoice is voided and cannot accept payment.');
  }

  if (invoice.status === 'PAID' || Number(invoice.amountDue) <= 0) {
    throw new Error('This invoice is already fully paid.');
  }

  if (!isRazorpayConfigured()) {
    throw new Error('Razorpay online payment gateway is currently unconfigured. Please contact support or pay via bank transfer.');
  }

  // Create order via Razorpay SDK with the server-calculated outstanding balance
  const order = await createRazorpayOrder({
    amount: invoice.amountDue,
    invoiceNumber: invoice.invoiceNumber,
    currency: invoice.currency || 'INR',
  });

  const paymentReference = await generatePaymentReference();

  // Create PENDING payment
  const payment = await prisma.payment.create({
    data: {
      paymentReference,
      invoiceId: invoice.id,
      customerId: invoice.customerId,
      amount: invoice.amountDue,
      currency: invoice.currency || 'INR',
      method: 'RAZORPAY',
      status: 'PENDING',
      gatewayOrderId: order.id,
      notes: `Razorpay online checkout order initiated for ${invoice.invoiceNumber}.`,
    },
  });

  return {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
    invoiceNumber: invoice.invoiceNumber,
    paymentReference: payment.paymentReference,
    customer: {
      name: invoice.customer?.contactPerson,
      email: invoice.customer?.email,
      contact: invoice.customer?.phone || '',
    },
  };
}

/**
 * Verifies Razorpay payment signature and marks invoice paid/partially paid
 */
export async function verifyAndApplyRazorpayPayment({
  invoiceId,
  gatewayOrderId,
  gatewayPaymentId,
  gatewaySignature,
  customerId,
}) {
  if (!gatewayOrderId || !gatewayPaymentId || !gatewaySignature) {
    throw new Error('Missing payment verification parameters from checkout.');
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { customer: true },
  });

  if (!invoice) {
    throw new Error('Invoice not found.');
  }

  if (customerId && invoice.customerId !== customerId) {
    throw new Error('Unauthorized.');
  }

  // Verify HMAC signature
  const isValid = verifyPaymentSignature({
    orderId: gatewayOrderId,
    paymentId: gatewayPaymentId,
    signature: gatewaySignature,
  });

  if (!isValid) {
    // Record failure
    await prisma.payment.updateMany({
      where: { gatewayOrderId },
      data: {
        status: 'FAILED',
        failureReason: 'Cryptographic signature verification failed.',
      },
    });
    throw new Error('Invalid payment signature. Payment could not be verified.');
  }

  // Find the pending payment record
  const pendingPayment = await prisma.payment.findFirst({
    where: { gatewayOrderId },
  });

  if (!pendingPayment) {
    throw new Error('Pending payment record for this gateway order not found.');
  }

  if (pendingPayment.status === 'SUCCESSFUL') {
    // Idempotent: already processed
    return { payment: pendingPayment, invoice };
  }

  // Atomic application of payment
  const result = await prisma.$transaction(
    async (tx) => {
      // 1. Mark Payment SUCCESSFUL
      const payment = await tx.payment.update({
        where: { id: pendingPayment.id },
        data: {
          status: 'SUCCESSFUL',
          gatewayPaymentId,
          gatewaySignature,
          paymentDate: new Date(),
          notes: `Verified Razorpay payment ID: ${gatewayPaymentId}`,
        },
      });

      // 2. Update Invoice
      const updatedAmountPaid = invoice.amountPaid.add(payment.amount);
      const updatedAmountDue = invoice.totalAmount.sub(updatedAmountPaid);
      const isFullyPaid = updatedAmountDue.lessThanOrEqualTo(0);

      const updatedInvoice = await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          amountPaid: updatedAmountPaid,
          amountDue: Prisma.Decimal.max(new Prisma.Decimal(0), updatedAmountDue),
          status: isFullyPaid ? 'PAID' : 'PARTIALLY_PAID',
          paidAt: isFullyPaid ? new Date() : null,
        },
        include: { customer: true },
      });

      return { payment, invoice: updatedInvoice };
    },
    {
      maxWait: 10000,
      timeout: 30000,
    }
  );

  try {
    await sendPaymentReceiptEmail({
      payment: result.payment,
      invoice: result.invoice,
      customer: invoice.customer,
    });
  } catch (err) {
    console.error('Failed to send receipt email:', err.message);
  }

  return result;
}

/**
 * Records an offline or gateway refund
 */
export async function processRefund({ paymentId, amount, reason, userId, isGateway = false }) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { invoice: true, refunds: true },
  });

  if (!payment) {
    throw new Error('Payment record not found.');
  }

  if (payment.status !== 'SUCCESSFUL') {
    throw new Error('Only successful payments can be refunded.');
  }

  const refundDecimal = new Prisma.Decimal(amount);
  if (refundDecimal.lessThanOrEqualTo(0)) {
    throw new Error('Refund amount must be greater than zero.');
  }

  // Calculate existing refunded amount
  const existingRefundTotal = payment.refunds
    .filter((r) => r.status === 'PROCESSED')
    .reduce((sum, r) => sum.add(r.amount), new Prisma.Decimal(0));

  const maxRefundable = payment.amount.sub(existingRefundTotal);

  if (refundDecimal.greaterThan(maxRefundable)) {
    throw new Error(
      `Requested refund (₹${refundDecimal}) exceeds maximum refundable amount (₹${maxRefundable}).`
    );
  }

  let gatewayRefundId = null;

  // Process through Razorpay if online payment
  if (isGateway && payment.method === 'RAZORPAY' && payment.gatewayPaymentId) {
    const razorpayRefund = await createRazorpayRefund({
      paymentId: payment.gatewayPaymentId,
      amount: refundDecimal,
      notes: { reason: reason || 'Customer refund' },
    });
    gatewayRefundId = razorpayRefund.id;
  }

  // Atomic update
  const refundRecord = await prisma.$transaction(
    async (tx) => {
      const refund = await tx.paymentRefund.create({
        data: {
          paymentId: payment.id,
          amount: refundDecimal,
          reason: reason ? reason.trim() : null,
          status: 'PROCESSED',
          gatewayRefundId,
          processedAt: new Date(),
          createdById: userId || null,
        },
      });

      // Adjust invoice balances
      const updatedAmountPaid = payment.invoice.amountPaid.sub(refundDecimal);
      const updatedAmountDue = payment.invoice.totalAmount.sub(updatedAmountPaid);

      const isFullyRefunded = updatedAmountPaid.lessThanOrEqualTo(0);

      await tx.invoice.update({
        where: { id: payment.invoiceId },
        data: {
          amountPaid: Prisma.Decimal.max(new Prisma.Decimal(0), updatedAmountPaid),
          amountDue: updatedAmountDue,
          status: isFullyRefunded ? 'REFUNDED' : 'PARTIALLY_PAID',
        },
      });

      // Update payment status
      const totalRefundedNow = existingRefundTotal.add(refundDecimal);
      const isPaymentFullyRefunded = totalRefundedNow.greaterThanOrEqualTo(payment.amount);

      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: isPaymentFullyRefunded ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
        },
      });

      return refund;
    },
    {
      maxWait: 10000,
      timeout: 30000,
    }
  );

  return refundRecord;
}

