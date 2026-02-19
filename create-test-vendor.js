// Create test vendor and product directly
const createTestVendorAndProduct = async () => {
  console.log('=== CREATING TEST VENDOR AND PRODUCT ===\n');
  
  try {
    // Step 1: Register vendor
    console.log('1. Registering test vendor...');
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vendorData)
    });
    
    if (registerResponse.ok) {
      const registerResult = await registerResponse.json();
      console.log('✅ Vendor registered successfully');
      console.log('Vendor ID:', registerResult.data.id);
      console.log('Vendor Email:', registerResult.data.email);
      
      const vendorId = registerResult.data.id;
      
      // Step 2: Create product without authentication (temporarily public)
      console.log('\n2. Creating test product...');
      const productData = {
        name: 'Test Product',
        price: 99.99,
        description: 'This is a test product',
        category: 'Electronic',
        image: 'test-image.jpg'
      };
      
      const productResponse = await fetch(`http://localhost:8081/api/vendor/${vendorId}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      
      console.log('Product response status:', productResponse.status);
      
      if (productResponse.ok) {
        const productResult = await productResponse.json();
        console.log('✅ Product created successfully');
        console.log('Product ID:', productResult.data.id);
        console.log('Product Name:', productResult.data.name);
        console.log('Product Price:', productResult.data.price);
        
        // Step 3: Get products to verify
        console.log('\n3. Verifying product creation...');
        const getProductsResponse = await fetch(`http://localhost:8081/api/vendor/${vendorId}/products`);
        
        if (getProductsResponse.ok) {
          const productsResult = await getProductsResponse.json();
          console.log('✅ Products retrieved successfully');
          console.log('Total products:', productsResult.data.length);
          productsResult.data.forEach((product, index) => {
            console.log(`Product ${index + 1}: ${product.name} - $${product.price}`);
          });
        } else {
          console.log('❌ Failed to retrieve products');
        }
      } else {
        const productError = await productResponse.text();
        console.log('❌ Product creation failed');
        console.log('Status:', productResponse.status);
        console.log('Error:', productError);
      }
    } else {
      const registerError = await registerResponse.text();
      console.log('❌ Vendor registration failed');
      console.log('Status:', registerResponse.status);
      console.log('Error:', registerError);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
  
  console.log('\n=== TEST COMPLETE ===');
};

createTestVendorAndProduct();
