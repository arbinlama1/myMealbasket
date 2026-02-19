import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Layout/Navbar';
import Home from './pages/Home';
import SimpleLogin from './pages/SimpleLogin';
import SimpleRegister from './pages/SimpleRegister';
import SimpleUserDashboard from './pages/SimpleUserDashboard';
import SimpleVendorDashboard from './pages/SimpleVendorDashboard';
import SimpleAdminDashboard from './pages/SimpleAdminDashboard';
import SimpleMealPlanner from './pages/SimpleMealPlanner';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Orders from './pages/Orders';
import MealPlanner from './pages/MealPlanner';
import VendorDashboard from './pages/VendorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import ApiTest from './pages/ApiTest';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';
import APITest from './components/APITest';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32', // Green
      light: '#4CAF50',
      dark: '#1B5E20',
    },
    secondary: {
      main: '#FF6B35', // Orange
      light: '#FF8A65',
      dark: '#E65100',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Simple Routes WITHOUT AuthContext - Main Login/Register */}
          <Route path="/login" element={<SimpleLogin />} />
          <Route path="/register" element={<SimpleRegister />} />
          <Route path="/user/dashboard" element={<SimpleUserDashboard />} />
          <Route path="/vendor/dashboard" element={<SimpleVendorDashboard />} />
          <Route path="/admin/dashboard" element={<SimpleAdminDashboard />} />
          <Route path="/meal-planner" element={<SimpleMealPlanner />} />
          
          {/* All other routes WITH AuthContext */}
          <Route path="/*" element={
            <AuthProvider>
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/about-us" element={<AboutUs />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/api-test" element={<ApiTest />} />
                <Route path="/debug-api" element={<APITest />} />

                {/* Protected User Routes */}
                <Route
                  path="/meal-planner"
                  element={
                    <ProtectedRoute requiredRole="USER">
                      <MealPlanner />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute requiredRole="USER">
                      <Orders />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Vendor Routes */}
                <Route
                  path="/vendor/*"
                  element={
                    <ProtectedRoute requiredRole="VENDOR">
                      <VendorDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Admin Routes */}
                <Route
                  path="/admin/*"
                  element={
                    <ProtectedRoute requiredRole="ADMIN">
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/user-management"
                  element={
                    <ProtectedRoute requiredRole="ADMIN">
                      <UserManagement />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AuthProvider>
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
