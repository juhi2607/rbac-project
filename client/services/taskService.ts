import api from './api';

export const taskService = {
  getAll: async (params?: Record<string, unknown>) => {
    const res = await api.get('/tasks', { params });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get(`/tasks/${id}`);
    return res.data;
  },

  create: async (data: Record<string, unknown>) => {
    const res = await api.post('/tasks', data);
    return res.data;
  },

  update: async (id: string, data: Record<string, unknown>) => {
    const res = await api.put(`/tasks/${id}`, data);
    return res.data;
  },

  updateStatus: async (id: string, status: string) => {
    const res = await api.patch(`/tasks/${id}/status`, { status });
    return res.data;
  },

  delete: async (id: string) => {
    const res = await api.delete(`/tasks/${id}`);
    return res.data;
  },
};
