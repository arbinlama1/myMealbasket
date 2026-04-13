// Payment Service - Handles payment operations with eSewa
class PaymentService {
  constructor() {
    this.baseURL = 'http://localhost:8081/api';
  }

  // Get authentication headers
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

  // Initiate eSewa payment - SIMPLE VERSION
  async initiateEsewaPayment(amount, purchaseOrderId) {
    try {
      const apiURL = `${this.baseURL}/payments/esewa/initiate`;
      const headers = this.getAuthHeaders();
      
      console.log('PaymentService: Initiating eSewa payment', {
        apiURL,
        amount,
        purchaseOrderId,
        headers: { ...headers, Authorization: headers.Authorization ? 'Bearer ***' : 'None' }
      });
      
      const response = await fetch(apiURL, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          amount: amount,
          purchaseOrderId: purchaseOrderId
        })
      });

      console.log('PaymentService: Response status', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        console.error('PaymentService: API error response', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('PaymentService: eSewa payment initiated successfully', data);
      return data;

    } catch (error) {
      console.error('PaymentService: Error initiating eSewa payment:', error);
      throw error;
    }
  }

  // Verify eSewa payment
  async verifyEsewaPayment(transactionId, referenceId, amount) {
    try {
      console.log('PaymentService: Verifying eSewa payment', { transactionId, referenceId, amount });

      const response = await fetch(`${this.baseURL}/payments/verify`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          encodedResponse: transactionId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error('PaymentService: Error initiating eSewa payment:', error);
      throw error;
    }
  }

  // Submit payment form to eSewa - SIMPLE VERSION
  submitPaymentForm(actionUrl, formData) {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = actionUrl;

    Object.keys(formData).forEach(key => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = formData[key];
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  }

  // Generate purchase order ID
  generatePurchaseOrderId() {
    return 'ORDER-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  // Format amount for display
  formatAmount(amount) {
    return new Intl.NumberFormat('ne-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 2
    }).format(amount);
  }
}

// Create and export singleton instance
const paymentService = new PaymentService();
export default paymentService;
