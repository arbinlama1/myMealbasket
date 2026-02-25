import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  CircularProgress,
  Chip,
  Rating,
  IconButton,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  useTheme,
  useMediaQuery

} from '@mui/material';
import {
  ShoppingCart,
  Favorite,
  FavoriteBorder,
  Restaurant,
  Dashboard,
  AccountCircle,
  Search as SearchIcon,
  Add,
  Remove,
  Delete,
  Visibility,
  LocalShipping,
  AccessTime,
  AttachMoney,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { productAPI, cartAPI, favoriteAPI, userAPI } from '../services/api';
import SpeechSearchButton from '../components/SpeechSearchButton';
import {
  Person,
  Delete as DeleteIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Logout as LogoutIcon,
  Star,
  TrendingUp,
  LocalOffer,
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
const ProductCard = ({ product, onAddToCart, onFavorite, onDetails, imageFallback, isFavorite }) => (
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
          color={isFavorite ? "error" : "default"}
          onClick={() => onFavorite(product)}
          sx={{ border: '1px solid', borderColor: isFavorite ? 'error.main' : 'error.light' }}
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
const API_BASE = "http://localhost:8081/api";

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
  const [favoriteProductIds, setFavoriteProductIds] = useState(new Set());
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

  // ── Load User Data ──────────────────────────────
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userResponse = await userAPI.getProfile();
        if (userResponse.data.success) {
          setUserData(userResponse.data.data);
        }

        const statsResponse = await userAPI.getUserStats();
        console.log('User stats response:', statsResponse);
        if (statsResponse.data && statsResponse.data.success) {
          console.log('Setting user stats:', statsResponse.data.data);
          setUserStats(statsResponse.data.data);
        } else {
          console.log('Stats API failed:', statsResponse);
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
        // Fallback to basic user data
        setUserData({ name: 'Guest', email: 'guest@example.com', role: 'USER' });
      } finally {
        setLoading(false);
      }
    };
    
    // Only load user data if we have a token
    const token = localStorage.getItem('token');
    if (token) {
      loadUserData();
    } else {
      setUserData({ name: 'Guest', email: 'guest@example.com', role: 'USER' });
      setLoading(false);
    }
  }, []);

  // ── Load Cart & Favorites from Backend ──────────
  useEffect(() => {
    const loadCartAndFavorites = async () => {
      try {
        // Load cart from backend
        const cartResponse = await cartAPI.getCart();
        if (cartResponse.data.success) {
          setCartItems(cartResponse.data.data.items || []);
        }

        // Load favorites from backend
        const favoritesResponse = await favoritesAPI.getFavorites();
        if (favoritesResponse.data.success) {
          const favorites = favoritesResponse.data.data || [];
          setFavoriteItems(favorites);
          // Create a Set of favorite product IDs for quick lookup
          setFavoriteProductIds(new Set(favorites.map(f => f.id)));
        }
      } catch (error) {
        console.error('Failed to load cart and favorites:', error);
      }
    };
    
    // Only load cart and favorites if we have a token
    const token = localStorage.getItem('token');
    if (token) {
      loadCartAndFavorites();
    }
  }, []);

  // ── Load Products ──────────────────────────────
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await productAPI.getAll();
        if (response.data.success) {
          const products = response.data.data || [];
          const normalized = products.map(p => ({
            ...p,
            vendor: p?.vendor?.shopName || p?.vendor?.name || p?.vendor || 'Unknown Vendor',
            image: p.image || imageFallback,
            ingredients: p.ingredients || 'No ingredients listed',
            nutrition: p.nutrition || 'No nutrition info',
            reviews: p.reviews || [],
          }));
          setVendorProducts(normalized);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
        setVendorProducts([]);
      }
    };
    loadProducts();
  }, []);

  // ── Cart Functions ─────────────────────────────
  const handleAddToCart = async (product) => {
    // Optimistic UI update - show immediate feedback
    const existingItem = cartItems.find(item => item.productId === product.id);
    if (existingItem) {
      // Update quantity if already in cart
      setCartItems(prev => prev.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      // Add new item to cart
      const newItem = {
        id: Date.now(), // temporary ID
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        vendor: product.vendor,
        quantity: 1
      };
      setCartItems(prev => [...prev, newItem]);
    }

    try {
      const response = await cartAPI.addToCart(product.id, 1);
      if (response.data.success) {
        // Refresh cart to get correct data from backend
        const cartResponse = await cartAPI.getCart();
        if (cartResponse.data.success) {
          setCartItems(cartResponse.data.data.items || []);
        }
        // Show success feedback
        const toast = document.createElement('div');
        toast.innerHTML = `
          <div style="position: fixed; bottom: 20px; right: 20px; 
                      background: #4CAF50; color: white; padding: 12px 20px; 
                      border-radius: 4px; box-shadow: 0 2px 10px rgba(0,0,0,0.2); 
                      z-index: 9999; animation: slideIn 0.3s ease;">
            ✅ Added "${product.name}" to cart
          </div>
        `;
        document.body.appendChild(toast);
        setTimeout(() => document.body.removeChild(toast), 2000);
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
      // Revert optimistic update on error
      const cartResponse = await cartAPI.getCart();
      if (cartResponse.data.success) {
        setCartItems(cartResponse.data.data.items || []);
      }
      alert('Failed to add item to cart');
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) { 
      alert('Cart is empty'); 
      return; 
    }

    try {
      const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: total
      };

      // Show loading message
      const loadingMessage = document.createElement('div');
      loadingMessage.innerHTML = `
        <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                    background: white; padding: 20px; border-radius: 8px; 
                    box-shadow: 0 4px 20px rgba(0,0,0,0.2); z-index: 9999; text-align: center;">
          <h3>🍔 Placing Your Order...</h3>
          <p>Please wait while we process your order</p>
        </div>
      `;
      document.body.appendChild(loadingMessage);

      const response = await cartAPI.checkout(orderData);
      console.log('Checkout response:', response);
      console.log('Response data:', response.data);
      
      // Remove loading message
      document.body.removeChild(loadingMessage);
      
      // Check response structure - handle both axios and direct responses
      const responseData = response.data || response;
      console.log('Using response data:', responseData);
      
      // Check for success in multiple ways
      const isSuccess = responseData?.success || 
                        responseData?.message?.includes('successfully') ||
                        response.status === 200 ||
                        response.status === 201;
      
      console.log('Is success:', isSuccess);
      
      if (isSuccess) {
        console.log('Checkout successful, keeping cart items');
        
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.innerHTML = `
          <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                      background: #4CAF50; color: white; padding: 20px; border-radius: 8px; 
                      box-shadow: 0 4px 20px rgba(0,0,0,0.2); z-index: 9999; text-align: center;">
            <h3>✅ Successfully Placed Order!</h3>
            <p>Total: NPR ${total.toFixed(2)}</p>
            <p>Your order has been sent to the vendor</p>
            <p style="font-size: 12px; opacity: 0.8;">Cart items preserved - use "Clear Cart" to empty cart</p>
          </div>
        `;
        document.body.appendChild(successMessage);
        
        // Remove success message after 3 seconds
        setTimeout(() => {
          document.body.removeChild(successMessage);
        }, 3000);
        
        // Refresh user stats
        const statsResponse = await userAPI.getUserStats();
        console.log('Post-checkout stats response:', statsResponse);
        if (statsResponse.data && statsResponse.data.success) {
          console.log('Updating user stats after checkout:', statsResponse.data.data);
          setUserStats(statsResponse.data.data);
        }
      } else {
        console.log('Checkout failed:', response);
        const errorMsg = responseData?.error || responseData?.message || 'Unknown error occurred';
        alert('Checkout failed: ' + errorMsg);
      }
    } catch (error) {
      console.error('Failed to checkout:', error);
      
      // Remove loading message if exists
      const loadingMessage = document.querySelector('div[style*="position: fixed"]');
      if (loadingMessage) {
        document.body.removeChild(loadingMessage);
      }
      
      // Handle authentication errors
      if (error.response?.status === 401) {
        const authMessage = document.createElement('div');
        authMessage.innerHTML = `
          <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                      background: #f44336; color: white; padding: 20px; border-radius: 8px; 
                      box-shadow: 0 4px 20px rgba(0,0,0,0.2); z-index: 9999; text-align: center;">
            <h3>🔐 Session Expired</h3>
            <p>Please login again to continue</p>
            <button onclick="window.location.href='/login'" style="
              background: white; color: #f44336; border: none; padding: 8px 16px; 
              border-radius: 4px; cursor: pointer; margin-top: 10px;">
              Login Again
            </button>
          </div>
        `;
        document.body.appendChild(authMessage);
        setTimeout(() => {
          document.body.removeChild(authMessage);
          window.location.href = '/login';
        }, 3000);
        return;
      }
      
      // Show error message
      const errorMessage = document.createElement('div');
      errorMessage.innerHTML = `
        <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                    background: #f44336; color: white; padding: 20px; border-radius: 8px; 
                    box-shadow: 0 4px 20px rgba(0,0,0,0.2); z-index: 9999; text-align: center;">
          <h3>❌ Order Failed</h3>
          <p>Failed to place order: ${error.message || 'Unknown error'}</p>
          <p>Status: ${error.response?.status || 'Unknown'}</p>
          <p>Please try again</p>
        </div>
      `;
      document.body.appendChild(errorMessage);
      setTimeout(() => document.body.removeChild(errorMessage), 3000);
    }
  };

  const handleUpdateCartQuantity = async (id, delta) => {
    const item = cartItems.find(item => item.id === id);
    if (!item) return;

    const newQuantity = Math.max(1, item.quantity + delta);
    
    // Optimistic UI update first (instant)
    setCartItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
    
    try {
      await cartAPI.updateCartItem(id, newQuantity);
      // Success - UI already updated
    } catch (error) {
      console.error('Failed to update cart quantity:', error);
      // Revert on error
      setCartItems(prev => prev.map(item => 
        item.id === id ? { ...item, quantity: item.quantity } : item
      ));
      alert('Failed to update cart quantity');
    }
  };

  const handleRemoveFromCart = async (id) => {
    // Optimistic UI update first (instant)
    const originalItems = [...cartItems];
    setCartItems(prev => prev.filter(item => item.id !== id));
    
    try {
      await cartAPI.removeFromCart(id);
      // Success - UI already updated
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      // Revert on error
      setCartItems(originalItems);
      alert('Failed to remove item from cart');
    }
  };

  const handleClearCart = async () => {
    // Show confirmation dialog
    const confirmed = window.confirm('Are you sure you want to clear all items from your cart?');
    if (!confirmed) return;
    
    try {
      await cartAPI.clearCart();
      setCartItems([]);
      
      // Show clear cart message
      const clearMessage = document.createElement('div');
      clearMessage.innerHTML = `
        <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                    background: #FF9800; color: white; padding: 15px; border-radius: 8px; 
                    box-shadow: 0 4px 20px rgba(0,0,0,0.2); z-index: 9999; text-align: center;">
          <h3>🛒 Cart Cleared</h3>
          <p>All items removed from cart</p>
        </div>
      `;
      document.body.appendChild(clearMessage);
      setTimeout(() => document.body.removeChild(clearMessage), 2000);
    } catch (error) {
      console.error('Failed to clear cart:', error);
      // Force clear locally even if API fails
      setCartItems([]);
    }
  };

  // ── Favorites Functions ────────────────────────
  const handleAddToFavorites = async (product) => {
    if (favoriteProductIds.has(product.id)) { 
      alert('Already in favorites'); 
      return; 
    }

    try {
      const response = await favoritesAPI.addToFavorites(product.id);
      if (response.data.success) {
        // Refresh favorites
        const favoritesResponse = await favoritesAPI.getFavorites();
        if (favoritesResponse.data.success) {
          const favorites = favoritesResponse.data.data || [];
          setFavoriteItems(favorites);
          setFavoriteProductIds(new Set(favorites.map(f => f.id)));
        }
        alert(`Added "${product.name}" to favorites`);
      }
    } catch (error) {
      console.error('Failed to add to favorites:', error);
      alert('Failed to add to favorites');
    }
  };

  const handleRemoveFromFavorites = async (id) => {
    try {
      console.log('Removing from favorites, product ID:', id);
      const response = await favoritesAPI.removeFromFavorites(id);
      console.log('Remove from favorites response:', response.data);
      if (response.data.success) {
        // Refresh favorites
        const favoritesResponse = await favoritesAPI.getFavorites();
        if (favoritesResponse.data.success) {
          const favorites = favoritesResponse.data.data || [];
          setFavoriteItems(favorites);
          setFavoriteProductIds(new Set(favorites.map(f => f.id)));
        }
      } else {
        console.error('Remove from favorites failed:', response.data.error);
        alert('Failed to remove from favorites: ' + response.data.error);
      }
    } catch (error) {
      console.error('Failed to remove from favorites:', error);
      alert('Failed to remove from favorites');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
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
              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField
                  sx={{ flexGrow: 1, minWidth: 200 }}
                  variant="outlined"
                  placeholder="Search products or vendors..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  InputProps={{ 
                    startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                    endAdornment: (
                      <InputAdornment position="end">
                        <SpeechSearchButton onSearchResult={(text) => setSearchQuery(text)} />
                      </InputAdornment>
                    )
                  }}
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
                        isFavorite={favoriteProductIds.has(product.id)}
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
                        Place Order
                      </Button>
                      <Button variant="outlined" color="error" size="large" fullWidth sx={{ mt: 1 }} onClick={handleClearCart}>
                        🗑️ Clear Cart
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