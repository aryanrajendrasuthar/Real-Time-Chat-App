import axios from 'axios';
import type { AuthResponse, Room, Message, User } from '../types';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post<AuthResponse>('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data),
  getMe: () => api.get<{ user: User }>('/auth/me'),
  searchUsers: (q: string) => api.get<{ users: User[] }>(`/auth/users/search?q=${q}`),
};

export const roomApi = {
  getRooms: () => api.get<{ rooms: Room[] }>('/rooms'),
  createRoom: (data: { memberIds: string[]; name?: string }) =>
    api.post<{ room: Room }>('/rooms', data),
  getRoom: (id: string) => api.get<{ room: Room }>(`/rooms/${id}`),
  getMessages: (roomId: string, page = 1) =>
    api.get<{ messages: Message[] }>(`/rooms/${roomId}/messages?page=${page}&limit=40`),
};

export const uploadApi = {
  upload: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post<{ fileUrl: string; fileName: string; type: string }>('/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default api;
