import prisma from '../config/prisma.js';
import { runRecurringBillingJob, updateOverdueInvoices } from '../services/billingService.js';

/**
 * Manually trigger recurring billing job
 */
export async function triggerRecurringBilling(req, res, next) {
  try {
    const results = await runRecurringBillingJob();

    return res.status(200).json({
      success: true,
      message: `Recurring billing completed: ${results.generated} generated, ${results.skipped} skipped, ${results.failed} failed.`,
      data: results,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Manually trigger overdue invoice scanner
 */
export async function triggerOverdueCheck(req, res, next) {
  try {
    const results = await updateOverdueInvoices();

    return res.status(200).json({
      success: true,
      message: `Overdue check completed: ${results.totalMarkedOverdue} invoices marked OVERDUE.`,
      data: results,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get billing scheduler status & diagnostics
 */
export async function getBillingStatus(req, res, next) {
  try {
    const now = new Date();

    // Run sequential counts for Neon DB safety
    const activeSubscriptions = await prisma.subscription.count({
      where: { status: 'ACTIVE' },
    });

    const dueSubscriptions = await prisma.subscription.count({
      where: {
        status: 'ACTIVE',
        nextBillingDate: { lte: now },
      },
    });

    const pendingDraftInvoices = await prisma.invoice.count({
      where: { status: 'DRAFT' },
    });

    const issuedInvoices = await prisma.invoice.count({
      where: { status: 'ISSUED' },
    });

    const overdueInvoices = await prisma.invoice.count({
      where: { status: 'OVERDUE' },
    });

    const paidInvoices = await prisma.invoice.count({
      where: { status: 'PAID' },
    });

    // Recent recurring invoices
    const recentInvoices = await prisma.invoice.findMany({
      where: { isRecurring: true },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { name: true, companyName: true } },
        subscription: { select: { subscriptionNumber: true } },
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        scheduler: {
          recurringCron: '5 0 * * * (00:05 AM Daily)',
          overdueCron: '0 1 * * * (01:00 AM Daily)',
          status: 'RUNNING',
          serverTime: now.toISOString(),
        },
        counts: {
          activeSubscriptions,
          dueSubscriptions,
          pendingDraftInvoices,
          issuedInvoices,
          overdueInvoices,
          paidInvoices,
        },
        recentRecurringInvoices: recentInvoices,
      },
    });
  } catch (error) {
    next(error);
  }
}

