// Create test users and vendors for admin dashboard
const createTestUsers = async () => {
  console.log('=== CREATING TEST USERS AND VENDORS ===\n');
  
  try {
    // Create test admin
    console.log('1. Creating test admin...');
    const adminResponse = await fetch('http://localhost:8081/api/auth/register/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Admin',
        email: 'admin@test.com',
        password: 'admin123'
      })
    });
    
    if (adminResponse.ok) {
      console.log('✅ Admin created successfully');
    } else {
      const error = await adminResponse.text();
      if (error.includes('already exists')) {
        console.log('✅ Admin already exists');
      } else {
        console.log('❌ Admin creation failed:', error);
      }
    }
    
    // Create test users
    console.log('\n2. Creating test users...');
    const testUsers = [
      { name: 'John Doe', email: 'john@test.com', password: 'user123' },
      { name: 'Jane Smith', email: 'jane@test.com', password: 'user123' },
      { name: 'Bob Wilson', email: 'bob@test.com', password: 'user123' }
    ];
    
    for (const user of testUsers) {
      const userResponse = await fetch('http://localhost:8081/api/auth/register/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      
      if (userResponse.ok) {
        console.log(`✅ User ${user.name} created successfully`);
      } else {
        const error = await userResponse.text();
        if (error.includes('already exists')) {
          console.log(`✅ User ${user.name} already exists`);
        } else {
          console.log(`❌ User ${user.name} creation failed:`, error);
        }
      }
    }
    
    // Create test vendors
    console.log('\n3. Creating test vendors...');
    const testVendors = [
      { 
        name: 'Electronics Store', 
        email: 'electronics@test.com', 
        password: 'vendor123',
        shopName: 'Tech World',
        businessType: 'Electronic',
        phone: '1234567890',
        address: '123 Tech Street'
      },
      { 
        name: 'Food Corner', 
        email: 'food@test.com', 
        password: 'vendor123',
        shopName: 'Delicious Food',
        businessType: 'Food',
        phone: '0987654321',
        address: '456 Food Avenue'
      },
      { 
        name: 'Fashion Hub', 
        email: 'fashion@test.com', 
        password: 'vendor123',
        shopName: 'Style Store',
        businessType: 'Clothing',
        phone: '1122334455',
        address: '789 Fashion Boulevard'
      }
    ];
    
    for (const vendor of testVendors) {
      const vendorResponse = await fetch('http://localhost:8081/api/auth/register/vendor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vendor)
      });
      
      if (vendorResponse.ok) {
        console.log(`✅ Vendor ${vendor.name} created successfully`);
      } else {
        const error = await vendorResponse.text();
        if (error.includes('already exists')) {
          console.log(`✅ Vendor ${vendor.name} already exists`);
        } else {
          console.log(`❌ Vendor ${vendor.name} creation failed:`, error);
        }
      }
    }
    
    // Test admin login and verify data
    console.log('\n4. Testing admin login and data retrieval...');
    const loginResponse = await fetch('http://localhost:8081/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@test.com', password: 'admin123' })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Admin login successful');
      const token = loginData.data.token;
      
      // Get all users
      const usersResponse = await fetch('http://localhost:8081/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        console.log('✅ Users retrieved successfully');
        console.log('Total accounts:', usersData.data.length);
        
        const users = usersData.data.filter(u => u.role === 'USER');
        const vendors = usersData.data.filter(u => u.role === 'VENDOR');
        const admins = usersData.data.filter(u => u.role === 'ADMIN');
        
        console.log(`  Users: ${users.length}`);
        console.log(`  Vendors: ${vendors.length}`);
        console.log(`  Admins: ${admins.length}`);
        
        console.log('\n=== USERS AND VENDORS READY FOR ADMIN DASHBOARD ===');
        console.log('Now you can:');
        console.log('1. Login as admin: admin@test.com / admin123');
        console.log('2. Go to admin dashboard');
        console.log('3. Click "Manage Users" to see all users');
        console.log('4. Click "Manage Vendors" to see all vendors');
        
      } else {
        console.log('❌ Failed to retrieve users:', await usersResponse.text());
      }
    } else {
      console.log('❌ Admin login failed:', await loginResponse.text());
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

createTestUsers();
