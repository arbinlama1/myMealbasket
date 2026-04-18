import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api';

const ratingService = {
  // Get all ratings for a user
  getUserRatings: async (userId) => {
    try {
      const url = `${API_BASE_URL}/recommendations/user/${userId}/ratings`;
      console.log(`=== FETCHING RATINGS ===`);
      console.log(`URL: ${url}`);
      console.log(`UserId: ${userId}`);
      
      const response = await axios.get(url);
      console.log('=== API RESPONSE ===');
      console.log('Status:', response.status);
      console.log('Headers:', response.headers);
      console.log('Data:', response.data);
      console.log('Full response:', response);
      
      if (response.data && Array.isArray(response.data)) {
        console.log(`Found ${response.data.length} ratings`);
        response.data.forEach((rating, index) => {
          console.log(`Rating ${index + 1}:`, {
            id: rating.id,
            userId: rating.user?.id,
            productId: rating.product?.id,
            rating: rating.rating,
            createdAt: rating.createdAt
          });
        });
      } else {
        console.log('No ratings found or invalid data format');
      }
      
      return response;
    } catch (error) {
      console.error('=== API ERROR ===');
      console.error('Error details:', error);
      console.error('Response:', error.response);
      console.error('Status:', error.response?.status);
      console.error('StatusText:', error.response?.statusText);
      console.error('Data:', error.response?.data);
      throw error;
    }
  },

  // Get rating for a specific product by user
  getUserProductRating: async (userId, productId) => {
    try {
      console.log(`Fetching rating for user ${userId}, product ${productId}`);
      const response = await axios.get(`${API_BASE_URL}/recommendations/user/${userId}/product/${productId}/rating`);
      console.log('User product rating API response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching user product rating:', error);
      return null;
    }
  },

  // Submit or update rating
  submitRating: async (userId, productId, rating) => {
    try {
      console.log(`Submitting rating: userId=${userId}, productId=${productId}, rating=${rating}`);
      const response = await axios.post(`${API_BASE_URL}/recommendations/rate`, {
        userId: parseInt(userId),
        productId: productId,
        rating: rating
      });
      console.log('Submit rating API response:', response);
      return response.data;
    } catch (error) {
      console.error('Error submitting rating:', error);
      throw error;
    }
  },

  // Get product average rating
  getProductRating: async (productId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/recommendations/product/${productId}/rating`);
      console.log('Product rating API response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching product rating:', error);
      return null;
    }
  }
};

export default ratingService;
