import axios from 'axios';

const API_BASE = "http://localhost:8081/api";

// Get auth token for API requests
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Promotion API object
const promotionAPI = {
  // Get all promotions for a vendor
  getVendorPromotions: async (vendorId) => {
    try {
      const response = await axios.get(`${API_BASE}/promotions/vendor/${vendorId}`, {
        headers: getAuthHeaders()
      });
      return response;
    } catch (error) {
      console.error('Error getting vendor promotions:', error);
      throw error;
    }
  },

  // Get all active promotions (for user coupon system)
  getActivePromotions: async () => {
    try {
      const response = await axios.get(`${API_BASE}/promotions/active`, {
        headers: getAuthHeaders()
      });
      return response;
    } catch (error) {
      console.error('Error getting active promotions:', error);
      throw error;
    }
  },

  // Get promotion by ID
  getPromotionById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE}/promotions/${id}`, {
        headers: getAuthHeaders()
      });
      return response;
    } catch (error) {
      console.error('Error getting promotion by ID:', error);
      throw error;
    }
  },

  // Create a new promotion
  createPromotion: async (promotionData) => {
    try {
      const response = await axios.post(`${API_BASE}/promotions`, promotionData, {
        headers: getAuthHeaders()
      });
      return response;
    } catch (error) {
      console.error('Error creating promotion:', error);
      throw error;
    }
  },

  // Update an existing promotion
  updatePromotion: async (id, promotionData) => {
    try {
      const response = await axios.put(`${API_BASE}/promotions/${id}`, promotionData, {
        headers: getAuthHeaders()
      });
      return response;
    } catch (error) {
      console.error('Error updating promotion:', error);
      throw error;
    }
  },

  // Delete a promotion
  deletePromotion: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE}/promotions/${id}`, {
        headers: getAuthHeaders()
      });
      return response;
    } catch (error) {
      console.error('Error deleting promotion:', error);
      throw error;
    }
  },

  // Toggle promotion active status
  togglePromotionStatus: async (id) => {
    try {
      const response = await axios.patch(`${API_BASE}/promotions/${id}/toggle`, {}, {
        headers: getAuthHeaders()
      });
      return response;
    } catch (error) {
      console.error('Error toggling promotion status:', error);
      throw error;
    }
  },

  // Apply promotion discount (for user cart)
  applyPromotion: async (couponCode, cartTotal) => {
    try {
      const response = await axios.post(`${API_BASE}/promotions/apply`, {
        couponCode,
        cartTotal
      }, {
        headers: getAuthHeaders()
      });
      return response;
    } catch (error) {
      console.error('Error applying promotion:', error);
      throw error;
    }
  },

  // Get promotions expiring soon
  getPromotionsExpiringSoon: async () => {
    try {
      const response = await axios.get(`${API_BASE}/promotions/expiring-soon`, {
        headers: getAuthHeaders()
      });
      return response;
    } catch (error) {
      console.error('Error getting promotions expiring soon:', error);
      throw error;
    }
  },

  // Get vendor promotion statistics
  getVendorPromotionStats: async (vendorId) => {
    try {
      const response = await axios.get(`${API_BASE}/promotions/vendor/${vendorId}/stats`, {
        headers: getAuthHeaders()
      });
      return response;
    } catch (error) {
      console.error('Error getting vendor promotion stats:', error);
      throw error;
    }
  }
};

export default promotionAPI;
