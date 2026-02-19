// Direct implementation of admin@gmail.com account
console.log('=== IMPLEMENTING ADMIN ACCOUNT ===');

// Clear existing sessions
localStorage.clear();
sessionStorage.clear();
console.log('✅ Cleared existing sessions');

// Create admin account
fetch('http://localhost:8081/api/auth/register/admin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'System Administrator',
    email: 'admin@gmail.com',
    password: 'qwerty1'
  })
})
.then(response => response.json())
.then(data => {
  console.log('✅ Admin account created:', data);
  
  // Login immediately
  return fetch('http://localhost:8081/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@gmail.com',
      password: 'qwerty1'
    })
  });
})
.then(response => response.json())
.then(data => {
  console.log('✅ Login successful:', data);
  
  // Store session
  localStorage.setItem('token', data.data.token);
  localStorage.setItem('user', JSON.stringify(data.data));
  console.log('✅ Session stored');
  
  console.log('=== ADMIN ACCOUNT READY ===');
  console.log('Email: admin@gmail.com');
  console.log('Password: qwerty1');
  console.log('You can now access admin dashboard!');
  
  // Reload to apply changes
  setTimeout(() => {
    window.location.reload();
  }, 2000);
})
.catch(error => {
  console.error('❌ Error:', error);
  console.log('Make sure backend is running on port 8081');
});

console.log('Implementation in progress...');
