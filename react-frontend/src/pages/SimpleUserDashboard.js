import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Paper, Typography, Box, Grid, Card, CardContent, Button,
  Avatar, CircularProgress, Chip, Rating, IconButton, TextField,
  InputAdornment, Select, MenuItem, FormControl, InputLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, Drawer, List,
  ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Badge,
  useTheme, useMediaQuery
} from '@mui/material';
import {
  Person, ShoppingCart, Restaurant, Search as SearchIcon,
  Add, Remove, Delete as DeleteIcon, Favorite, Dashboard,
  Menu as MenuIcon, Close as CloseIcon, Logout as LogoutIcon,
  Star, TrendingUp, LocalOffer
} from '@mui/icons-material';

// ── Styled Nav Card ────────────────────────────────────────────────────────────
const NavCard = ({ icon, label, count, active, onClick, color = '#1976d2' }) => (
  <Card
    onClick={onClick}
    sx={{
      cursor: 'pointer',
      border: active ? `2px solid ${color}` : '2px solid transparent',
      bgcolor: active ? `${color}15` : 'background.paper',
      transition: 'all 0.2s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: 4,
        border: `2px solid ${color}`,
      },
    }}
  >
    <CardContent sx={{ textAlign: 'center', py: 2, px: 1.5 }}>
      <Box sx={{ color: active ? color : 'text.secondary', mb: 0.5 }}>
        {count !== undefined ? (
          <Badge badgeContent={count} color="error" max={99}>
            {icon}
          </Badge>
        ) : icon}
      </Box>
      <Typography variant="caption" fontWeight={active ? 700 : 400} color={active ? color : 'text.secondary'}>
        {label}
      </Typography>
    </CardContent>
  </Card>
);

// ── Stat Card ──────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, bgcolor, color = 'text.primary' }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" fontWeight={700} color={color}>{value}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{label}</Typography>
        </Box>
        <Box sx={{ bgcolor, borderRadius: 2, p: 1, color: 'white' }}>{icon}</Box>
      </Box>
    </CardContent>
  </Card>
);

// ── Product Card ───────────────────────────────────────────────────────────────
const ProductCard = ({ product, onAddToCart, onFavorite, onDetails, imageFallback }) => (
  <Card
    sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
    }}
  >
    <Box sx={{ position: 'relative', pt: '60%', overflow: 'hidden' }}>
      <img
        src={product.image}
        alt={product.name}
        style={{
          position: 'absolute', top: 0, left: 0,
          width: '100%', height: '100%', objectFit: 'cover',
          transition: 'transform 0.3s',
        }}
        onError={e => { e.target.src = imageFallback; }}
      />
      <Chip
        label={`NPR ${product.price}`}
        color="success"
        size="small"
        sx={{ position: 'absolute', top: 8, right: 8, fontWeight: 700 }}
      />
      {product.category && (
        <Chip
          label={product.category}
          size="small"
          sx={{ position: 'absolute', top: 8, left: 8, bgcolor: 'rgba(0,0,0,0.6)', color: 'white' }}
        />
      )}
    </Box>
    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom noWrap fontWeight={600}>
        {product.name}
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {product.vendor}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
        <Rating value={product.rating || 0} precision={0.5} readOnly size="small" />
        <Typography variant="caption" color="text.secondary">
          ({product.totalRatings || 0})
        </Typography>
      </Box>
      <Box sx={{ mt: 'auto', display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          size="small"
          startIcon={<ShoppingCart fontSize="small" />}
          onClick={() => onAddToCart(product)}
          sx={{ flex: 1 }}
        >
          Add
        </Button>
        <IconButton
          size="small"
          color="error"
          onClick={() => onFavorite(product)}
          sx={{ border: '1px solid', borderColor: 'error.light' }}
        >
          <Favorite fontSize="small" />
        </IconButton>
        <Button variant="outlined" size="small" onClick={() => onDetails(product.id)}>
          Info
        </Button>
      </Box>
    </CardContent>
  </Card>
);

// ── Main Component ─────────────────────────────────────────────────────────────
const SimpleUserDashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const [vendorProducts, setVendorProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [showProductDetail, setShowProductDetail] = useState(false);

  const [cartItems, setCartItems] = useState([]);
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [userStats, setUserStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    points: 0,
    memberSince: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
    lastOrder: 'No orders yet',
    avgOrderValue: 0,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const imageFallback = 'https://via.placeholder.com/300x200?text=No+Image';

  // ── Auth ───────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
  }, [navigate]);

  // ── Load User ──────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem('user');
    setUserData(stored ? JSON.parse(stored) : { name: 'Guest', email: 'guest@example.com', role: 'USER' });
    setLoading(false);
  }, []);

  // ── Load Cart & Favorites ──────────────────────
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) setCartItems(JSON.parse(storedCart));
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) setFavoriteItems(JSON.parse(storedFavorites));
  }, []);

  // ── Persist ────────────────────────────────────
  useEffect(() => { localStorage.setItem('cart', JSON.stringify(cartItems)); }, [cartItems]);
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favoriteItems));
    setUserStats(prev => ({ ...prev, favoriteItemsCount: favoriteItems.length }));
  }, [favoriteItems]);

  // ── Load Products ──────────────────────────────
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch('http://localhost:8081/api/products');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const products = Array.isArray(data?.data) ? data.data : data || [];
        const normalized = products.map(p => ({
          ...p,
          vendor: p?.vendor?.shopName || p?.vendor?.name || p?.vendor || 'Unknown Vendor',
          image: p.image || imageFallback,
          ingredients: p.ingredients || 'No ingredients listed',
          nutrition: p.nutrition || 'No nutrition info',
          reviews: p.reviews || [],
        }));
        setVendorProducts(normalized);
      } catch (err) {
        console.error('Failed to load products:', err);
        setVendorProducts([]);
      }
    };
    loadProducts();
  }, []);

  // ── Cart Functions ─────────────────────────────
  const handleAddToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
    alert(`Added "${product.name}" to cart`);
  };

  const handleUpdateCartQuantity = (id, delta) => {
    setCartItems(prev =>
      prev.map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item)
    );
  };

  const handleRemoveFromCart = (id) => setCartItems(prev => prev.filter(item => item.id !== id));

  const handleCheckout = () => {
    if (cartItems.length === 0) { alert('Cart is empty'); return; }
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    alert(`Order placed successfully!\nTotal: NPR ${total.toFixed(2)}`);
    setCartItems([]);
    setUserStats(prev => {
      const newOrders = prev.totalOrders + 1;
      const newSpent = prev.totalSpent + total;
      return {
        ...prev,
        totalOrders: newOrders,
        totalSpent: newSpent,
        points: prev.points + Math.floor(total),
        lastOrder: new Date().toLocaleDateString(),
        avgOrderValue: newOrders > 0 ? newSpent / newOrders : 0,
      };
    });
  };

  // ── Favorites Functions ────────────────────────
  const handleAddToFavorites = (product) => {
    if (favoriteItems.some(f => f.id === product.id)) { alert('Already in favorites'); return; }
    setFavoriteItems(prev => [...prev, {
      id: product.id, name: product.name, vendor: product.vendor,
      price: product.price, rating: product.rating, image: product.image
    }]);
    alert(`Added "${product.name}" to favorites`);
  };

  const handleRemoveFromFavorites = (id) => setFavoriteItems(prev => prev.filter(f => f.id !== id));

  const handleLogout = () => {
    ['token', 'user', 'favorites', 'cart'].forEach(k => localStorage.removeItem(k));
    navigate('/home');
  };

  const handleRateProduct = (productId, newRating) => {
    setVendorProducts(prev =>
      prev.map(p => p.id === productId ? { ...p, rating: newRating, totalRatings: (p.totalRatings || 0) + 1 } : p)
    );
  };

  // ── Computed ───────────────────────────────────
  const filteredProducts = vendorProducts.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.vendor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });
  const categories = ['all', ...new Set(vendorProducts.map(p => p.category).filter(Boolean))];
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // ── Navigation Items ───────────────────────────
  const navItems = [
    { view: 'dashboard', label: 'Dashboard', icon: <Dashboard /> },
    { view: 'meals', label: 'Browse', icon: <Restaurant /> },
    { view: 'favorites', label: 'Favorites', icon: <Favorite />, count: favoriteItems.length },
    { view: 'cart', label: 'Cart', icon: <ShoppingCart />, count: cartItems.length },
    { view: 'profile', label: 'Profile', icon: <Person /> },
  ];

  const switchView = (view) => {
    setCurrentView(view);
    setMobileDrawerOpen(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={64} />
      </Box>
    );
  }

  // ── Sidebar Content ────────────────────────────
  const SidebarContent = () => (
    <Box sx={{ width: 220, pt: 2 }}>
      <Box sx={{ px: 2, pb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
          {userData?.name?.[0] || 'U'}
        </Avatar>
        <Box>
          <Typography variant="subtitle2" fontWeight={700} noWrap>{userData?.name || 'User'}</Typography>
          <Typography variant="caption" color="text.secondary">{userStats.points} pts</Typography>
        </Box>
      </Box>
      <Divider />
      <List dense>
        {navItems.map(({ view, label, icon, count }) => (
          <ListItem key={view} disablePadding>
            <ListItemButton
              selected={currentView === view}
              onClick={() => switchView(view)}
              sx={{
                borderRadius: 1, mx: 1, my: 0.25,
                '&.Mui-selected': { bgcolor: 'primary.50', color: 'primary.main' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: currentView === view ? 'primary.main' : 'inherit' }}>
                {count !== undefined ? (
                  <Badge badgeContent={count} color="error" max={99}>{icon}</Badge>
                ) : icon}
              </ListItemIcon>
              <ListItemText primary={label} primaryTypographyProps={{ fontSize: 14, fontWeight: currentView === view ? 600 : 400 }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ mt: 1 }} />
      <List dense>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout} sx={{ borderRadius: 1, mx: 1, my: 0.25 }}>
            <ListItemIcon sx={{ minWidth: 36 }}><LogoutIcon color="error" /></ListItemIcon>
            <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: 14, color: 'error.main' }} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.50' }}>

      {/* ── Desktop Sidebar ── */}
      {!isMobile && (
        <Paper
          elevation={2}
          sx={{
            width: 220,
            flexShrink: 0,
            position: 'sticky',
            top: 0,
            height: '100vh',
            overflowY: 'auto',
            borderRadius: 0,
          }}
        >
          <SidebarContent />
        </Paper>
      )}

      {/* ── Mobile Drawer ── */}
      {isMobile && (
        <Drawer open={mobileDrawerOpen} onClose={() => setMobileDrawerOpen(false)}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
            <IconButton onClick={() => setMobileDrawerOpen(false)}><CloseIcon /></IconButton>
          </Box>
          <SidebarContent />
        </Drawer>
      )}

      {/* ── Main Content ── */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>

        {/* Top Bar (mobile) */}
        {isMobile && (
          <Paper elevation={1} sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 0, position: 'sticky', top: 0, zIndex: 100 }}>
            <IconButton onClick={() => setMobileDrawerOpen(true)}><MenuIcon /></IconButton>
            <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>
              {navItems.find(n => n.view === currentView)?.label || 'Dashboard'}
            </Typography>
            <Badge badgeContent={cartItems.length} color="error">
              <IconButton onClick={() => switchView('cart')}><ShoppingCart /></IconButton>
            </Badge>
          </Paper>
        )}

        <Container maxWidth="lg" sx={{ py: 3 }}>

          {/* ── Dashboard View ── */}
          {currentView === 'dashboard' && (
            <>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={800} gutterBottom>
                  Welcome back, {userData?.name?.split(' ')[0] || 'User'} 👋
                </Typography>
                <Typography color="text.secondary">Member since {userStats.memberSince}</Typography>
              </Box>

              {/* Quick Nav Cards */}
              <Grid container spacing={2} sx={{ mb: 4 }}>
                {navItems.filter(n => n.view !== 'dashboard').map(({ view, label, icon, count }) => (
                  <Grid item xs={6} sm={3} key={view}>
                    <NavCard
                      icon={icon}
                      label={label}
                      count={count}
                      active={false}
                      onClick={() => switchView(view)}
                      color={view === 'cart' ? '#d32f2f' : view === 'favorites' ? '#e91e63' : '#1976d2'}
                    />
                  </Grid>
                ))}
              </Grid>

              {/* Stat Cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={6} md={3}>
                  <StatCard
                    label="Total Orders"
                    value={userStats.totalOrders}
                    icon={<Restaurant />}
                    bgcolor="#1976d2"
                  />
                </Grid>
                <Grid item xs={6} md={3}>
                  <StatCard
                    label="Total Spent"
                    value={`NPR ${userStats.totalSpent.toFixed(0)}`}
                    icon={<TrendingUp />}
                    bgcolor="#388e3c"
                    color="success.main"
                  />
                </Grid>
                <Grid item xs={6} md={3}>
                  <StatCard
                    label="Favorites"
                    value={favoriteItems.length}
                    icon={<Favorite />}
                    bgcolor="#e91e63"
                  />
                </Grid>
                <Grid item xs={6} md={3}>
                  <StatCard
                    label="Points Earned"
                    value={userStats.points}
                    icon={<Star />}
                    bgcolor="#f57c00"
                    color="warning.main"
                  />
                </Grid>
              </Grid>

              {/* Cart Summary Card (if items in cart) */}
              {cartItems.length > 0 && (
                <Paper sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'warning.light', bgcolor: 'warning.50' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        🛒 {cartItems.length} item{cartItems.length > 1 ? 's' : ''} in cart
                      </Typography>
                      <Typography color="text.secondary">Total: NPR {cartTotal.toFixed(2)}</Typography>
                    </Box>
                    <Button variant="contained" color="warning" onClick={() => switchView('cart')}>
                      View Cart
                    </Button>
                  </Box>
                </Paper>
              )}

              <Button
                variant="contained"
                size="large"
                startIcon={<Restaurant />}
                onClick={() => switchView('meals')}
                sx={{ py: 1.5, px: 4 }}
              >
                Browse Products
              </Button>
            </>
          )}

          {/* ── Products View ── */}
          {currentView === 'meals' && (
            <>
              <Typography variant="h4" fontWeight={700} gutterBottom>Available Products</Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <TextField
                  sx={{ flexGrow: 1, minWidth: 200 }}
                  variant="outlined"
                  placeholder="Search products or vendors..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
                />
                <FormControl sx={{ minWidth: 140 }}>
                  <InputLabel>Category</InputLabel>
                  <Select value={filterCategory} label="Category" onChange={e => setFilterCategory(e.target.value)}>
                    {categories.map(cat => (
                      <MenuItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {filteredProducts.length === 0 ? (
                <Paper sx={{ p: 5, textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>No products found</Typography>
                  <Button variant="outlined" onClick={() => { setSearchQuery(''); setFilterCategory('all'); }}>
                    Reset Filters
                  </Button>
                </Paper>
              ) : (
                <Grid container spacing={3}>
                  {filteredProducts.map(product => (
                    <Grid item xs={12} sm={6} md={4} key={product.id}>
                      <ProductCard
                        product={product}
                        onAddToCart={handleAddToCart}
                        onFavorite={handleAddToFavorites}
                        onDetails={(id) => { setSelectedProductId(id); setShowProductDetail(true); }}
                        imageFallback={imageFallback}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}

          {/* ── Favorites View ── */}
          {currentView === 'favorites' && (
            <>
              <Typography variant="h4" fontWeight={700} gutterBottom>My Favorites</Typography>
              {favoriteItems.length === 0 ? (
                <Paper sx={{ p: 5, textAlign: 'center' }}>
                  <Favorite sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>No favorites yet</Typography>
                  <Button variant="contained" onClick={() => switchView('meals')}>Browse Products</Button>
                </Paper>
              ) : (
                <Grid container spacing={3}>
                  {favoriteItems.map(item => (
                    <Grid item xs={12} sm={6} md={4} key={item.id}>
                      <Card sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }}>
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{ width: '100%', height: 180, objectFit: 'cover' }}
                          onError={e => { e.target.src = imageFallback; }}
                        />
                        <CardContent>
                          <Typography variant="h6" fontWeight={600} noWrap>{item.name}</Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {item.vendor} • NPR {item.price}
                          </Typography>
                          <Rating value={item.rating || 0} readOnly size="small" />
                          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                            <Button variant="contained" size="small" fullWidth startIcon={<ShoppingCart />} onClick={() => handleAddToCart(item)}>
                              Add to Cart
                            </Button>
                            <Button variant="outlined" size="small" color="error" onClick={() => handleRemoveFromFavorites(item.id)}>
                              <DeleteIcon fontSize="small" />
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}

          {/* ── Cart View ── */}
          {currentView === 'cart' && (
            <>
              <Typography variant="h4" fontWeight={700} gutterBottom>Shopping Cart</Typography>
              {cartItems.length === 0 ? (
                <Paper sx={{ p: 5, textAlign: 'center' }}>
                  <ShoppingCart sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>Your cart is empty</Typography>
                  <Button variant="contained" onClick={() => switchView('meals')}>Shop Now</Button>
                </Paper>
              ) : (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: 'grey.50' }}>
                            <TableCell fontWeight={600}>Product</TableCell>
                            <TableCell align="right">Price</TableCell>
                            <TableCell align="center">Qty</TableCell>
                            <TableCell align="right">Subtotal</TableCell>
                            <TableCell align="center">Del</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {cartItems.map(item => (
                            <TableRow key={item.id} hover>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                  <img
                                    src={item.image || imageFallback}
                                    alt={item.name}
                                    style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }}
                                    onError={e => { e.target.src = imageFallback; }}
                                  />
                                  <Box>
                                    <Typography variant="body2" fontWeight={600}>{item.name}</Typography>
                                    <Typography variant="caption" color="text.secondary">{item.vendor}</Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell align="right">NPR {item.price}</TableCell>
                              <TableCell align="center">
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                  <IconButton size="small" onClick={() => handleUpdateCartQuantity(item.id, -1)}><Remove fontSize="small" /></IconButton>
                                  <Typography sx={{ minWidth: 24, textAlign: 'center' }}>{item.quantity}</Typography>
                                  <IconButton size="small" onClick={() => handleUpdateCartQuantity(item.id, 1)}><Add fontSize="small" /></IconButton>
                                </Box>
                              </TableCell>
                              <TableCell align="right">NPR {(item.price * item.quantity).toFixed(2)}</TableCell>
                              <TableCell align="center">
                                <IconButton color="error" size="small" onClick={() => handleRemoveFromCart(item.id)}><DeleteIcon /></IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, position: 'sticky', top: 16 }}>
                      <Typography variant="h6" fontWeight={700} gutterBottom>Order Summary</Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography color="text.secondary">Items ({cartItems.length})</Typography>
                        <Typography>NPR {cartTotal.toFixed(2)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography color="text.secondary">Delivery</Typography>
                        <Typography color="success.main">Free</Typography>
                      </Box>
                      <Divider sx={{ my: 2 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                        <Typography variant="h6" fontWeight={700}>Total</Typography>
                        <Typography variant="h6" fontWeight={700} color="primary.main">
                          NPR {cartTotal.toFixed(2)}
                        </Typography>
                      </Box>
                      <Button variant="contained" color="primary" size="large" fullWidth onClick={handleCheckout}>
                        Checkout
                      </Button>
                      <Button variant="text" fullWidth sx={{ mt: 1 }} onClick={() => switchView('meals')}>
                        Continue Shopping
                      </Button>
                    </Paper>
                  </Grid>
                </Grid>
              )}
            </>
          )}

          {/* ── Profile View ── */}
          {currentView === 'profile' && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <Avatar sx={{ width: 96, height: 96, bgcolor: 'primary.main', fontSize: 40, mx: 'auto', mb: 2 }}>
                    {userData?.name?.[0] || 'U'}
                  </Avatar>
                  <Typography variant="h5" fontWeight={700}>{userData?.name}</Typography>
                  <Typography color="text.secondary" gutterBottom>{userData?.email}</Typography>
                  <Chip label={userData?.role || 'USER'} color="primary" size="small" sx={{ mb: 3 }} />
                  <Button variant="outlined" color="error" fullWidth startIcon={<LogoutIcon />} onClick={handleLogout}>
                    Logout
                  </Button>
                </Paper>
              </Grid>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 4 }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom>Account Info</Typography>
                  <Divider sx={{ mb: 3 }} />
                  {[
                    ['Member Since', userStats.memberSince],
                    ['Last Order', userStats.lastOrder],
                    ['Total Orders', userStats.totalOrders],
                    ['Total Spent', `NPR ${userStats.totalSpent.toFixed(2)}`],
                    ['Avg. Order Value', `NPR ${userStats.avgOrderValue.toFixed(2)}`],
                    ['Points Earned', userStats.points],
                    ['Favorites', favoriteItems.length],
                  ].map(([label, value]) => (
                    <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Typography color="text.secondary">{label}</Typography>
                      <Typography fontWeight={600}>{value}</Typography>
                    </Box>
                  ))}
                </Paper>
              </Grid>
            </Grid>
          )}
        </Container>
      </Box>

      {/* ── Product Detail Dialog ── */}
      <Dialog open={showProductDetail} onClose={() => setShowProductDetail(false)} maxWidth="md" fullWidth>
        {selectedProductId && (() => {
          const product = vendorProducts.find(p => p.id === selectedProductId);
          if (!product) return null;
          return (
            <>
              <DialogTitle sx={{ fontWeight: 700 }}>{product.name}</DialogTitle>
              <DialogContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={5}>
                    <img
                      src={product.image}
                      alt={product.name}
                      style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 8 }}
                      onError={e => { e.target.src = imageFallback; }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={7}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>by {product.vendor}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Rating
                        value={product.rating || 0}
                        onChange={(_, v) => v && handleRateProduct(product.id, v)}
                        precision={0.5}
                      />
                      <Typography variant="caption">({product.totalRatings || 0} ratings)</Typography>
                    </Box>
                    <Chip label={`NPR ${product.price}`} color="success" size="medium" sx={{ mb: 2, fontWeight: 700, fontSize: 16 }} />
                    {product.category && <Chip label={product.category} variant="outlined" size="small" sx={{ ml: 1, mb: 2 }} />}
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 1 }}>Ingredients</Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>{product.ingredients}</Typography>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 1 }}>Nutrition</Typography>
                    <Typography variant="body2" color="text.secondary">{product.nutrition}</Typography>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions sx={{ p: 2 }}>
                <Button onClick={() => setShowProductDetail(false)}>Close</Button>
                <Button variant="outlined" onClick={() => { handleAddToFavorites(product); setShowProductDetail(false); }} startIcon={<Favorite />}>
                  Favorite
                </Button>
                <Button variant="contained" onClick={() => { handleAddToCart(product); setShowProductDetail(false); }} startIcon={<ShoppingCart />}>
                  Add to Cart
                </Button>
              </DialogActions>
            </>
          );
        })()}
      </Dialog>
    </Box>
  );
};

export default SimpleUserDashboard;