// Vendor Service - Handles vendor-specific product operations
// This service will be ready for backend JWT authentication integration

class VendorService {
  constructor() {
    this.baseURL = 'http://localhost:8081'; // Backend API URL
    this.currentVendorId = null;
  }

  getAuthHeaders() {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token && token !== 'null' && token !== 'undefined') {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  // Set current vendor ID (will come from JWT token in backend)
  setCurrentVendor(vendorId) {
    this.currentVendorId = vendorId;
  }

  // Get current vendor ID from localStorage user
  getCurrentVendorId() {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        console.log('VendorService: Current user:', parsedUser);
        if (parsedUser.role === 'VENDOR') {
          console.log('VendorService: Vendor ID:', parsedUser.id);
          return parsedUser.id;
        }
      } catch (err) {
        console.error('VendorService: Error parsing user data:', err);
      }
    }
    console.error('VendorService: No vendor found in localStorage');
    return null;
  }

  // Get vendor's own products only
  async getVendorProducts() {
    const vendorId = this.getCurrentVendorId();
    if (!vendorId) {
      throw new Error('Vendor not authenticated');
    }

    try {
      console.log(`VendorService: Loading products for vendor ${vendorId}`);

      const response = await fetch(`${this.baseURL}/api/vendor/${vendorId}/products`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const products = data?.data || data || [];
      const safeProducts = Array.isArray(products) ? products : [];

      // Normalize vendor fields for UI
      const normalized = safeProducts.map(p => {
        const vendorName = p?.vendor?.shopName || p?.vendor?.name || p?.vendor || p?.vendorName;
        const vendorIdFromObj = p?.vendor?.id || p?.vendorId || vendorId;
        return {
          ...p,
          vendor: vendorName,
          vendorId: vendorIdFromObj
        };
      });

      console.log(`VendorService: Found ${normalized.length} products for vendor ${vendorId}:`, normalized);
      return normalized;

    } catch (error) {
      console.error('VendorService: Error fetching vendor products:', error);
      throw error;
    }
  }

  // Add product for current vendor only
  async addProduct(productData) {
    const vendorId = this.getCurrentVendorId();
    if (!vendorId) {
      throw new Error('Vendor not authenticated');
    }

    try {
      console.log('=== VENDOR SERVICE ADD PRODUCT ===');
      console.log('Vendor ID:', vendorId);
      console.log('Product Data:', productData);
      console.log('Base URL:', this.baseURL);
      
      const headers = this.getAuthHeaders();
      console.log('Request Headers:', headers);
      
      const url = `${this.baseURL}/api/vendor/${vendorId}/products`;
      console.log('Request URL:', url);
      
      console.log('Making API call...');
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(productData)
      });

      console.log('Response received');
      console.log('Response Status:', response.status);
      console.log('Response Status Text:', response.statusText);
      console.log('Response Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        console.log('Response not OK, getting error details...');
        let errorText;
        try {
          errorText = await response.text();
          console.log('Error response text:', errorText);
          
          // Try to parse as JSON
          try {
            const errorJson = JSON.parse(errorText);
            console.log('Parsed error JSON:', errorJson);
            throw new Error(`HTTP ${response.status}: ${errorJson.message || errorJson.error || errorText}`);
          } catch (parseError) {
            console.log('Could not parse error as JSON, using raw text');
            throw new Error(`HTTP ${response.status}: ${errorText}`);
          }
        } catch (textError) {
          console.log('Could not get error text:', textError);
          throw new Error(`HTTP ${response.status}: Failed to add product`);
        }
      }

      console.log('Response OK, parsing JSON...');
      const data = await response.json();
      console.log('Response data:', data);
      
      const newProduct = data?.data || data;
      console.log('Extracted product:', newProduct);

      // Normalize vendor fields for UI
      const normalized = {
        ...newProduct,
        vendor: newProduct?.vendor?.shopName || newProduct?.vendor?.name || 'Vendor',
        vendorId: newProduct?.vendor?.id || vendorId
      };

      console.log('Normalized product:', normalized);
      
      // Notify admin and user dashboards
      const notification = {
        type: 'PRODUCT_ADDED',
        product: normalized,
        vendorId: vendorId
      };
      window.postMessage(notification, '*');
      
      console.log('=== PRODUCT ADD SUCCESSFUL ===');
      return normalized;

    } catch (error) {
      console.error('=== PRODUCT ADD ERROR ===');
      console.error('Error:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }

  // Update product for current vendor only
  async updateProduct(productId, productData) {
    const vendorId = this.getCurrentVendorId();
    if (!vendorId) {
      throw new Error('Vendor not authenticated');
    }

    try {
      console.log(`VendorService: Updating product ${productId} for vendor ${vendorId}:`, productData);

      const response = await fetch(`${this.baseURL}/api/vendor/${vendorId}/products/${productId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const updatedProduct = data?.data || data;

      const normalized = {
        ...updatedProduct,
        vendor: updatedProduct?.vendor?.shopName || updatedProduct?.vendor?.name || productData.vendor,
        vendorId: updatedProduct?.vendor?.id || vendorId
      };

      console.log(`VendorService: Successfully updated product ${productId} for vendor ${vendorId}`);
      
      // Notify admin dashboard about product update
      window.postMessage({
        type: 'PRODUCT_UPDATED',
        product: normalized,
        vendorId: vendorId
      }, '*');
      
      // Notify user dashboard about product update
      window.postMessage({
        type: 'PRODUCT_UPDATED',
        product: normalized,
        vendorId: vendorId
      }, '*');
      
      return normalized;

    } catch (error) {
      console.error('VendorService: Error updating product:', error);
      throw error;
    }
  }

  // Delete product for current vendor only
  async deleteProduct(productId) {
    const vendorId = this.getCurrentVendorId();
    if (!vendorId) {
      throw new Error('Vendor not authenticated');
    }

    try {
      console.log(`VendorService: Deleting product ${productId} for vendor ${vendorId}`);

      const response = await fetch(`${this.baseURL}/api/vendor/${vendorId}/products/${productId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const deletedProduct = data?.data || data || { id: productId };

      console.log(`VendorService: Successfully deleted product ${productId} for vendor ${vendorId}`);
      
      // Notify admin dashboard about product deletion
      window.postMessage({
        type: 'PRODUCT_DELETED',
        product: deletedProduct,
        vendorId: vendorId
      }, '*');
      
      // Notify user dashboard about product deletion
      window.postMessage({
        type: 'PRODUCT_DELETED',
        product: deletedProduct,
        vendorId: vendorId
      }, '*');
      
      return deletedProduct;

    } catch (error) {
      console.error('VendorService: Error deleting product:', error);
      throw error;
    }
  }

  // Get vendor profile
  async getVendorProfile() {
    const vendorId = this.getCurrentVendorId();
    if (!vendorId) {
      throw new Error('Vendor not authenticated');
    }

    try {
      const response = await fetch(`${this.baseURL}/api/vendor/${vendorId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const vendor = data?.data || data;

      console.log(`VendorService: Retrieved profile for vendor ${vendorId}:`, vendor);
      return vendor;

    } catch (error) {
      console.error('VendorService: Error getting vendor profile:', error);
      throw error;
    }
  }

  // Update vendor profile
  async updateVendorProfile(profileData) {
    const vendorId = this.getCurrentVendorId();
    if (!vendorId) {
      throw new Error('Vendor not authenticated');
    }

    try {
      console.log(`VendorService: Updating profile for vendor ${vendorId}:`, profileData);

      const response = await fetch(`${this.baseURL}/api/vendor/${vendorId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const updatedVendor = data?.data || data;

      console.log(`VendorService: Successfully updated profile for vendor ${vendorId}:`, updatedVendor);
      return updatedVendor;

    } catch (error) {
      console.error('VendorService: Error updating vendor profile:', error);
      throw error;
    }
  }
}

// Create and export singleton instance
const vendorService = new VendorService();
export default vendorService;
