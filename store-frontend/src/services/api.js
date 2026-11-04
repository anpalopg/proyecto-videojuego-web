import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Attach token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('store_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401 → clear session and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('store_token');
      localStorage.removeItem('store_user');
      const base = import.meta.env.BASE_URL || '/';
      window.location.href = `${base.replace(/\/$/, '')}/login`;
    }
    return Promise.reject(err);
  }
);

export default api;

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  loginGoogle: () => { window.location.href = `${api.defaults.baseURL}/auth/google`; },
  loginApple: () => { window.location.href = `${api.defaults.baseURL}/auth/apple`; },
};

// ── Games ─────────────────────────────────────────────────────────────────────
export const gamesService = {
  getAll: (params) => api.get('/games', { params }),
  getById: (id) => api.get(`/games/${id}`),
  getTrending: () => api.get('/games/trending'),
  getCategories: () => api.get('/games/categories'),
  getFeatured: () => api.get('/games/featured'),
};

// ── Cart ──────────────────────────────────────────────────────────────────────
export const cartService = {
  get: () => api.get('/cart'),
  add: (gameId) => api.post('/cart', { game_id: gameId }),
  remove: (gameId) => api.delete(`/cart/${gameId}`),
  checkout: () => api.post('/cart/checkout'),
};

// ── Assignments ───────────────────────────────────────────────────────────────
export const assignmentsService = {
  getSubject:    ()           => api.get('/assignments/subject'),
  setSubject:    (name)       => api.put('/assignments/subject', { name }),
  getAll:        ()           => api.get('/assignments'),
  create:        (data)       => api.post('/assignments', data),
  remove:        (id)         => api.delete(`/assignments/${id}`),
};
