import api from './api';

export const getProducts = async (params = {}) => {
  const response = await api.get('/products', { params });
  return response.data;
};

export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (data) => {
  const response = await api.post('/products', data);
  return response.data;
};

export const updateProduct = async (id, data) => {
  const response = await api.put(`/products/${id}`, data);
  return response.data;
};

export const updateProductStatus = async (id, isActive) => {
  const response = await api.patch(`/products/${id}/status`, { isActive });
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

// Variants
export const getVariants = async (productId) => {
  const response = await api.get(`/products/${productId}/variants`);
  return response.data;
};

export const createVariant = async (productId, data) => {
  const response = await api.post(`/products/${productId}/variants`, data);
  return response.data;
};

export const updateVariant = async (id, data) => {
  const response = await api.put(`/variants/${id}`, data);
  return response.data;
};

export const updateVariantStatus = async (id, isActive) => {
  const response = await api.patch(`/variants/${id}/status`, { isActive });
  return response.data;
};

export const deleteVariant = async (id) => {
  const response = await api.delete(`/variants/${id}`);
  return response.data;
};

