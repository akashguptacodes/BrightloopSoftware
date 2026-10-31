import prisma from '../config/database.js';
import PDFDocument from 'pdfkit';

/**
 * Resolves standard date filter presets into { startDate, endDate }
 */
export function resolveDateRange(range, customStart, customEnd) {
  const now = new Date();
  let startDate = null;
  let endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  if (range === 'today') {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  } else if (range === 'last7days') {
    startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 7);
    startDate.setHours(0, 0, 0, 0);
  } else if (range === 'last30days') {
    startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 30);
    startDate.setHours(0, 0, 0, 0);
  } else if (range === 'thismonth') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  } else if (range === 'lastmonth') {
    startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
    endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  } else if (range === 'thisyear') {
    startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
  } else if (customStart || customEnd) {
    if (customStart) startDate = new Date(customStart);
    if (customEnd) {
      endDate = new Date(customEnd);
      endDate.setHours(23, 59, 59, 999);
    }
  }

  return { startDate, endDate };
}

/**
 * 1. Revenue Analytics & Metrics
 */
export async function getRevenueReport(range, customStart, customEnd) {
  const { startDate, endDate } = resolveDateRange(range, customStart, customEnd);

  const paymentWhere = { status: 'SUCCESSFUL' };
  const refundWhere = { status: 'PROCESSED' };

  if (startDate || endDate) {
    paymentWhere.paymentDate = {};
    refundWhere.createdAt = {};
    if (startDate) {
      paymentWhere.paymentDate.gte = startDate;
      refundWhere.createdAt.gte = startDate;
    }
    if (endDate) {
      paymentWhere.paymentDate.lte = endDate;
      refundWhere.createdAt.lte = endDate;
    }
  }

  // Sequential execution for Neon DB pooler stability
  const payments = await prisma.payment.findMany({
    where: paymentWhere,
    select: { amount: true, paymentDate: true, method: true },
    orderBy: { paymentDate: 'asc' },
  });

  const refunds = await prisma.paymentRefund.findMany({
    where: refundWhere,
    select: { amount: true, createdAt: true },
  });

  const totalCollected = payments.reduce((acc, p) => acc + Number(p.amount), 0);
  const totalRefunded = refunds.reduce((acc, r) => acc + Number(r.amount), 0);
  const netRevenue = Math.max(0, totalCollected - totalRefunded);

  // Method Breakdown
  const methodBreakdown = payments.reduce((acc, p) => {
    const m = p.method || 'OTHER';
    acc[m] = (acc[m] || 0) + Number(p.amount);
    return acc;
  }, {});

  // Monthly breakdown for last 12 months (or within range)
  const monthlyTrendsMap = {};
  const monthsBack = 12;
  const now = new Date();

  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleString('default', { month: 'short', year: 'numeric' });
    monthlyTrendsMap[key] = {
      month: key,
      year: d.getFullYear(),
      monthIndex: d.getMonth(),
      grossRevenue: 0,
      refunds: 0,
      netRevenue: 0,
      transactionCount: 0,
    };
  }

  // Aggregate payments by month
  payments.forEach((p) => {
    const d = new Date(p.paymentDate || new Date());
    const key = d.toLocaleString('default', { month: 'short', year: 'numeric' });
    if (monthlyTrendsMap[key]) {
      monthlyTrendsMap[key].grossRevenue += Number(p.amount);
      monthlyTrendsMap[key].transactionCount += 1;
    }
  });

  // Aggregate refunds by month
  refunds.forEach((r) => {
    const d = new Date(r.createdAt || new Date());
    const key = d.toLocaleString('default', { month: 'short', year: 'numeric' });
    if (monthlyTrendsMap[key]) {
      monthlyTrendsMap[key].refunds += Number(r.amount);
    }
  });

  const monthlyTrends = Object.values(monthlyTrendsMap).map((m) => ({
    ...m,
    grossRevenue: Number(m.grossRevenue.toFixed(2)),
    refunds: Number(m.refunds.toFixed(2)),
    netRevenue: Number(Math.max(0, m.grossRevenue - m.refunds).toFixed(2)),
  }));

  return {
    summary: {
      totalCollected: Number(totalCollected.toFixed(2)),
      totalRefunded: Number(totalRefunded.toFixed(2)),
      netRevenue: Number(netRevenue.toFixed(2)),
      totalTransactions: payments.length,
      methodBreakdown,
    },
    monthlyTrends,
    dateRange: { startDate, endDate, range: range || 'all' },
  };
}

/**
 * 2. Subscription Analytics & Report
 */
export async function getSubscriptionReport(range, customStart, customEnd) {
  const { startDate, endDate } = resolveDateRange(range, customStart, customEnd);

  const total = await prisma.subscription.count();
  const active = await prisma.subscription.count({ where: { status: 'ACTIVE' } });
  const paused = await prisma.subscription.count({ where: { status: 'PAUSED' } });
  const cancelled = await prisma.subscription.count({ where: { status: 'CANCELLED' } });
  const pending = await prisma.subscription.count({ where: { status: 'PENDING' } });
  const closed = await prisma.subscription.count({ where: { status: 'CLOSED' } });

  // Expiring soon: active contracts with nextBillingDate in next 7 days
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  const expiringSoon = await prisma.subscription.count({
    where: {
      status: 'ACTIVE',
      nextBillingDate: {
        gte: new Date(),
        lte: sevenDaysFromNow,
      },
    },
  });

  // New subscriptions created within date filter
  const newSubWhere = {};
  if (startDate || endDate) {
    newSubWhere.createdAt = {};
    if (startDate) newSubWhere.createdAt.gte = startDate;
    if (endDate) newSubWhere.createdAt.lte = endDate;
  }
  const newSubscriptionsInPeriod = await prisma.subscription.count({ where: newSubWhere });

  // Frequency distribution
  const allSubs = await prisma.subscription.findMany({
    select: { billingFrequencySnapshot: true, status: true },
  });

  const frequencyBreakdown = allSubs.reduce((acc, s) => {
    const f = s.billingFrequencySnapshot || 'MONTHLY';
    acc[f] = (acc[f] || 0) + 1;
    return acc;
  }, {});

  const statusDistribution = [
    { name: 'Active', value: active, color: '#10B981' },
    { name: 'Paused', value: paused, color: '#F59E0B' },
    { name: 'Cancelled', value: cancelled, color: '#EF4444' },
    { name: 'Pending', value: pending, color: '#6366F1' },
    { name: 'Closed', value: closed, color: '#64748B' },
  ];

  return {
    summary: {
      total,
      active,
      paused,
      cancelled,
      pending,
      closed,
      expiringSoon,
      newSubscriptionsInPeriod,
    },
    statusDistribution,
    frequencyBreakdown,
    dateRange: { startDate, endDate, range: range || 'all' },
  };
}

/**
 * 3. Customer Growth & Status Report
 */
export async function getCustomerReport(range, customStart, customEnd) {
  const { startDate, endDate } = resolveDateRange(range, customStart, customEnd);

  const total = await prisma.customer.count();
  const active = await prisma.customer.count({ where: { isActive: true } });

  const newCustWhere = {};
  if (startDate || endDate) {
    newCustWhere.createdAt = {};
    if (startDate) newCustWhere.createdAt.gte = startDate;
    if (endDate) newCustWhere.createdAt.lte = endDate;
  }
  const newCustomersInPeriod = await prisma.customer.count({ where: newCustWhere });

  // Customers with active subscriptions
  const customersWithActiveSubs = await prisma.customer.count({
    where: {
      subscriptions: { some: { status: 'ACTIVE' } },
    },
  });

  // Customers with overdue invoices
  const customersWithOverdueInvoices = await prisma.customer.count({
    where: {
      invoices: { some: { status: 'OVERDUE' } },
    },
  });

  // Top Customers by revenue
  const topCustomersRaw = await prisma.customer.findMany({
    take: 10,
    select: {
      id: true,
      customerCode: true,
      contactPerson: true,
      companyName: true,
      email: true,
      payments: {
        where: { status: 'SUCCESSFUL' },
        select: { amount: true },
      },
      subscriptions: {
        where: { status: 'ACTIVE' },
        select: { id: true },
      },
    },
  });

  const topCustomers = topCustomersRaw
    .map((c) => {
      const totalPaid = c.payments.reduce((acc, p) => acc + Number(p.amount), 0);
      return {
        id: c.id,
        code: c.customerCode,
        name: c.companyName || c.contactPerson,
        contactPerson: c.contactPerson,
        email: c.email,
        activeSubscriptionsCount: c.subscriptions.length,
        totalPaid: Number(totalPaid.toFixed(2)),
      };
    })
    .sort((a, b) => b.totalPaid - a.totalPaid);

  return {
    summary: {
      total,
      active,
      newCustomersInPeriod,
      customersWithActiveSubs,
      customersWithOverdueInvoices,
    },
    topCustomers,
    dateRange: { startDate, endDate, range: range || 'all' },
  };
}

/**
 * 4. Invoice & Receivables Report
 */
export async function getInvoiceReport(range, customStart, customEnd) {
  const { startDate, endDate } = resolveDateRange(range, customStart, customEnd);

  const where = {};
  if (startDate || endDate) {
    where.issueDate = {};
    if (startDate) where.issueDate.gte = startDate;
    if (endDate) where.issueDate.lte = endDate;
  }

  const invoices = await prisma.invoice.findMany({
    where,
    select: {
      status: true,
      totalAmount: true,
      amountPaid: true,
      amountDue: true,
    },
  });

  let totalInvoiced = 0;
  let totalPaid = 0;
  let totalDue = 0;
  const statusCounts = {
    DRAFT: 0,
    ISSUED: 0,
    PARTIALLY_PAID: 0,
    PAID: 0,
    OVERDUE: 0,
    VOID: 0,
    REFUNDED: 0,
  };

  invoices.forEach((inv) => {
    totalInvoiced += Number(inv.totalAmount);
    totalPaid += Number(inv.amountPaid);
    totalDue += Number(inv.amountDue);
    if (statusCounts[inv.status] !== undefined) {
      statusCounts[inv.status] += 1;
    }
  });

  return {
    summary: {
      totalInvoices: invoices.length,
      totalInvoiced: Number(totalInvoiced.toFixed(2)),
      totalPaid: Number(totalPaid.toFixed(2)),
      totalOutstanding: Number(totalDue.toFixed(2)),
      statusCounts,
    },
    dateRange: { startDate, endDate, range: range || 'all' },
  };
}

/**
 * 5. Product & Plan Revenue Breakdown
 */
export async function getProductPlanReport() {
  // Aggregate from saved invoice items snapshots
  const invoiceItems = await prisma.invoiceItem.findMany({
    select: {
      productNameSnapshot: true,
      planNameSnapshot: true,
      variantNameSnapshot: true,
      lineTotal: true,
      quantity: true,
      invoice: { select: { status: true } },
    },
  });

  // Only consider items on issued or paid invoices
  const validItems = invoiceItems.filter((it) =>
    ['PAID', 'ISSUED', 'PARTIALLY_PAID', 'OVERDUE'].includes(it.invoice?.status)
  );

  const productMap = {};
  const planMap = {};

  validItems.forEach((it) => {
    const prodName = it.productNameSnapshot || 'Unspecified Product';
    if (!productMap[prodName]) {
      productMap[prodName] = { name: prodName, count: 0, totalRevenue: 0 };
    }
    productMap[prodName].count += it.quantity;
    productMap[prodName].totalRevenue += Number(it.lineTotal);

    const planName = it.planNameSnapshot || 'One-off / Direct';
    if (!planMap[planName]) {
      planMap[planName] = { name: planName, count: 0, totalRevenue: 0 };
    }
    planMap[planName].count += it.quantity;
    planMap[planName].totalRevenue += Number(it.lineTotal);
  });

  const productsBreakdown = Object.values(productMap)
    .map((p) => ({ ...p, totalRevenue: Number(p.totalRevenue.toFixed(2)) }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue);

  const plansBreakdown = Object.values(planMap)
    .map((p) => ({ ...p, totalRevenue: Number(p.totalRevenue.toFixed(2)) }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue);

  return {
    productsBreakdown,
    plansBreakdown,
  };
}

/**
 * CSV Export Generator
 */
export function generateReportCsv(reportType, data) {
  let headers = [];
  let rows = [];

  if (reportType === 'revenue') {
    headers = ['Month', 'Gross Revenue (INR)', 'Refunds (INR)', 'Net Revenue (INR)', 'Transaction Count'];
    rows = (data.monthlyTrends || []).map((m) => [
      `"${m.month}"`,
      m.grossRevenue,
      m.refunds,
      m.netRevenue,
      m.transactionCount,
    ]);
  } else if (reportType === 'customers') {
    headers = ['Customer Code', 'Customer / Company', 'Contact Person', 'Email', 'Active Subscriptions', 'Total Revenue (INR)'];
    rows = (data.topCustomers || []).map((c) => [
      `"${c.code}"`,
      `"${c.name}"`,
      `"${c.contactPerson}"`,
      `"${c.email}"`,
      c.activeSubscriptionsCount,
      c.totalPaid,
    ]);
  } else if (reportType === 'products') {
    headers = ['Product Name', 'Quantity Sold / Subscribed', 'Total Revenue (INR)'];
    rows = (data.productsBreakdown || []).map((p) => [
      `"${p.name}"`,
      p.count,
      p.totalRevenue,
    ]);
  } else if (reportType === 'invoices') {
    headers = ['Invoice Status', 'Count'];
    const sc = data.summary?.statusCounts || {};
    rows = Object.entries(sc).map(([status, count]) => [`"${status}"`, count]);
  }

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  return csvContent;
}

/**
 * PDF Report Generator using PDFKit
 */
export function generateReportPdf(reportType, data, res) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  const buffers = [];

  doc.on('data', (c) => buffers.push(c));
  doc.on('end', () => {
    const pdfBuffer = Buffer.concat(buffers);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${reportType}-report.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.end(pdfBuffer);
  });

  // Header
  doc
    .fillColor('#1E40AF')
    .fontSize(20)
    .font('Helvetica-Bold')
    .text('BRIGHTLOOP SOFTWARE', 40, 40)
    .fontSize(10)
    .font('Helvetica')
    .fillColor('#6B7280')
    .text(`Executive Business Report: ${reportType.toUpperCase()}`, 40, 68)
    .text(`Generated: ${new Date().toLocaleString()}`, 40, 82);

  doc
    .strokeColor('#E5E7EB')
    .lineWidth(1)
    .moveTo(40, 105)
    .lineTo(555, 105)
    .stroke();

  let y = 125;

  if (reportType === 'revenue') {
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#111827').text('Revenue Summary', 40, y);
    y += 20;

    const summary = data.summary || {};
    doc.fontSize(10).font('Helvetica').fillColor('#374151')
      .text(`Total Revenue Collected: INR ${summary.totalCollected?.toLocaleString()}`, 40, y);
    y += 16;
    doc.text(`Total Refunds Processed: INR ${summary.totalRefunded?.toLocaleString()}`, 40, y);
    y += 16;
    doc.font('Helvetica-Bold').text(`Net Recognized Revenue: INR ${summary.netRevenue?.toLocaleString()}`, 40, y);
    y += 30;

    doc.fontSize(12).font('Helvetica-Bold').text('Monthly Revenue Trend', 40, y);
    y += 20;

    (data.monthlyTrends || []).forEach((m) => {
      doc.fontSize(9).font('Helvetica').fillColor('#4B5563')
        .text(`${m.month}: Net INR ${m.netRevenue.toLocaleString()} (${m.transactionCount} transactions)`, 50, y);
      y += 15;
    });
  } else if (reportType === 'customers') {
    const summary = data.summary || {};
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#111827').text('Customer Portfolio', 40, y);
    y += 20;
    doc.fontSize(10).font('Helvetica').fillColor('#374151')
      .text(`Total Registered Customers: ${summary.total}`, 40, y);
    y += 16;
    doc.text(`Active Accounts: ${summary.active}`, 40, y);
    y += 16;
    doc.text(`Customers with Active Subscriptions: ${summary.customersWithActiveSubs}`, 40, y);
    y += 16;
    doc.text(`Customers with Overdue Invoices: ${summary.customersWithOverdueInvoices}`, 40, y);
    y += 30;

    doc.fontSize(12).font('Helvetica-Bold').text('Top Accounts by Revenue', 40, y);
    y += 20;

    (data.topCustomers || []).slice(0, 10).forEach((c) => {
      doc.fontSize(9).font('Helvetica').fillColor('#4B5563')
        .text(`${c.name} (${c.email}): INR ${c.totalPaid.toLocaleString()} (${c.activeSubscriptionsCount} active subs)`, 50, y);
      y += 15;
    });
  } else {
    doc.fontSize(10).font('Helvetica').fillColor('#374151').text('Detailed metrics exported successfully.', 40, y);
  }

  doc.end();
}

