import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// ── Request Interceptor ────────────────────────────────────────────────────────
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

// ── Response Interceptor ───────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth APIs ──────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  registerVendor: (vendorData) => api.post('/auth/register/vendor', vendorData),
  logout: () => {
    ['token', 'user', 'userEmail', 'userName', 'userRole'].forEach((k) =>
      localStorage.removeItem(k)
    );
    return Promise.resolve();
  },
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (resetData) => api.post('/auth/reset-password', resetData),
};

// ── Product APIs ───────────────────────────────────────────────────────────────
export const productAPI = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  search: (name) => api.get(`/products/search?name=${encodeURIComponent(name)}`),
  getByVendor: (vendorName) => api.get(`/products/vendor/${encodeURIComponent(vendorName)}`),
  getByVendorId: (vendorId) => api.get(`/products/vendor/${vendorId}`),
  create: (product) => api.post('/products', product),
  update: (id, product) => api.put(`/products/${id}`, product),
  delete: (id) => api.delete(`/products/${id}`),
};

// ── User APIs ──────────────────────────────────────────────────────────────────
export const userAPI = {
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  deleteAccount: () => api.delete('/auth/account'),
};

// ── Vendor APIs ────────────────────────────────────────────────────────────────
export const vendorAPI = {
  getProfile: (vendorId) => api.get(`/vendor/${vendorId}`),
  getProducts: (vendorId) => api.get(`/vendor/${vendorId}/products`),
  createProduct: (vendorId, product) => api.post(`/vendor/${vendorId}/products`, product),
  updateProduct: (vendorId, productId, product) =>
    api.put(`/vendor/${vendorId}/products/${productId}`, product),
  deleteProduct: (vendorId, productId) =>
    api.delete(`/vendor/${vendorId}/products/${productId}`),
};

// ── Order APIs ─────────────────────────────────────────────────────────────────
export const orderAPI = {
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  getUserOrders: () => api.get('/orders/user'),
  create: (order) => api.post('/orders', order),
  delete: (id) => api.delete(`/orders/${id}`),
};

// ── Meal Plan APIs ─────────────────────────────────────────────────────────────
export const mealPlanAPI = {
  getAll: () => api.get('/meal-plans'),
  getUserPlans: () => api.get('/meal-plans/user'),
  getPlansByDate: (date) => api.get(`/meal-plans/user/date/${date}`),
  getPlansByType: (mealType) => api.get(`/meal-plans/user/meal-type/${mealType}`),
  create: (plan) => api.post('/meal-plans', plan),
  update: (id, plan) => api.put(`/meal-plans/${id}`, plan),
  delete: (id) => api.delete(`/meal-plans/${id}`),
  getAIRecommendation: (mealType, date) =>
    api.post(`/meal-plans/ai-recommendation?mealType=${mealType}&date=${date}`),
  getRecommended: () => api.get('/meal-plans/recommended'),
};

// ── Contact APIs ───────────────────────────────────────────────────────────────
export const contactAPI = {
  sendMessage: (message) => api.post('/contact/message', message),
  getAllMessages: () => api.get('/contact/messages'),
};

// ── Test / Setup APIs ──────────────────────────────────────────────────────────
export const testAPI = {
  healthCheck: () => api.get('/test/health'),
  publicEndpoint: () => api.get('/test/public'),
};

export const setupAPI = {
  createTestUsers: () => api.post('/setup/create-test-users'),
  getTestCredentials: () => api.get('/setup/test-credentials'),
};

export default api;