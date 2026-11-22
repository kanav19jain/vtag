import axios from 'axios';

const TOKEN_KEY = 'vtag_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !String(error.config?.url || '').includes('/auth/')) {
      removeToken();
      window.dispatchEvent(new CustomEvent('vtag:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export const getErrorMessage = (error) =>
  error?.response?.data?.error?.message ||
  error?.response?.data?.message ||
  error?.message ||
  'Something went wrong. Please try again.';

export const authApi = {
  requestOtp: (phone) => api.post('/auth/request-otp', { phone }),
  verifyOtp: (phone, otp) => api.post('/auth/verify-otp', { phone, otp }),
  me: () => api.get('/auth/me'),
};

export const ownerApi = {
  vehicles: () => api.get('/owner/vehicles'),
  createVehicle: (payload) => api.post('/owner/vehicles', payload),
  deleteVehicle: (id) => api.delete(`/owner/vehicles/${id}`),
  downloadQr: (id) =>
    api.get(`/owner/vehicles/${id}/qr`, { responseType: 'blob' }),
  history: () => api.get('/owner/history'),
};

export const publicApi = {
  tag: (tagId) => api.get(`/public/tags/${tagId}`),
  startCall: (tagId, forceFailure = false) =>
    api.post(`/public/tags/${tagId}/calls`, { forceFailure }),
  getCall: (publicId) => api.get(`/public/calls/${publicId}`),
  endCall: (publicId) => api.patch(`/public/calls/${publicId}/end`),
};

export default api;
