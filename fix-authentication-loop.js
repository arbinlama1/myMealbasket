// Fix authentication loop and create admin account
const fixAuthenticationLoop = async () => {
  console.log('=== FIXING AUTHENTICATION LOOP ===\n');
  
  try {
    // Step 1: Test basic backend connectivity
    console.log('1. Testing backend connectivity...');
    const testResponse = await fetch('http://localhost:8081/api/auth/test', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    }).catch(() => {
      console.log('Backend test endpoint not available, trying login endpoint...');
    });
    
    // Step 2: Create admin account directly
    console.log('\n2. Creating admin@gmail.com account...');
    const adminData = {
      name: 'System Administrator',
      email: 'admin@gmail.com',
      password: 'qwerty1'
    };
    
    const registerResponse = await fetch('http://localhost:8081/api/auth/register/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adminData)
    });
    
    console.log('Register response status:', registerResponse.status);
    
    if (registerResponse.ok) {
      const registerResult = await registerResponse.json();
      console.log('✅ Admin registered successfully!');
      console.log('Admin ID:', registerResult.data?.id);
    } else {
      const registerError = await registerResponse.text();
      console.log('❌ Admin registration failed:', registerError);
      
      if (registerError.includes('already exists')) {
        console.log('✅ Admin already exists, proceeding to login test...');
      }
    }
    
    // Step 3: Test login with multiple attempts
    console.log('\n3. Testing admin login...');
    const loginResponse = await fetch('http://localhost:8081/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@gmail.com',
        password: 'qwerty1'
      })
    });
    
    console.log('Login response status:', loginResponse.status);
    
    if (loginResponse.ok) {
      const loginResult = await loginResponse.json();
      console.log('✅ Login successful!');
      console.log('Token received:', loginResult.data?.token ? 'YES' : 'NO');
      console.log('User ID:', loginResult.data?.id);
      
      // Step 4: Test admin dashboard access
      if (loginResult.data?.token) {
        console.log('\n4. Testing admin dashboard access...');
        
        const usersResponse = await fetch('http://localhost:8081/api/admin/users', {
          headers: { 'Authorization': `Bearer ${loginResult.data.token}` }
        });
        
        console.log('Users API status:', usersResponse.status);
        
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          console.log('✅ Admin dashboard access working!');
          console.log('Total accounts found:', usersData.data?.length || 0);
          
          const admins = usersData.data?.filter(u => u.role === 'ADMIN') || [];
          const users = usersData.data?.filter(u => u.role === 'USER') || [];
          const vendors = usersData.data?.filter(u => u.role === 'VENDOR') || [];
          
          console.log(`Admins: ${admins.length}`);
          console.log(`Users: ${users.length}`);
          console.log(`Vendors: ${vendors.length}`);
          
          console.log('\n=== AUTHENTICATION FIXED ===');
          console.log('Your admin account is working:');
          console.log('Email: admin@gmail.com');
          console.log('Password: qwerty1');
          console.log('\nYou can now access the admin dashboard!');
          
        } else {
          const usersError = await usersResponse.text();
          console.log('❌ Admin dashboard access failed:', usersError);
        }
      }
      
    } else {
      const loginError = await loginResponse.text();
      console.log('❌ Login failed:', loginError);
      
      // Try alternative passwords
      console.log('\nTrying alternative passwords...');
      const altPasswords = ['admin123', 'password', 'admin'];
      
      for (const pwd of altPasswords) {
        console.log(`Trying password: ${pwd}`);
        
        const altLoginResponse = await fetch('http://localhost:8081/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'admin@gmail.com',
            password: pwd
          })
        });
        
        if (altLoginResponse.ok) {
          console.log(`✅ Login successful with password: ${pwd}`);
          console.log('Use this password for admin@gmail.com');
          break;
        }
      }
    }
    
    // Step 5: Clear any problematic sessions
    console.log('\n5. Clearing browser storage...');
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.log('✅ Browser storage cleared');
    }
    
  } catch (error) {
    console.error('❌ Critical error:', error.message);
    console.log('\nPossible solutions:');
    console.log('1. Restart the backend');
    console.log('2. Check database connection');
    console.log('3. Clear browser cache and cookies');
    console.log('4. Try different browser');
  }
  
  console.log('\n=== FIX PROCESS COMPLETE ===');
};

// Auto-run the fix
fixAuthenticationLoop();
