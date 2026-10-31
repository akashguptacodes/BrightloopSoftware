import api from './api.js';

export async function getCustomers(params = {}) {
  const res = await api.get('/customers', { params });
  return res.data;
}

export async function getCustomerById(id) {
  const res = await api.get(`/customers/${id}`);
  return res.data;
}

export async function createCustomer(data) {
  const res = await api.post('/customers', data);
  return res.data;
}

export async function updateCustomer(id, data) {
  const res = await api.put(`/customers/${id}`, data);
  return res.data;
}

export async function toggleCustomerStatus(id) {
  const res = await api.patch(`/customers/${id}/status`);
  return res.data;
}

