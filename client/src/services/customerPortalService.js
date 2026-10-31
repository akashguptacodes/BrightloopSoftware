import api from './api.js';

export async function getCustomerProfile() {
  const res = await api.get('/customer-portal/profile');
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

