import api from './api';

// Promotion API object
const promotionAPI = {
  getVendorPromotions: async (vendorId) => {
    try {
      return await api.get(`/promotions/vendor/${vendorId}`);
    } catch (error) {
      console.error('Error getting vendor promotions:', error);
      throw error;
    }
  },

  getActivePromotions: async () => {
    try {
      return await api.get('/promotions/active');
    } catch (error) {
      console.error('Error getting active promotions:', error);
      throw error;
    }
  },

  getPromotionById: async (id) => {
    try {
      return await api.get(`/promotions/${id}`);
    } catch (error) {
      console.error('Error getting promotion by ID:', error);
      throw error;
    }
  },

  createPromotion: async (promotionData) => {
    try {
      return await api.post('/promotions', promotionData);
    } catch (error) {
      console.error('Error creating promotion:', error);
      throw error;
    }
  },

  updatePromotion: async (id, promotionData) => {
    try {
      return await api.put(`/promotions/${id}`, promotionData);
    } catch (error) {
      console.error('Error updating promotion:', error);
      throw error;
    }
  },

  deletePromotion: async (id) => {
    try {
      return await api.delete(`/promotions/${id}`);
    } catch (error) {
      console.error('Error deleting promotion:', error);
      throw error;
    }
  },

  togglePromotionStatus: async (id) => {
    try {
      return await api.patch(`/promotions/${id}/toggle`, {});
    } catch (error) {
      console.error('Error toggling promotion status:', error);
      throw error;
    }
  },

  applyPromotion: async (couponCode, cartTotal) => {
    try {
      return await api.post('/promotions/apply', { couponCode, cartTotal });
    } catch (error) {
      console.error('Error applying promotion:', error);
      throw error;
    }
  },

  getPromotionsExpiringSoon: async () => {
    try {
      return await api.get('/promotions/expiring-soon');
    } catch (error) {
      console.error('Error getting promotions expiring soon:', error);
      throw error;
    }
  },

  getVendorPromotionStats: async (vendorId) => {
    try {
      return await api.get(`/promotions/vendor/${vendorId}/stats`);
    } catch (error) {
      console.error('Error getting vendor promotion stats:', error);
      throw error;
    }
  }
};

export default promotionAPI;
