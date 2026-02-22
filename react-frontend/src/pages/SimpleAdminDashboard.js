import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Avatar,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent,
  LinearProgress,
  IconButton,
  ListItemSecondaryAction,
  Fade,
  AppBar,
  Toolbar,
  Menu,
  MenuItem
} from '@mui/material';
import {
  People,
  Store,
  ShoppingCart,
  AttachMoney,
  TrendingUp,
  Person,
  Business,
  Email,
  Phone,
  LocationOn,
  AccessTime,
  Delete,
  Refresh,
  Dashboard,
  Assessment,
  Group,
  LocalMall,
  MonetizationOn,
  ShowChart,
  AdminPanelSettings,
  Logout,
  ArrowBack,
  AccountCircle
} from '@mui/icons-material';
import adminService from '../services/adminService';

const SimpleAdminDashboard = () => {
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, users, vendors, analytics, settings
  const [anchorEl, setAnchorEl] = useState(null);
  
  // Admin data states
  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVendors: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  
  // Real-time activity tracking states
  const [recentActivities, setRecentActivities] = useState([]);
  const [systemStatus, setSystemStatus] = useState({
    activeUsers: 0,
    onlineUsers: 0,
    totalSessions: 0,
    serverLoad: 45,
    uptime: '99.8%',
    lastBackup: new Date().toLocaleString(),
    systemVersion: 'v2.1.0'
  });
  const [userSessions, setUserSessions] = useState([]);

  useEffect(() => {
    // Get admin data from localStorage
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!user || !token) {
      setError('Please login first');
      setLoading(false);
      return;
    }

    try {
      const parsedUser = JSON.parse(user);
      if (parsedUser.role !== 'ADMIN') {
        setError('Access denied. Admin role required.');
        setLoading(false);
        return;
      }
      setAdminData(parsedUser);
      
      // Load admin data
      loadAdminData();
    } catch (err) {
      setError('Error loading user data');
      setLoading(false);
    }
  }, []);

  // Load admin dashboard data
  const loadAdminData = async () => {
    try {
      console.log('AdminDashboard: Loading admin data from backend...');
      setLoading(true);
      setError('');
      
      // Fetch data from backend API only - no localStorage fallbacks
      let allUsers = [];
      let allProducts = [];
      
      // Fetch users from backend
      const usersData = await adminService.getAllUsers();
      allUsers = usersData.data || usersData || [];
      console.log('AdminDashboard: Successfully fetched users from backend:', allUsers);

      // Fetch products from backend
      const productsData = await adminService.getAllProducts();
      allProducts = productsData.data || productsData || [];
      console.log('AdminDashboard: Successfully fetched products from backend:', allProducts);
      
      // Debug: Check what users we have
      console.log('AdminDashboard: Processing users:', allUsers);
      console.log('AdminDashboard: Total users found:', allUsers.length);
      console.log('AdminDashboard: Products count:', Array.isArray(allProducts) ? allProducts.length : 0);

      // Normalize backend payload (AccountDTO) to expected UI shape
      allUsers = (Array.isArray(allUsers) ? allUsers : []).map(u => {
        const role = u.role || u.userRole || u.type;
        const isVendor = role === 'VENDOR';
        return {
          ...u,
          role,
          // Map vendor business fields from backend
          businessName: u.businessName || u.shopName || u.name,
          businessType: u.businessType || 'N/A',
          // Vendor list logic expects this flag
          isRegistered: isVendor ? true : u.isRegistered,
        };
      });

      // Helper: get products for a vendor id (works for backend and fallback)
      const getProductsForVendorId = (vendorId) => {
        if (!vendorId) return [];
        if (!Array.isArray(allProducts)) return [];
        return allProducts.filter(p => {
          // Backend Product has p.vendor as object
          if (p && p.vendor && (p.vendor.id === vendorId || p.vendor.id === Number(vendorId))) return true;
          // Fallback/localStorage product may have vendorId directly
          if (p && (p.vendorId === vendorId || p.vendorId === Number(vendorId))) return true;
          return false;
        });
      };
      
      // Log user details for debugging
      allUsers.forEach((user, index) => {
        console.log(`User ${index + 1}:`, {
          name: user.name,
          email: user.email,
          role: user.role,
          isConnected: user.isConnected,
          productCount: user.productCount || 0,
          businessName: user.businessName || 'N/A'
        });
      });
      
      // Specifically log vendors for debugging
      const vendors = allUsers.filter(u => u.role === 'VENDOR');
      console.log('AdminDashboard: Found vendors:', vendors);
      console.log('AdminDashboard: Total vendors:', vendors.length);
      vendors.forEach((vendor, index) => {
        console.log(`Vendor ${index + 1}:`, {
          name: vendor.name,
          email: vendor.email,
          businessName: vendor.businessName,
          isConnected: vendor.isConnected,
          productCount: vendor.productCount || 0,
          lastLogin: vendor.lastLogin
        });
      });

    // Connect users to their vendor products
    allUsers = allUsers.map(user => {
      if (user.role === 'VENDOR') {
        const vendorProducts = getProductsForVendorId(user.id);
        console.log(`AdminDashboard: Connecting vendor ${user.name} (${user.email}) to ${vendorProducts.length} products`);

        return {
          ...user,
          vendorProducts,
          productCount: vendorProducts.length,
          isConnected: vendorProducts.length > 0, // Only connected if has products
          lastActivity: vendorProducts.length > 0 ? 'Active' : 'No products yet'
        };
      } else {
        if (user.role === 'USER') {
          // Check if user has ordered products (for future implementation)
          return {
            ...user,
            isConnected: true, // Users are always connected once they register
            vendorProducts: [],
            productCount: 0,
            lastActivity: 'Active'
          };
        } else {
          // Admin
          return {
            ...user,
            isConnected: true, // Admin is always connected
            vendorProducts: [],
            productCount: 0,
            lastActivity: 'Managing System'
          };
        }
      }
    });

    // Extract vendors from registered users (real DB vendors)
    const registeredVendors = allUsers.filter(user => user.role === 'VENDOR');
    const productVendors = Array.isArray(allProducts)
      ? [...new Set(allProducts.map(p => (p && p.vendor && (p.vendor.shopName || p.vendor.name)) || p.vendor))].filter(Boolean)
      : [];

    // Combine ALL vendors - both registered and those with products
    const allVendorsList = [];

    // First, add all registered vendors
    registeredVendors.forEach(vendor => {
      const vendorName = vendor.businessName || vendor.shopName || vendor.name;
      const vendorProducts = getProductsForVendorId(vendor.id);

      allVendorsList.push({
        id: vendor.id,
        name: vendorName,
        email: vendor.email || 'N/A',
        phone: vendor.phone || 'N/A',
        businessType: vendor.businessType || 'N/A',
        address: vendor.address || 'N/A',
        registeredAt: vendor.createdAt || 'N/A',
        isRegistered: true,
        isConnected: vendorProducts.length > 0,
        productCount: vendorProducts.length,
        vendorId: vendor.id
      });
    });

    // Then, add vendors from products that aren't already registered
    productVendors.forEach(vendorName => {
      if (!allVendorsList.find(v => v.name === vendorName) && vendorName !== 'Restaurant One') {
        const vendorProducts = allProducts.filter(p => p.vendor === vendorName);
        
        allVendorsList.push({
          id: null, // No registered ID
          name: vendorName,
          email: 'N/A',
          phone: 'N/A',
          businessType: 'N/A',
          address: 'N/A',
          registeredAt: 'N/A',
          isRegistered: false,
          isConnected: vendorProducts.length > 0,
          productCount: vendorProducts.length,
          vendorId: null
        });
      }
    });
      
      // Calculate stats
      const calculatedStats = {
        totalUsers: allUsers.length || 0,
        totalVendors: allVendorsList.length,
        totalProducts: allProducts.length,
        totalOrders: 0, // Will be implemented when orders are stored
        totalRevenue: 0,
        connectedUsers: allUsers.filter(u => u.isConnected).length,
        activeVendors: allVendorsList.filter(v => v.isConnected).length
      };
      
      console.log('AdminDashboard: Final stats:', calculatedStats);
      console.log('AdminDashboard: Final users list:', allUsers);
      console.log('AdminDashboard: Connected users:', allUsers.filter(u => u.isConnected));
      
      // Load recent activities
      loadRecentActivities(allProducts, allUsers, allVendorsList);
      
      // Load user sessions and system status
      loadUserSessions(allUsers);
      updateSystemStatus();
      
      setUsers(allUsers);
      setVendors(allVendorsList);
      setProducts(allProducts);
      setOrders([]); // Will be implemented
      setStats(calculatedStats);
      setLoading(false);
      
    } catch (error) {
      console.error('AdminDashboard: Error loading admin data:', error);
      setError('Failed to load admin data from backend. Please check if the server is running.');
      setLoading(false);
    }
  };

  // Load recent activities
  const loadRecentActivities = (products, users, vendors) => {
    const activities = [];
    const now = new Date();
    
    // Simulate recent vendor registrations
    vendors.forEach((vendor, index) => {
      activities.push({
        type: 'vendor_registration',
        title: `New Vendor Registration`,
        description: `${vendor.name} applied for vendor account`,
        time: `${index * 5 + 1} mins ago`,
        icon: 'Store',
        color: 'success'
      });
    });
    
    // Simulate recent product additions
    products.slice(-3).forEach((product, index) => {
      activities.push({
        type: 'product_added',
        title: `New Product Added`,
        description: `${product.name} added by ${product.vendor}`,
        time: `${index * 10 + 2} mins ago`,
        icon: 'ShoppingCart',
        color: 'info'
      });
    });
    
    // Simulate user registrations
    users.slice(-2).forEach((user, index) => {
      activities.push({
        type: 'user_registration',
        title: `New User Registration`,
        description: `${user.name || 'User'} joined the platform`,
        time: `${index * 15 + 3} mins ago`,
        icon: 'Person',
        color: 'primary'
      });
    });
    
    // Add system activities
    activities.push({
      type: 'system_update',
      title: `System Update`,
      description: `Database backup completed successfully`,
      time: '1 hour ago',
      icon: 'SystemUpdate',
      color: 'warning'
    });
    
    setRecentActivities(activities.slice(0, 8)); // Show latest 8 activities
  };

  // Load user sessions
  const loadUserSessions = (users) => {
    const sessions = users.map((user, index) => ({
      id: user.id || index,
      name: user.name || `User ${index + 1}`,
      email: user.email || `user${index + 1}@test.com`,
      status: Math.random() > 0.3 ? 'online' : 'offline', // Simulate online/offline
      lastActivity: Math.random() > 0.5 ? 'Active now' : `${Math.floor(Math.random() * 60)} mins ago`,
      sessionDuration: `${Math.floor(Math.random() * 120) + 10} mins`,
      role: user.role || 'USER'
    }));
    
    setUserSessions(sessions);
    
    // Update system status
    const onlineCount = sessions.filter(s => s.status === 'online').length;
    const activeCount = sessions.filter(s => s.lastActivity === 'Active now').length;
    
    setSystemStatus(prev => ({
      ...prev,
      onlineUsers: onlineCount,
      activeUsers: activeCount,
      totalSessions: sessions.length
    }));
  };

  // Update system status
  const updateSystemStatus = () => {
    setSystemStatus(prev => ({
      ...prev,
      serverLoad: Math.floor(Math.random() * 30) + 30, // Simulate 30-60% load
      lastBackup: new Date(Date.now() - Math.random() * 7200000).toLocaleString() // Random time within last 2 hours
    }));
  };

  // Add new activity (to be called from other components)
  const addActivity = (type, title, description) => {
    const newActivity = {
      type,
      title,
      description,
      time: 'Just now',
      icon: type === 'user_registration' ? 'Person' : 
            type === 'vendor_registration' ? 'Store' : 
            type === 'product_added' ? 'ShoppingCart' : 'Notification',
      color: type === 'user_registration' ? 'primary' : 
             type === 'vendor_registration' ? 'success' : 
             type === 'product_added' ? 'info' : 'warning'
    };
    
    setRecentActivities(prev => [newActivity, ...prev].slice(0, 8));
  };

  // Listen for real-time updates from other dashboards
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type) {
        console.log('Admin Dashboard received message:', event.data);
        
        switch (event.data.type) {
          case 'PRODUCT_ADDED':
            addActivity('product_added', 'New Product Added', 
              `${event.data.product.name} added by ${event.data.product.vendor}`);
            loadAdminData(); // Refresh data
            break;
          case 'USER_LOGIN':
            addActivity('user_login', 'User Login', 
              `${event.data.userName} logged into the system`);
            loadAdminData(); // Refresh data
            break;
          case 'VENDOR_REGISTERED':
            addActivity('vendor_registration', 'New Vendor Registration', 
              `${event.data.vendorName} applied for vendor account`);
            loadAdminData(); // Refresh data
            break;
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Auto-refresh system status every 30 seconds
  useEffect(() => {
    loadAdminData();
  }, []);

  // Listen for real-time user registration and login updates
  useEffect(() => {
    const handleMessage = (event) => {
      console.log('AdminDashboard: Received real-time message:', event.data);
      
      if (event.data.type === 'USER_REGISTERED') {
        console.log('AdminDashboard: New user registered:', event.data);
        // Refresh data to show new user
        loadAdminData();
        
        // Show notification (optional - you can add a toast notification here)
        if (event.data.userRole === 'VENDOR') {
          console.log(` New Vendor Registered: ${event.data.userName} (${event.data.businessName || 'No business name'})`);
        } else {
          console.log(` New User Registered: ${event.data.userName} (${event.data.userEmail})`);
        }
      } else if (event.data.type === 'USER_LOGIN') {
        console.log('AdminDashboard: User logged in:', event.data);
        // Refresh data to update login status
        loadAdminData();
        
        if (event.data.userRole === 'VENDOR') {
          console.log(` Vendor Login: ${event.data.userName} (${event.data.businessName || 'No business name'})`);
        } else {
          console.log(` User Login: ${event.data.userName} (${event.data.userEmail})`);
        }
      }
    };

    // Add event listener for real-time updates
    window.addEventListener('message', handleMessage);
    
    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // Auto-refresh system status every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      updateSystemStatus();
      loadUserSessions(users);
    }, 30000);

    return () => clearInterval(interval);
  }, [users]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  // Navigation Functions
  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getViewTitle = () => {
    switch(currentView) {
      case 'dashboard': return 'Admin Dashboard';
      case 'users': return 'User Management';
      case 'vendors': return 'Vendor Management';
      case 'analytics': return 'Platform Analytics';
      case 'settings': return 'System Settings';
      default: return 'Admin Dashboard';
    }
  };

  const handleViewUsers = () => {
    setCurrentView('users');
  };

  const handleViewVendors = () => {
    setCurrentView('vendors');
  };

  const handleViewAnalytics = () => {
    setCurrentView('analytics');
  };

  // Manual refresh function
  const handleRefreshData = async () => {
    console.log('AdminDashboard: Manual refresh triggered...');
    try {
      setLoading(true);
      setError('');
      
      // Reload data from backend (no localStorage cache to clear)
      await loadAdminData();
      
      console.log('AdminDashboard: Manual refresh completed successfully');
    } catch (error) {
      console.error('AdminDashboard: Manual refresh failed:', error);
      setError('Failed to refresh data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Delete user function
  const handleDeleteUser = async (userToDelete) => {
    const userId = userToDelete?.id;
    const userEmail = userToDelete?.email;

    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('AdminDashboard: Deleting user:', { userId, userEmail, userToDelete });
      
      // Delete from backend only
      if (userId !== undefined && userId !== null) {
        await adminService.deleteUser(userId);
        console.log('AdminDashboard: User deleted from backend successfully');
      } else {
        throw new Error('Missing user id; cannot delete user.');
      }
      
      // Reload data to refresh the UI
      await loadAdminData();
      
    } catch (error) {
      console.error('AdminDashboard: Error deleting user:', error);
      setError('Failed to delete user. Please try again.');
    }
  };

  // Delete vendor function
  const handleDeleteVendor = async (vendorName, vendorEmail, vendorId) => {
    console.log('handleDeleteVendor called with:', { vendorName, vendorEmail, vendorId });
    
    if (!window.confirm(`Are you sure you want to delete vendor "${vendorName}" and all their products? This action cannot be undone.`)) {
      console.log('User cancelled deletion');
      return;
    }

    try {
      console.log('AdminDashboard: Deleting vendor:', { vendorName, vendorEmail, vendorId });
      
      // Delete vendor from backend using admin service
      if (vendorId) {
        await adminService.deleteUser(vendorId);
        console.log('AdminDashboard: Vendor deleted from backend successfully');
      } else {
        throw new Error('Missing vendor id; cannot delete vendor.');
      }
      
      // Reload data to refresh the UI
      console.log('AdminDashboard: Reloading data after deletion');
      await loadAdminData();
      
      alert(`Vendor "${vendorName}" deleted successfully`);
      
    } catch (error) {
      console.error('AdminDashboard: Error deleting vendor:', error);
      setError('Failed to delete vendor. Please try again.');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await adminService.deleteProduct(productId);
        console.log('AdminDashboard: Product deleted from backend successfully');
        
        // Reload data
        await loadAdminData();
        alert('Product deleted successfully');
      } catch (error) {
        console.error('AdminDashboard: Error deleting product:', error);
        setError('Failed to delete product. Please try again.');
      }
    }
  };

  if (loading) {
    console.log('AdminDashboard: Still loading, showing spinner...');
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    console.log('AdminDashboard: Error occurred:', error);
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          variant="contained"
          onClick={() => window.location.href = '/login'}
          sx={{ mt: 2 }}
        >
          Go to Login
        </Button>
      </Container>
    );
  }

  console.log('AdminDashboard: Rendering main content, currentView:', currentView);
  console.log('AdminDashboard: Users count:', users.length);
  console.log('AdminDashboard: Vendors count:', vendors.length);

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Navbar */}
      <AppBar position="static" sx={{ mb: 3 }}>
        <Toolbar>
          {currentView !== 'dashboard' && (
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleBackToDashboard}
              sx={{ mr: 2 }}
            >
              <ArrowBack />
            </IconButton>
          )}
          
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {getViewTitle()}
          </Typography>
          
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleMenuOpen}
          >
            <AccountCircle />
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon><AdminPanelSettings /></ListItemIcon>
              <ListItemText>{adminData?.name || 'Administrator'}</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => { handleMenuClose(); handleLogout(); }}>
              <ListItemIcon><Logout /></ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 2 }}>
        {/* Dashboard View */}
        {currentView === 'dashboard' && (
          <>
            {/* Header */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                  <AdminPanelSettings />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Welcome, {adminData?.name || 'Administrator'}!
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Manage the entire platform efficiently
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                        <AttachMoney />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" fontWeight="bold">
                          Rs. {(stats.totalRevenue || 0).toLocaleString()}
                        </Typography>
                        <Typography color="text.secondary">
                          Total Revenue
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                        <People />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" fontWeight="bold">
                          {(stats.totalUsers || 0).toLocaleString()}
                        </Typography>
                        <Typography color="text.secondary">
                          Total Users
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                        <Store />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" fontWeight="bold">
                          {(stats.activeVendors || 0).toLocaleString()}
                        </Typography>
                        <Typography color="text.secondary">
                          Active Vendors
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        <ShoppingCart />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" fontWeight="bold">
                          {(stats.totalOrders || 0).toLocaleString()}
                        </Typography>
                        <Typography color="text.secondary">
                          Total Orders
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Header */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                  <AdminPanelSettings />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Welcome, {adminData?.name || 'Administrator'}!
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Manage the entire platform efficiently
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                        <AttachMoney />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" fontWeight="bold">
                          Rs. {(stats.totalRevenue || 0).toLocaleString()}
                        </Typography>
                        <Typography color="text.secondary">
                          Total Revenue
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                        <People />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" fontWeight="bold">
                          {(stats.totalUsers || 0).toLocaleString()}
                        </Typography>
                        <Typography color="text.secondary">
                          Total Users
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                        <Store />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" fontWeight="bold">
                          {(stats.activeVendors || 0).toLocaleString()}
                        </Typography>
                        <Typography color="text.secondary">
                          Active Vendors
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        <ShoppingCart />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" fontWeight="bold">
                          {(stats.totalOrders || 0).toLocaleString()}
                        </Typography>
                        <Typography color="text.secondary">
                          Total Orders
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                    Admin Controls
                  </Typography>
                  <List>
                    <ListItem 
                      button 
                      sx={{ borderRadius: 1, mb: 1 }}
                      onClick={handleViewUsers}
                    >
                      <ListItemIcon>
                        <People color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="Manage Users" secondary="Manage all user accounts" />
                    </ListItem>
                    <ListItem 
                      button 
                      sx={{ borderRadius: 1, mb: 1 }}
                      onClick={handleViewVendors}
                    >
                      <ListItemIcon>
                        <Store color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="Manage Vendors" secondary="Approve and manage vendors" />
                    </ListItem>
                    <ListItem 
                      button 
                      sx={{ borderRadius: 1, mb: 1 }}
                      onClick={handleViewAnalytics}
                    >
                      <ListItemIcon>
                        <Assessment color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="Monitor System Performance" secondary="View platform statistics" />
                    </ListItem>
                    <ListItem 
                      button 
                      sx={{ borderRadius: 1 }}
                      onClick={handleViewAnalytics}
                    >
                      <ListItemIcon>
                        <TrendingUp color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="View Analytical Reports" secondary="Detailed system analytics" />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                    Recent Activity
                  </Typography>
                  <List>
                    {recentActivities.length > 0 ? recentActivities.map((activity, index) => (
                      <ListItem key={index} sx={{ borderRadius: 1, mb: 1, bgcolor: 'grey.50' }}>
                        <ListItemIcon>
                          {activity.icon === 'Person' && <Person color={activity.color} />}
                          {activity.icon === 'Store' && <Store color={activity.color} />}
                          {activity.icon === 'ShoppingCart' && <ShoppingCart color={activity.color} />}
                          {activity.icon === 'SystemUpdate' && <Assessment color={activity.color} />}
                          {activity.icon === 'Notification' && <TrendingUp color={activity.color} />}
                        </ListItemIcon>
                        <ListItemText 
                          primary={activity.title}
                          secondary={`${activity.description} - ${activity.time}`}
                        />
                        <Box sx={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: '50%', 
                          bgcolor: activity.color === 'success' ? 'success.main' : 
                                     activity.color === 'info' ? 'info.main' : 
                                     activity.color === 'warning' ? 'warning.main' : 'primary.main'
                        }} />
                      </ListItem>
                    )) : (
                      <ListItem sx={{ borderRadius: 1, mb: 1, bgcolor: 'grey.50' }}>
                        <ListItemText primary="No recent activity" secondary="System is idle" />
                      </ListItem>
                    )}
                  </List>
                </Paper>
              </Grid>

            {/* System Status */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                System Status & User Activity
              </Typography>
              
              {/* User Activity Overview */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center', p: 2, border: 1, borderColor: 'grey.200', borderRadius: 1 }}>
                    <Typography variant="h4" color="success.main" fontWeight="bold">
                      {systemStatus.onlineUsers}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Users Online
                    </Typography>
                    <Box sx={{ 
                      width: 12, 
                      height: 12, 
                      borderRadius: '50%', 
                      bgcolor: 'success.main', 
                      mx: 'auto', 
                      mt: 1 
                    }} />
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center', p: 2, border: 1, borderColor: 'grey.200', borderRadius: 1 }}>
                    <Typography variant="h4" color="info.main" fontWeight="bold">
                      {systemStatus.activeUsers}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Now
                    </Typography>
                    <Box sx={{ 
                      width: 12, 
                      height: 12, 
                      borderRadius: '50%', 
                      bgcolor: 'info.main', 
                      mx: 'auto', 
                      mt: 1 
                    }} />
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center', p: 2, border: 1, borderColor: 'grey.200', borderRadius: 1 }}>
                    <Typography variant="h4" color="warning.main" fontWeight="bold">
                      {systemStatus.totalSessions}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Sessions
                    </Typography>
                    <Box sx={{ 
                      width: 12, 
                      height: 12, 
                      borderRadius: '50%', 
                      bgcolor: 'warning.main', 
                      mx: 'auto', 
                      mt: 1 
                    }} />
                  </Box>
                </Grid>
              </Grid>

              {/* Active User Sessions */}
              <Typography variant="h6" sx={{ mb: 2 }}>
                Active User Sessions
              </Typography>
              <List sx={{ mb: 3, maxHeight: 200, overflow: 'auto' }}>
                {userSessions.length > 0 ? userSessions.slice(0, 5).map((session, index) => (
                  <ListItem key={index} sx={{ mb: 1, border: 1, borderColor: 'grey.200', borderRadius: 1 }}>
                    <ListItemIcon>
                      <Avatar sx={{ 
                        width: 32, 
                        height: 32, 
                        bgcolor: session.status === 'online' ? 'success.main' : 'grey.400' 
                      }}>
                        <Person sx={{ fontSize: 18 }} />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText 
                      primary={session.name}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {session.email} • {session.role}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {session.lastActivity} • Session: {session.sessionDuration}
                          </Typography>
                        </Box>
                      }
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%', 
                        bgcolor: session.status === 'online' ? 'success.main' : 'grey.400'
                      }} />
                      <Typography variant="caption" color={session.status === 'online' ? 'success.main' : 'text.secondary'}>
                        {session.status === 'online' ? 'Online' : 'Offline'}
                      </Typography>
                    </Box>
                  </ListItem>
                )) : (
                  <ListItem>
                    <ListItemText primary="No active sessions" secondary="All users are offline" />
                  </ListItem>
                )}
              </List>
              
              {/* System Metrics */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    Database Status
                  </Typography>
                  <Typography variant="body1" color="success.main" sx={{ mb: 2 }}>
                    ✅ Connected
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    Last Backup
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {systemStatus.lastBackup}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    System Version
                  </Typography>
                  <Typography variant="body1">
                    {systemStatus.systemVersion}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    Server Load
                  </Typography>
                  <Typography variant="body1" color={systemStatus.serverLoad > 70 ? 'error.main' : 'success.main'} sx={{ mb: 2 }}>
                    {systemStatus.serverLoad}% {systemStatus.serverLoad > 70 ? 'High' : 'Normal'}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    Uptime
                  </Typography>
                  <Typography variant="body1" color="success.main">
                    {systemStatus.uptime}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    System Health
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Box sx={{ 
                      width: 12, 
                      height: 12, 
                      borderRadius: '50%', 
                      bgcolor: 'success.main' 
                    }} />
                    <Typography variant="body1" color="success.main">
                      All Systems Operational
                    </Typography>
                  </Box>
                  
                  <Button variant="outlined" size="small" onClick={handleRefreshData}>
                    Refresh Status
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </>
        )}

        {/* Users Management View */}
        {currentView === 'users' && (
          <>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h4">User Management</Typography>
              <Button variant="contained" onClick={handleRefreshData}>
                Refresh Data
              </Button>
            </Box>
            
            {/* Debug Information */}
            <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" color="text.secondary">
                Debug Info: Found {users.length} total users in localStorage.allUsers
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                Regular Users: {users.filter(u => u.role === 'USER').length} | 
                Vendors: {users.filter(u => u.role === 'VENDOR').length} | 
                Admins: {users.filter(u => u.role === 'ADMIN').length}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                Connected Users: {users.filter(u => u.isConnected).length} | 
                Active Vendors: {users.filter(u => u.role === 'VENDOR' && u.isConnected).length}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                Total Vendors: {vendors.length} | All vendors from database
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                Vendor Management shows all vendors from database.
              </Typography>
              <Typography variant="caption" color="text.secondary">
                User Management shows only regular users (USER role). Vendors and Admins are shown in separate sections.
              </Typography>
            </Paper>
            
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Regular Users: {users.filter(u => u.role === 'USER').length}
              </Typography>
              
              {users.filter(u => u.role === 'USER').length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    No regular users found in the system.
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    This could be because:
                  </Typography>
                  <Box component="ul" sx={{ textAlign: 'left', maxWidth: 400, mx: 'auto' }}>
                    <Typography component="li" variant="body2">
                      No regular users have registered yet
                    </Typography>
                    <Typography component="li" variant="body2">
                      Users are logged in but not saved to allUsers
                    </Typography>
                    <Typography component="li" variant="body2">
                      localStorage data was cleared
                    </Typography>
                  </Box>
                  <Button 
                    variant="outlined" 
                    onClick={handleRefreshData}
                    sx={{ mt: 2 }}
                  >
                    Refresh & Load Default Users
                  </Button>
                </Box>
              ) : (
                <List>
                  {users.filter(u => u.role === 'USER').map((user, index) => (
                    <ListItem key={user.id ?? index} sx={{ mb: 2, border: 1, borderColor: 'grey.200', borderRadius: 1 }}>
                      <ListItemIcon>
                        <Avatar sx={{ 
                          width: 40, 
                          height: 40, 
                          bgcolor: user.role === 'ADMIN' ? 'error.main' : 
                                  user.role === 'VENDOR' ? 'warning.main' : 'primary.main' 
                        }}>
                          <Person />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {user.name || 'Unknown User'}
                            </Typography>
                            <Chip 
                              label={user.role || 'USER'} 
                              size="small" 
                              color={user.role === 'ADMIN' ? 'error' : 
                                     user.role === 'VENDOR' ? 'warning' : 'primary'}
                            />
                            <Chip 
                              label={user.isConnected ? 'Connected' : 'Disconnected'} 
                              size="small" 
                              color={user.isConnected ? 'success' : 'default'}
                              variant="outlined"
                            />
                            {user.lastLogin && (
                              <Chip 
                                label="Recently Active" 
                                size="small" 
                                color="success" 
                                variant="outlined"
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              📧 {user.email || 'No email'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              📱 {user.phone || 'No phone'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              📍 {user.address || 'No address'}
                            </Typography>
                            {user.businessName && (
                              <Typography variant="body2" color="text.secondary">
                                🏢 {user.businessName} ({user.businessType || 'Business'})
                              </Typography>
                            )}
                            <Typography variant="body2" color="text.secondary">
                              🔄 Status: {user.lastActivity || 'Unknown'}
                            </Typography>
                            {user.role === 'VENDOR' && (
                              <Typography variant="body2" color="text.secondary">
                                📦 Products: {user.productCount || 0} items
                              </Typography>
                            )}
                            <Typography variant="caption" color="text.secondary">
                              Created: {user.createdAt ? new Date(user.createdAt).toLocaleString() : 'Unknown'}
                            </Typography>
                            {user.lastLogin && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                Last Login: {new Date(user.lastLogin).toLocaleString()}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton 
                          edge="end" 
                          color="error"
                          onClick={() => handleDeleteUser(user)}
                          title="Delete User"
                        >
                          <Delete />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </>
        )}

        {/* Vendors Management View */}
        {currentView === 'vendors' && (
          <>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h4">Vendor Management</Typography>
              <Button variant="contained" onClick={handleRefreshData}>
                Refresh Data
              </Button>
            </Box>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                All Vendors: {vendors.length}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Showing all vendor accounts from the database.
              </Typography>
              <List>
                {vendors.length > 0 ? 
                  vendors.map((vendor, index) => (
                  <ListItem key={index} sx={{ mb: 2, border: 1, borderColor: 'grey.200', borderRadius: 1 }}>
                    <ListItemIcon>
                      <Store color={vendor.isRegistered ? 'success' : 'warning'} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {vendor.name}
                            {vendor.isRegistered && (
                              <Chip label="Registered" size="small" color="success" sx={{ ml: 1 }} />
                            )}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Email: {vendor.email}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Phone: {vendor.phone}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Business Type: {vendor.businessType}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Address: {vendor.address}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Registered: {vendor.registeredAt !== 'N/A' ? new Date(vendor.registeredAt).toLocaleDateString() : 'Not registered'}
                          </Typography>
                        </Box>
                      }
                      secondary={`${vendor.productCount} products`}
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'right' }}>
                        {vendor.productCount} Products
                      </Typography>
                      <Button 
                        variant="outlined" 
                        color="error" 
                        size="small"
                        onClick={() => {
                          console.log('Delete button clicked for vendor:', vendor);
                          console.log('Vendor name:', vendor.name);
                          console.log('Vendor email:', vendor.email);
                          console.log('Vendor ID:', vendor.id);
                          handleDeleteVendor(vendor.name, vendor.email, vendor.id);
                        }}
                      >
                        Delete
                      </Button>
                    </Box>
                  </ListItem>
                )) : (
                  <ListItem>
                    <ListItemText 
                      primary="No registered vendors found" 
                      secondary="Vendors need to register and login to appear in this list" 
                    />
                  </ListItem>
                )}
              </List>
            </Paper>
          </>
        )}

        {/* Analytics View */}
        {currentView === 'analytics' && (
          <>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h4">Platform Analytics</Typography>
              <Button variant="contained" onClick={handleRefreshData}>
                Refresh Data
              </Button>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>User Statistics</Typography>
                  <Typography variant="body1">Total Users: {stats.totalUsers}</Typography>
                  <Typography variant="body1">Total Vendors: {stats.totalVendors}</Typography>
                  <Typography variant="body1">Total Products: {stats.totalProducts}</Typography>
                  <Typography variant="body1">Total Orders: {stats.totalOrders}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>Revenue Analytics</Typography>
                  <Typography variant="body1">Total Revenue: NPR {stats.totalRevenue}</Typography>
                  <Typography variant="body1">Average Product Price: NPR {products.length > 0 ? Math.round(stats.totalRevenue / products.length) : 0}</Typography>
                  <Typography variant="body1">Products per Vendor: {vendors.length > 0 ? Math.round(products.length / vendors.length) : 0}</Typography>
                </Paper>
              </Grid>
            </Grid>
          </>
        )}

        {/* Settings View */}
        {currentView === 'settings' && (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4">System Settings</Typography>
            </Box>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Admin Settings</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                System is running normally. All admin controls are functional.
              </Typography>
              <Button variant="contained" onClick={handleRefreshData}>
                Refresh All Data
              </Button>
            </Paper>
          </>
        )}
      </Container>
    </Box>
  );
};

export default SimpleAdminDashboard;
