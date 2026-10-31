import {
  getRevenueReport,
  getSubscriptionReport,
  getCustomerReport,
  getInvoiceReport,
  getProductPlanReport,
  generateReportCsv,
  generateReportPdf,
} from '../services/reportService.js';

export async function getRevenueReportHandler(req, res, next) {
  try {
    const { range, startDate, endDate } = req.query;
    const data = await getRevenueReport(range, startDate, endDate);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function getSubscriptionReportHandler(req, res, next) {
  try {
    const { range, startDate, endDate } = req.query;
    const data = await getSubscriptionReport(range, startDate, endDate);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function getCustomerReportHandler(req, res, next) {
  try {
    const { range, startDate, endDate } = req.query;
    const data = await getCustomerReport(range, startDate, endDate);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function getInvoiceReportHandler(req, res, next) {
  try {
    const { range, startDate, endDate } = req.query;
    const data = await getInvoiceReport(range, startDate, endDate);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function getProductPlanReportHandler(req, res, next) {
  try {
    const data = await getProductPlanReport();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function exportCsvHandler(req, res, next) {
  try {
    const { type = 'revenue', range, startDate, endDate } = req.query;
    let data;

    if (type === 'revenue') {
      data = await getRevenueReport(range, startDate, endDate);
    } else if (type === 'customers') {
      data = await getCustomerReport(range, startDate, endDate);
    } else if (type === 'products') {
      data = await getProductPlanReport();
    } else {
      data = await getInvoiceReport(range, startDate, endDate);
    }

    const csv = generateReportCsv(type, data);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${type}-report.csv"`);
    return res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
}

export async function exportPdfHandler(req, res, next) {
  try {
    const { type = 'revenue', range, startDate, endDate } = req.query;
    let data;

    if (type === 'revenue') {
      data = await getRevenueReport(range, startDate, endDate);
    } else if (type === 'customers') {
      data = await getCustomerReport(range, startDate, endDate);
    } else {
      data = await getInvoiceReport(range, startDate, endDate);
    }

    generateReportPdf(type, data, res);
  } catch (error) {
    if (!res.headersSent) {
      next(error);
    }
  }
}

