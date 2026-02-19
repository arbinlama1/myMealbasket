// Create admin account with nabraj@gmail.com
const createNabrajAdmin = async () => {
  console.log('=== CREATING NABRAJ ADMIN ACCOUNT ===\n');
  
  try {
    const adminData = {
      name: 'Nabaraj Administrator',
      email: 'nabraj@gmail.com',
      password: 'qwerty'
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
      console.log('Admin details:', result.data);
      
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
        console.log('Token received:', loginResult.data.token.substring(0, 50) + '...');
        console.log('User ID:', loginResult.data.id);
        
        console.log('\n=== ADMIN ACCOUNT READY ===');
        console.log('You can now login with:');
        console.log('Email: nabraj@gmail.com');
        console.log('Password: qwerty');
        console.log('\nGo to admin dashboard after login!');
        
      } else {
        const error = await loginResponse.text();
        console.log('❌ Login test failed:', error);
      }
      
    } else {
      const error = await registerResponse.text();
      console.log('❌ Admin creation failed:', error);
      
      if (error.includes('already exists')) {
        console.log('\n⚠️  Admin account already exists!');
        console.log('Trying to login with existing credentials...');
        
        // Try to login with existing account
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
          console.log('Email:', adminData.email);
          console.log('Password:', adminData.password);
        } else {
          console.log('❌ Login failed. Account exists but password is different.');
          console.log('Try different passwords or contact support.');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\nMake sure backend is running on http://localhost:8081');
  }
  
  console.log('\n=== PROCESS COMPLETE ===');
};

createNabrajAdmin();
