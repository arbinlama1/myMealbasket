// Setup vendor and products in correct order
const setupVendorAndProducts = async () => {
  console.log('=== SETUP VENDOR AND PRODUCTS ===\n');
  
  try {
    // Step 1: Register vendor first
    console.log('1. Registering vendor...');
    const vendorData = {
      name: 'Test Vendor',
      email: 'vendor@test.com',
      password: 'vendor123',
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
      
      // Step 2: Login as vendor to get token
      console.log('\n2. Logging in as vendor...');
      const loginResponse = await fetch('http://localhost:8081/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: vendorData.email,
          password: vendorData.password
        })
      });
      
      if (loginResponse.ok) {
        const loginResult = await loginResponse.json();
        console.log('✅ Login successful');
        const token = loginResult.data.token;
        
        // Step 3: Create products
        console.log('\n3. Creating products...');
        const products = [
          {
            name: 'Laptop',
            price: 999.99,
            description: 'High-performance laptop',
            category: 'Electronic',
            image: 'laptop.jpg'
          },
          {
            name: 'Smartphone',
            price: 699.99,
            description: 'Latest smartphone model',
            category: 'Electronic',
            image: 'phone.jpg'
          },
          {
            name: 'Headphones',
            price: 199.99,
            description: 'Wireless headphones',
            category: 'Electronic',
            image: 'headphones.jpg'
          }
        ];
        
        for (let i = 0; i < products.length; i++) {
          const product = products[i];
          console.log(`Creating product ${i + 1}: ${product.name}`);
          
          const productResponse = await fetch(`http://localhost:8081/api/vendor/${vendorId}/products`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(product)
          });
          
          if (productResponse.ok) {
            const productResult = await productResponse.json();
            console.log(`✅ Product "${product.name}" created with ID: ${productResult.data.id}`);
          } else {
            const error = await productResponse.text();
            console.log(`❌ Failed to create product "${product.name}": ${error}`);
          }
        }
        
        // Step 4: Verify products
        console.log('\n4. Verifying created products...');
        const verifyResponse = await fetch(`http://localhost:8081/api/vendor/${vendorId}/products`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (verifyResponse.ok) {
          const verifyResult = await verifyResponse.json();
          console.log(`✅ Found ${verifyResult.data.length} products for vendor`);
          verifyResult.data.forEach((product, index) => {
            console.log(`  ${index + 1}. ${product.name} - $${product.price}`);
          });
        } else {
          console.log('❌ Failed to verify products');
        }
        
      } else {
        console.log('❌ Login failed');
      }
    } else {
      const error = await registerResponse.text();
      console.log('❌ Vendor registration failed:', error);
    }
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
  
  console.log('\n=== SETUP COMPLETE ===');
};

setupVendorAndProducts();
