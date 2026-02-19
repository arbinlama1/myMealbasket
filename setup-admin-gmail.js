// Setup admin@gmail.com as the only admin account
const setupAdminGmail = async () => {
  console.log('=== SETTING UP ADMIN@GMAIL.COM ===\n');
  
  try {
    const adminData = {
      name: 'System Administrator',
      email: 'admin@gmail.com',
      password: 'qwerty1'
    };
    
    console.log('Creating admin account...');
    console.log('Email:', adminData.email);
    console.log('Password:', adminData.password);
    
    // Register the admin
    const registerResponse = await fetch('http://localhost:8081/api/auth/register/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adminData)
    });
    
    if (registerResponse.ok) {
      const result = await registerResponse.json();
      console.log('✅ Admin account created successfully!');
      console.log('Admin ID:', result.data.id);
      
      // Test login immediately
      console.log('\nTesting login...');
      const loginResponse = await fetch('http://localhost:8081/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: adminData.email,
          password: adminData.password
        })
      });
      
      if (loginResponse.ok) {
        const loginResult = await loginResponse.json();
        console.log('✅ Login successful!');
        console.log('User ID:', loginResult.data.id);
        
        // Test admin dashboard access
        console.log('\nTesting admin dashboard access...');
        const usersResponse = await fetch('http://localhost:8081/api/admin/users', {
          headers: { 'Authorization': `Bearer ${loginResult.data.token}` }
        });
        
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          const admins = usersData.data.filter(u => u.role === 'ADMIN');
          
          console.log('✅ Admin dashboard access working!');
          console.log('Current admin accounts:');
          admins.forEach((admin, index) => {
            console.log(`  ${index + 1}. ${admin.name} - ${admin.email}`);
          });
          
          console.log('\n=== SETUP COMPLETE ===');
          console.log('Your admin account is ready:');
          console.log('Email: admin@gmail.com');
          console.log('Password: qwerty1');
          console.log('\nYou can now:');
          console.log('1. Login to admin dashboard');
          console.log('2. View all users and vendors');
          console.log('3. Manage the system');
          
        } else {
          console.log('❌ Admin dashboard access failed:', await usersResponse.text());
        }
        
      } else {
        const error = await loginResponse.text();
        console.log('❌ Login test failed:', error);
      }
      
    } else {
      const error = await registerResponse.text();
      
      if (error.includes('already exists')) {
        console.log('✅ Admin account already exists!');
        
        // Test login with existing account
        const loginResponse = await fetch('http://localhost:8081/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: adminData.email,
            password: adminData.password
          })
        });
        
        if (loginResponse.ok) {
          console.log('✅ Login successful with existing account!');
          console.log('\n=== READY TO USE ===');
          console.log('Email: admin@gmail.com');
          console.log('Password: qwerty1');
        } else {
          console.log('❌ Password might be different for existing account');
          console.log('Try these passwords:');
          console.log('- qwerty1');
          console.log('- admin123');
          console.log('- password');
        }
      } else {
        console.log('❌ Admin creation failed:', error);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\nMake sure backend is running on http://localhost:8081');
  }
};

setupAdminGmail();
