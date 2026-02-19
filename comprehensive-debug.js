// Comprehensive debug script to identify all issues
const comprehensiveDebug = async () => {
  console.log('=== COMPREHENSIVE SYSTEM DEBUG ===\n');
  
  // Test 1: Backend connectivity
  console.log('1. Testing Backend Connectivity...');
  try {
    const response = await fetch('http://localhost:8081/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'vendor@test.com', password: 'vendor123' })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend is running');
      console.log('✅ Login successful');
      console.log('Token:', data.data.token.substring(0, 50) + '...');
      console.log('User ID:', data.data.id);
      console.log('Role:', data.data.role);
      
      // Test 2: Vendor authentication
      console.log('\n2. Testing Vendor Authentication...');
      const token = data.data.token;
      const vendorId = data.data.id;
      
      const vendorResponse = await fetch(`http://localhost:8081/api/vendor/${vendorId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (vendorResponse.ok) {
        console.log('✅ Vendor authentication working');
        const vendorData = await vendorResponse.json();
        console.log('Vendor data:', vendorData.data);
      } else {
        console.log('❌ Vendor authentication failed');
        console.log('Status:', vendorResponse.status);
        console.log('Error:', await vendorResponse.text());
      }
      
      // Test 3: Product creation
      console.log('\n3. Testing Product Creation...');
      const productResponse = await fetch(`http://localhost:8081/api/vendor/${vendorId}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: 'Debug Product',
          price: 99.99,
          description: 'Test product for debugging',
          category: 'Electronic',
          image: 'test.jpg'
        })
      });
      
      if (productResponse.ok) {
        console.log('✅ Product creation working');
        const productData = await productResponse.json();
        console.log('Product created:', productData.data);
      } else {
        console.log('❌ Product creation failed');
        console.log('Status:', productResponse.status);
        console.log('Error:', await productResponse.text());
      }
      
      // Test 4: Get products
      console.log('\n4. Testing Get Products...');
      const getProductsResponse = await fetch(`http://localhost:8081/api/vendor/${vendorId}/products`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (getProductsResponse.ok) {
        console.log('✅ Get products working');
        const productsData = await getProductsResponse.json();
        console.log('Products count:', productsData.data.length);
        console.log('Products:', productsData.data);
      } else {
        console.log('❌ Get products failed');
        console.log('Status:', getProductsResponse.status);
        console.log('Error:', await getProductsResponse.text());
      }
      
    } else {
      console.log('❌ Backend login failed');
      console.log('Status:', response.status);
      console.log('Error:', await response.text());
    }
  } catch (error) {
    console.log('❌ Backend connection failed');
    console.log('Error:', error.message);
    console.log('\nPossible solutions:');
    console.log('1. Start the backend: cd d:\\MealBasketSyatem && mvn spring-boot:run');
    console.log('2. Check if PostgreSQL is running on port 5433');
    console.log('3. Verify database connection in application.properties');
  }
  
  // Test 5: Frontend localStorage
  console.log('\n5. Testing Frontend localStorage...');
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    console.log('User in localStorage:', user ? '✅ Present' : '❌ Missing');
    console.log('Token in localStorage:', token ? '✅ Present' : '❌ Missing');
    
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        console.log('User role:', parsedUser.role);
        console.log('User ID:', parsedUser.id);
        console.log('User email:', parsedUser.email);
      } catch (e) {
        console.log('❌ Invalid user data in localStorage');
      }
    }
  }
  
  console.log('\n=== DEBUG COMPLETE ===');
};

// Run the debug
comprehensiveDebug();
