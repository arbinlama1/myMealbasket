// Test admin API to fetch users and vendors
const testAdminAPI = async () => {
  console.log('=== TESTING ADMIN API ===\n');
  
  try {
    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await fetch('http://localhost:8081/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@test.com', password: 'admin123' })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Admin login successful');
      const token = loginData.data.token;
      
      // Step 2: Test get all users endpoint
      console.log('\n2. Testing /api/admin/users endpoint...');
      const usersResponse = await fetch('http://localhost:8081/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('Users response status:', usersResponse.status);
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        console.log('✅ Users API working');
        console.log('Total users found:', usersData.data.length);
        usersData.data.forEach((user, index) => {
          console.log(`  ${index + 1}. ${user.name} (${user.role}) - ${user.email}`);
        });
      } else {
        const usersError = await usersResponse.text();
        console.log('❌ Users API failed');
        console.log('Error:', usersError);
      }
      
      // Step 3: Test get all vendors endpoint
      console.log('\n3. Testing /api/admin/vendors endpoint...');
      const vendorsResponse = await fetch('http://localhost:8081/api/admin/vendors', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('Vendors response status:', vendorsResponse.status);
      
      if (vendorsResponse.ok) {
        const vendorsData = await vendorsResponse.json();
        console.log('✅ Vendors API working');
        console.log('Total vendors found:', vendorsData.data.length);
        vendorsData.data.forEach((vendor, index) => {
          console.log(`  ${index + 1}. ${vendor.name} - ${vendor.email}`);
          if (vendor.shopName) console.log(`     Shop: ${vendor.shopName}`);
        });
      } else {
        const vendorsError = await vendorsResponse.text();
        console.log('❌ Vendors API failed');
        console.log('Error:', vendorsError);
      }
      
      // Step 4: Test get all accounts endpoint
      console.log('\n4. Testing /api/admin/accounts endpoint...');
      const accountsResponse = await fetch('http://localhost:8081/api/admin/accounts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('Accounts response status:', accountsResponse.status);
      
      if (accountsResponse.ok) {
        const accountsData = await accountsResponse.json();
        console.log('✅ Accounts API working');
        console.log('Total accounts found:', accountsData.data.length);
        
        const users = accountsData.data.filter(a => a.role === 'USER');
        const vendors = accountsData.data.filter(a => a.role === 'VENDOR');
        const admins = accountsData.data.filter(a => a.role === 'ADMIN');
        
        console.log(`  Users: ${users.length}`);
        console.log(`  Vendors: ${vendors.length}`);
        console.log(`  Admins: ${admins.length}`);
      } else {
        const accountsError = await accountsResponse.text();
        console.log('❌ Accounts API failed');
        console.log('Error:', accountsError);
      }
      
    } else {
      const loginError = await loginResponse.text();
      console.log('❌ Admin login failed');
      console.log('Error:', loginError);
      
      // Try to register admin first
      console.log('\nTrying to register admin...');
      const registerResponse = await fetch('http://localhost:8081/api/auth/register/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Admin',
          email: 'admin@test.com',
          password: 'admin123'
        })
      });
      
      if (registerResponse.ok) {
        console.log('✅ Admin registered successfully');
        console.log('Please run the test again to login as admin');
      } else {
        console.log('❌ Admin registration failed');
        console.log('Error:', await registerResponse.text());
      }
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  console.log('\n=== TEST COMPLETE ===');
};

testAdminAPI();
