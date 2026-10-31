import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach Bearer token from localStorage for reliable cross-domain authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — redirect on 401 (session expired) only for protected routes
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password'];
      const isLandingOrPublic = currentPath === '/' || publicPaths.some((page) => currentPath.startsWith(page));

      // Never auto-redirect to /login when the visitor is on the landing page or auth pages
      if (!isLandingOrPublic) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
