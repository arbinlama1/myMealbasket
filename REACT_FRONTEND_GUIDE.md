# React Frontend Setup Guide for MealBasketSystem

## Backend API Endpoints

The backend has been converted to support React frontend with REST API endpoints.

### Authentication Endpoints
- `POST /api/auth/login` - User/Admin login
- `POST /api/auth/register` - User registration

### Product Endpoints
- `GET /api/products` - Get all products
- `GET /api/products/{id}` - Get product by ID
- `GET /api/products/search?name={name}` - Search products by name
- `GET /api/products/vendor/{vendorName}` - Get products by vendor
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/{id}` - Update product (Admin only)
- `DELETE /api/products/{id}` - Delete product (Admin only)

### Order Endpoints
- `POST /api/orders` - Create order (Authenticated users)
- `GET /api/orders` - Get all orders (Admin only)
- `GET /api/orders/user` - Get current user's orders
- `GET /api/orders/{id}` - Get order by ID
- `DELETE /api/orders/{id}` - Delete order

### Contact Endpoints
- `POST /api/contact/message` - Send contact message
- `GET /api/contact/messages` - Get all messages (Admin only)

## React Setup Instructions

### 1. Create React App
```bash
npx create-react-app mealbasket-frontend
cd mealbasket-frontend
```

### 2. Install Required Dependencies
```bash
npm install axios react-router-dom
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material
```

### 3. Project Structure
```
src/
├── components/
│   ├── auth/
│   │   ├── Login.js
│   │   └── Register.js
│   ├── products/
│   │   ├── ProductList.js
│   │   ├── ProductCard.js
│   │   └── ProductDetail.js
│   ├── orders/
│   │   ├── OrderList.js
│   │   └── OrderForm.js
│   └── layout/
│       ├── Header.js
│       ├── Footer.js
│       └── Navigation.js
├── services/
│   └── api.js
├── context/
│   └── AuthContext.js
├── App.js
└── index.js
```

### 4. API Service Setup (src/services/api.js)
```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### 5. Authentication Context (src/context/AuthContext.js)
```javascript
import React, { createContext, useState, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, role, name, id } = response.data.data;
      
      localStorage.setItem('token', token);
      setUser({ id, email, role, name });
      
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      await api.post('/auth/register', userData);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 6. Sample Login Component (src/components/auth/Login.js)
```javascript
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/products');
    } else {
      setError(result.message);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Login</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default Login;
```

### 7. Sample Product List Component (src/components/products/ProductList.js)
```javascript
import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        setProducts(response.data.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Products</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        {products.map((product) => (
          <div key={product.id} style={{ border: '1px solid #ddd', padding: '10px' }}>
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p>Price: ${product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
```

### 8. Main App Component (src/App.js)
```javascript
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProductList from './components/products/ProductList';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/products" element={
            <ProtectedRoute>
              <ProductList />
            </ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to="/products" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
```

## Running the Application

### Backend
```bash
cd MealBasketSystem
mvn spring-boot:run
```

### Frontend
```bash
cd mealbasket-frontend
npm start
```

The frontend will run on http://localhost:3000 and the backend on http://localhost:8081.

## Authentication Flow

1. Users register/login through `/api/auth/register` or `/api/auth/login`
2. Backend returns JWT token on successful authentication
3. Frontend stores token in localStorage
4. All subsequent API calls include the JWT token in Authorization header
5. Backend validates token and allows access to protected endpoints

## API Response Format

All API responses follow this format:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error message",
  "data": null
}
```

## Next Steps

1. Implement shopping cart functionality
2. Add payment integration
3. Create admin dashboard
4. Add product categories
5. Implement user profile management
6. Add order history
7. Implement vendor management
