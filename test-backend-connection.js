// Test backend connection and vendor authentication
const testBackendConnection = async () => {
  console.log('Testing backend connection...');
  
  try {
    // Test 1: Check if backend is running
    const healthResponse = await fetch('http://localhost:8081/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'vendor@test.com',
        password: 'vendor123'
      })
    });

    if (healthResponse.ok) {
      console.log('✅ Backend is running and responding');
      const loginResult = await healthResponse.json();
      console.log('Login successful:', loginResult);
      
      // Test 2: Test vendor product creation
      const token = loginResult.data.token;
      const vendorId = loginResult.data.id;
      
      const productResponse = await fetch(`http://localhost:8081/api/vendor/${vendorId}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: 'Test Product',
          price: 99.99,
          description: 'Test description',
          category: 'Electronic',
          image: 'test.jpg'
        })
      });

      if (productResponse.ok) {
        console.log('✅ Product creation endpoint working');
        const productResult = await productResponse.json();
        console.log('Product created:', productResult);
      } else {
        const productError = await productResponse.json();
        console.log('❌ Product creation failed:', productError);
      }
    } else {
      console.log('❌ Backend login failed');
      const error = await healthResponse.json();
      console.log('Login error:', error);
    }
  } catch (error) {
    console.error('❌ Backend connection failed:', error.message);
    console.log('Please make sure the backend is running on port 8081');
    console.log('Run: cd d:\\MealBasketSyatem && mvn spring-boot:run');
  }
};

testBackendConnection();
