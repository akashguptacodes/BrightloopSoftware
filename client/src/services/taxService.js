import api from './api';

export const getTaxes = async (params = {}) => {
  const response = await api.get('/taxes', { params });
  return response.data;
};

export const getTaxById = async (id) => {
  const response = await api.get(`/taxes/${id}`);
  return response.data;
};

export const createTax = async (data) => {
  const response = await api.post('/taxes', data);
  return response.data;
};

export const updateTax = async (id, data) => {
  const response = await api.put(`/taxes/${id}`, data);
  return response.data;
};

export const updateTaxStatus = async (id, isActive) => {
  const response = await api.patch(`/taxes/${id}/status`, { isActive });
  return response.data;
};

export const deleteTax = async (id) => {
  const response = await api.delete(`/taxes/${id}`);
  return response.data;
};

