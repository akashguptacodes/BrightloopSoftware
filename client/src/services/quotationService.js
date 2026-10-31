import api from './api.js';

export async function getQuotations(params = {}) {
  const res = await api.get('/quotations', { params });
  return res.data;
}

export async function getQuotationById(id) {
  const res = await api.get(`/quotations/${id}`);
  return res.data;
}

export async function createQuotation(data) {
  const res = await api.post('/quotations', data);
  return res.data;
}

export async function updateQuotation(id, data) {
  const res = await api.put(`/quotations/${id}`, data);
  return res.data;
}

export async function sendQuotation(id) {
  const res = await api.post(`/quotations/${id}/send`);
  return res.data;
}

export async function acceptQuotation(id) {
  const res = await api.post(`/quotations/${id}/accept`);
  return res.data;
}

export async function rejectQuotation(id) {
  const res = await api.post(`/quotations/${id}/reject`);
  return res.data;
}

export async function convertToSubscription(id, data = {}) {
  const res = await api.post(`/quotations/${id}/convert`, data);
  return res.data;
}

