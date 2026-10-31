import prisma from '../config/prisma.js';
import {
  recordManualPayment,
  initiateRazorpayPayment,
  verifyAndApplyRazorpayPayment,
  processRefund,
} from '../services/paymentService.js';

/**
 * List all payments with search, filters, and pagination
 */
export async function getPayments(req, res, next) {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      paymentMethod,
      invoiceId,
      customerId,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where = {};

    if (status) {
      where.status = status;
    }

    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }

    if (invoiceId) {
      where.invoiceId = invoiceId;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (startDate || endDate) {
      where.paymentDate = {};
      if (startDate) where.paymentDate.gte = new Date(startDate);
      if (endDate) where.paymentDate.lte = new Date(endDate);
    }

    if (search && search.trim()) {
      const query = search.trim();
      where.OR = [
        { paymentNumber: { contains: query, mode: 'insensitive' } },
        { paymentReference: { contains: query, mode: 'insensitive' } },
        { invoice: { invoiceNumber: { contains: query, mode: 'insensitive' } } },
        { customer: { name: { contains: query, mode: 'insensitive' } } },
        { customer: { companyName: { contains: query, mode: 'insensitive' } } },
      ];
    }

    // Execute sequentially for Neon DB connection stability
    const total = await prisma.payment.count({ where });
    const payments = await prisma.payment.findMany({
      where,
      skip,
      take,
      orderBy: { [sortBy]: sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc' },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            companyName: true,
            customerCode: true,
          },
        },
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            grandTotal: true,
            amountPaid: true,
            amountDue: true,
            status: true,
          },
        },
        recordedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: { refunds: true },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: payments,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get single payment details with full breakdown and refunds
 */
export async function getPaymentById(req, res, next) {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        customer: true,
        invoice: {
          include: {
            subscription: {
              select: {
                id: true,
                subscriptionNumber: true,
                status: true,
              },
            },
          },
        },
        recordedBy: {
          select: { id: true, name: true, email: true, role: true },
        },
        refunds: {
          orderBy: { createdAt: 'desc' },
          include: {
            processedBy: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Record a manual offline payment (Cash, Bank Transfer, Cheque, UPI, etc.)
 */
export async function recordManualPaymentHandler(req, res, next) {
  try {
    const { invoiceId, amount, paymentMethod, paymentReference, paymentDate, notes } = req.body;

    if (!invoiceId) {
      return res.status(400).json({ success: false, message: 'Invoice ID is required' });
    }

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Payment amount must be greater than zero' });
    }

    if (!paymentMethod) {
      return res.status(400).json({ success: false, message: 'Payment method is required' });
    }

    const payment = await recordManualPayment(
      {
        invoiceId,
        amount,
        paymentMethod,
        paymentReference,
        paymentDate,
        notes,
      },
      req.user.id
    );

    return res.status(201).json({
      success: true,
      message: `Payment of ₹${payment.amount} recorded successfully`,
      data: payment,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Initiate Razorpay checkout order
 */
export async function initiateRazorpayOrderHandler(req, res, next) {
  try {
    const { invoiceId } = req.body;

    if (!invoiceId) {
      return res.status(400).json({ success: false, message: 'Invoice ID is required' });
    }

    const orderData = await initiateRazorpayPayment(invoiceId);

    return res.status(200).json({
      success: true,
      message: 'Razorpay order created',
      data: orderData,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Verify Razorpay payment signature and apply to invoice
 */
export async function verifyRazorpayPaymentHandler(req, res, next) {
  try {
    const { invoiceId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!invoiceId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required Razorpay payment verification parameters',
      });
    }

    const payment = await verifyAndApplyRazorpayPayment({
      invoiceId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    return res.status(200).json({
      success: true,
      message: 'Payment verified and applied successfully',
      data: payment,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Process a refund on a payment
 */
export async function refundPaymentHandler(req, res, next) {
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Refund amount must be greater than zero' });
    }

    const refund = await processRefund(id, { amount, reason }, req.user.id);

    return res.status(200).json({
      success: true,
      message: `Refund of ₹${refund.amount} processed successfully`,
      data: refund,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all payments for a specific invoice
 */
export async function getInvoicePayments(req, res, next) {
  try {
    const { invoiceId } = req.params;

    const payments = await prisma.payment.findMany({
      where: { invoiceId },
      orderBy: { createdAt: 'desc' },
      include: {
        recordedBy: { select: { id: true, name: true, email: true } },
        refunds: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
}

