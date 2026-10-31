import prisma from '../config/database.js';

/**
 * @desc    Get complete Admin dashboard metrics, charts, and activities
 * @route   GET /api/dashboard/stats
 */
export async function getDashboardStats(req, res, next) {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    // Sequential queries for Neon DB connection stability
    const staffCount = await prisma.user.count({ where: { role: 'STAFF' } });
    const customerCount = await prisma.user.count({ where: { role: 'CUSTOMER' } });

    // Customer Metrics
    const totalCustomers = await prisma.customer.count();
    const activeCustomers = await prisma.customer.count({ where: { isActive: true } });
    const newCustomersThisMonth = await prisma.customer.count({
      where: { createdAt: { gte: startOfMonth } },
    });

    // Product & Plan Metrics
    const totalProducts = await prisma.product.count();
    const activeProducts = await prisma.product.count({ where: { isActive: true } });
    const totalPlans = await prisma.subscriptionPlan.count();
    const activePlans = await prisma.subscriptionPlan.count({ where: { isActive: true } });
    const totalTaxes = await prisma.tax.count();
    const activeTaxes = await prisma.tax.count({ where: { isActive: true } });
    const totalDiscounts = await prisma.discount.count();
    const activeDiscounts = await prisma.discount.count({ where: { isActive: true } });

    // Quotations
    const totalQuotations = await prisma.quotation.count();
    const draftQuotations = await prisma.quotation.count({ where: { status: 'DRAFT' } });
    const sentQuotations = await prisma.quotation.count({ where: { status: 'SENT' } });
    const acceptedQuotations = await prisma.quotation.count({ where: { status: 'ACCEPTED' } });
    const convertedQuotations = await prisma.quotation.count({ where: { status: 'CONVERTED' } });

    // Subscriptions
    const totalSubscriptions = await prisma.subscription.count();
    const activeSubscriptions = await prisma.subscription.count({ where: { status: 'ACTIVE' } });
    const pausedSubscriptions = await prisma.subscription.count({ where: { status: 'PAUSED' } });
    const cancelledSubscriptions = await prisma.subscription.count({ where: { status: 'CANCELLED' } });
    const closedSubscriptions = await prisma.subscription.count({ where: { status: 'CLOSED' } });
    const expiringSoonSubscriptions = await prisma.subscription.count({
      where: {
        status: 'ACTIVE',
        nextBillingDate: {
          gte: now,
          lte: sevenDaysFromNow,
        },
      },
    });

    // Invoices & Receivables
    const allInvoices = await prisma.invoice.findMany({
      select: {
        status: true,
        totalAmount: true,
        amountPaid: true,
        amountDue: true,
      },
    });

    let pendingInvoiceAmount = 0;
    let overdueInvoiceAmount = 0;
    let totalOutstandingAmount = 0;
    let draftInvoices = 0;
    let issuedInvoices = 0;
    let paidInvoices = 0;
    let overdueInvoices = 0;

    allInvoices.forEach((inv) => {
      const due = Number(inv.amountDue);
      if (inv.status === 'DRAFT') draftInvoices += 1;
      if (inv.status === 'ISSUED' || inv.status === 'PARTIALLY_PAID') {
        issuedInvoices += 1;
        pendingInvoiceAmount += due;
        totalOutstandingAmount += due;
      }
      if (inv.status === 'PAID') paidInvoices += 1;
      if (inv.status === 'OVERDUE') {
        overdueInvoices += 1;
        overdueInvoiceAmount += due;
        totalOutstandingAmount += due;
      }
    });

    // Payments & Revenue
    const successfulPayments = await prisma.payment.findMany({
      where: { status: 'SUCCESSFUL' },
      select: { amount: true, paymentDate: true },
      orderBy: { paymentDate: 'asc' },
    });

    const refunds = await prisma.paymentRefund.findMany({
      where: { status: 'PROCESSED' },
      select: { amount: true, createdAt: true },
    });

    const totalCollected = successfulPayments.reduce((acc, p) => acc + Number(p.amount), 0);
    const totalRefunded = refunds.reduce((acc, r) => acc + Number(r.amount), 0);
    const netRevenue = Math.max(0, totalCollected - totalRefunded);

    const revenueThisMonth = successfulPayments
      .filter((p) => p.paymentDate && new Date(p.paymentDate) >= startOfMonth)
      .reduce((acc, p) => acc + Number(p.amount), 0);

    // Monthly Revenue Trends for Last 12 Months
    const monthlyTrendsMap = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyTrendsMap[key] = {
        month: key,
        grossRevenue: 0,
        refunds: 0,
        netRevenue: 0,
      };
    }

    successfulPayments.forEach((p) => {
      const d = new Date(p.paymentDate || now);
      const key = d.toLocaleString('default', { month: 'short', year: 'numeric' });
      if (monthlyTrendsMap[key]) {
        monthlyTrendsMap[key].grossRevenue += Number(p.amount);
      }
    });

    refunds.forEach((r) => {
      const d = new Date(r.createdAt || now);
      const key = d.toLocaleString('default', { month: 'short', year: 'numeric' });
      if (monthlyTrendsMap[key]) {
        monthlyTrendsMap[key].refunds += Number(r.amount);
      }
    });

    const revenueChart = Object.values(monthlyTrendsMap).map((m) => ({
      ...m,
      grossRevenue: Number(m.grossRevenue.toFixed(2)),
      refunds: Number(m.refunds.toFixed(2)),
      netRevenue: Number(Math.max(0, m.grossRevenue - m.refunds).toFixed(2)),
    }));

    // Subscription Status Distribution
    const subscriptionDistribution = [
      { name: 'Active', value: activeSubscriptions, color: '#10B981' },
      { name: 'Paused', value: pausedSubscriptions, color: '#F59E0B' },
      { name: 'Cancelled', value: cancelledSubscriptions, color: '#EF4444' },
      { name: 'Closed', value: closedSubscriptions, color: '#64748B' },
    ];

    // Recent Activities
    const recentActivities = await prisma.activityLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { companyName: true, contactPerson: true } },
        user: { select: { name: true, role: true } },
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Admin dashboard statistics retrieved successfully.',
      data: {
        customers: {
          total: totalCustomers,
          active: activeCustomers,
          newThisMonth: newCustomersThisMonth,
        },
        products: {
          total: totalProducts,
          active: activeProducts,
          totalPlans,
          activePlans,
        },
        subscriptions: {
          total: totalSubscriptions,
          active: activeSubscriptions,
          paused: pausedSubscriptions,
          cancelled: cancelledSubscriptions,
          closed: closedSubscriptions,
          expiringSoon: expiringSoonSubscriptions,
        },
        financials: {
          totalRevenue: Number(totalCollected.toFixed(2)),
          totalRefunded: Number(totalRefunded.toFixed(2)),
          netRevenue: Number(netRevenue.toFixed(2)),
          revenueThisMonth: Number(revenueThisMonth.toFixed(2)),
          pendingInvoiceAmount: Number(pendingInvoiceAmount.toFixed(2)),
          overdueInvoiceAmount: Number(overdueInvoiceAmount.toFixed(2)),
          totalOutstandingAmount: Number(totalOutstandingAmount.toFixed(2)),
        },
        quotations: {
          total: totalQuotations,
          draft: draftQuotations,
          sent: sentQuotations,
          accepted: acceptedQuotations,
          converted: convertedQuotations,
        },
        invoices: {
          total: allInvoices.length,
          draft: draftInvoices,
          issued: issuedInvoices,
          paid: paidInvoices,
          overdue: overdueInvoices,
        },
        revenueChart,
        subscriptionDistribution,
        recentActivities,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get Staff operational dashboard metrics & queues
 * @route   GET /api/dashboard/staff
 */
export async function getStaffDashboardStats(req, res, next) {
  try {
    const now = new Date();
    const fourteenDaysAhead = new Date();
    fourteenDaysAhead.setDate(fourteenDaysAhead.getDate() + 14);

    const totalCustomers = await prisma.customer.count();
    const totalQuotations = await prisma.quotation.count();
    const pendingQuotations = await prisma.quotation.count({
      where: { status: { in: ['DRAFT', 'SENT'] } },
    });
    const activeSubscriptions = await prisma.subscription.count({
      where: { status: 'ACTIVE' },
    });
    const pendingInvoices = await prisma.invoice.count({
      where: { status: { in: ['ISSUED', 'PARTIALLY_PAID'] } },
    });
    const overdueInvoices = await prisma.invoice.count({
      where: { status: 'OVERDUE' },
    });
    const paymentsReceivedCount = await prisma.payment.count({
      where: { status: 'SUCCESSFUL' },
    });

    // Recent 5 Quotations
    const recentQuotationsRaw = await prisma.quotation.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { companyName: true, contactPerson: true } },
      },
    });
    const recentQuotations = recentQuotationsRaw.map((q) => ({
      id: q.id,
      quotationNumber: q.quotationNumber,
      customerName: q.customer?.companyName || q.customer?.contactPerson,
      grandTotal: q.grandTotal,
      status: q.status,
      createdAt: q.createdAt,
    }));

    // Recent 5 Invoices
    const recentInvoicesRaw = await prisma.invoice.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { companyName: true, contactPerson: true } },
      },
    });
    const recentInvoices = recentInvoicesRaw.map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      customerName: inv.customer?.companyName || inv.customer?.contactPerson,
      totalAmount: inv.totalAmount,
      amountDue: inv.amountDue,
      dueDate: inv.dueDate,
      status: inv.status,
    }));

    // Upcoming 5 Renewals
    const upcomingRenewalsRaw = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        nextBillingDate: {
          gte: now,
          lte: fourteenDaysAhead,
        },
      },
      take: 5,
      orderBy: { nextBillingDate: 'asc' },
      include: {
        customer: { select: { companyName: true, contactPerson: true } },
        plan: { select: { name: true, billingFrequency: true } },
      },
    });
    const upcomingRenewals = upcomingRenewalsRaw.map((sub) => ({
      id: sub.id,
      subscriptionNumber: sub.subscriptionNumber,
      customerName: sub.customer?.companyName || sub.customer?.contactPerson,
      planName: sub.plan?.name,
      billingFrequency: sub.billingFrequencySnapshot,
      nextBillingDate: sub.nextBillingDate,
      status: sub.status,
    }));

    return res.status(200).json({
      success: true,
      data: {
        kpis: {
          totalCustomers,
          totalQuotations,
          pendingQuotations,
          activeSubscriptions,
          pendingInvoices,
          overdueInvoices,
          paymentsReceivedCount,
        },
        recentQuotations,
        recentInvoices,
        upcomingRenewals,
      },
    });
  } catch (error) {
    next(error);
  }
}
