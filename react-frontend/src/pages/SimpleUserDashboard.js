import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  CircularProgress,
  LinearProgress,
  Chip,
  Rating,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Person,
  ShoppingCart,
  Restaurant,
  Assessment,
  Favorite,
  History,
  LocalOffer,
  TrendingUp,
  AttachMoney,
  Logout,
  Add,
  Edit,
  Delete,
  Visibility,
  CheckCircle,
  Pending,
  Cancel,
  ArrowBack,
  Home,
  AccountCircle,
  Star,
  Menu as MenuIcon,
} from '@mui/icons-material';

const SimpleUserDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, meals, orders, favorites, profile
  const [anchorEl, setAnchorEl] = useState(null);
  
  // Use shared ProductService - start empty
  const [vendorProducts, setVendorProducts] = useState([]); // Start with empty array
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [showProductDetail, setShowProductDetail] = useState(false);

  // Rating function for users to rate products
  const handleRateProduct = (productId, rating) => {
    const product = vendorProducts.find(p => p.id === productId);
    if (!product) return;
    
    // Update product rating
    const updatedProduct = {
      ...product,
      rating: rating,
      totalRatings: (product.totalRatings || 0) + 1
    };
    
    // Update local state
    setVendorProducts(vendorProducts.map(p => 
      p.id === productId ? updatedProduct : p
    ));
    
    alert(`You rated "${product.name}" ${rating} stars!`);
  };

  // Function to simulate placing an order (NPR currency)
  const handlePlaceOrder = (product) => {
    const quantity = prompt('Enter quantity:', '1');
    if (!quantity || isNaN(quantity) || parseInt(quantity) <= 0) {
      alert('Please enter a valid quantity');
      return;
    }
    
    const orderQuantity = parseInt(quantity);
    const totalCost = product.price * orderQuantity;
    
    // Update user stats
    const updatedUserStats = {
      totalOrders: (userStats.totalOrders || 0) + 1,
      totalSpent: (userStats.totalSpent || 0) + totalCost,
      favoriteItems: userStats.favoriteItems || 0,
      points: (userStats.points || 0) + Math.floor(totalCost), // 1 point per NPR 1 spent
      memberSince: userStats.memberSince,
      lastOrder: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      avgOrderValue: ((userStats.totalSpent || 0) + totalCost) / ((userStats.totalOrders || 0) + 1)
    };
    
    // Update user stats in state (for display)
    userStats.totalOrders = updatedUserStats.totalOrders;
    userStats.totalSpent = updatedUserStats.totalSpent;
    userStats.points = updatedUserStats.points;
    userStats.lastOrder = updatedUserStats.lastOrder;
    userStats.avgOrderValue = updatedUserStats.avgOrderValue;
    
    alert(`Order placed: ${orderQuantity} x "${product.name}" = NPR ${totalCost.toFixed(2)}\n` +
          `Total Orders: ${updatedUserStats.totalOrders}\n` +
          `Total Spent: NPR ${updatedUserStats.totalSpent.toFixed(2)}\n` +
          `Points Earned: ${updatedUserStats.points}`);
  };

  // Function to add item to favorites
  const handleAddToFavorites = (product) => {
    // Check if already in favorites
    if (favoriteItems.some(item => item.id === product.id)) {
      alert('This item is already in your favorites!');
      return;
    }
    
    // Add to favorites
    favoriteItems.push({
      id: product.id,
      name: product.name,
      vendor: product.vendor,
      price: product.price,
      rating: product.rating,
      description: product.description,
      image: product.image
    });
    
    // Update user stats
    userStats.favoriteItems = favoriteItems.length;
    
    alert(`"${product.name}" added to favorites!`);
  };

  // Initialize products from backend and subscribe to updates
  useEffect(() => {
    console.log('SimpleUserDashboard - Initializing products from backend');

    const loadProducts = async () => {
      try {
        const response = await fetch('http://localhost:8081/api/products', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const products = data?.data || data || [];
        const safeProducts = Array.isArray(products) ? products : [];

        // Normalize vendor fields for UI (backend provides vendor object)
        const normalized = safeProducts.map(p => {
          const vendorName = p?.vendor?.shopName || p?.vendor?.name || p?.vendor || p?.vendorName;
          const vendorId = p?.vendor?.id || p?.vendorId;
          return {
            ...p,
            vendor: vendorName,
            vendorId: vendorId
          };
        });

        console.log('Final products to display:', normalized);
        setVendorProducts(normalized);
        
      } catch (error) {
        console.error('Error loading products from backend:', error);
        setVendorProducts([]);
      }
    };
    
    // Load products immediately
    loadProducts();
    
    // Listen for real-time updates; refresh from backend
    const handleMessage = (event) => {
      if (event.data && event.data.type) {
        console.log('User Dashboard received message:', event.data);
        
        switch (event.data.type) {
          case 'PRODUCT_ADDED':
            loadProducts();
            break;
          case 'PRODUCT_UPDATED':
            loadProducts();
            break;
          case 'PRODUCT_DELETED':
            loadProducts();
            break;
          case 'VENDOR_PRODUCTS_DELETED':
            loadProducts();
            break;
          case 'VENDOR_DELETED':
            loadProducts();
            break;
        }
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // Sample user data - starts with zero for new users (NPR currency)
  const userStats = {
    totalOrders: 0,
    totalSpent: 0.00,
    favoriteItems: 0,
    points: 0,
    memberSince: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
    lastOrder: 'No orders yet',
    avgOrderValue: 0.00
  };

  // Recent orders - starts empty for new users
  const recentOrders = [];

  // Favorite items - starts empty for new users
  const favoriteItems = [];

  // Recommendations - starts empty for new users
  const recommendations = [];

  useEffect(() => {
    // Try to get user data from localStorage, but don't fail if it's not there
    try {
      const user = localStorage.getItem('user');
      if (user) {
        const parsedUser = JSON.parse(user);
        setUserData(parsedUser);
      } else {
        // Set default user data if localStorage is empty
        setUserData({
          id: 1,
          name: 'Test User',
          email: 'user@test.com',
          role: 'USER'
        });
      }
    } catch (err) {
      console.error('Error loading user data:', err);
      // Set default user data on error
      setUserData({
        id: 1,
        name: 'Test User',
        email: 'user@test.com',
        role: 'USER'
      });
    }
    
    // Set loading to false after user data is loaded
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigateToMealPlanner = () => {
    setCurrentView('meals');
  };

  const handleViewOrderHistory = () => {
    setCurrentView('orders');
  };

  const handleViewFavorites = () => {
    setCurrentView('favorites');
  };

  const handleRemoveFromFavorites = (itemId) => {
    const item = favoriteItems.find(item => item.id === itemId);
    if (item && confirm(`Remove "${item.name}" from your favorites?`)) {
      // In a real app, this would update the backend
      alert(`"${item.name}" removed from favorites!`);
    }
  };

  const handleOrderFromFavorites = (item) => {
    alert(`Ordering "${item.name}" from ${item.vendor} for NPR ${item.price}`);
  };

  const handleViewProductDetail = (productId) => {
    setSelectedProductId(productId);
    setShowProductDetail(true);
  };

  const handleCloseProductDetail = () => {
    setShowProductDetail(false);
    setSelectedProductId(null);
  };

  const handleAddToCartFromDetail = () => {
    const product = vendorProducts.find(p => p.id === selectedProductId);
    if (product) {
      alert(`Added "${product.name}" to cart! Total: NPR ${product.price}`);
    }
  };

  const handleViewProfile = () => {
    setCurrentView('profile');
  };

  const handleQuickOrder = () => {
    // Navigate to meal planner for quick ordering
    setCurrentView('meals');
  };

  const handleGetRecommendations = () => {
    // Navigate to meals view with AI recommendations
    setCurrentView('meals');
  };

  const handleViewCart = () => {
    // Navigate to cart view (could be implemented later)
    alert('Cart feature coming soon!');
  };

  const handleViewInventory = () => {
    const inventoryList = vendorProducts.map(product => 
      `${product.name} - ${product.vendor} - NPR ${product.price} - ${product.inStock ? 'In Stock' : 'Out of Stock'}`
    ).join('\n');
    
    alert(`Available Products:\n\n${inventoryList}\n\nTotal Products: ${vendorProducts.length}`);
  };

  const handleViewAnalytics = () => {
    const totalValue = vendorProducts.reduce((sum, product) => sum + product.price, 0);
    const avgPrice = vendorProducts.length > 0 ? (totalValue / vendorProducts.length).toFixed(2) : 0;
    const avgRating = vendorProducts.length > 0 ? 
      (vendorProducts.reduce((sum, product) => sum + product.rating, 0) / vendorProducts.length).toFixed(1) : 0;
    
    alert(`Product Statistics:\n\n` +
      `Total Products: ${vendorProducts.length}\n` +
      `Average Price: NPR ${avgPrice}\n` +
      `Average Rating: ${avgRating}\n`);
  };

  const getViewTitle = () => {
    switch(currentView) {
      case 'dashboard': return 'User Dashboard';
      case 'meals': return 'Browse Meals';
      case 'orders': return 'Order History';
      case 'favorites': return 'My Favorites';
      case 'profile': return 'Profile Settings';
      default: return 'User Dashboard';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

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
              <ListItemIcon><Person /></ListItemIcon>
              <ListItemText>{userData?.name || 'User'}</ListItemText>
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
            {/* Top Action Bar */}
            <Paper sx={{ p: 2, mb: 3, bgcolor: 'primary.50' }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h6" color="primary.main" sx={{ mr: 1 }}>
                       Quick Order
                    </Typography>
                    <Button 
                      variant="contained" 
                      size="small" 
                      startIcon={<Restaurant />}
                      sx={{ mr: 1 }}
                      onClick={handleQuickOrder}
                    >
                      Order Now
                    </Button>
                    <Button 
                      variant="outlined" 
                      size="small"
                      startIcon={<ShoppingCart />}
                      onClick={handleViewCart}
                    >
                      Cart (0)
                    </Button>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h6" color="primary.main" sx={{ mr: 1 }}>
                      AI Assistant
                    </Typography>
                    <Button 
                      variant="contained" 
                      size="small" 
                      startIcon={<Assessment />}
                      color="secondary"
                      onClick={handleGetRecommendations}
                    >
                      Get Recommendations
                    </Button>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                    <Typography variant="h6" color="primary.main" sx={{ mr: 1 }}>
                      ⭐ Special Offers
                    </Typography>
                    <Chip 
                      label="20% OFF" 
                      color="warning" 
                      variant="filled" 
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Chip 
                      label="Free Delivery" 
                      color="success" 
                      variant="filled" 
                      size="small"
                    />
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Header */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 56, height: 56 }}>
                  <Person sx={{ fontSize: 32 }} />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Welcome back, {userData?.name || 'User'}!
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Member since {userStats.memberSince} • {userStats.points} points
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* User Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                        <ShoppingCart />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" fontWeight="bold">
                          {userStats.totalOrders}
                        </Typography>
                        <Typography color="text.secondary">
                          Total Orders
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'success.main', color: 'white' }}>
                  <Typography variant="h4" fontWeight="bold">
                    NPR {userStats.totalSpent.toFixed(2)}
                  </Typography>
                  <Typography variant="body2">
                    Total Spent
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'warning.main', color: 'white' }}>
                  <Typography variant="h4" fontWeight="bold">
                    {userStats.favoriteItems}
                  </Typography>
                  <Typography variant="body2">
                    Favorite Items
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        <Star />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" fontWeight="bold">
                          {userStats.points}
                        </Typography>
                        <Typography color="text.secondary">
                          Points
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Quick Actions */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                    Quick Actions
                  </Typography>
                  <List>
                    <ListItem 
                      button 
                      sx={{ borderRadius: 1, mb: 1 }}
                      onClick={handleNavigateToMealPlanner}
                    >
                      <ListItemIcon>
                        <Restaurant color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Browse Products" 
                        secondary="Browse products and categories" 
                      />
                    </ListItem>
                    <ListItem 
                      button 
                      sx={{ borderRadius: 1, mb: 1 }}
                      onClick={handleNavigateToMealPlanner}
                    >
                      <ListItemIcon>
                        <TrendingUp color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="AI Recommendations" 
                        secondary="Receive AI-powered meal suggestions" 
                      />
                    </ListItem>
                    <ListItem 
                      button 
                      sx={{ borderRadius: 1, mb: 1 }}
                      onClick={handleNavigateToMealPlanner}
                    >
                      <ListItemIcon>
                        <Assessment color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Smart Meal Planner" 
                        secondary="Plan your meals intelligently" 
                      />
                    </ListItem>
                    <ListItem 
                      button 
                      sx={{ borderRadius: 1 }}
                      onClick={handleViewOrderHistory}
                    >
                      <ListItemIcon>
                        <ShoppingCart color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Place Orders" 
                        secondary="View and manage your orders" 
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                    Recent Orders
                  </Typography>
                  <List>
                    {recentOrders.map((order) => (
                      <ListItem key={order.id} sx={{ borderRadius: 1, mb: 1, bgcolor: 'grey.50' }}>
                        <ListItemText 
                          primary={order.vendor}
                          secondary={`${order.items} • NPR ${order.total} • ${order.status}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                  <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
                    View All Orders
                  </Button>
                </Paper>
              </Grid>
            </Grid>

            {/* Favorites and Recommendations */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                    My Favorites
                  </Typography>
                  <List>
                    {favoriteItems.map((item) => (
                      <ListItem key={item.id} sx={{ borderRadius: 1, mb: 1, bgcolor: 'grey.50' }}>
                        <ListItemText 
                          primary={item.name}
                          secondary={`${item.vendor} • NPR ${item.price}`}
                        />
                        <Rating value={item.rating} precision={0.1} readOnly size="small" />
                      </ListItem>
                    ))}
                  </List>
                  <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
                    View All Favorites
                  </Button>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                    Recommended for You
                  </Typography>
                  <List>
                    {recommendations.map((item) => (
                      <ListItem key={item.id} sx={{ borderRadius: 1, mb: 1, bgcolor: 'grey.50' }}>
                        <ListItemText 
                          primary={item.name}
                          secondary={`${item.vendor} • NPR ${item.price} • ${item.reason}`}
                        />
                        <Rating value={item.rating} precision={0.1} readOnly size="small" />
                      </ListItem>
                    ))}
                  </List>
                  <Button variant="contained" fullWidth sx={{ mt: 2 }}>
                    Browse More
                  </Button>
                </Paper>
              </Grid>
            </Grid>

            {/* Progress Section */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                Rewards Progress
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="body2">Points to Next Reward</Typography>
                  <Typography variant="body2" color="primary.main">
                    {2000 - userStats.points} points
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(userStats.points / 2000) * 100} 
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {userStats.points} / 2000 points to next reward
              </Typography>
            </Paper>
          </>
        )}

        {/* Orders View */}
        {currentView === 'orders' && (
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" fontWeight="bold">
                Order History
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Home />}
                onClick={handleBackToDashboard}
              >
                Return to Dashboard
              </Button>
            </Box>
            <Typography variant="body1" sx={{ mb: 3 }}>
              View your complete order history and track current orders.
            </Typography>
            <Button variant="contained">
              View All Orders
            </Button>
          </Paper>
        )}

        {/* Meals View */}
        {currentView === 'meals' && (
          <>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5" fontWeight="bold">
                Browse Products
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Home />}
                onClick={handleBackToDashboard}
              >
                Return to Dashboard
              </Button>
            </Box>

            {/* Vendor Products Grid */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                    Available Products
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Debug: Found {vendorProducts.length} products
                  </Typography>
                  {vendorProducts.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No products available.
                      </Typography>
                      <Button variant="contained" sx={{ mt: 2 }} onClick={() => {
                        console.log('Manual refresh - checking products...');
                        console.log('Manual refresh products:', vendorProducts);
                        // Products are already loaded in state
                      }}>
                        Refresh Products
                      </Button>
                    </Box>
                  ) : (
                    <Grid container spacing={2}>
                      {vendorProducts.map((product) => (
                        <Grid item xs={12} sm={6} md={4} key={product.id}>
                          <Card 
                            sx={{ 
                              height: '100%', 
                              position: 'relative', 
                              cursor: 'pointer',
                              transition: 'transform 0.2s ease-in-out',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: 4
                              }
                            }}
                            onClick={() => handleViewProductDetail(product.id)}
                          >
                            <Box sx={{ position: 'relative', height: 200, overflow: 'hidden' }}>
                              <img 
                                src={product.image} 
                                alt={product.name}
                                style={{ 
                                  width: '100%', 
                                  height: '100%', 
                                  objectFit: 'cover' 
                                }}
                              />
                              <Box sx={{ 
                                position: 'absolute', 
                                top: 8, 
                                right: 8, 
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'flex-end',
                                gap: 1
                              }}>
                                <Chip 
                                  label={`NPR ${product.price}`} 
                                  color="success" 
                                  size="small" 
                                />
                                <Chip 
                                  label={product.inStock ? 'In Stock' : 'Out of Stock'} 
                                  color={product.inStock ? 'success' : 'error'} 
                                  size="medium" 
                                />
                              </Box>
                              <Box sx={{ 
                                position: 'absolute', 
                                bottom: 0, 
                                left: 0, 
                                right: 0, 
                                background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                                color: 'white',
                                p: 2,
                                textAlign: 'center'
                              }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                  <Typography variant="body2" color="success.main" fontWeight="bold">
                                    NPR {product.price}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                                  </Typography>
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                  {product.name}
                                </Typography>
                                <Typography variant="body2">
                                  Click to view details
                                </Typography>
                              </Box>
                            </Box>
                            <CardContent sx={{ pt: 4 }}>
                              <Typography variant="h6" color="primary.main" sx={{ mb: 1 }}>
                                {product.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {product.vendor}
                              </Typography>
                              <Typography variant="body2" sx={{ mb: 1 }}>
                                {product?.description}
                              </Typography>
                              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                                <Typography variant="body2" color="success.main" fontWeight="bold">
                                  NPR {product?.price || 0}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {product?.inStock ? 'In Stock' : 'Out of Stock'}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                <Typography variant="body2" color="text.secondary">
                                  Rating: {product.rating || 0} ({product.totalRatings || 0} ratings)
                                </Typography>
                                <Rating 
                                  value={product.rating || 0} 
                                  precision={0.1} 
                                  readOnly={false}
                                  size="large"
                                  onChange={(event, newValue) => {
                                    if (newValue) {
                                      handleRateProduct(product.id, newValue);
                                    }
                                  }}
                                />
                                <Chip label={product.category} color="primary" size="medium" />
                              </Box>
                              <Typography variant="body1" sx={{ mb: 2 }}>
                                {product?.description}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button 
                                  variant="contained" 
                                  size="small"
                                  onClick={() => handlePlaceOrder(product)}
                                  sx={{ minWidth: 'auto', px: 1 }}
                                >
                                  🛒 Order
                                </Button>
                                <Button 
                                  variant="outlined" 
                                  size="small"
                                  onClick={() => handleAddToFavorites(product)}
                                  sx={{ minWidth: 'auto', px: 1 }}
                                >
                                  ❤️ Favorite
                                </Button>
                                <Button 
                                  variant="outlined" 
                                  size="small"
                                  onClick={() => handleViewProductDetail(product.id)}
                                  sx={{ minWidth: 'auto', px: 1 }}
                                >
                                  Quick View
                                </Button>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                    Quick Actions
                  </Typography>
                  <List>
                    <ListItem 
                      button 
                      sx={{ borderRadius: 1, mb: 1 }}
                      onClick={handleNavigateToMealPlanner}
                    >
                      <ListItemIcon>
                        <Restaurant color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="Browse Products" secondary="View available food items" />
                    </ListItem>
                    <ListItem 
                      button 
                      sx={{ borderRadius: 1, mb: 1 }}
                      onClick={handleViewInventory}
                    >
                      <ListItemIcon>
                        <Assessment color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="View Products" secondary={`See all ${vendorProducts.length} available products`} />
                    </ListItem>
                    <ListItem 
                      button 
                      sx={{ borderRadius: 1, mb: 1 }}
                      onClick={handleViewOrderHistory}
                    >
                      <ListItemIcon>
                        <ShoppingCart color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="Order History" secondary="View your past orders" />
                    </ListItem>
                    <ListItem 
                      button 
                      sx={{ borderRadius: 1 }}
                      onClick={handleViewFavorites}
                    >
                      <ListItemIcon>
                        <Favorite color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="My Favorites" secondary="Manage favorite items" />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
            </Grid>
          </>
        )}

        {/* Favorites View */}
        {currentView === 'favorites' && (
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" fontWeight="bold">
                My Favorites ({favoriteItems.length} items)
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Home />}
                onClick={handleBackToDashboard}
              >
                Return to Dashboard
              </Button>
            </Box>
            
            {favoriteItems.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  You haven't added any favorites yet.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Browse products and click the heart icon to add them to your favorites.
                </Typography>
                <Button variant="contained" onClick={handleNavigateToMealPlanner}>
                  Browse Products
                </Button>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {favoriteItems.map((item) => (
                  <Grid item xs={12} sm={6} md={4} key={item.id}>
                    <Card sx={{ height: '100%' }}>
                      <Box sx={{ position: 'relative', height: 200, overflow: 'hidden' }}>
                        <img 
                          src={item.image} 
                          alt={item.name}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover' 
                          }}
                        />
                        <Box sx={{ 
                          position: 'absolute', 
                          top: 8, 
                          right: 8, 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'flex-end',
                          gap: 1
                        }}>
                          <Chip 
                            label={`$${item.price}`} 
                            color="success" 
                            size="small" 
                          />
                          <IconButton size="small" color="error">
                            <Favorite />
                          </IconButton>
                        </Box>
                      </Box>
                      <CardContent>
                        <Typography variant="h6" color="primary.main" sx={{ mb: 1 }}>
                          {item.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {item.vendor}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          {item.description}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Rating value={item.rating} precision={0.1} readOnly size="small" />
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button 
                              variant="contained" 
                              size="small"
                              onClick={() => handleOrderFromFavorites(item)}
                            >
                              Order Now
                            </Button>
                            <Button 
                              variant="outlined" 
                              size="small"
                              color="error"
                              onClick={() => handleRemoveFromFavorites(item.id)}
                            >
                              Remove
                            </Button>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        )}

        {/* Profile View */}
        {currentView === 'profile' && (
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" fontWeight="bold">
                Profile Settings
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Home />}
                onClick={handleBackToDashboard}
              >
                Return to Dashboard
              </Button>
            </Box>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Name: {userData?.name || 'Test User'}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Email: {userData?.email || 'user@test.com'}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Role: {userData?.role || 'USER'}
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Member Since: {userStats.memberSince}
            </Typography>
            <Button variant="outlined">
              Edit Profile
            </Button>
          </Paper>
        )}

        {/* Product Detail Dialog */}
        <Dialog 
          open={showProductDetail} 
          onClose={handleCloseProductDetail}
          maxWidth="md"
          fullWidth
          scroll="paper"
        >
          {selectedProductId && (
            <>
              <DialogTitle>
                <Typography variant="h5" fontWeight="bold">
                  Product Details
                </Typography>
              </DialogTitle>
              <DialogContent>
                {(() => {
                  const product = vendorProducts.find(p => p.id === selectedProductId);
                  if (!product) return null;
                  
                  return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {/* Product Header with Image */}
                      <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
                        <Box sx={{ flex: 1, maxWidth: 300 }}>
                          <img 
                            src={product?.image} 
                            alt={product?.name}
                            style={{ 
                              width: '100%', 
                              height: 200, 
                              objectFit: 'cover',
                              borderRadius: 2
                            }}
                          />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h4" color="primary.main" sx={{ mb: 1 }}>
                            {product?.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {product?.vendor}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            {product?.description}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <Chip 
                              label={product.inStock ? 'In Stock' : 'Out of Stock'} 
                              color={product.inStock ? 'success' : 'error'} 
                              size="medium" 
                            />
                            <Chip label={product.category} color="primary" size="medium" />
                          </Box>
                          <Typography variant="body1" sx={{ mb: 2 }}>
                            {product?.description}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <Typography variant="body2" color="text.secondary">
                              <strong>Calories:</strong> {product.calories}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              <strong>Prep Time:</strong> {product.prepTime}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      {/* Ingredients Section */}
                      <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                          Ingredients
                        </Typography>
                        <Typography variant="body2">
                          {product.ingredients}
                        </Typography>
                      </Paper>

                      {/* Action Buttons */}
                      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
                        <Button 
                          variant="contained" 
                          size="large"
                          onClick={handleAddToCartFromDetail}
                          startIcon={<ShoppingCart />}
                        >
                          Add to Cart
                        </Button>
                        <Button 
                          variant="outlined" 
                          size="large"
                          onClick={handleCloseProductDetail}
                        >
                          Close
                        </Button>
                      </Box>
                    </Box>
                  );
                })()}
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseProductDetail}>Close</Button>
                <Button onClick={handleAddToCartFromDetail} variant="contained" color="primary">
                  Add to Cart - NPR {product.price}
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
    </Box>
  );
};

export default SimpleUserDashboard;
