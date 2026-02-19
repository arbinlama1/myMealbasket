// Check if vendor exists in database
const checkVendorExists = async () => {
  console.log('=== CHECKING VENDOR IN DATABASE ===\n');
  
  try {
    // First login to get token
    console.log('1. Logging in as vendor...');
    const loginResponse = await fetch('http://localhost:8081/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'vendor@test.com', password: 'vendor123' })
    });
    
    if (!loginResponse.ok) {
      console.log('❌ Login failed');
      console.log('Status:', loginResponse.status);
      console.log('Error:', await loginResponse.text());
      
      // Try to register vendor first
      console.log('\n2. Trying to register vendor...');
      const registerResponse = await fetch('http://localhost:8081/api/auth/register/vendor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Vendor',
          email: 'vendor@test.com',
          password: 'vendor123',
          shopName: 'Test Shop',
          businessType: 'Electronic',
          phone: '1234567890',
          address: 'Test Address'
        })
      });
      
      if (registerResponse.ok) {
        console.log('✅ Vendor registered successfully');
        console.log('Now try logging in again...');
      } else {
        console.log('❌ Vendor registration failed');
        console.log('Error:', await registerResponse.text());
        return;
      }
      
      // Try login again
      const retryLoginResponse = await fetch('http://localhost:8081/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'vendor@test.com', password: 'vendor123' })
      });
      
      if (!retryLoginResponse.ok) {
        console.log('❌ Retry login also failed');
        return;
      }
      
      const loginData = await retryLoginResponse.json();
      const token = loginData.data.token;
      const vendorId = loginData.data.id;
      
      console.log('✅ Login successful after registration');
      console.log('Vendor ID:', vendorId);
      
      // Test vendor profile
      console.log('\n3. Testing vendor profile...');
      const profileResponse = await fetch(`http://localhost:8081/api/vendor/${vendorId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (profileResponse.ok) {
        console.log('✅ Vendor profile accessible');
        const profileData = await profileResponse.json();
        console.log('Vendor data:', profileData.data);
      } else {
        console.log('❌ Vendor profile not accessible');
        console.log('Error:', await profileResponse.text());
      }
    } else {
      const loginData = await loginResponse.json();
      const token = loginData.data.token;
      const vendorId = loginData.data.id;
      
      console.log('✅ Login successful');
      console.log('Vendor ID:', vendorId);
      
      // Test vendor profile
      console.log('\n2. Testing vendor profile...');
      const profileResponse = await fetch(`http://localhost:8081/api/vendor/${vendorId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (profileResponse.ok) {
        console.log('✅ Vendor profile accessible');
        const profileData = await profileResponse.json();
        console.log('Vendor data:', profileData.data);
        
        // Test product creation
        console.log('\n3. Testing product creation...');
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
          console.log('✅ Product creation successful');
          const productData = await productResponse.json();
          console.log('Product:', productData.data);
        } else {
          console.log('❌ Product creation failed');
          console.log('Status:', productResponse.status);
          console.log('Error:', await productResponse.text());
        }
      } else {
        console.log('❌ Vendor profile not accessible');
        console.log('Error:', await profileResponse.text());
      }
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  console.log('\n=== CHECK COMPLETE ===');
};

checkVendorExists();
