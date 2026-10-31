import api from './api';

export const getRevenueReport = async (params) => {
  const response = await api.get('/reports/revenue', { params });
  return response.data;
};

export const getSubscriptionReport = async (params) => {
  const response = await api.get('/reports/subscriptions', { params });
  return response.data;
};

export const getCustomerReport = async (params) => {
  const response = await api.get('/reports/customers', { params });
  return response.data;
};

export const getInvoiceReport = async (params) => {
  const response = await api.get('/reports/invoices', { params });
  return response.data;
};

export const getProductPlanReport = async (params) => {
  const response = await api.get('/reports/products-plans', { params });
  return response.data;
};

export const exportReportCsv = async (reportType, params = {}) => {
  const response = await api.get('/reports/export/csv', {
    params: { type: reportType, ...params },
    responseType: 'blob',
  });
  return response.data;
};

export const exportReportPdf = async (reportType, params = {}) => {
  const response = await api.get('/reports/export/pdf', {
    params: { type: reportType, ...params },
    responseType: 'blob',
  });
  return response.data;
};

