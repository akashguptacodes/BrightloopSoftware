import api from './api.js';

export async function getSubscriptions(params = {}) {
  const res = await api.get('/subscriptions', { params });
  return res.data;
}

export async function getSubscriptionById(id) {
  const res = await api.get(`/subscriptions/${id}`);
  return res.data;
}

export async function createDirectSubscription(data) {
  const res = await api.post('/subscriptions', data);
  return res.data;
}

export async function activateSubscription(id) {
  const res = await api.post(`/subscriptions/${id}/activate`);
  return res.data;
}

export async function pauseSubscription(id, data = {}) {
  const res = await api.post(`/subscriptions/${id}/pause`, data);
  return res.data;
}

export async function resumeSubscription(id) {
  const res = await api.post(`/subscriptions/${id}/resume`);
  return res.data;
}

export async function cancelSubscription(id, data = {}) {
  const res = await api.post(`/subscriptions/${id}/cancel`, data);
  return res.data;
}

export async function renewSubscription(id) {
  const res = await api.post(`/subscriptions/${id}/renew`);
  return res.data;
}

export async function closeSubscription(id) {
  const res = await api.post(`/subscriptions/${id}/close`);
  return res.data;
}

export async function getSubscriptionHistory(id) {
  const res = await api.get(`/subscriptions/${id}/history`);
  return res.data;
}

