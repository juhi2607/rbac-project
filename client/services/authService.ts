import api from './api';

export const authService = {
  login: async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },

  register: async (name: string, email: string, password: string, role?: string) => {
    const res = await api.post('/auth/register', { name, email, password, role });
    return res.data;
  },

  getProfile: async () => {
    const res = await api.get('/auth/profile');
    return res.data;
  },

  updateProfile: async (data: { name?: string; currentPassword?: string; newPassword?: string }) => {
    const res = await api.put('/auth/profile', data);
    return res.data;
  },
};
