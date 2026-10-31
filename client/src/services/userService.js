import api from './api';

export const getAllUsers = async (params = {}) => {
  const response = await api.get('/users', { params });
  return response.data;
};

export const createStaff = async (data) => {
  const response = await api.post('/users/staff', data);
  return response.data;
};

export const updateUserStatus = async (id, isActive) => {
  const response = await api.patch(`/users/${id}/status`, { isActive });
  return response.data;
};

