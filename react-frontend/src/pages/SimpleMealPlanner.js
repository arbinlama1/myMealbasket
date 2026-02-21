import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Avatar,
  Chip,
  Rating,
  TextField,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Search,
  ShoppingCart,
  Restaurant,
  LocalFireDepartment,
  AccessTime,
  Star,
  Add,
  Remove,
  Favorite,
  FavoriteBorder,
  Logout,
  Person,
  Home,
  Assessment,
} from '@mui/icons-material';

const SimpleMealPlanner = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cartItems, setCartItems] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDialogOpen, setProductDialogOpen] = useState(false);

  // Sample products
  const [products] = useState([
    {
      id: 1,
      name: 'Classic Burger',
      description: 'Juicy beef patty with fresh vegetables',
      price: 12.99,
      category: 'Main Course',
      rating: 4.5,
      reviews: 234,
      prepTime: '15 mins',
      calories: 650,
      image: '🍔',
      vendor: 'Burger Palace',
      vendorId: 1
    },
    {
      id: 2,
      name: 'Caesar Salad',
      description: 'Fresh romaine lettuce with parmesan and croutons',
      price: 8.99,
      category: 'Salad',
      rating: 4.2,
      reviews: 156,
      prepTime: '10 mins',
      calories: 320,
      image: '🥗',
      vendor: 'Green Garden',
      vendorId: 2
    },
    {
      id: 3,
      name: 'Pepperoni Pizza',
      description: 'Classic pizza with pepperoni and mozzarella',
      price: 15.99,
      category: 'Main Course',
      rating: 4.7,
      reviews: 412,
      prepTime: '20 mins',
      calories: 850,
      image: '🍕',
      vendor: 'Pizza Express',
      vendorId: 3
    },
    {
      id: 4,
      name: 'Grilled Chicken',
      description: 'Tender grilled chicken with herbs',
      price: 14.99,
      category: 'Main Course',
      rating: 4.6,
      reviews: 189,
      prepTime: '18 mins',
      calories: 420,
      image: '🍗',
      vendor: 'Chicken House',
      vendorId: 4
    },
    {
      id: 5,
      name: 'French Fries',
      description: 'Crispy golden french fries',
      price: 4.99,
      category: 'Side Dish',
      rating: 4.3,
      reviews: 298,
      prepTime: '8 mins',
      calories: 320,
      image: '🍟',
      vendor: 'Burger Palace',
      vendorId: 1
    },
    {
      id: 6,
      name: 'Fresh Juice',
      description: 'Mixed fruit juice with vitamins',
      price: 5.99,
      category: 'Beverage',
      rating: 4.4,
      reviews: 167,
      prepTime: '5 mins',
      calories: 120,
      image: '🥤',
      vendor: 'Juice Bar',
      vendorId: 5
    }
  ]);

  const categories = ['all', 'Main Course', 'Salad', 'Side Dish', 'Beverage', 'Dessert'];

  useEffect(() => {
    // Get user data from localStorage
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    // if (!user || !token) {
    //   setError('Please login first');
    //   setLoading(false);
    //   return;
    // }

    try {
      const parsedUser = JSON.parse(user);
      setUserData(parsedUser);
      setLoading(false);
    } catch (err) {
      setError('Error loading user data');
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    if (existingItem) {
      setCartItems(cartItems.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
  };

  const handleRemoveFromCart = (productId) => {
    setCartItems(cartItems.filter(item => item.id !== productId));
  };

  const handleUpdateQuantity = (productId, change) => {
    setCartItems(cartItems.map(item =>
      item.id === productId
        ? { ...item, quantity: Math.max(1, item.quantity + change) }
        : item
    ));
  };

  const toggleFavorite = (productId) => {
    if (favorites.includes(productId)) {
      setFavorites(favorites.filter(id => id !== productId));
    } else {
      setFavorites([...favorites, productId]);
    }
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setProductDialogOpen(true);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
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

  if (error) {
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
            <Person />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Meal Planner
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Welcome, {userData?.name || 'User'}!
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<ShoppingCart />}
            onClick={() => alert(`Cart: ${getTotalItems()} items - $${getTotalPrice().toFixed(2)}`)}
          >
            Cart ({getTotalItems()})
          </Button>
          <Button
            variant="outlined"
            startIcon={<Assessment />}
            onClick={() => alert(`Your Favorites: ${favorites.length} items`)}
          >
            Favorites ({favorites.length})
          </Button>
          <Button
            variant="outlined"
            startIcon={<Logout />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Box>

      {/* Search and Filter */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search for food..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {categories.map(category => (
                <Chip
                  key={category}
                  label={category}
                  onClick={() => setSelectedCategory(category)}
                  color={selectedCategory === category ? 'primary' : 'default'}
                  variant={selectedCategory === category ? 'filled' : 'outlined'}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Products Grid */}
      <Grid container spacing={3}>
        {filteredProducts.map(product => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.100' }}>
                <Typography variant="h3">{product.image}</Typography>
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                  <Typography variant="h6" fontWeight="bold">
                    {product.name}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => toggleFavorite(product.id)}
                    color={favorites.includes(product.id) ? 'error' : 'default'}
                  >
                    {favorites.includes(product.id) ? <Favorite /> : <FavoriteBorder />}
                  </IconButton>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {product.description}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Rating value={product.rating} precision={0.1} size="small" readOnly />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    ({product.reviews})
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Chip
                    icon={<AccessTime />}
                    label={product.prepTime}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    icon={<LocalFireDepartment />}
                    label={`${product.calories} cal`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={product.category}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  by {product.vendor}
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" color="primary.main" fontWeight="bold">
                    ${product.price}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleViewProduct(product)}
                    >
                      View
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleAddToCart(product)}
                      startIcon={<Add />}
                    >
                      Add
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Product Details Dialog */}
      <Dialog open={productDialogOpen} onClose={() => setProductDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedProduct?.name}</DialogTitle>
        <DialogContent>
          {selectedProduct && (
            <Box>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="h4">{selectedProduct.image}</Typography>
              </Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedProduct.description}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Rating value={selectedProduct.rating} precision={0.1} readOnly />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  ({selectedProduct.reviews} reviews)
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip icon={<AccessTime />} label={selectedProduct.prepTime} />
                <Chip icon={<LocalFireDepartment />} label={`${selectedProduct.calories} cal`} />
                <Chip label={selectedProduct.category} color="primary" />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Vendor: {selectedProduct.vendor}
              </Typography>
              <Typography variant="h5" color="primary.main" fontWeight="bold" sx={{ mb: 2 }}>
                ${selectedProduct.price}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProductDialogOpen(false)}>Close</Button>
          {selectedProduct && (
            <Button
              variant="contained"
              onClick={() => {
                handleAddToCart(selectedProduct);
                setProductDialogOpen(false);
              }}
              startIcon={<Add />}
            >
              Add to Cart
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Cart Summary */}
      {cartItems.length > 0 && (
        <Paper sx={{ p: 3, mt: 4, position: 'sticky', bottom: 20 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Cart Summary
          </Typography>
          <List dense>
            {cartItems.map(item => (
              <ListItem key={item.id}>
                <ListItemText
                  primary={`${item.name} x${item.quantity}`}
                  secondary={`$${(item.price * item.quantity).toFixed(2)}`}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton size="small" onClick={() => handleUpdateQuantity(item.id, -1)}>
                    <Remove />
                  </IconButton>
                  <Typography>{item.quantity}</Typography>
                  <IconButton size="small" onClick={() => handleUpdateQuantity(item.id, 1)}>
                    <Add />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleRemoveFromCart(item.id)}>
                    <Remove />
                  </IconButton>
                </Box>
              </ListItem>
            ))}
          </List>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              Total: ${getTotalPrice().toFixed(2)}
            </Typography>
            <Button variant="contained" onClick={() => alert('Checkout feature coming soon!')}>
              Checkout
            </Button>
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default SimpleMealPlanner;
