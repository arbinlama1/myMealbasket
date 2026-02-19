// Simple test to check if backend is running
const testBackend = async () => {
  try {
    console.log('Testing backend connection...');
    
    // Test basic health check
    const response = await fetch('http://localhost:8081/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'vendor@test.com',
        password: 'vendor123'
      })
    });
    
    if (response.ok) {
      console.log('✅ Backend is running and responding');
      const data = await response.json();
      console.log('Login response:', data);
    } else {
      console.log('❌ Backend responded with error:', response.status);
    }
  } catch (error) {
    console.error('❌ Backend connection failed:', error.message);
  }
};

testBackend();
