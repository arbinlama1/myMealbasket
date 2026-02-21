import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Layout/Navbar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SimpleUserDashboard from './pages/SimpleUserDashboard';
import SimpleVendorDashboard from './pages/SimpleVendorDashboard';
import SimpleAdminDashboard from './pages/SimpleAdminDashboard';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Orders from './pages/Orders';
import MealPlanner from './pages/MealPlanner';
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';
import ProtectedRoute from './components/Auth/ProtectedRoute';

const theme = createTheme({
  palette: {
    primary: { main: '#2E7D32', light: '#4CAF50', dark: '#1B5E20' },
    secondary: { main: '#FF6B35', light: '#FF8A65', dark: '#E65100' },
    background: { default: '#F5F5F5', paper: '#FFFFFF' },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 600 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: { root: { textTransform: 'none', borderRadius: 8, fontWeight: 500 } },
    },
    MuiCard: {
      styleOverrides: { root: { borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' } },
    },
  },
});

// ── Inner router component so useAuth() can access AuthProvider context ────────
function AppRoutes() {
  const { isAuthenticated, role } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        {/* ── Public routes ───────────────────────────────────────────────── */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />

        {/* ── Home: show user dashboard if logged in as USER ─────────────── */}
        <Route
          path="/"
          element={
            isAuthenticated && role === 'USER' ? <SimpleUserDashboard /> : <Home />
          }
        />

        {/* ── Protected: USER ─────────────────────────────────────────────── */}
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

        {/* ── Protected: VENDOR ───────────────────────────────────────────── */}
        {/* FIX: /vendor/* catches /vendor and all sub-paths */}
        <Route
          path="/vendor/*"
          element={
            <ProtectedRoute requiredRole="VENDOR">
              <SimpleVendorDashboard />
            </ProtectedRoute>
          }
        />

        {/* ── Protected: ADMIN ────────────────────────────────────────────── */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <SimpleAdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* ── Catch-all ───────────────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* FIX: AuthProvider wraps Router so useAuth() works inside Router */}
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;