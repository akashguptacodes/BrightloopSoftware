import prisma from '../config/database.js';

/**
 * @desc    Get dashboard metrics & summary counts (ADMIN & STAFF)
 * @route   GET /api/dashboard/stats
 */
export async function getDashboardStats(req, res, next) {
  try {
    const staffCount = await prisma.user.count({ where: { role: 'STAFF' } });
    const customerCount = await prisma.user.count({ where: { role: 'CUSTOMER' } });
    const totalProducts = await prisma.product.count();
    const activeProducts = await prisma.product.count({ where: { isActive: true } });
    const totalPlans = await prisma.subscriptionPlan.count();
    const activePlans = await prisma.subscriptionPlan.count({ where: { isActive: true } });
    const totalTaxes = await prisma.tax.count();
    const activeTaxes = await prisma.tax.count({ where: { isActive: true } });
    const totalDiscounts = await prisma.discount.count();
    const activeDiscounts = await prisma.discount.count({ where: { isActive: true } });

    // Sprint 3: Customers, Quotations & Subscriptions counts
    const totalCustomers = await prisma.customer.count();
    const activeCustomers = await prisma.customer.count({ where: { isActive: true } });

    const totalQuotations = await prisma.quotation.count();
    const draftQuotations = await prisma.quotation.count({ where: { status: 'DRAFT' } });
    const sentQuotations = await prisma.quotation.count({ where: { status: 'SENT' } });
    const acceptedQuotations = await prisma.quotation.count({ where: { status: 'ACCEPTED' } });
    const convertedQuotations = await prisma.quotation.count({ where: { status: 'CONVERTED' } });

    const totalSubscriptions = await prisma.subscription.count();
    const activeSubscriptions = await prisma.subscription.count({ where: { status: 'ACTIVE' } });
    const pausedSubscriptions = await prisma.subscription.count({ where: { status: 'PAUSED' } });
    const cancelledSubscriptions = await prisma.subscription.count({ where: { status: 'CANCELLED' } });

    // Sprint 4: Invoices & Payments counts
    const totalInvoices = await prisma.invoice.count();
    const draftInvoices = await prisma.invoice.count({ where: { status: 'DRAFT' } });
    const issuedInvoices = await prisma.invoice.count({ where: { status: 'ISSUED' } });
    const paidInvoices = await prisma.invoice.count({ where: { status: 'PAID' } });
    const overdueInvoices = await prisma.invoice.count({ where: { status: 'OVERDUE' } });

    const totalPayments = await prisma.payment.count();
    const successfulPayments = await prisma.payment.findMany({
      where: { status: 'SUCCESSFUL' },
      select: { amount: true },
    });
    const totalCollected = successfulPayments.reduce(
      (acc, p) => acc + Number(p.amount),
      0
    );

    return res.status(200).json({
      success: true,
      message: 'Dashboard stats retrieved successfully.',
      data: {
        users: {
          staffCount,
          customerCount,
        },
        customers: {
          total: totalCustomers,
          active: activeCustomers,
        },
        products: {
          total: totalProducts,
          active: activeProducts,
        },
        plans: {
          total: totalPlans,
          active: activePlans,
        },
        quotations: {
          total: totalQuotations,
          draft: draftQuotations,
          sent: sentQuotations,
          accepted: acceptedQuotations,
          converted: convertedQuotations,
        },
        subscriptions: {
          total: totalSubscriptions,
          active: activeSubscriptions,
          paused: pausedSubscriptions,
          cancelled: cancelledSubscriptions,
        },
        invoices: {
          total: totalInvoices,
          draft: draftInvoices,
          issued: issuedInvoices,
          paid: paidInvoices,
          overdue: overdueInvoices,
        },
        payments: {
          total: totalPayments,
          totalCollected,
        },
        taxes: {
          total: totalTaxes,
          active: activeTaxes,
        },
        discounts: {
          total: totalDiscounts,
          active: activeDiscounts,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

