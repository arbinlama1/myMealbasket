import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Paper, Typography, Box, Grid, Card, CardContent, Button,
  Avatar, List, ListItem, ListItemText, ListItemIcon, Divider, Alert,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, IconButton,
  MenuItem, LinearProgress, Badge, Drawer, useTheme, useMediaQuery,
  InputAdornment, ListItemButton, Rating, Snackbar, Stack, FormGroup,
  FormControlLabel, Checkbox,
} from '@mui/material';
import {
  Person,
  ShoppingCart,
  Restaurant,
  Search as SearchIcon,
  Add,
  Remove,
  Delete as DeleteIcon,
  Favorite, Dashboard,
  Menu as MenuIcon,
  Close as CloseIcon,
  Logout as LogoutIcon,
  Star,
  TrendingUp,
  LocalOffer,
  Receipt,
  Refresh as RefreshIcon,
  Mic,
  MicOff,
  Edit,
  Save,
  MenuBook,
  Timer,
} from '@mui/icons-material';
import { cartAPI, favoritesAPI, productAPI, userAPI, couponAPI } from '../services/api';
import useVoiceSearch from '../hooks/useVoiceSearch';
import ShoppingListGeneratorPanel from '../components/ShoppingListGenerator';

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
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCouponCode, setAppliedCouponCode] = useState(null);
  const [couponDiscountAmount, setCouponDiscountAmount] = useState(0);
  const [couponFinalTotal, setCouponFinalTotal] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponApplyLoading, setCouponApplyLoading] = useState(false);
  const [activeCoupons, setActiveCoupons] = useState([]);
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [favoriteProductIds, setFavoriteProductIds] = useState(new Set());
  const [orders, setOrders] = useState([]);
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
  const categories = ['all', 'breakfast', 'lunch', 'dinner', 'snacks', 'beverages', 'desserts'];
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Recipe States
  const [recipes, setRecipes] = useState([]);
  const [recipeSearchQuery, setRecipeSearchQuery] = useState('');
  const [recipeFilterCategory, setRecipeFilterCategory] = useState('ALL');
  const [shoppingListSelectedIds, setShoppingListSelectedIds] = useState([]);

  // Profile Management States
  const [editMode, setEditMode] = useState(false);
  const [budgetEditMode, setBudgetEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    dietaryPreferences: [],
    allergies: [],
    weeklyBudget: 5000,
    deliveryAddresses: []
  });
  const [newAllergy, setNewAllergy] = useState('');
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    type: 'Home',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    phone: '',
    isDefault: false
  });

  // Voice Search Hook
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleVoiceResult = (processedResult) => {
    setSearchQuery(processedResult);
  };

  const { isListening, voiceSupported, startVoiceSearch, stopVoiceSearch } = useVoiceSearch(
    handleVoiceResult,
    {
      showSnackbar,
    }
  );
  const imageFallback = 'https://via.placeholder.com/300x200?text=No+Image';

  // ── Auth ───────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
  }, [navigate]);

  // ── Load User Data ──────────────────────────────
  const loadUserData = async () => {
    try {
      const userResponse = await userAPI.getProfile();
      if (userResponse.data.success) {
        setUserData(userResponse.data.data);
        // Initialize profile data
        setProfileData({
          name: userResponse.data.data.name || '',
          phone: userResponse.data.data.phone || '',
          dietaryPreferences: userResponse.data.data.dietaryPreferences || [],
          allergies: userResponse.data.data.allergies || [],
          weeklyBudget: userResponse.data.data.weeklyBudget || 5000,
          deliveryAddresses: []
        });

        // Fetch delivery addresses from backend
        try {
          const addressesResponse = await userAPI.getDeliveryAddresses();
          if (addressesResponse.data.success) {
            setProfileData(prev => ({
              ...prev,
              deliveryAddresses: addressesResponse.data.data || []
            }));
          }
        } catch (addressError) {
          console.error('Failed to fetch delivery addresses:', addressError);
          // Continue with empty addresses list
        }
      }

      const statsResponse = await userAPI.getUserStats();
      console.log('User stats response:', statsResponse);
      if (statsResponse.data && statsResponse.data.success) {
        console.log('Setting user stats:', statsResponse.data.data);
        setUserStats(statsResponse.data.data);
      } else {
        console.log('Stats API failed:', statsResponse);
      }

      // Load user orders
      let ordersResponse;
      try {
        ordersResponse = await userAPI.getMyOrders(); // Use new dedicated My Orders API
      } catch (ordersError) {
        console.error('Orders API error:', ordersError);
        // Handle authentication errors specifically for orders
        if (ordersError.response?.status === 401) {
          console.error('Orders authentication error - redirecting to login');
          localStorage.removeItem('token'); // Clear invalid token
          navigate('/login'); // Redirect to login
          return;
        }
        // For other errors, set ordersResponse to null to trigger fallback
        ordersResponse = { data: { success: false } };
      }
      
      console.log('=== MY ORDERS API RESPONSE ===');
      console.log('API Response:', ordersResponse);
      
      if (ordersResponse.data && ordersResponse.data.success) {
        console.log('✅ USING MY ORDERS API WITH PRODUCT DETAILS');
        console.log('Raw orders response:', ordersResponse.data);
        
        // Extract orders from the new API response
        let rawOrders = ordersResponse.data.data || [];
        
        console.log('Extracted orders count:', rawOrders.length);
        
        // Debug: Log the structure of the first order to understand item data
        if (rawOrders.length > 0) {
          console.log('=== FIRST ORDER STRUCTURE DEBUG ===');
          console.log('First order:', rawOrders[0]);
          console.log('First order items:', rawOrders[0].items);
          console.log('All order keys:', Object.keys(rawOrders[0]));
        }
        
        // Process orders from new API (already has product details)
        const cleanedOrders = rawOrders.map(order => ({
          id: order.id,
          status: order.status || 'Pending',
          totalAmount: order.totalAmount || 0,
          createdAt: order.createdAt || order.orderDate,
          updatedAt: order.updatedAt,
          // Extract basic info
          amount: order.totalAmount || 0,
          quantity: order.items ? order.items.length : 1,
          // Items from new API already have product details
          items: order.items && order.items.length > 0 ? order.items.map(item => ({
            name: item.productName || `Product ${item.productId}`,
            quantity: item.quantity || 1,
            price: item.price || 0,
            amount: item.subtotal || (item.price * item.quantity) || 0
          })) : 
          // Fallback for orders without items
          [{
            name: `Order Items (${order.totalAmount || 0})`, 
            quantity: 1, 
            amount: order.totalAmount || 0,
            price: order.totalAmount || 0
          }]
        }));
        
        // Sort orders by date (latest first)
        const sortedOrders = cleanedOrders.sort((a, b) => 
          new Date(b.createdAt || b.orderDate) - new Date(a.createdAt || a.orderDate)
        );
        
        console.log('=== ORDER SORTING DEBUG ===');
        console.log('Cleaned orders before sort:', cleanedOrders);
        console.log('Cleaned orders after sort:', sortedOrders);
        console.log('Latest order:', sortedOrders[0]);
        console.log('Orders with dates:', sortedOrders.map(o => ({ id: o.id, date: o.createdAt, status: o.status })));
        
        setOrders(sortedOrders);
        
      } else {
        console.log('❌ USING SAMPLE DATA (API failed or no orders)');
        console.log('API Response Status:', ordersResponse.data?.success);
        console.log('API Message:', ordersResponse.data?.message);
        
        // Set sample orders as fallback
        const sampleOrders = [
          {
            id: 3,
            orderNumber: 'ORD-003',
            status: 'Delivered',
            totalAmount: 1250.00,
            createdAt: '2026-04-01T14:30:00',
            items: [
              { name: 'Pizza Margherita', quantity: 1, price: 450.00, amount: 450.00 },
              { name: 'Caesar Salad', quantity: 1, price: 200.00, amount: 200.00 },
              { name: 'Garlic Bread', quantity: 2, price: 150.00, amount: 300.00 }
            ]
          },
          {
            id: 2,
            orderNumber: 'ORD-002',
            status: 'Pending',
            totalAmount: 890.00,
            createdAt: '2026-04-02T18:45:00',
            items: [
              { name: 'Burger Combo', quantity: 1, price: 350.00, amount: 350.00 },
              { name: 'French Fries', quantity: 1, price: 120.00, amount: 120.00 },
              { name: 'Cold Coffee', quantity: 2, price: 210.00, amount: 420.00 }
            ]
          },
          {
            id: 1,
            orderNumber: 'ORD-001',
            status: 'Cancelled',
            totalAmount: 650.00,
            createdAt: '2026-04-03T12:15:00',
            items: [
              { name: 'Pasta Alfredo', quantity: 1, price: 280.00, amount: 280.00 },
              { name: 'Soup of the Day', quantity: 1, price: 120.00, amount: 120.00 },
              { name: 'Garlic Bread', quantity: 1, price: 75.00, amount: 75.00 }
            ]
          }
        ];
        setOrders(sampleOrders);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
      
      // Handle authentication errors specifically
      if (error.response?.status === 401) {
        console.error('Authentication error - redirecting to login');
        localStorage.removeItem('token'); // Clear invalid token
        navigate('/login'); // Redirect to login
        return;
      }
      
      // Fallback to basic user data
      setUserData({ name: 'Guest', email: 'guest@example.com', role: 'USER' });
      // Set sample orders for demo (latest first)
      setOrders([
        {
          id: 3,
          orderNumber: 'ORD-003',
          status: 'SHIPPED',
          totalAmount: 650.00,
          orderDate: '2024-01-20',
          items: [
            { name: 'Bakery Items', quantity: 4, price: 150.00 },
            { name: 'Beverages', quantity: 2, price: 50.00 }
          ]
        },
        {
          id: 2,
          orderNumber: 'ORD-002',
          status: 'PREPARING',
          totalAmount: 890.00,
          orderDate: '2024-01-18',
          items: [
            { name: 'Fresh Fruits', quantity: 3, price: 300.00 },
            { name: 'Dairy Products', quantity: 2, price: 290.00 }
          ]
        },
        {
          id: 1,
          orderNumber: 'ORD-001',
          status: 'DELIVERED',
          totalAmount: 1250.00,
          orderDate: '2024-01-15',
          items: [
            { name: 'Fresh Vegetables', quantity: 2, price: 250.00 },
            { name: 'Organic Rice', quantity: 1, price: 750.00 }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  // ── Load Recipes ───────────────────────────────
  useEffect(() => {
    const loadRecipes = async () => {
      try {
        // Try to get all recipes first
        const response = await fetch(`${API_BASE}/recipes`);
        const data = await response.json();
        
        if (data.success && data.data) {
          setRecipes(data.data);
        } else {
          // If general endpoint fails, try to get recipes by vendor ID
          // For demo purposes, we'll try vendor ID 8 as shown in the user's data
          try {
            const vendorResponse = await fetch(`${API_BASE}/recipes/vendor/8`);
            const vendorData = await vendorResponse.json();
            if (vendorData.success && vendorData.data) {
              setRecipes(vendorData.data);
            } else if (Array.isArray(vendorData)) {
              // Fallback for old API format
              setRecipes(vendorData);
            } else {
              setRecipes([]);
            }
          } catch (vendorError) {
            console.error('Failed to load vendor recipes:', vendorError);
            setRecipes([]);
          }
        }
      } catch (err) {
        console.error('Failed to load recipes:', err);
        // Try fallback API call
        try {
          const fallbackResponse = await fetch(`${API_BASE}/recipes`);
          const fallbackData = await fallbackResponse.json();
          if (Array.isArray(fallbackData)) {
            setRecipes(fallbackData);
          } else {
            setRecipes([]);
          }
        } catch (fallbackError) {
          console.error('Fallback recipe loading failed:', fallbackError);
          setRecipes([]);
        }
      }
    };
    loadRecipes();
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
      const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const applied =
        appliedCouponCode != null &&
        couponFinalTotal != null &&
        !Number.isNaN(Number(couponFinalTotal));
      const total = applied ? Number(couponFinalTotal) : subtotal;
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: total,
        couponCode: applied ? appliedCouponCode : undefined,
        discountAmount: applied ? couponDiscountAmount : undefined,
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
            <p>Total: NPR ${Number(total).toFixed(2)}</p>
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
      setAppliedCouponCode(null);
      setCouponDiscountAmount(0);
      setCouponFinalTotal(null);
      setCouponError('');
      setCouponCodeInput('');
      
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
      setAppliedCouponCode(null);
      setCouponDiscountAmount(0);
      setCouponFinalTotal(null);
      setCouponError('');
      setCouponCodeInput('');
    }
  };

  const handleApplyCoupon = async () => {
    const code = couponCodeInput.trim();
    if (!code) {
      setCouponError('Enter a coupon code');
      return;
    }
    if (cartItems.length === 0) return;
    setCouponApplyLoading(true);
    setCouponError('');
    try {
      const res = await couponAPI.apply({
        couponCode: code,
        cartTotal: Number(cartTotal.toFixed(2)),
      });
      const body = res.data;
      if (body?.success && body.data?.success) {
        const upper = code.toUpperCase();
        setAppliedCouponCode(upper);
        setCouponCodeInput(upper);
        setCouponDiscountAmount(Number(body.data.discountAmount));
        setCouponFinalTotal(Number(body.data.finalTotal));
        showSnackbar(body.data.message || 'Coupon applied successfully', 'success');
      } else {
        setCouponError(body?.message || 'Invalid coupon');
      }
    } catch (e) {
      setCouponError(e.response?.data?.message || e.message || 'Could not apply coupon');
    } finally {
      setCouponApplyLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCouponCode(null);
    setCouponDiscountAmount(0);
    setCouponFinalTotal(null);
    setCouponError('');
    setCouponCodeInput('');
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

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(recipeSearchQuery.toLowerCase());
    const matchesCategory = recipeFilterCategory === 'ALL' || recipe.category === recipeFilterCategory;
    return matchesSearch && matchesCategory;
  });

  const shoppingListIdEquals = (a, b) => String(a) === String(b);

  const toggleShoppingListRecipe = useCallback((id) => {
    if (id == null) return;
    setShoppingListSelectedIds((prev) =>
      prev.some((x) => shoppingListIdEquals(x, id))
        ? prev.filter((x) => !shoppingListIdEquals(x, id))
        : [...prev, id]
    );
  }, []);

  const selectAllVisibleRecipesForShopping = useCallback(() => {
    setShoppingListSelectedIds(filteredRecipes.map((r) => r.id).filter((x) => x != null));
  }, [filteredRecipes]);

  const clearShoppingListSelection = useCallback(() => setShoppingListSelectedIds([]), []);

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const hasAppliedCoupon =
    appliedCouponCode != null &&
    couponFinalTotal != null &&
    !Number.isNaN(Number(couponFinalTotal));
  const displayOrderTotal = hasAppliedCoupon ? Number(couponFinalTotal) : cartTotal;

  useEffect(() => {
    if (cartItems.length === 0) {
      setAppliedCouponCode(null);
      setCouponDiscountAmount(0);
      setCouponFinalTotal(null);
      setCouponError('');
      setCouponCodeInput('');
    }
  }, [cartItems.length]);

  useEffect(() => {
    if (currentView !== 'cart') return;
    let cancelled = false;
    couponAPI
      .getActive()
      .then((res) => {
        if (cancelled || !res.data?.success || !Array.isArray(res.data.data)) return;
        setActiveCoupons(res.data.data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [currentView]);

  useEffect(() => {
    if (!appliedCouponCode || cartItems.length === 0) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await couponAPI.apply({
          couponCode: appliedCouponCode,
          cartTotal: Number(cartTotal.toFixed(2)),
        });
        const body = res.data;
        if (cancelled) return;
        if (body?.success && body.data?.success) {
          setCouponDiscountAmount(Number(body.data.discountAmount));
          setCouponFinalTotal(Number(body.data.finalTotal));
          setCouponError('');
        } else {
          setAppliedCouponCode(null);
          setCouponDiscountAmount(0);
          setCouponFinalTotal(null);
          setCouponError(body?.message || 'Coupon no longer applies to this cart.');
        }
      } catch (e) {
        if (cancelled) return;
        setAppliedCouponCode(null);
        setCouponDiscountAmount(0);
        setCouponFinalTotal(null);
        setCouponError(e.response?.data?.message || 'Coupon no longer applies.');
      }
    })();
    return () => {
      cancelled = true;
    };
    // Re-run when cart total changes; appliedCouponCode read from latest render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartTotal, cartItems.length]);

  // Navigation Items
  const navItems = [
    { view: 'dashboard', label: 'Dashboard', icon: <Dashboard /> },
    { view: 'meals', label: 'Browse', icon: <Restaurant /> },
    { view: 'recipes', label: 'Recipes', icon: <MenuBook /> },
    { view: 'favorites', label: 'Favorites', icon: <Favorite />, count: favoriteItems.length },
    { view: 'cart', label: 'Cart', icon: <ShoppingCart />, count: cartItems.length },
    { view: 'orders', label: 'My Orders', icon: <Receipt /> },
    { view: 'profile', label: 'Profile', icon: <Person /> },
  ];

  const switchView = (view) => {
    setCurrentView(view);
    setMobileDrawerOpen(false);
  };

  // Profile Management Handlers
  const handleSaveBudget = async () => {
    console.log('=== HANDLE SAVE BUDGET CALLED ===');
    console.log('Current weeklyBudget:', profileData.weeklyBudget);
    try {
      // Prepare budget data for backend
      const budgetUpdateData = {
        weeklyBudget: Number(profileData.weeklyBudget),
      };

      // Send budget data to backend
      console.log('Sending budget data to backend:', budgetUpdateData);
      const response = await userAPI.updateProfile(budgetUpdateData);
      console.log('Backend response:', response.data);
      
      if (response.data.success) {
        console.log('Budget save successful, response data:', response.data.data);
        // Refresh user data from backend to get updated values
        await loadUserData();
        console.log('After loadUserData, current profileData.weeklyBudget:', profileData.weeklyBudget);
        setBudgetEditMode(false);
        showSnackbar('Weekly budget updated successfully', 'success');
      } else {
        showSnackbar('Failed to update weekly budget: ' + (response.data.message || 'Unknown error'), 'error');
      }
    } catch (error) {
      console.error('Error updating weekly budget:', error);
      showSnackbar('Failed to update weekly budget. Please try again.', 'error');
      
      // Handle authentication errors specifically
      if (error.response?.status === 401) {
        console.error('Authentication error - redirecting to login');
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
    }
  };

  const handleRemoveAllergy = (index) => {
    setProfileData(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index)
    }));
  };

  const handleAddAllergy = () => {
    if (newAllergy.trim() && !profileData.allergies.includes(newAllergy.trim())) {
      setProfileData(prev => ({
        ...prev,
        allergies: [...prev.allergies, newAllergy.trim()]
      }));
      setNewAllergy('');
    }
  };

  const handleSaveProfile = async () => {
    try {
      // Prepare profile data for backend
      const profileUpdateData = {
        name: profileData.name,
        phone: profileData.phone,
        dietaryPreferences: profileData.dietaryPreferences,
        allergies: profileData.allergies,
      };

      // Send profile data to backend
      const response = await userAPI.updateProfile(profileUpdateData);
      
      if (response.data.success) {
        // Refresh user data from backend
        await loadUserData();
        setEditMode(false);
        showSnackbar('Profile updated successfully', 'success');
      } else {
        showSnackbar('Failed to update profile: ' + (response.data.message || 'Unknown error'), 'error');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showSnackbar('Error updating profile', 'error');
    }
  };

  const handleAddAddress = async () => {
    if (newAddress.street && newAddress.city) {
      try {
        const addressToAdd = {
          ...newAddress,
          isDefault: profileData.deliveryAddresses.length === 0 || newAddress.isDefault
        };
        
        // Send address to backend
        const response = await userAPI.addDeliveryAddress(addressToAdd);
        
        if (response.data.success) {
          // If setting as default, remove default from other addresses
          const updatedAddresses = addressToAdd.isDefault
            ? profileData.deliveryAddresses.map(addr => ({ ...addr, isDefault: false }))
            : profileData.deliveryAddresses;
          
          setProfileData(prev => ({
            ...prev,
            deliveryAddresses: [...updatedAddresses, addressToAdd]
          }));
          
          setNewAddress({
            type: 'Home',
            street: '',
            city: '',
            state: '',
            postalCode: '',
            phone: '',
            isDefault: false
          });
          setShowAddAddress(false);
          showSnackbar('Address added successfully', 'success');
        } else {
          showSnackbar('Failed to add address: ' + (response.data.message || 'Unknown error'), 'error');
        }
      } catch (error) {
        console.error('Error adding address:', error);
        showSnackbar('Failed to add address. Please try again.', 'error');
        
        // Handle authentication errors specifically
        if (error.response?.status === 401) {
          console.error('Authentication error - redirecting to login');
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
      }
    }
  };

  const handleRemoveAddress = (index) => {
    setProfileData(prev => ({
      ...prev,
      deliveryAddresses: prev.deliveryAddresses.filter((_, i) => i !== index)
    }));
  };

  const handleSetDefaultAddress = (index) => {
    setProfileData(prev => ({
      ...prev,
      deliveryAddresses: prev.deliveryAddresses.map((addr, i) => ({
        ...addr,
        isDefault: i === index
      }))
    }));
  };

  const handleDietaryChange = (value, checked) => {
    setProfileData(prev => ({
      ...prev,
      dietaryPreferences: checked
        ? [...prev.dietaryPreferences, value]
        : prev.dietaryPreferences.filter(pref => pref !== value)
    }));
  };

  const getBudgetStatus = () => {
    const spent = userStats.totalSpent;
    const budget = parseFloat(profileData.weeklyBudget) || 5000;
    const percentage = (spent / budget) * 100;
    
    if (percentage >= 100) return 'Budget exceeded';
    if (percentage >= 80) return 'Warning: Near budget limit';
    if (percentage >= 60) return 'Moderate spending';
    return 'On track';
  };

  const getBudgetProgress = () => {
    const spent = userStats.totalSpent;
    const budget = parseFloat(profileData.weeklyBudget) || 5000;
    return Math.min((spent / budget) * 100, 100);
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
          <Typography variant="caption" color="text.secondary">{userData?.role || 'USER'}</Typography>
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
                      active={currentView === view}
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
                      <Typography color="text.secondary">Total: NPR {displayOrderTotal.toFixed(2)}</Typography>
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
                  placeholder="Search products or vendors or use voice search..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                    endAdornment: voiceSupported && (
                      <IconButton
                        size="small"
                        onClick={isListening ? stopVoiceSearch : startVoiceSearch}
                        color={isListening ? 'error' : 'primary'}
                        sx={{ 
                          animation: isListening ? 'pulse 1.5s infinite' : 'none',
                          '@keyframes pulse': {
                            '0%': { opacity: 1 },
                            '50%': { opacity: 0.5 },
                            '100%': { opacity: 1 },
                          }
                        }}
                      >
                        {isListening ? <MicOff /> : <Mic />}
                      </IconButton>
                    ),
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
                
                {/* Voice Search Status */}
                {voiceSupported && (
                  <Chip
                    label={isListening ? 'Listening...' : 'Voice Ready'}
                    color={isListening ? 'warning' : 'success'}
                    size="small"
                    icon={isListening ? <Mic /> : <MicOff />}
                    sx={{ alignSelf: 'center' }}
                  />
                )}
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

          {/* ── Recipes View ── */}
          {currentView === 'recipes' && (
            <>
              <Typography variant="h4" fontWeight={700} gutterBottom>Recipes</Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <TextField
                  sx={{ flexGrow: 1, minWidth: 200 }}
                  variant="outlined"
                  placeholder="Search recipes..."
                  value={recipeSearchQuery}
                  onChange={e => setRecipeSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                  }}
                />
                <FormControl sx={{ minWidth: 140 }}>
                  <InputLabel>Category</InputLabel>
                  <Select value={recipeFilterCategory} label="Category" onChange={e => setRecipeFilterCategory(e.target.value)}>
                    <MenuItem value="ALL">All Categories</MenuItem>
                    <MenuItem value="APPETIZER">Appetizer</MenuItem>
                    <MenuItem value="MAIN_COURSE">Main Course</MenuItem>
                    <MenuItem value="DESSERT">Dessert</MenuItem>
                    <MenuItem value="BEVERAGE">Beverage</MenuItem>
                    <MenuItem value="SNACK">Snack</MenuItem>
                    <MenuItem value="SALAD">Salad</MenuItem>
                    <MenuItem value="SOUP">Soup</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <ShoppingListGeneratorPanel
                visibleRecipes={filteredRecipes}
                selectedIds={shoppingListSelectedIds}
                onSelectAllVisible={selectAllVisibleRecipesForShopping}
                onClearSelection={clearShoppingListSelection}
              />

              {filteredRecipes.length === 0 ? (
                <Paper sx={{ p: 5, textAlign: 'center' }}>
                  <MenuBook sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>No recipes found</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {recipes.length === 0 ? 'No recipes available yet.' : 'Try adjusting your search or filters.'}
                  </Typography>
                  {(recipeSearchQuery || recipeFilterCategory !== 'ALL') && (
                    <Button variant="outlined" onClick={() => { setRecipeSearchQuery(''); setRecipeFilterCategory('ALL'); }}>
                      Reset Filters
                    </Button>
                  )}
                </Paper>
              ) : (
                <Grid container spacing={3}>
                  {filteredRecipes.map((recipe) => (
                    <Grid item xs={12} sm={6} md={4} key={recipe.id}>
                      <Card 
                        sx={{ 
                          height: '100%', 
                          display: 'flex', 
                          flexDirection: 'column',
                          borderRadius: 3,
                          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                          transition: 'all 0.3s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                          },
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            zIndex: 2,
                            bgcolor: 'rgba(255,255,255,0.92)',
                            borderRadius: 1,
                            boxShadow: 1,
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            size="small"
                            checked={shoppingListSelectedIds.some((x) => shoppingListIdEquals(x, recipe.id))}
                            onChange={() => toggleShoppingListRecipe(recipe.id)}
                            inputProps={{ 'aria-label': `Add ${recipe.name} to shopping list` }}
                          />
                        </Box>
                        {/* Category Badge */}
                        <Box 
                          sx={{ 
                            position: 'absolute', 
                            top: 16, 
                            right: 16, 
                            zIndex: 1 
                          }}
                        >
                          <Chip 
                            label={recipe.category?.replace('_', ' ') || 'MAIN COURSE'} 
                            size="small" 
                            sx={{ 
                              backgroundColor: 'rgba(255,255,255,0.9)',
                              backdropFilter: 'blur(10px)',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              fontSize: '0.7rem',
                              color: 'primary.main'
                            }}
                          />
                        </Box>

                        <CardContent sx={{ flexGrow: 1, p: 3 }}>
                          {/* Recipe Title */}
                          <Typography 
                            variant="h6" 
                            component="h3" 
                            sx={{ 
                              fontWeight: 700,
                              mb: 2,
                              color: 'text.primary',
                              lineHeight: 1.3,
                              pr: 8 // Make room for the category badge
                            }}
                          >
                            {recipe.name}
                          </Typography>
                          
                          {/* Cooking Time */}
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              backgroundColor: 'primary.light',
                              borderRadius: 2,
                              px: 1.5,
                              py: 0.5
                            }}>
                              <Timer sx={{ fontSize: 16, mr: 0.5, color: 'primary.main' }} />
                              <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                {recipe.cookingTime || 30} min
                              </Typography>
                            </Box>
                          </Box>

                          {/* Ingredients Section */}
                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Restaurant sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                Ingredients ({recipe.ingredients?.length || 0})
                              </Typography>
                            </Box>
                            <Box sx={{ pl: 2.5 }}>
                              {recipe.ingredients?.slice(0, 3).map((ing, idx) => (
                                <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                  <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                                    {ing.name}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                    {ing.quantity} {ing.unit}
                                  </Typography>
                                </Box>
                              ))}
                              {recipe.ingredients?.length > 3 && (
                                <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600, mt: 0.5 }}>
                                  +{recipe.ingredients.length - 3} more ingredients
                                </Typography>
                              )}
                            </Box>
                          </Box>

                          {/* Cooking Instructions */}
                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <MenuBook sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                Instructions
                              </Typography>
                            </Box>
                            <Box sx={{ pl: 2.5 }}>
                              <Typography 
                                variant="body2" 
                                color="text.secondary" 
                                sx={{ 
                                  lineHeight: 1.5,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}
                              >
                                {recipe.cookingInstructions || 'No instructions provided'}
                              </Typography>
                            </Box>
                          </Box>

                          {/* Nutritional Information */}
                          {recipe.nutritionalValue && (
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
                                Nutrition Facts (per serving)
                              </Typography>
                              <Box sx={{ pl: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                  <Typography variant="body2" color="text.secondary">Calories:</Typography>
                                  <Typography variant="body2" fontWeight={500}>{recipe.nutritionalValue.calories || 0}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                  <Typography variant="body2" color="text.secondary">Protein:</Typography>
                                  <Typography variant="body2" fontWeight={500}>{recipe.nutritionalValue.protein || 0}g</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                  <Typography variant="body2" color="text.secondary">Carbs:</Typography>
                                  <Typography variant="body2" fontWeight={500}>{recipe.nutritionalValue.carbs || 0}g</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                  <Typography variant="body2" color="text.secondary">Fat:</Typography>
                                  <Typography variant="body2" fontWeight={500}>{recipe.nutritionalValue.fat || 0}g</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                  <Typography variant="body2" color="text.secondary">Fiber:</Typography>
                                  <Typography variant="body2" fontWeight={500}>{recipe.nutritionalValue.fiber || 0}g</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                  <Typography variant="body2" color="text.secondary">Sugar:</Typography>
                                  <Typography variant="body2" fontWeight={500}>{recipe.nutritionalValue.sugar || 0}g</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                  <Typography variant="body2" color="text.secondary">Sodium:</Typography>
                                  <Typography variant="body2" fontWeight={500}>{recipe.nutritionalValue.sodium || 0}mg</Typography>
                                </Box>
                              </Box>
                            </Box>
                          )}

                          {/* Vendor Info */}
                          {recipe.vendorId && (
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="caption" color="text.secondary">
                                Vendor Name: {recipe.vendorName || 'Unknown Vendor'}
                              </Typography>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}

          {/* Favorites View */}
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
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Discount coupon
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'flex-start' }}>
                        <TextField
                          size="small"
                          fullWidth
                          label="Enter coupon code"
                          value={couponCodeInput}
                          onChange={(e) => {
                            setCouponCodeInput(e.target.value.toUpperCase());
                            setCouponError('');
                          }}
                          disabled={appliedCouponCode != null}
                          placeholder="e.g. SAVE20"
                        />
                        <Button
                          variant="contained"
                          size="medium"
                          onClick={handleApplyCoupon}
                          disabled={appliedCouponCode != null || couponApplyLoading || cartItems.length === 0}
                          sx={{ mt: 0.5, flexShrink: 0 }}
                        >
                          {couponApplyLoading ? '…' : 'Apply'}
                        </Button>
                      </Box>
                      {appliedCouponCode != null && (
                        <Button size="small" color="secondary" onClick={handleRemoveCoupon} sx={{ mb: 1 }}>
                          Remove coupon
                        </Button>
                      )}
                      {couponError && (
                        <Alert severity="error" sx={{ mb: 1 }} onClose={() => setCouponError('')}>
                          {couponError}
                        </Alert>
                      )}
                      {activeCoupons.length > 0 && appliedCouponCode == null && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Available offers — tap to autofill
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.75 }}>
                            {activeCoupons.map((c) => (
                              <Chip
                                key={c.code}
                                size="small"
                                icon={<LocalOffer fontSize="small" />}
                                label={c.code}
                                onClick={() => {
                                  setCouponCodeInput(String(c.code).toUpperCase());
                                  setCouponError('');
                                }}
                                variant="outlined"
                                sx={{ cursor: 'pointer' }}
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography color="text.secondary">Items ({cartItems.length})</Typography>
                        <Typography>NPR {cartTotal.toFixed(2)}</Typography>
                      </Box>
                      {hasAppliedCoupon && couponDiscountAmount > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography color="success.main">Discount ({appliedCouponCode})</Typography>
                          <Typography color="success.main">− NPR {Number(couponDiscountAmount).toFixed(2)}</Typography>
                        </Box>
                      )}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography color="text.secondary">Delivery</Typography>
                        <Typography color="success.main">Free</Typography>
                      </Box>
                      <Divider sx={{ my: 2 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                        <Typography variant="h6" fontWeight={700}>Total</Typography>
                        <Typography variant="h6" fontWeight={700} color="primary.main">
                          NPR {displayOrderTotal.toFixed(2)}
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

          {/* ── Orders View ── */}
          {currentView === 'orders' && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" fontWeight={700}>My Orders</Typography>
                <Button 
                  variant="outlined" 
                  startIcon={<RefreshIcon />}
                  onClick={loadUserData}
                  sx={{ textTransform: 'none' }}
                >
                  Refresh Orders
                </Button>
              </Box>
              {orders.length === 0 ? (
                <Alert severity="info">You haven't placed any orders yet.</Alert>
              ) : (
                <Grid container spacing={3}>
                  {orders.map((order, index) => (
                    <Grid item xs={12} md={6} key={order.id}>
                      <Card 
                        sx={{ 
                          height: '100%',
                          border: index === 0 ? '2px solid #1976d2' : '1px solid rgba(0,0,0,0.12)',
                          backgroundColor: index === 0 ? 'rgba(25, 118, 210, 0.04)' : 'background.paper'
                        }}
                      >
                        {index === 0 && (
                          <Box sx={{ 
                            bgcolor: 'primary.main', 
                            color: 'white', 
                            px: 2, 
                            py: 1, 
                            fontSize: '0.75rem', 
                            fontWeight: 600,
                            textAlign: 'center'
                          }}>
                            LATEST ORDER
                          </Box>
                        )}
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 2 }}>
                            <Chip 
                              label={order.status || 'Pending'} 
                              color={
                                order.status === 'DELIVERED' || order.status === 'Delivered' ? 'success' : 
                                order.status === 'CANCELLED' || order.status === 'Cancelled' ? 'error' : 
                                order.status === 'PENDING' || order.status === 'Pending' ? 'warning' :
                                order.status === 'ACCEPTED' || order.status === 'Accepted' ? 'info' :
                                order.status === 'PROCESSING' || order.status === 'Processing' ? 'info' :
                                order.status === 'OUT_FOR_DELIVERY' || order.status === 'Out for Delivery' ? 'primary' :
                                'warning'
                              }
                              size="small"
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Date: {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Status: {order.status || 'Pending'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontStyle: 'italic' }}>
                            {order.status === 'PENDING' || order.status === 'Pending' ? 'Waiting for vendor acceptance' :
                             order.status === 'ACCEPTED' || order.status === 'Accepted' ? 'Order accepted by vendor' :
                             order.status === 'PROCESSING' || order.status === 'Processing' ? 'Order is being prepared' :
                             order.status === 'OUT_FOR_DELIVERY' || order.status === 'Out for Delivery' ? 'Order is on the way' :
                             order.status === 'DELIVERED' || order.status === 'Delivered' ? 'Order has been delivered' :
                             order.status === 'CANCELLED' || order.status === 'Cancelled' ? 'Order was cancelled' :
                             'Order status unknown'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Items: {order.items?.length || order.quantity || 1}
                          </Typography>
                          <Typography variant="h6" color="primary.main" sx={{ mb: 2 }}>
                            Total: Rs.{order.totalAmount?.toFixed(2) || '0.00'}
                          </Typography>
                          {order.items && order.items.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Order Items:</Typography>
                              {order.items.map((item, index) => (
                                <Box key={index} sx={{ pl: 1, mb: 0.5 }}>
                                  <Typography variant="body2" color="text.secondary">
                                    • {item.name || `Item ${index + 1}`} {item.quantity > 1 ? `(${item.quantity}x)` : ''}
                                  </Typography>
                                  {item.price && (
                                    <Typography variant="caption" color="text.secondary" sx={{ pl: 2 }}>
                                      Rs.{item.price.toFixed(2)} each = Rs.{(item.amount || (item.price * item.quantity)).toFixed(2)}
                                    </Typography>
                                  )}
                                </Box>
                              ))}
                            </Box>
                          )}
                          </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}

          {/* Profile View */}
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
                <Stack spacing={3}>
                  {/* Personal Information */}
                  <Paper sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h6" fontWeight={700}>Personal Information</Typography>
                      <IconButton onClick={() => setEditMode(!editMode)} color="primary">
                        {editMode ? <Save /> : <Edit />}
                      </IconButton>
                    </Box>
                    <Divider sx={{ mb: 3 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Full Name"
                          value={profileData.name}
                          onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                          disabled={!editMode}
                          margin="normal"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                                              </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Email"
                          value={userData?.email || ''}
                          disabled
                          margin="normal"
                          helperText="Email cannot be changed"
                        />
                      </Grid>
                    </Grid>
                    {editMode && (
                      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                        <Button variant="contained" onClick={handleSaveProfile}>Save Changes</Button>
                        <Button variant="outlined" onClick={() => setEditMode(false)}>Cancel</Button>
                      </Box>
                    )}
                  </Paper>

                  {/* Dietary Preferences */}
                  <Paper sx={{ p: 4 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>Dietary Preferences</Typography>
                    <Divider sx={{ mb: 3 }} />
                    <FormGroup>
                      {[
                        { value: 'vegetarian', label: 'Vegetarian' },
                        { value: 'vegan', label: 'Vegan' },
                        { value: 'non-veg', label: 'Non-Vegetarian' },
                        { value: 'gluten-free', label: 'Gluten-Free' },
                        { value: 'dairy-free', label: 'Dairy-Free' },
                        { value: 'keto', label: 'Keto' },
                        { value: 'low-carb', label: 'Low-Carb' },
                        { value: 'halal', label: 'Halal' },
                      ].map((diet) => (
                        <FormControlLabel
                          key={diet.value}
                          control={
                            <Checkbox
                              checked={profileData.dietaryPreferences.includes(diet.value)}
                              onChange={(e) => handleDietaryChange(diet.value, e.target.checked)}
                            />
                          }
                          label={diet.label}
                        />
                      ))}
                    </FormGroup>
                  </Paper>

                  {/* Allergies */}
                  <Paper sx={{ p: 4 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>Allergies & Restrictions</Typography>
                    <Divider sx={{ mb: 3 }} />
                    <Box sx={{ mb: 2 }}>
                      {profileData.allergies.map((allergy, index) => (
                        <Chip
                          key={index}
                          label={allergy}
                          onDelete={() => handleRemoveAllergy(index)}
                          color="error"
                          variant="outlined"
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        size="small"
                        placeholder="Add allergy (e.g., peanuts, shellfish)"
                        value={newAllergy}
                        onChange={(e) => setNewAllergy(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddAllergy()}
                      />
                      <Button variant="outlined" onClick={handleAddAllergy}>Add</Button>
                    </Box>
                  </Paper>

                  {/* Weekly Budget */}
                  <Paper sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" fontWeight={700}>Weekly Budget</Typography>
                      <IconButton onClick={() => setBudgetEditMode(!budgetEditMode)} color="primary">
                        {budgetEditMode ? <Save /> : <Edit />}
                      </IconButton>
                    </Box>
                    <Divider sx={{ mb: 3 }} />
                    <TextField
                      fullWidth
                      type="number"
                      label="Weekly Budget (NPR)"
                      value={profileData.weeklyBudget}
                      onChange={(e) => setProfileData(prev => ({ ...prev, weeklyBudget: e.target.value }))}
                      disabled={!budgetEditMode}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">NPR</InputAdornment>,
                      }}
                      helperText={`Current spending: NPR ${userStats.totalSpent.toFixed(2)} this week`}
                    />
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Budget Status: {getBudgetStatus()}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={getBudgetProgress()}
                        sx={{ mt: 1, height: 8, borderRadius: 4 }}
                        color={getBudgetProgress() > 80 ? 'error' : 'primary'}
                      />
                    </Box>
                    {budgetEditMode && (
                      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                        <Button variant="contained" onClick={handleSaveBudget}>Save Budget</Button>
                        <Button variant="outlined" onClick={() => setBudgetEditMode(false)}>Cancel</Button>
                      </Box>
                    )}
                  </Paper>

                  {/* Delivery Address */}
                  <Paper sx={{ p: 4 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>Delivery Addresses</Typography>
                    <Divider sx={{ mb: 3 }} />
                    {profileData.deliveryAddresses.map((address, index) => (
                      <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {address.type} {address.isDefault && <Chip label="Default" size="small" color="primary" sx={{ ml: 1 }} />}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {address.street}, {address.city}<br />
                              {address.state}, {address.postalCode}<br />
                              Phone: {address.phone}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton size="small" onClick={() => handleSetDefaultAddress(index)}>
                              <Star />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleRemoveAddress(index)}>
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                    <Button variant="outlined" startIcon={<Add />} onClick={() => setShowAddAddress(true)}>
                      Add New Address
                    </Button>
                  </Paper>

                  {/* Account Statistics */}
                  <Paper sx={{ p: 4 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>Account Statistics</Typography>
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
                </Stack>
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

      {/* Add Address Dialog */}
      <Dialog open={showAddAddress} onClose={() => setShowAddAddress(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Delivery Address</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Address Type</InputLabel>
                <Select
                  value={newAddress.type}
                  label="Address Type"
                  onChange={(e) => setNewAddress(prev => ({ ...prev, type: e.target.value }))}
                >
                  <MenuItem value="Home">Home</MenuItem>
                  <MenuItem value="Work">Work</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                value={newAddress.street}
                onChange={(e) => setNewAddress(prev => ({ ...prev, street: e.target.value }))}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                value={newAddress.city}
                onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="State/Province"
                value={newAddress.state}
                onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Postal Code"
                value={newAddress.postalCode}
                onChange={(e) => setNewAddress(prev => ({ ...prev, postalCode: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={newAddress.phone}
                onChange={(e) => setNewAddress(prev => ({ ...prev, phone: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newAddress.isDefault}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, isDefault: e.target.checked }))}
                  />
                }
                label="Set as default address"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddAddress(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddAddress}>Add Address</Button>
        </DialogActions>
      </Dialog>
      
      {/* Voice Search Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

          </Box>
  );
};

export default SimpleUserDashboard;