// Admin Service — handles all admin API calls with proper error handling
const BASE_URL = 'http://localhost:8081/api';

class AdminService {
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async request(path, options = {}) {
    const response = await fetch(`${BASE_URL}${path}`, {
      headers: this.getAuthHeaders(),
      ...options,
    });

    if (!response.ok) {
      let body = '';
      try { body = await response.text(); } catch { /* ignore */ }
      const err = new Error(`HTTP ${response.status}${body ? `: ${body}` : ''}`);
      err.status = response.status;
      throw err;
    }

    return response.json();
  }

  getAllUsers() {
    return this.request('/admin/users');
  }

  getAllVendors() {
    return this.request('/admin/vendors');
  }

  getAllProducts() {
    return this.request('/products');
  }

  deleteUser(userId) {
    return this.request(`/admin/users/${userId}`, { method: 'DELETE' });
  }

  updateUserRole(userId, newRole) {
    return this.request(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role: newRole }),
    });
  }

  // LocalStorage fallback when backend is unreachable
  getUsersFromFallback() {
    return JSON.parse(localStorage.getItem('allUsers') || '[]');
  }
}

export default new AdminService();