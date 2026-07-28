import api from './api';

export const projectService = {
  getAll: async (params?: Record<string, unknown>) => {
    const res = await api.get('/projects', { params });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get(`/projects/${id}`);
    return res.data;
  },

  create: async (data: Record<string, unknown>) => {
    const res = await api.post('/projects', data);
    return res.data;
  },

  update: async (id: string, data: Record<string, unknown>) => {
    const res = await api.put(`/projects/${id}`, data);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await api.delete(`/projects/${id}`);
    return res.data;
  },

  getStats: async () => {
    const res = await api.get('/projects/stats');
    return res.data;
  },
};
