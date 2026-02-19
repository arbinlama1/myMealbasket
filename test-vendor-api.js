// Test vendor API connection step by step
const testVendorAPI = async () => {
  console.log('=== VENDOR API CONNECTION TEST ===\n');
  
  // Test 1: Check if backend is running
  console.log('1. Testing backend connection...');
  try {
    const response = await fetch('http://localhost:8081/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'vendor@test.com', password: 'vendor123' })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend connection successful');
      console.log('✅ Login successful');
      console.log('Token length:', data.data.token.length);
      console.log('User ID:', data.data.id);
      console.log('User Role:', data.data.role);
      
      const token = data.data.token;
      const vendorId = data.data.id;
      
      // Test 2: Test vendor profile endpoint
      console.log('\n2. Testing vendor profile endpoint...');
      const profileResponse = await fetch(`http://localhost:8081/api/vendor/${vendorId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('Profile response status:', profileResponse.status);
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        console.log('✅ Vendor profile retrieved');
        console.log('Profile:', profileData.data);
      } else {
        const profileError = await profileResponse.text();
        console.log('❌ Vendor profile failed');
        console.log('Error:', profileError);
      }
      
      // Test 3: Test get products endpoint
      console.log('\n3. Testing get products endpoint...');
      const getProductsResponse = await fetch(`http://localhost:8081/api/vendor/${vendorId}/products`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('Get products response status:', getProductsResponse.status);
      if (getProductsResponse.ok) {
        const productsData = await getProductsResponse.json();
        console.log('✅ Get products successful');
        console.log('Products count:', productsData.data.length);
      } else {
        const productsError = await getProductsResponse.text();
        console.log('❌ Get products failed');
        console.log('Error:', productsError);
      }
      
      // Test 4: Test create product endpoint
      console.log('\n4. Testing create product endpoint...');
      const testProduct = {
        name: 'API Test Product',
        price: 99.99,
        description: 'Test product from API test',
        category: 'Electronic',
        image: 'test.jpg'
      };
      
      console.log('Sending product data:', testProduct);
      console.log('Using token:', token.substring(0, 50) + '...');
      console.log('Vendor ID:', vendorId);
      
      const createProductResponse = await fetch(`http://localhost:8081/api/vendor/${vendorId}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(testProduct)
      });
      
      console.log('Create product response status:', createProductResponse.status);
      console.log('Create product response headers:', Object.fromEntries(createProductResponse.headers.entries()));
      
      if (createProductResponse.ok) {
        const createData = await createProductResponse.json();
        console.log('✅ Create product successful');
        console.log('Created product:', createData.data);
      } else {
        const createError = await createProductResponse.text();
        console.log('❌ Create product failed');
        console.log('Error response:', createError);
        
        // Try to parse error as JSON
        try {
          const errorJson = JSON.parse(createError);
          console.log('Parsed error:', errorJson);
        } catch (e) {
          console.log('Error is not JSON format');
        }
      }
      
    } else {
      console.log('❌ Backend login failed');
      const loginError = await response.text();
      console.log('Login error:', loginError);
    }
  } catch (error) {
    console.log('❌ Backend connection failed');
    console.log('Error:', error.message);
    console.log('Stack:', error.stack);
  }
  
  console.log('\n=== API TEST COMPLETE ===');
};

// Run the test
testVendorAPI();
