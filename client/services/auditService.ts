import api from './api';

export const auditService = {
  getAll: async (params?: Record<string, unknown>) => {
    const res = await api.get('/audit-logs', { params });
    return res.data;
  },
};
