// Admin Service for backend API integration
class AdminService {
  constructor() {
    this.baseURL = 'http://localhost:8081/api/admin';
    this.productsURL = 'http://localhost:8081/api/products';
  }

  // Get authentication headers
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Get all users and vendors from backend
  async getAllUsers() {
    try {
      console.log('AdminService: Fetching all users from backend...');
      const response = await fetch(`${this.baseURL}/users`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        let bodyText = '';
        try {
          bodyText = await response.text();
        } catch (e) {
          bodyText = '';
        }
        const msg = `HTTP ${response.status} ${response.statusText}${bodyText ? ` - ${bodyText}` : ''}`;
        const err = new Error(msg);
        err.status = response.status;
        throw err;
      }

      const data = await response.json();
      console.log('AdminService: Successfully fetched users:', data);
      return data;
    } catch (error) {
      console.error('AdminService: Error fetching users:', error);
      throw error;
    }
  }

  // Get all vendors specifically
  async getAllVendors() {
    try {
      console.log('AdminService: Fetching all vendors from backend...');
      const response = await fetch(`${this.baseURL}/vendors`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        let bodyText = '';
        try {
          bodyText = await response.text();
        } catch (e) {
          bodyText = '';
        }
        const msg = `HTTP ${response.status} ${response.statusText}${bodyText ? ` - ${bodyText}` : ''}`;
        const err = new Error(msg);
        err.status = response.status;
        throw err;
      }

      const data = await response.json();
      console.log('AdminService: Successfully fetched vendors:', data);
      return data;
    } catch (error) {
      console.error('AdminService: Error fetching vendors:', error);
      throw error;
    }
  }

  // Get dashboard statistics
  async getDashboardStats() {
    try {
      console.log('AdminService: Fetching dashboard stats from backend...');
      const response = await fetch(`${this.baseURL}/stats`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('AdminService: Successfully fetched stats:', data);
      return data;
    } catch (error) {
      console.error('AdminService: Error fetching stats:', error);
      throw error;
    }
  }

  // Get all products from all vendors
  async getAllProducts() {
    try {
      console.log('AdminService: Fetching all products from backend...');
      const response = await fetch(`${this.productsURL}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('AdminService: Successfully fetched products:', data);
      return data;
    } catch (error) {
      console.error('AdminService: Error fetching products:', error);
      throw error;
    }
  }

  // Delete a user
  async deleteUser(userId) {
    try {
      console.log('AdminService: Deleting user:', userId);
      const response = await fetch(`${this.baseURL}/users/${userId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('AdminService: Successfully deleted user:', data);
      return data;
    } catch (error) {
      console.error('AdminService: Error deleting user:', error);
      throw error;
    }
  }

  // Update user role
  async updateUserRole(userId, newRole) {
    try {
      console.log('AdminService: Updating user role:', userId, newRole);
      const response = await fetch(`${this.baseURL}/users/${userId}/role`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ role: newRole })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('AdminService: Successfully updated user role:', data);
      return data;
    } catch (error) {
      console.error('AdminService: Error updating user role:', error);
      throw error;
    }
  }

  // Fallback to localStorage if backend is not available
  async getUsersFromFallback() {
    console.log('AdminService: Using localStorage fallback for users...');
    const allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
    return allUsers;
  }
}

export default new AdminService();
