import api from './api.js';

export async function getBillingStatus() {
  const res = await api.get('/admin/billing/status');
  return res.data;
}

export async function runBillingNow() {
  const res = await api.post('/admin/billing/run');
  return res.data;
}

export async function checkOverdueNow() {
  const res = await api.post('/admin/billing/check-overdue');
  return res.data;
}

