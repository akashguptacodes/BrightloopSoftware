import api from './api';

export const getActivityLogs = async (params = {}) => {
  const response = await api.get('/activity-logs', { params });
  return response.data;
};

