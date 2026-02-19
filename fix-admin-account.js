// Fix admin account - check existing and create/reset if needed
const fixAdminAccount = async () => {
  console.log('=== FIXING ADMIN ACCOUNT ===\n');
  
  try {
    // Step 1: Try to login with common admin credentials
    console.log('1. Testing common admin credentials...');
    
    const commonAdmins = [
      { email: 'admin@test.com', password: 'admin123' },
      { email: 'admin@gmail.com', password: 'admin123' },
      { email: 'admin@mealbasket.com', password: 'admin123' },
      { email: 'admin', password: 'admin' },
      { email: 'admin@test.com', password: 'password' }
    ];
    
    let workingAdmin = null;
    
    for (const admin of commonAdmins) {
      console.log(`Trying: ${admin.email} / ${admin.password}`);
      
      const loginResponse = await fetch('http://localhost:8081/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(admin)
      });
      
      if (loginResponse.ok) {
        console.log(`✅ Found working admin: ${admin.email}`);
        workingAdmin = admin;
        break;
      } else {
        const error = await loginResponse.text();
        console.log(`❌ Failed: ${error.substring(0, 100)}...`);
      }
    }
    
    if (workingAdmin) {
      console.log('\n=== WORKING ADMIN FOUND ===');
      console.log(`Email: ${workingAdmin.email}`);
      console.log(`Password: ${workingAdmin.password}`);
      console.log('\nUse these credentials to login to admin dashboard.');
    } else {
      // Step 2: Create a new admin account
      console.log('\n2. No working admin found. Creating new admin account...');
      
      const newAdmin = {
        name: 'System Administrator',
        email: 'admin@test.com',
        password: 'admin123'
      };
      
      console.log('Creating admin:', newAdmin.email);
      
      const registerResponse = await fetch('http://localhost:8081/api/auth/register/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAdmin)
      });
      
      if (registerResponse.ok) {
        console.log('✅ Admin account created successfully!');
        console.log('\n=== NEW ADMIN CREDENTIALS ===');
        console.log(`Email: ${newAdmin.email}`);
        console.log(`Password: ${newAdmin.password}`);
        console.log('\nUse these credentials to login to admin dashboard.');
        
        // Test the new admin login
        console.log('\n3. Testing new admin login...');
        const testLogin = await fetch('http://localhost:8081/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: newAdmin.email,
            password: newAdmin.password
          })
        });
        
        if (testLogin.ok) {
          console.log('✅ New admin login works perfectly!');
        } else {
          console.log('❌ New admin login failed:', await testLogin.text());
        }
        
      } else {
        const error = await registerResponse.text();
        console.log('❌ Admin creation failed:', error);
        
        if (error.includes('already exists')) {
          console.log('\n⚠️  Admin already exists but password might be different.');
          console.log('Try these passwords for admin@test.com:');
          console.log('- admin123');
          console.log('- password');
          console.log('- admin');
          console.log('- 123456');
        }
      }
    }
    
    // Step 3: Show all admin accounts in database
    console.log('\n4. Checking all admin accounts in database...');
    
    // Try to get admin list (this will help us see what admins exist)
    try {
      const loginResponse = await fetch('http://localhost:8081/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@test.com', password: 'admin123' })
      });
      
      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        const token = loginData.data.token;
        
        const usersResponse = await fetch('http://localhost:8081/api/admin/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          const admins = usersData.data.filter(u => u.role === 'ADMIN');
          
          console.log('Found admin accounts:');
          admins.forEach((admin, index) => {
            console.log(`  ${index + 1}. ${admin.name} - ${admin.email}`);
          });
        }
      }
    } catch (e) {
      console.log('Could not retrieve admin list:', e.message);
    }
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  }
  
  console.log('\n=== ADMIN FIX COMPLETE ===');
  console.log('\nNEXT STEPS:');
  console.log('1. Use the credentials shown above to login');
  console.log('2. Go to admin dashboard');
  console.log('3. Check if you can see users and vendors');
};

fixAdminAccount();
