import api from './api.js';

export async function getPayments(params = {}) {
  const res = await api.get('/payments', { params });
  return res.data;
}

export async function getPaymentById(id) {
  const res = await api.get(`/payments/${id}`);
  return res.data;
}

export async function recordManualPayment(data) {
  const res = await api.post('/payments/manual', data);
  return res.data;
}

export async function initiateRazorpayOrder(invoiceId) {
  const res = await api.post('/payments/razorpay/create-order', { invoiceId });
  return res.data;
}

export async function verifyRazorpayPayment(data) {
  const res = await api.post('/payments/razorpay/verify', data);
  return res.data;
}

export async function refundPayment(id, data) {
  const res = await api.post(`/payments/${id}/refund`, data);
  return res.data;
}

export async function getInvoicePayments(invoiceId) {
  const res = await api.get(`/payments/invoice/${invoiceId}`);
  return res.data;
}

