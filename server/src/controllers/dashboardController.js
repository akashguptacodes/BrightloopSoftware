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

