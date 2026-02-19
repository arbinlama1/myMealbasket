// Test vendor registration and product creation
const testVendorFlow = async () => {
  try {
    console.log('Testing vendor registration...');
    
    // 1. Register a test vendor
    const vendorData = {
      name: 'Test Vendor',
      email: 'testvendor@example.com',
      password: 'test123',
      shopName: 'Test Shop',
      businessType: 'Electronic',
      phone: '1234567890',
      address: 'Test Address'
    };

    const registerResponse = await fetch('http://localhost:8081/api/auth/register/vendor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(vendorData)
    });

    if (registerResponse.ok) {
      const registerResult = await registerResponse.json();
      console.log('✅ Vendor registration successful:', registerResult);
      
      // 2. Login as vendor
      const loginResponse = await fetch('http://localhost:8081/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: vendorData.email,
          password: vendorData.password
        })
      });

      if (loginResponse.ok) {
        const loginResult = await loginResponse.json();
        console.log('✅ Vendor login successful:', loginResult);
        
        const token = loginResult.data.token;
        const vendorId = loginResult.data.id;
        
        // 3. Create a product
        const productData = {
          name: 'Test Product',
          price: 99.99,
          description: 'Test product description',
          category: 'Electronic',
          image: 'test-image.jpg'
        };

        const productResponse = await fetch(`http://localhost:8081/api/vendor/${vendorId}/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(productData)
        });

        if (productResponse.ok) {
          const productResult = await productResponse.json();
          console.log('✅ Product creation successful:', productResult);
        } else {
          const productError = await productResponse.json();
          console.log('❌ Product creation failed:', productError);
        }
      } else {
        const loginError = await loginResponse.json();
        console.log('❌ Vendor login failed:', loginError);
      }
    } else {
      const registerError = await registerResponse.json();
      console.log('❌ Vendor registration failed:', registerError);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testVendorFlow();
