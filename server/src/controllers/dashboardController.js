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

    return res.status(200).json({
      success: true,
      message: 'Dashboard stats retrieved successfully.',
      data: {
        users: {
          staffCount,
          customerCount,
        },
        products: {
          total: totalProducts,
          active: activeProducts,
        },
        plans: {
          total: totalPlans,
          active: activePlans,
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

