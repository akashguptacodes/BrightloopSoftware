import api from './api.js';

export async function getCustomerProfile() {
  const res = await api.get('/customer-portal/profile');
  return res.data;
}

export async function updateCustomerProfile(data) {
  const res = await api.put('/customer-portal/profile', data);
  return res.data;
}

export async function getCustomerQuotations() {
  const res = await api.get('/customer-portal/quotations');
  return res.data;
}

export async function getCustomerQuotationById(id) {
  const res = await api.get(`/customer-portal/quotations/${id}`);
  return res.data;
}

export async function customerAcceptQuotation(id) {
  const res = await api.post(`/customer-portal/quotations/${id}/accept`);
  return res.data;
}

export async function customerRejectQuotation(id, reason = '') {
  const res = await api.post(`/customer-portal/quotations/${id}/reject`, { reason });
  return res.data;
}

export async function getCustomerSubscriptions() {
  const res = await api.get('/customer-portal/subscriptions');
  return res.data;
}

export async function getCustomerSubscriptionById(id) {
  const res = await api.get(`/customer-portal/subscriptions/${id}`);
  return res.data;
}

export async function customerPauseSubscription(id, reason = '') {
  const res = await api.post(`/customer-portal/subscriptions/${id}/pause`, { reason });
  return res.data;
}

export async function customerResumeSubscription(id) {
  const res = await api.post(`/customer-portal/subscriptions/${id}/resume`);
  return res.data;
}

export async function customerCancelSubscription(id, reason = '') {
  const res = await api.post(`/customer-portal/subscriptions/${id}/cancel`, { reason });
  return res.data;
}

export async function customerRenewSubscription(id) {
  const res = await api.post(`/customer-portal/subscriptions/${id}/renew`);
  return res.data;
}

export async function getCustomerInvoices() {
  const res = await api.get('/customer-portal/invoices');
  return res.data;
}

export async function getCustomerInvoiceById(id) {
  const res = await api.get(`/customer-portal/invoices/${id}`);
  return res.data;
}

export async function downloadCustomerInvoicePdf(id, filename = `invoice-${id}.pdf`) {
  const response = await api.get(`/customer-portal/invoices/${id}/pdf`, {
    responseType: 'blob',
  });
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function getCustomerPayments() {
  const res = await api.get('/customer-portal/payments');
  return res.data;
}

