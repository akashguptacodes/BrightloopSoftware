import { Prisma } from '@prisma/client';
import prisma from '../config/database.js';
import { calculateBillingPeriod } from '../utils/billingDateCalculator.js';
import { generateInvoiceNumber } from '../utils/numberGenerator.js';
import { calculateInvoiceItems } from './invoiceService.js';
import { sendInvoiceIssuedEmail, sendInvoiceOverdueEmail } from './emailService.js';

/**
 * Generates a recurring invoice for a single eligible active subscription
 */
export async function generateRecurringInvoiceForSubscription(subscription, referenceDate = new Date()) {
  const frequency = subscription.billingFrequencySnapshot || 'MONTHLY';
  const interval = subscription.billingIntervalSnapshot || 1;

  // Determine billing period based on current anchor date
  const periodStart = subscription.nextBillingDate || referenceDate;
  const { billingPeriodStart, billingPeriodEnd, nextBillingDate } = calculateBillingPeriod(
    frequency,
    interval,
    periodStart
  );

  // Idempotency check: Ensure invoice has not already been created for this exact subscription and cycle
  const existingInvoice = await prisma.invoice.findFirst({
    where: {
      subscriptionId: subscription.id,
      billingPeriodStart,
      billingPeriodEnd,
    },
  });

  if (existingInvoice) {
    return { skipped: true, reason: 'Invoice already exists for this billing period', invoice: existingInvoice };
  }

  // Build items from subscription snapshot items
  const itemsToQuote = subscription.items.map((si) => ({
    subscriptionItemId: si.id,
    productNameSnapshot: si.productNameSnapshot,
    variantNameSnapshot: si.variantNameSnapshot,
    planNameSnapshot: si.planNameSnapshot,
    quantity: si.quantity,
    unitPrice: si.unitPrice,
    discountAmount: si.discountAmount,
    taxRateSnapshot: si.taxRateSnapshot,
    taxAmount: si.taxAmount,
    lineSubtotal: si.lineSubtotal,
    lineTotal: si.lineTotal,
  }));

  const calculation = await calculateInvoiceItems(itemsToQuote);
  const invoiceNumber = await generateInvoiceNumber();

  // Due date: default 15 days from issue or billingPeriodEnd
  const dueDate = new Date(referenceDate);
  dueDate.setDate(dueDate.getDate() + 15);

  // Run in transaction with extended timeout for Neon cloud safety
  const invoice = await prisma.$transaction(
    async (tx) => {
      // 1. Create Invoice & Items
      const inv = await tx.invoice.create({
        data: {
          invoiceNumber,
          customerId: subscription.customerId,
          subscriptionId: subscription.id,
          status: 'ISSUED',
          issueDate: new Date(),
          dueDate,
          billingPeriodStart,
          billingPeriodEnd,
          subtotal: calculation.totals.subtotal,
          discountTotal: calculation.totals.discountTotal,
          taxTotal: calculation.totals.taxTotal,
          totalAmount: calculation.totals.totalAmount,
          amountPaid: new Prisma.Decimal(0),
          amountDue: calculation.totals.amountDue,
          currency: 'INR',
          notes: `Automated recurring invoice for cycle ${billingPeriodStart.toISOString().split('T')[0]} to ${billingPeriodEnd.toISOString().split('T')[0]}.`,
          termsAndConditions: subscription.paymentTerms || null,
          items: {
            create: calculation.validatedItems,
          },
        },
        include: {
          customer: true,
          subscription: true,
          items: true,
        },
      });

      // 2. Advance Subscription nextBillingDate
      await tx.subscription.update({
        where: { id: subscription.id },
        data: {
          nextBillingDate,
        },
      });

      // 3. Log History
      await tx.subscriptionHistory.create({
        data: {
          subscriptionId: subscription.id,
          action: 'INVOICE_GENERATED',
          previousStatus: subscription.status,
          newStatus: subscription.status,
          description: `Generated recurring invoice ${invoiceNumber} for period ending ${billingPeriodEnd.toISOString().split('T')[0]}. Next billing date set to ${nextBillingDate.toISOString().split('T')[0]}.`,
        },
      });

      return inv;
    },
    {
      maxWait: 15000,
      timeout: 30000,
    }
  );

  // Send email notification safely outside transaction
  try {
    await sendInvoiceIssuedEmail({ invoice, customer: invoice.customer });
  } catch (err) {
    console.error(`Failed to send invoice email for ${invoice.invoiceNumber}:`, err.message);
  }

  return { success: true, invoice };
}

/**
 * Scans all due active subscriptions and generates recurring invoices
 */
export async function runRecurringBillingJob(referenceDate = new Date()) {
  const now = new Date(referenceDate);

  // Find active subscriptions whose nextBillingDate is due (or past due)
  const eligibleSubscriptions = await prisma.subscription.findMany({
    where: {
      status: 'ACTIVE',
      nextBillingDate: {
        lte: now,
      },
    },
    include: {
      items: true,
      customer: true,
      plan: true,
    },
    orderBy: { nextBillingDate: 'asc' },
  });

  const results = {
    checked: eligibleSubscriptions.length,
    generated: 0,
    skipped: 0,
    failed: 0,
    invoices: [],
    errors: [],
  };

  // Process sequentially to protect database pooler connections
  for (const sub of eligibleSubscriptions) {
    try {
      if (!sub.items || sub.items.length === 0) {
        results.skipped++;
        results.errors.push({
          subscriptionNumber: sub.subscriptionNumber,
          error: 'Subscription has no line items',
        });
        continue;
      }

      const res = await generateRecurringInvoiceForSubscription(sub, now);
      if (res.skipped) {
        results.skipped++;
      } else if (res.success) {
        results.generated++;
        results.invoices.push({
          invoiceNumber: res.invoice.invoiceNumber,
          subscriptionNumber: sub.subscriptionNumber,
          customer: sub.customer?.contactPerson,
          totalAmount: res.invoice.totalAmount,
        });
      }
    } catch (err) {
      results.failed++;
      results.errors.push({
        subscriptionNumber: sub.subscriptionNumber,
        error: err.message,
      });
    }
  }

  return results;
}

/**
 * Checks for unpaid invoices past their due date and marks them OVERDUE
 */
export async function updateOverdueInvoices(referenceDate = new Date()) {
  const now = new Date(referenceDate);

  const overdueInvoices = await prisma.invoice.findMany({
    where: {
      status: { in: ['ISSUED', 'PARTIALLY_PAID'] },
      dueDate: { lt: now },
      amountDue: { gt: 0 },
    },
    include: { customer: true },
  });

  const updatedInvoices = [];

  for (const inv of overdueInvoices) {
    try {
      const updated = await prisma.invoice.update({
        where: { id: inv.id },
        data: { status: 'OVERDUE' },
      });
      updatedInvoices.push(updated);

      // Safe notification
      try {
        await sendInvoiceOverdueEmail({ invoice: inv, customer: inv.customer });
      } catch (err) {
        // silent email log
      }
    } catch (err) {
      console.error(`Failed to mark invoice ${inv.invoiceNumber} overdue:`, err.message);
    }
  }

  return {
    totalChecked: overdueInvoices.length,
    totalMarkedOverdue: updatedInvoices.length,
  };
}

