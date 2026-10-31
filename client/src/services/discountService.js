import api from './api';

export const getDiscounts = async (params = {}) => {
  const response = await api.get('/discounts', { params });
  return response.data;
};

export const getDiscountById = async (id) => {
  const response = await api.get(`/discounts/${id}`);
  return response.data;
};

export const createDiscount = async (data) => {
  const response = await api.post('/discounts', data);
  return response.data;
};

export const updateDiscount = async (id, data) => {
  const response = await api.put(`/discounts/${id}`, data);
  return response.data;
};

export const updateDiscountStatus = async (id, isActive) => {
  const response = await api.patch(`/discounts/${id}/status`, { isActive });
  return response.data;
};

export const deleteDiscount = async (id) => {
  const response = await api.delete(`/discounts/${id}`);
  return response.data;
};

