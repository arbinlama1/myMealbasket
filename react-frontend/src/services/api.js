import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    
    // Skip authentication for static assets and non-API requests
    const skipAuth = config.url?.includes('favicon.ico') || 
                   config.url?.includes('manifest.json') ||
                   !config.url?.startsWith('/api');
    
    if (!skipAuth) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Adding auth token for:', config.url);
      }
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.config?.url, error.message);
    
    // Skip redirect for static assets and non-API requests
    const skipRedirect = error.config?.url?.includes('favicon.ico') || 
                       error.config?.url?.includes('manifest.json') ||
                       !error.config?.url?.startsWith('/api');
    
    if (error.response?.status === 401 && !skipRedirect) {
      console.log('401 error detected, redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Network error handling
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      console.error('Backend server is not running or not accessible');
    }
    
    return Promise.reject(error);
  }
);

// Authentication APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  registerVendor: (vendorData) => api.post('/auth/register/vendor', vendorData),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    return Promise.resolve();
  },
  getCurrentUser: () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    return { user, token };
  },
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (resetData) => api.post('/auth/reset-password', resetData)
};

// Product APIs
export const productAPI = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  search: (name) => api.get(`/products/search?name=${name}`),
  getByVendor: (vendorName) => api.get(`/products/vendor/${vendorName}`),
  getByVendorId: (vendorId) => api.get(`/products/vendor/${vendorId}`),
  create: (product) => api.post('/products', product),
  update: (id, product) => api.put(`/products/${id}`, product),
  delete: (id) => api.delete(`/products/${id}`),
};

// User Management APIs
export const userAPI = {
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  deleteAccount: () => api.delete('/auth/account'),
  getUserOrders: () => api.get('/orders/user'),
  updateUserPreferences: (preferences) => api.put('/auth/preferences', preferences),
  getUserActivity: () => api.get('/auth/activity'),
};

// Vendor APIs
export const vendorAPI = {
  getProfile: (vendorId) => api.get(`/vendor/${vendorId}`),
  getProducts: (vendorId) => api.get(`/vendor/${vendorId}/products`),
  createProduct: (vendorId, product) => api.post(`/vendor/${vendorId}/products`, product),
  updateProduct: (vendorId, productId, product) => api.put(`/vendor/${vendorId}/products/${productId}`, product),
  deleteProduct: (vendorId, productId) => api.delete(`/vendor/${vendorId}/products/${productId}`)
};
export const orderAPI = {
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  getUserOrders: () => api.get('/orders/user'),
  create: (order) => api.post('/orders', order),
  delete: (id) => api.delete(`/orders/${id}`),
};

// Meal Plan APIs
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

// Stock Alert APIs
export const stockAlertAPI = {
  getAll: () => api.get('/stock-alerts'),
  getByVendor: (vendorId) => api.get(`/stock-alerts/vendor/${vendorId}`),
  getByProduct: (productId) => api.get(`/stock-alerts/product/${productId}`),
  getActive: () => api.get('/stock-alerts/active'),
  getCritical: () => api.get('/stock-alerts/critical'),
  create: (alert) => api.post('/stock-alerts', alert),
  monitorStock: (vendorId, productId, currentStock) => 
    api.post(`/stock-alerts/monitor/${vendorId}/${productId}/${currentStock}`),
  predictStock: (vendorId, productId, currentStock) => 
    api.post(`/stock-alerts/predict/${vendorId}/${productId}/${currentStock}`),
  deactivate: (alertId) => api.put(`/stock-alerts/deactivate/${alertId}`),
  delete: (alertId) => api.delete(`/stock-alerts/${alertId}`),
};

// System Performance APIs
export const performanceAPI = {
  getAll: () => api.get('/system-performance'),
  getByType: (metricType) => api.get(`/system-performance/type/${metricType}`),
  getCritical: () => api.get('/system-performance/critical'),
  getRecent: (hours) => api.get(`/system-performance/recent/${hours}`),
  monitorResponseTime: (responseTime) => 
    api.post(`/system-performance/monitor/response-time?responseTimeMs=${responseTime}`),
  monitorErrorRate: (errorRate) => 
    api.post(`/system-performance/monitor/error-rate?errorPercentage=${errorRate}`),
  monitorOrderVolume: (orderCount) => 
    api.post(`/system-performance/monitor/order-volume?orderCount=${orderCount}`),
  monitorSystemLoad: (cpuUsage) => 
    api.post(`/system-performance/monitor/system-load?cpuUsage=${cpuUsage}`),
  healthCheck: () => api.post('/system-performance/health-check'),
  generateDailyReport: () => api.post('/system-performance/generate-daily-report'),
  getAnalytics: (startTime, endTime) => 
    api.get(`/system-performance/analytics/${startTime}/${endTime}`),
};

// Contact APIs
export const contactAPI = {
  sendMessage: (message) => api.post('/contact/message', message),
  getAllMessages: () => api.get('/contact/messages'),
};

// Database Test APIs
export const dbTestAPI = {
  testConnectivity: () => api.get('/db-test/connectivity'),
  testTables: () => api.get('/db-test/tables'),
  createTestData: () => api.post('/db-test/create-test-data'),
};

// Test APIs
export const testAPI = {
  healthCheck: () => api.get('/test/health'),
  publicEndpoint: () => api.get('/test/public'),
};

// Setup APIs
export const setupAPI = {
  createTestUsers: () => api.post('/setup/create-test-users'),
  getTestCredentials: () => api.get('/setup/test-credentials'),
};

export default api;
