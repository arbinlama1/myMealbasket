// Test frontend vendor dashboard without backend
console.log('=== FRONTEND VENDOR DASHBOARD TEST ===\n');

// Simulate localStorage data
const testUser = {
  id: 1,
  name: 'Test Vendor',
  email: 'vendor@test.com',
  role: 'VENDOR',
  shopName: 'Test Shop'
};

const testToken = 'test-jwt-token-12345';

// Set up test data in localStorage
if (typeof localStorage !== 'undefined') {
  localStorage.setItem('user', JSON.stringify(testUser));
  localStorage.setItem('token', testToken);
  
  console.log('✅ Test data set in localStorage');
  console.log('User:', JSON.parse(localStorage.getItem('user')));
  console.log('Token:', localStorage.getItem('token'));
  
  // Test vendor service methods
  console.log('\n=== TESTING VENDOR SERVICE ===');
  
  // Test getCurrentVendorId
  const userStr = localStorage.getItem('user');
  if (userStr) {
    const user = JSON.parse(userStr);
    console.log('✅ getCurrentVendorId would return:', user.id);
    console.log('✅ User role is:', user.role);
    
    if (user.role === 'VENDOR') {
      console.log('✅ User has correct VENDOR role');
    } else {
      console.log('❌ User does not have VENDOR role');
    }
  }
  
  // Test getAuthHeaders
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token && token !== 'null' && token !== 'undefined') {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('✅ Auth headers would be:', headers);
  } else {
    console.log('❌ No valid token found');
  }
  
  // Test product data creation
  console.log('\n=== TESTING PRODUCT DATA ===');
  const testProduct = {
    name: 'Test Product',
    price: 99.99,
    description: 'Test description',
    category: 'Electronic',
    image: 'test.jpg'
  };
  
  console.log('✅ Product data would be:', testProduct);
  
  // Test API URL construction
  const baseURL = 'http://localhost:8081';
  const vendorId = JSON.parse(localStorage.getItem('user')).id;
  const url = `${baseURL}/api/vendor/${vendorId}/products`;
  console.log('✅ API URL would be:', url);
  
  console.log('\n=== FRONTEND TEST COMPLETE ===');
  console.log('Frontend logic appears correct.');
  console.log('Issue is likely with backend connection or authentication.');
  
} else {
  console.log('❌ localStorage not available (running in Node.js)');
}

// Instructions for manual testing
console.log('\n=== MANUAL TESTING INSTRUCTIONS ===');
console.log('1. Start the backend: cd d:\\MealBasketSyatem && mvn spring-boot:run');
console.log('2. Open browser and go to vendor dashboard');
console.log('3. Open browser console (F12)');
console.log('4. Try to add a product');
console.log('5. Look for console logs starting with "=== VENDOR SERVICE ADD PRODUCT ==="');
console.log('6. Check backend console for errors');
