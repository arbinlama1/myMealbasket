// Test database connection by registering a vendor
const testVendorRegistration = async () => {
  try {
    console.log('Testing vendor registration...');
    
    const vendorData = {
      name: 'Test Vendor',
      email: 'testvendor@example.com',
      password: 'test123',
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
      const data = await response.json();
      console.log('✅ Vendor registration successful:', data);
    } else {
      const error = await response.json();
      console.log('❌ Vendor registration failed:', error);
    }
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  }
};

testVendorRegistration();
