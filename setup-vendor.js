// Setup vendor in database
const setupVendor = async () => {
  try {
    console.log('Setting up vendor in database...');
    
    // Register the test vendor
    const vendorData = {
      name: 'Test Vendor',
      email: 'vendor@test.com',
      password: 'vendor123',
      shopName: 'Test Shop',
      businessType: 'Electronic',
      phone: '1234567890',
      address: 'Test Address'
    };

    const response = await fetch('http://localhost:8081/api/auth/register/vendor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(vendorData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Vendor setup successful:', result);
      console.log('You can now login with:');
      console.log('Email: vendor@test.com');
      console.log('Password: vendor123');
    } else {
      const error = await response.json();
      console.log('❌ Vendor setup failed:', error);
    }
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
};

setupVendor();
