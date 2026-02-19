import React, { useState } from 'react';
import { testAPI, authAPI, setupAPI } from '../services/api';

const APITest = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test, status, message, data = null) => {
    setTestResults(prev => [...prev, {
      test,
      status,
      message,
      data,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const runTests = async () => {
    setLoading(true);
    setTestResults([]);
    
    // Test 1: Basic Health Check
    try {
      const response = await testAPI.healthCheck();
      addResult('Health Check', 'SUCCESS', 'API is reachable', response.data);
    } catch (error) {
      addResult('Health Check', 'FAILED', error.message);
    }

    // Test 2: Public Endpoint
    try {
      const response = await testAPI.publicEndpoint();
      addResult('Public Endpoint', 'SUCCESS', 'Public API working', response.data);
    } catch (error) {
      addResult('Public Endpoint', 'FAILED', error.message);
    }

    // Test 3: Get Test Credentials
    try {
      const response = await setupAPI.getTestCredentials();
      addResult('Get Test Credentials', 'SUCCESS', 'Test credentials retrieved', response.data);
    } catch (error) {
      addResult('Get Test Credentials', 'FAILED', error.message);
    }

    // Test 4: Auth Login Test with Test User
    try {
      const response = await authAPI.login({ email: 'user@test.com', password: 'password123' });
      addResult('Auth Login (Test User)', 'SUCCESS', 'Auth API working', response.data);
    } catch (error) {
      addResult('Auth Login (Test User)', 'FAILED', error.message);
    }

    setLoading(false);
  };

  const createTestUsers = async () => {
    setLoading(true);
    try {
      const response = await setupAPI.createTestUsers();
      addResult('Create Test Users', 'SUCCESS', 'Test users created successfully', response.data);
    } catch (error) {
      addResult('Create Test Users', 'FAILED', error.message);
    }
    setLoading(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>🔧 API Connection Test</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={createTestUsers}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#ccc' : '#ff9800',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          {loading ? 'Creating Users...' : '🔧 Create Test Users'}
        </button>
        
        <button 
          onClick={runTests} 
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#ccc' : '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          {loading ? 'Running Tests...' : '🧪 Run API Tests'}
        </button>
        
        <button 
          onClick={clearResults}
          style={{
            padding: '10px 20px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🗑️ Clear Results
        </button>
      </div>

      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <h3>📋 Test Instructions:</h3>
        <ol>
          <li>Make sure backend server is running on <strong>http://localhost:8081</strong></li>
          <li>Click "🔧 Create Test Users" to create test accounts</li>
          <li>Click "🧪 Run API Tests" to check connectivity</li>
          <li>Check results below for any connection issues</li>
        </ol>
        
        <h4>🔑 Test Credentials:</h4>
        <ul>
          <li><strong>User:</strong> user@test.com / password123</li>
          <li><strong>Vendor:</strong> vendor@test.com / vendor123</li>
          <li><strong>Admin:</strong> admin@test.com / admin123</li>
        </ul>
      </div>

      {testResults.length > 0 && (
        <div>
          <h3>📊 Test Results:</h3>
          {testResults.map((result, index) => (
            <div 
              key={index}
              style={{
                padding: '15px',
                margin: '10px 0',
                border: `2px solid ${result.status === 'SUCCESS' ? '#4caf50' : '#f44336'}`,
                borderRadius: '4px',
                backgroundColor: result.status === 'SUCCESS' ? '#f1f8e9' : '#ffebee'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, color: result.status === 'SUCCESS' ? '#2e7d32' : '#c62828' }}>
                  {result.test}
                </h4>
                <span style={{ fontSize: '12px', color: '#666' }}>
                  {result.timestamp}
                </span>
              </div>
              <p style={{ margin: '5px 0', fontWeight: 'bold' }}>
                Status: {result.status}
              </p>
              <p style={{ margin: '5px 0' }}>
                Message: {result.message}
              </p>
              {result.data && (
                <details style={{ marginTop: '10px' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>View Response Data</summary>
                  <pre style={{ 
                    backgroundColor: '#f8f9fa', 
                    padding: '10px', 
                    borderRadius: '4px',
                    overflow: 'auto',
                    fontSize: '12px'
                  }}>
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default APITest;
