import api from './api';

export const userService = {
  getAll: async (params?: Record<string, unknown>) => {
    const res = await api.get('/users', { params });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get(`/users/${id}`);
    return res.data;
  },

  create: async (data: Record<string, unknown>) => {
    const res = await api.post('/users', data);
    return res.data;
  },

  update: async (id: string, data: Record<string, unknown>) => {
    const res = await api.put(`/users/${id}`, data);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await api.delete(`/users/${id}`);
    return res.data;
  },

  getManagers: async () => {
    const res = await api.get('/users/managers');
    return res.data;
  },
};
