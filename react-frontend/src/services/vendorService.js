// Vendor Service — handles all vendor-specific product operations
const BASE_URL = 'http://localhost:8081/api';

class VendorService {
  constructor() {
    this.currentVendorId = null;
  }

  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  setCurrentVendor(vendorId) {
    this.currentVendorId = vendorId;
  }

  getCurrentVendorId() {
    if (this.currentVendorId) return this.currentVendorId;
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user?.role === 'VENDOR') return user.id;
    } catch { /* ignore */ }
    return null;
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

  normalizeProduct(p, fallbackVendorId) {
    return {
      ...p,
      vendor: p?.vendor?.shopName || p?.vendor?.name || p?.vendor || 'Unknown Vendor',
      vendorId: p?.vendor?.id || p?.vendorId || fallbackVendorId,
    };
  }

  async getVendorProfile() {
    const vendorId = this.getCurrentVendorId();
    if (!vendorId) throw new Error('Vendor not authenticated');
    const data = await this.request(`/vendor/${vendorId}`);
    return data?.data || data;
  }

  async getVendorProducts() {
    const vendorId = this.getCurrentVendorId();
    if (!vendorId) throw new Error('Vendor not authenticated');
    const data = await this.request(`/vendor/${vendorId}/products`);
    const products = Array.isArray(data?.data) ? data.data : data || [];
    return products.map((p) => this.normalizeProduct(p, vendorId));
  }

  async addProduct(productData) {
    const vendorId = this.getCurrentVendorId();
    if (!vendorId) throw new Error('Vendor not authenticated');
    const data = await this.request(`/vendor/${vendorId}/products`, {
      method: 'POST',
      body: JSON.stringify(productData),
    });
    const product = this.normalizeProduct(data?.data || data, vendorId);
    window.postMessage({ type: 'PRODUCT_ADDED', product, vendorId }, '*');
    return product;
  }

  async updateProduct(productId, productData) {
    const vendorId = this.getCurrentVendorId();
    if (!vendorId) throw new Error('Vendor not authenticated');
    const data = await this.request(`/vendor/${vendorId}/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
    const product = this.normalizeProduct(data?.data || data, vendorId);
    window.postMessage({ type: 'PRODUCT_UPDATED', product, vendorId }, '*');
    return product;
  }

  async deleteProduct(productId) {
    const vendorId = this.getCurrentVendorId();
    if (!vendorId) throw new Error('Vendor not authenticated');
    const data = await this.request(`/vendor/${vendorId}/products/${productId}`, {
      method: 'DELETE',
    });
    const product = data?.data || data || { id: productId };
    window.postMessage({ type: 'PRODUCT_DELETED', product, vendorId }, '*');
    return product;
  }
}

const vendorService = new VendorService();
export default vendorService;