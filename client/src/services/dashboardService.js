import api from './api';

export const getDashboardStats = async (params) => {
  const response = await api.get('/dashboard/stats', { params });
  return response.data;
};

export const getStaffDashboardStats = async () => {
  const response = await api.get('/dashboard/staff');
  return response.data;
};


