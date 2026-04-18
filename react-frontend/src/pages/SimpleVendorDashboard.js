import RecipeManagement from '../components/RecipeManagement';
import React, { useState, useEffect } from 'react';
import { vendorAPI, authAPI } from '../services/api';
import promotionAPI from '../services/promotionAPI';
import {
  Container, Paper, Typography, Box, Grid, Card, CardContent, Button,
  Avatar, List, ListItem, ListItemText, ListItemIcon, Divider, Alert,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, IconButton,
  MenuItem, LinearProgress, Badge, Drawer, useTheme, useMediaQuery, Snackbar,
  FormControlLabel, Checkbox,
} from '@mui/material';
import {
  Person, ShoppingCart, Assessment, TrendingUp, AttachMoney,
  Logout, Add, Edit, Delete, CheckCircle,
  Store, Menu as MenuIcon, Close as CloseIcon,
  Inventory, LocalOffer, BarChart, Dashboard, Warning, Refresh,
  MenuBook, Save,
} from '@mui/icons-material';

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, bgcolor }) => (
  <Paper sx={{ p: 3, textAlign: 'center', bgcolor, color: 'white', borderRadius: 2 }}>
    <Box sx={{ mb: 1, opacity: 0.85 }}>{icon}</Box>
    <Typography variant="h4" fontWeight={800}>{value}</Typography>
    <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>{label}</Typography>
  </Paper>
);

// ── Nav Item ──────────────────────────────────────────────────────────────────
const NavItem = ({ icon, label, view, currentView, count, onClick }) => (
  <ListItem disablePadding>
    <ListItem
      button
      selected={currentView === view}
      onClick={() => onClick(view)}
      sx={{
        borderRadius: 1, mx: 1, my: 0.25,
        '&.Mui-selected': { bgcolor: 'primary.50', color: 'primary.main' },
        cursor: 'pointer',
      }}
    >
      <ListItemIcon sx={{ minWidth: 36, color: currentView === view ? 'primary.main' : 'inherit' }}>
        {count !== undefined
          ? <Badge badgeContent={count} color="error" max={99}>{icon}</Badge>
          : icon}
      </ListItemIcon>
      <ListItemText
        primary={label}
        primaryTypographyProps={{ fontSize: 14, fontWeight: currentView === view ? 700 : 400 }}
      />
    </ListItem>
  </ListItem>
);

// ── Order Status Chip ─────────────────────────────────────────────────────────
const StatusChip = ({ status }) => {
  const colorMap = {
    PENDING: 'default', 
    PREPARING: 'warning', 
    READY: 'info', 
    DELIVERED: 'success', 
    CANCELLED: 'error',
  };
  
  const statusUpper = status?.toUpperCase() || 'PENDING';
  const color = colorMap[statusUpper] || 'default';
  
  return (
    <Chip 
      label={statusUpper} 
      size="small" 
      color={color}
      sx={{ fontWeight: 600, textTransform: 'uppercase' }}
    />
  );
};

// Backend endpoints for recipes/promotions are now implemented.
const RECIPES_API_AVAILABLE = true;
const PROMOTIONS_API_AVAILABLE = true;

// ── Main Component ────────────────────────────────────────────────────────────
const SimpleVendorDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [vendorData, setVendorData] = useState({
    id: null, name: '', email: '',
    rating: 0.0, totalRatings: 0, totalOrders: 0, revenue: 0.0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentView, setCurrentView] = useState('dashboard');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Recipe Management State
  const [recipes, setRecipes] = useState([]);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');

  // Monthly Revenue Goal State
  const [monthlyRevenueGoal, setMonthlyRevenueGoal] = useState(15000);
  const [editGoalDialogOpen, setEditGoalDialogOpen] = useState(false);
  const [tempRevenueGoal, setTempRevenueGoal] = useState(15000);

  // Auto-refresh orders when Orders view is selected
  useEffect(() => {
    if (currentView === 'orders' && vendorData?.id) {
      refreshOrders();
    }
  }, [currentView, vendorData?.id]);

  // Orders Management Functions
  const refreshOrders = async () => {
    if (!vendorData?.id) return;
    
    setOrdersLoading(true);
    setOrdersError('');
    
    try {
      console.log('Refreshing orders for vendor ID:', vendorData.id);
      const ordersResponse = await vendorAPI.getOrders(vendorData.id);
      console.log('Orders response:', ordersResponse);
      
      const responseData = ordersResponse?.data;
      
      let ordersData = [];
      
      if (Array.isArray(responseData)) {
        ordersData = responseData;
      } 
      else if (responseData?.success && Array.isArray(responseData.data)) {
        ordersData = responseData.data;
      } 
      else if (Array.isArray(responseData?.data)) {
        ordersData = responseData.data;
      } 
      else {
        console.warn('Unexpected orders response format:', ordersResponse);
        ordersData = [];
      }
      
      console.log('Final orders set:', ordersData);
      setOrders(ordersData);
    } catch (orderErr) {
      console.error('Failed to refresh vendor orders:', orderErr);
      setOrdersError('Failed to refresh orders. Please try again.');
    } finally {
      setOrdersLoading(false);
    }
  };

  // Revenue Goal Management Functions
  const handleOpenEditGoal = () => {
    setTempRevenueGoal(monthlyRevenueGoal);
    setEditGoalDialogOpen(true);
  };

  const handleCloseEditGoal = () => {
    setEditGoalDialogOpen(false);
  };

  const handleSaveRevenueGoal = async () => {
    if (tempRevenueGoal > 0 && vendorData?.id) {
      try {
        // Save to backend
        const response = await vendorAPI.updateVendor(vendorData.id, {
          monthlyRevenueGoal: tempRevenueGoal
        });
        
        if (response.data?.success) {
          setMonthlyRevenueGoal(tempRevenueGoal);
          setEditGoalDialogOpen(false);
          console.log('Revenue goal saved to backend:', tempRevenueGoal);
        } else {
          showToast('Failed to save revenue goal: ' + (response.data?.message || 'Unknown error'), 'error');
        }
      } catch (error) {
        console.error('Error saving revenue goal:', error);
        showToast('Failed to save revenue goal. Please try again.', 'error');
      }
    }
  };

  // Recipe Management Functions
  const fetchRecipes = async (vendorId) => {
    if (!RECIPES_API_AVAILABLE) {
      setRecipes([]);
      return;
    }

    try {
      console.log('Fetching recipes from API for vendor:', vendorId);
      const response = await fetch(`http://localhost:8081/api/recipes/vendor/${vendorId}`);
      const data = await response.json();
      console.log('Recipes fetched:', data);
      const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
      
      // Parse ingredients from JSON string to array for each recipe
      const parsedList = list.map(recipe => {
        if (!recipe.ingredients) {
          return { ...recipe, ingredients: [] };
        }
        if (typeof recipe.ingredients === 'string') {
          try {
            const parsed = JSON.parse(recipe.ingredients);
            return { ...recipe, ingredients: Array.isArray(parsed) ? parsed : [] };
          } catch (e) {
            return { ...recipe, ingredients: [] };
          }
        }
        if (!Array.isArray(recipe.ingredients)) {
          return { ...recipe, ingredients: [] };
        }
        return recipe;
      });
      
      setRecipes(parsedList);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      setRecipes([]);
    }
  };

  
  
  // Business Information Edit State
  const [editBusinessInfo, setEditBusinessInfo] = useState(false);
  const [businessInfoData, setBusinessInfoData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    businessType: ''
  });

  // Dialog / form state
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '', price: '', category: 'Clothing', description: '', image: '', photoFile: null, stock: 0,
  });

  // Promotion state
  const [promotions, setPromotions] = useState([]);
  const [promotionLoading, setPromotionLoading] = useState(false);
  const [promotionError, setPromotionError] = useState('');
  const [promotionDialogOpen, setPromotionDialogOpen] = useState(false);
  const [newPromotion, setNewPromotion] = useState({ 
    title: '', 
    description: '', 
    couponCode: '', 
    discountType: 'PERCENT', 
    discountValue: '', 
    minOrderAmount: '', 
    startDate: '', 
    expiryDate: '', 
    isActive: true 
  });

  // Toast state
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  // ── Auth & Load ───────────────────────────────
  useEffect(() => {
    const loadVendorData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No authentication token found. Please login again.');
          setLoading(false);
          setTimeout(() => { window.location.href = '/login'; }, 2000);
          return;
        }

        // Get current user profile from auth endpoint
        const profileResponse = await authAPI.getProfile();
        if (profileResponse.data.success) {
          const userProfile = profileResponse.data.data;
          
          // Check if user is a vendor
          if (userProfile.role !== 'VENDOR') {
            setError('Access denied. Vendor role required.');
            setLoading(false);
            setTimeout(() => { window.location.href = '/login'; }, 2000);
            return;
          }
          
          setVendorData(userProfile);
          
          // Load full vendor profile to get monthlyRevenueGoal
          try {
            const vendorProfileResponse = await vendorAPI.getProfile(userProfile.id);
            if (vendorProfileResponse.data?.success && vendorProfileResponse.data?.data?.monthlyRevenueGoal) {
              setMonthlyRevenueGoal(vendorProfileResponse.data.data.monthlyRevenueGoal);
            }
          } catch (goalErr) {
            console.log('Could not load revenue goal from backend, using default:', goalErr);
          }
          
          // Load vendor products
          try {
            const productsResponse = await vendorAPI.getProducts(userProfile.id);
            if (productsResponse.data.success) {
              setProducts(productsResponse.data.data || []);
            }
          } catch (productErr) {
            console.error('Failed to load vendor products:', productErr);
          }

          // Load vendor orders (fetch all orders for this vendor)
         try {
  console.log('Fetching orders for vendor ID:', userProfile.id);

  const ordersResponse = await vendorAPI.getOrders(userProfile.id);

  console.log('Orders response:', ordersResponse);

  const responseData = ordersResponse?.data;

  let ordersData = [];

  if (Array.isArray(responseData)) {
    // Case 1: backend returns raw array
    ordersData = responseData;
  } 
  else if (responseData?.success && Array.isArray(responseData.data)) {
    // Case 2: wrapped response { success: true, data: [] }
    ordersData = responseData.data;
  } 
  else if (Array.isArray(responseData?.data)) {
    // Case 3: double wrapped
    ordersData = responseData.data;
  } 
  else {
    console.warn('Unexpected orders response format:', ordersResponse);
    ordersData = [];
  }

  console.log('Final orders set:', ordersData);
  setOrders(ordersData);

} catch (orderErr) {
  console.error('Failed to load vendor orders:', orderErr);
  setOrders([]);
}

          if (RECIPES_API_AVAILABLE) {
            try {
              await fetchRecipes(userProfile.id);
            } catch (recipeErr) {
              console.error('Failed to load vendor recipes:', recipeErr);
            }
          }
        } else {
          setError('Failed to load vendor profile. Please login again.');
          setLoading(false);
          setTimeout(() => { window.location.href = '/login'; }, 2000);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to load vendor dashboard:', err);
        setError('Failed to load vendor dashboard. Please refresh.');
        setLoading(false);
      }
    };
    loadVendorData();

    const handleMessage = (event) => {
      if (event.data?.type === 'PRODUCT_DELETED' && event.data.vendorId === vendorData.id) {
        setProducts(prev => prev.filter(p => p.id !== event.data.product.id));
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Load promotions when vendor data is available and when switching to promotions view
  useEffect(() => {
    if (PROMOTIONS_API_AVAILABLE && vendorData?.id) {
      loadPromotions();
    }
  }, [vendorData?.id]);

  useEffect(() => {
    if (PROMOTIONS_API_AVAILABLE && currentView === 'promotions' && vendorData?.id) {
      loadPromotions();
    }
  }, [currentView, vendorData?.id]);

  // ── Product CRUD ──────────────────────────────
  const handlePhotoUpload = (file) => new Promise((resolve, reject) => {
    if (!file) { resolve(''); return; }
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Failed to read photo'));
    reader.readAsDataURL(file);
  });

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { showToast('Please select an image file', 'error'); return; }
    if (file.size > 5 * 1024 * 1024) { showToast('Photo must be under 5MB', 'error'); return; }
    setNewProduct(p => ({ ...p, photoFile: file, image: URL.createObjectURL(file) }));
  };

  const resetForm = () => {
    setNewProduct({ name: '', price: '', category: 'Clothing', description: '', image: '', photoFile: null, stock: 0 });
    setEditingProduct(null);
    setShowAddProductForm(false);
  };

  const handleSaveProduct = async () => {
    const { name, price, category, description, stock } = newProduct;
    if (!name || !price || !category || !description) { showToast('Please fill in all required fields', 'error'); return; }
    if (stock < 0) { showToast('Stock cannot be negative', 'error'); return; }
    try {
      let productImage = newProduct.image;
      if (newProduct.photoFile) productImage = await handlePhotoUpload(newProduct.photoFile);
      const productData = { name, price: parseFloat(price), description, category, image: productImage, stock: parseInt(newProduct.stock) || 0 };

      if (editingProduct) {
        const updated = await vendorAPI.updateProduct(vendorData.id, editingProduct.id, productData);
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? updated.data.data : p));
        window.postMessage({ type: 'PRODUCT_UPDATED', product: updated.data.data, vendorId: vendorData.id }, '*');
        showToast(`Product "${updated.data.data.name}" updated!`, 'success');
      } else {
        const saved = await vendorAPI.createProduct(vendorData.id, productData);
        setProducts(prev => [...prev, saved.data.data]);
        setVendorData(prev => ({ ...prev, totalProducts: (prev.totalProducts || 0) + 1 }));
        showToast(`Product "${saved.data.data.name}" added! Price: NPR ${saved.data.data.price}`, 'success');
      }
      resetForm();
    } catch (err) {
      showToast(`Failed to save product: ${err.message}`, 'error');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setNewProduct({ name: product.name, price: product.price, category: product.category, description: product.description || '', image: product.image || '', photoFile: null, stock: product.stock || 0 });
    setShowAddProductForm(true);
  };

  const handleDeleteProduct = async (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product || !window.confirm(`Delete "${product.name}"?`)) return;
    try {
      await vendorAPI.deleteProduct(vendorData.id, productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
      setVendorData(prev => ({ ...prev, totalProducts: Math.max(0, (prev.totalProducts || 0) - 1) }));
      window.postMessage({ type: 'PRODUCT_DELETED', product: product, vendorId: vendorData.id }, '*');
      showToast(`"${product.name}" deleted.`, 'success');
    } catch (err) {
      showToast(`Failed to delete: ${err.message}`, 'error');
    }
  };

  const handleToggleStock = async (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    try {
      const currentStock = product.stock || 0;
      const newStock = currentStock === 0 ? 10 : 0; // Toggle between 0 (out of stock) and 10 (in stock)
      
      const updatedProduct = await vendorAPI.updateProduct(vendorData.id, productId, {
        ...product,
        stock: newStock
      });
      setProducts(prev => prev.map(p => p.id === productId ? updatedProduct.data.data : p));
      showToast(`Stock updated: ${product.name} is now ${newStock === 0 ? 'Out of Stock' : 'In Stock (10 units)'}`, 'success');
    } catch (err) {
      showToast(`Failed to update stock: ${err.message}`, 'error');
    }
  };

  const handleClearAllProducts = () => {
    if (!window.confirm('Delete ALL products?')) return;
    setProducts([]);
    window.postMessage({ type: 'VENDOR_PRODUCTS_DELETED', vendorId: vendorData.id }, '*');
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      const response = await vendorAPI.updateOrderStatus(vendorData.id, orderId, newStatus);
      if (response.data && response.data.success) {
        await refreshOrders();
        showToast(`Order #${orderId} status updated to ${newStatus} successfully!`, 'success');
      } else {
        showToast(`Failed to update order status: ${response.data?.message || 'Unknown error'}`, 'error');
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: o.status } : o));
      }
    } catch (err) {
      showToast(`Failed to update order status: ${err.message}`, 'error');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: o.status } : o));
    }
  };

  const handleEditBusinessInfo = () => {
    setBusinessInfoData({
      name: vendorData.name || '',
      email: vendorData.email || '',
      phone: vendorData.phone || '',
      address: vendorData.address || '',
      businessType: vendorData.businessType || ''
    });
    setEditBusinessInfo(true);
  };

  const handleSaveBusinessInfo = async () => {
    try {
      // Update vendor profile via API
      const response = await vendorAPI.updateVendorProfile(vendorData.id, businessInfoData);
      
      if (response.data.success) {
        // Update local state
        setVendorData(prev => ({ ...prev, ...businessInfoData }));
        setEditBusinessInfo(false);
        showToast('Business information updated successfully!', 'success');
      } else {
        showToast('Failed to update business information: ' + (response.data.message || 'Unknown error'), 'error');
      }
    } catch (error) {
      console.error('Error updating business information:', error);
      showToast('Failed to update business information. Please try again.', 'error');
    }
  };

  const handleCancelBusinessInfoEdit = () => {
    setEditBusinessInfo(false);
  };

  const handleBusinessInfoChange = (field, value) => {
    setBusinessInfoData(prev => ({ ...prev, [field]: value }));
  };

  const showToast = (message, severity = 'success') => {
    setToast({ open: true, message, severity });
  };

  const handleCloseToast = () => {
    setToast(prev => ({ ...prev, open: false }));
  };

  // ── Promotions ────────────────────────────────
  const loadPromotions = async () => {
    if (!vendorData?.id) return;

    if (!PROMOTIONS_API_AVAILABLE) {
      setPromotions([]);
      setPromotionError('');
      return;
    }
    
    setPromotionLoading(true);
    setPromotionError('');
    try {
      const response = await promotionAPI.getVendorPromotions(vendorData.id);
      if (response.data.success) {
        setPromotions(response.data.data || []);
      } else {
        setPromotionError(response.data.message || 'Failed to load promotions');
      }
    } catch (error) {
      console.error('Error loading promotions:', error);
      setPromotionError(error.response?.data?.message || 'Failed to load promotions');
    } finally {
      setPromotionLoading(false);
    }
  };

  const handleCreatePromotion = async () => {
    const { title, description, couponCode, discountType, discountValue, minOrderAmount, startDate, expiryDate, isActive } = newPromotion;
    
    // Validation
    if (!title || !couponCode || !discountValue || !startDate || !expiryDate) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    
    // Prepare promotion data
    const promotionData = {
      title,
      description,
      couponCode: couponCode.toUpperCase(),
      discountType,
      discountValue: parseFloat(discountValue),
      minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : 0,
      startDate,
      expiryDate,
      isActive
    };
    
    try {
      const response = await promotionAPI.createPromotion(promotionData);
      if (response.data.success) {
        showToast('Promotion created successfully', 'success');
        setNewPromotion({ 
          title: '', 
          description: '', 
          couponCode: '', 
          discountType: 'PERCENT', 
          discountValue: '', 
          minOrderAmount: '', 
          startDate: '', 
          expiryDate: '', 
          isActive: true 
        });
        setPromotionDialogOpen(false);
        await loadPromotions(); // Refresh the list
      } else {
        showToast(response.data.message || 'Failed to create promotion', 'error');
      }
    } catch (error) {
      console.error('Error creating promotion:', error);
      showToast(error.response?.data?.message || 'Failed to create promotion', 'error');
    }
  };

  const handleTogglePromotion = async (id) => {
    console.log('Toggling promotion with id:', id, 'type:', typeof id);
    if (!id || isNaN(id)) {
      showToast('Invalid promotion ID', 'error');
      return;
    }
    try {
      const response = await promotionAPI.togglePromotionStatus(id);
      console.log('Toggle response:', response);
      if (response.data.success) {
        showToast('Promotion status updated successfully', 'success');
        await loadPromotions(); // Refresh the list
      } else {
        showToast(response.data.message || 'Failed to update promotion status', 'error');
      }
    } catch (error) {
      console.error('Error toggling promotion:', error);
      console.error('Error response:', error.response);
      showToast(error.response?.data?.message || 'Failed to update promotion status', 'error');
    }
  };

  const handleDeletePromotion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this promotion?')) {
      return;
    }
    
    try {
      const response = await promotionAPI.deletePromotion(id);
      if (response.data.success) {
        showToast('Promotion deleted successfully', 'success');
        await loadPromotions(); // Refresh the list
      } else {
        showToast(response.data.message || 'Failed to delete promotion', 'error');
      }
    } catch (error) {
      console.error('Error deleting promotion:', error);
      showToast(error.response?.data?.message || 'Failed to delete promotion', 'error');
    }
  };

  // ── Misc ──────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const switchView = (view) => {
    setCurrentView(view);
    setMobileDrawerOpen(false);
  };

  const filteredProducts = products.filter(p => selectedCategory === 'All' || p.category === selectedCategory);
  const pendingOrders = orders.filter(o => o.status?.toUpperCase() === 'PENDING').length;
  const preparingOrders = orders.filter(o => o.status?.toUpperCase() === 'PREPARING').length;
  const readyOrders = orders.filter(o => o.status?.toUpperCase() === 'READY').length;
  const deliveredOrders = orders.filter(o => o.status?.toUpperCase() === 'DELIVERED').length;
  const totalRevenue = vendorData.revenue || 0;
  const lowStock = products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 5).length;

  const navItems = [
    { view: 'dashboard', label: 'Dashboard', icon: <Dashboard /> },
    { view: 'products', label: 'Products', icon: <Inventory />, count: products.length },
    { view: 'orders', label: 'Orders', icon: <ShoppingCart />, count: pendingOrders || undefined },
    { view: 'recipes', label: 'Recipes', icon: <MenuBook />, count: recipes.length },
    { view: 'analytics', label: 'Analytics', icon: <BarChart /> },
    { view: 'promotions', label: 'Promotions', icon: <LocalOffer /> },
    { view: 'profile', label: 'Profile', icon: <Person /> },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button variant="contained" onClick={() => { window.location.href = '/login'; }}>Go to Login</Button>
      </Container>
    );
  }

  // ── Sidebar ───────────────────────────────────
  const SidebarContent = () => (
    <Box sx={{ width: 220, pt: 2 }}>
      <Box sx={{ px: 2, pb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
          <Store fontSize="small" />
        </Avatar>
        <Box>
          <Typography variant="subtitle2" fontWeight={700} noWrap>{vendorData.name}</Typography>
          <Typography variant="caption" color="text.secondary">Vendor</Typography>
        </Box>
      </Box>
      <Divider />
      <List dense>
        {navItems.map(({ view, label, icon, count }) => (
          <NavItem key={view} view={view} label={label} icon={icon} count={count} currentView={currentView} onClick={switchView} />
        ))}
      </List>
      <Divider />
      <List dense>
        <ListItem disablePadding>
          <ListItem button onClick={handleLogout} sx={{ borderRadius: 1, mx: 1, my: 0.25, cursor: 'pointer' }}>
            <ListItemIcon sx={{ minWidth: 36 }}><Logout color="error" /></ListItemIcon>
            <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: 14, color: 'error.main' }} />
          </ListItem>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.50' }}>

      {/* Desktop Sidebar */}
      {!isMobile && (
        <Paper elevation={2} sx={{ width: 220, flexShrink: 0, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', borderRadius: 0 }}>
          <SidebarContent />
        </Paper>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer open={mobileDrawerOpen} onClose={() => setMobileDrawerOpen(false)}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
            <IconButton onClick={() => setMobileDrawerOpen(false)}><CloseIcon /></IconButton>
          </Box>
          <SidebarContent />
        </Drawer>
      )}

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>

        {/* Mobile Top Bar */}
        {isMobile && (
          <Paper elevation={1} sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 0, position: 'sticky', top: 0, zIndex: 100 }}>
            <IconButton onClick={() => setMobileDrawerOpen(true)}><MenuIcon /></IconButton>
            <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>
              {navItems.find(n => n.view === currentView)?.label || 'Dashboard'}
            </Typography>
            {pendingOrders > 0 ? (
              <Badge badgeContent={pendingOrders} color="error">
                <IconButton onClick={() => switchView('orders')}><ShoppingCart /></IconButton>
              </Badge>
            ) : (
              <IconButton onClick={() => switchView('orders')}><ShoppingCart /></IconButton>
            )}
          </Paper>
        )}

        <Container maxWidth="lg" sx={{ py: 3 }}>

          {/* ════════════════ DASHBOARD VIEW ════════════════ */}
          {currentView === 'dashboard' && (
            <>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={800}>Welcome back, {vendorData.name} 👋</Typography>
                <Typography color="text.secondary">{vendorData.email}</Typography>
              </Box>

              {/* Stat Cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={6} md={3}>
                  <StatCard label="Total Products" value={products.length} icon={<Inventory />} bgcolor="primary.main" />
                </Grid>
                <Grid item xs={6} md={3}>
                  <StatCard label="In Stock" value={products.filter(p => (p.stock || 0) > 0).length} icon={<CheckCircle />} bgcolor="success.main" />
                </Grid>
                <Grid item xs={6} md={3}>
                  <StatCard label="Low Stock" value={lowStock} icon={<Warning />} bgcolor="warning.main" />
                </Grid>
                <Grid item xs={6} md={3}>
                  <StatCard label="Total Orders" value={vendorData.totalOrders || 0} icon={<ShoppingCart />} bgcolor="info.main" />
                </Grid>
              </Grid>

              {/* Pending orders alert */}
              {pendingOrders > 0 && (
                <Alert severity="warning" sx={{ mb: 3 }} action={
                  <Button color="inherit" size="small" onClick={() => switchView('orders')}>View</Button>
                }>
                  You have {pendingOrders} pending order{pendingOrders > 1 ? 's' : ''} waiting for action.
                </Alert>
              )}

              <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Quick Actions */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, height: '100%' }}>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Quick Actions</Typography>
                    <List dense>
                      {[
                        { icon: <Add color="primary" />, label: 'Add New Product', sub: 'List a new item for sale', action: () => { setShowAddProductForm(true); } },
                        { icon: <Inventory color="primary" />, label: 'Manage Products', sub: `${products.length} products`, action: () => switchView('products') },
                        { icon: <ShoppingCart color="primary" />, label: 'View Orders', sub: `${pendingOrders} pending`, action: () => switchView('orders') },
                        { icon: <BarChart color="primary" />, label: 'Analytics', sub: `NPR ${totalRevenue.toFixed(0)} revenue`, action: () => switchView('analytics') },
                        { icon: <LocalOffer color="primary" />, label: 'Promotions', sub: `${promotions.filter(p => p.active).length} active`, action: () => switchView('promotions') },
                      ].map(({ icon, label, sub, action }) => (
                        <ListItem key={label} button onClick={action} sx={{ borderRadius: 1, mb: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>{icon}</ListItemIcon>
                          <ListItemText primary={label} secondary={sub} primaryTypographyProps={{ fontWeight: 600, fontSize: 14 }} secondaryTypographyProps={{ fontSize: 12 }} />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>

                {/* Recent Orders */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, height: '100%' }}>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Recent Orders</Typography>
                    <List dense>
                      {orders.slice(0, 4).map(order => (
                        <ListItem key={order.id} sx={{ borderRadius: 1, mb: 0.5, bgcolor: 'grey.50' }}>
                          <ListItemText
                            primary={`#${order.id} — ${order.customer || 'Customer'}`}
                            secondary={`NPR ${order.totalAmount || order.total} • ${order.time || new Date(order.createdAt).toLocaleTimeString()}`}
                            primaryTypographyProps={{ fontWeight: 600, fontSize: 14 }}
                            secondaryTypographyProps={{ fontSize: 12 }}
                          />
                        </ListItem>
                      ))}
                    </List>
                    <Button variant="outlined" fullWidth sx={{ mt: 2 }} onClick={() => switchView('orders')}>
                      View All Orders
                    </Button>
                  </Paper>
                </Grid>
              </Grid>

              {/* Revenue Progress */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" fontWeight={700}>Monthly Revenue Goal</Typography>
                  <Button
                    size="small"
                    startIcon={<Edit />}
                    onClick={handleOpenEditGoal}
                    sx={{ minWidth: 'auto' }}
                  >
                    Edit
                  </Button>
                </Box>
                <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">NPR {totalRevenue.toFixed(0)} / NPR {monthlyRevenueGoal.toLocaleString()}</Typography>
                  <Typography variant="body2" color="primary.main" fontWeight={600}>{Math.min(100, Math.round((totalRevenue / monthlyRevenueGoal) * 100))}%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={Math.min(100, (totalRevenue / monthlyRevenueGoal) * 100)} sx={{ height: 8, borderRadius: 4 }} />
              </Paper>

              {/* Vendor Profile Summary */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>Vendor Profile</Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
                  <Chip label={`⭐ ${vendorData.rating || 0} Rating`} color="primary" />
                  <Chip label={`${vendorData.totalOrders || 0} Orders`} color="success" />
                  <Chip label={`NPR ${totalRevenue.toFixed(0)} Revenue`} color="warning" />
                  <Chip label={`${products.length} Products`} color="info" />
                </Box>
              </Paper>
            </>
          )}

          {/* ════════════════ PRODUCTS VIEW ════════════════ */}
          {currentView === 'products' && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h4" fontWeight={700}>Product Management</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="contained" startIcon={<Add />} onClick={() => { resetForm(); setShowAddProductForm(true); }}>
                    Add Product
                  </Button>
                  {products.length > 0 && (
                    <Button variant="outlined" color="error" startIcon={<Delete />} onClick={handleClearAllProducts}>
                      Clear All
                    </Button>
                  )}
                </Box>
              </Box>

              {/* Category Filter */}
              <Paper sx={{ p: 2, mb: 3 }}>
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <InputLabel>Category</InputLabel>
                  <Select value={selectedCategory} label="Category" onChange={e => setSelectedCategory(e.target.value)}>
                    <MenuItem value="All">All Categories</MenuItem>
                    {['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages', 'Desserts'].map(c => (
                      <MenuItem key={c} value={c}>{c}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                  Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
                </Typography>
              </Paper>

              {filteredProducts.length === 0 ? (
                <Paper sx={{ p: 5, textAlign: 'center' }}>
                  <Inventory sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>No products yet</Typography>
                  <Button variant="contained" startIcon={<Add />} onClick={() => setShowAddProductForm(true)}>
                    Add Your First Product
                  </Button>
                </Paper>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.50' }}>
                        <TableCell>Product</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell align="right">Price (NPR)</TableCell>
                        <TableCell align="center">Stock</TableCell>
                        <TableCell align="center">Orders</TableCell>
                        <TableCell align="center">Rating</TableCell>
                        <TableCell align="center">Status</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredProducts.map(product => (
                        <TableRow key={product.id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Box
                                component="img"
                                src={product.image || `https://via.placeholder.com/48x48?text=${encodeURIComponent(product.name[0])}`}
                                alt={product.name}
                                sx={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 1 }}
                                onError={e => { e.target.src = 'https://via.placeholder.com/48x48?text=N/A'; }}
                              />
                              <Box>
                                <Typography variant="body2" fontWeight={600}>{product.name}</Typography>
                                <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 160, display: 'block' }}>
                                  {product.description}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell><Chip label={product.category} size="small" variant="outlined" /></TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>{product.price?.toFixed(2)}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={product.stock || 0}
                              size="small"
                              color={(product.stock || 0) === 0 ? 'error' : (product.stock || 0) <= 5 ? 'warning' : 'success'}
                            />
                          </TableCell>
                          <TableCell align="center">{product.orderCount || 0}</TableCell>
                          <TableCell align="center">{product.rating || '0'}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={(product.stock || 0) === 0 ? 'Out of Stock' : 'In Stock'}
                              size="small"
                              color={(product.stock || 0) === 0 ? 'error' : 'success'}
                              onClick={() => handleToggleStock(product.id)}
                              sx={{ cursor: 'pointer' }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                              <IconButton size="small" color="primary" onClick={() => handleEditProduct(product)}>
                                <Edit fontSize="small" />
                              </IconButton>
                              <IconButton size="small" color="error" onClick={() => handleDeleteProduct(product.id)}>
                                <Delete fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}

          {/* ════════════════ ORDERS VIEW ════════════════ */}
          {currentView === 'orders' && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" fontWeight={700}>Order Management</Typography>
                <Button
                  variant="contained"
                  startIcon={<Refresh />}
                  onClick={refreshOrders}
                  disabled={ordersLoading}
                >
                  Refresh Orders
                </Button>
              </Box>

              {ordersError && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setOrdersError('')}>
                  {ordersError}
                </Alert>
              )}

              {ordersLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={40} />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                    Loading orders...
                  </Typography>
                </Box>
              )}

              {/* Order Stats */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                  { label: 'Pending', color: 'default', count: pendingOrders },
                  { label: 'Preparing', color: 'warning', count: preparingOrders },
                  { label: 'Ready', color: 'info', count: readyOrders },
                  { label: 'Delivered', color: 'success', count: deliveredOrders },
                ].map(({ label, color, count }) => (
                  <Grid item xs={6} sm={3} key={label}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" fontWeight={700} color={`${color}.main`}>{count}</Typography>
                      <Typography variant="body2" color="text.secondary">{label}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell>Order ID</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Items</TableCell>
                      <TableCell align="right">Total (NPR)</TableCell>
                      <TableCell align="center">Status</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders.map(order => {
                      // Debug: Log order data structure
                      console.log('Order data:', order);
                      
                      return (
                      <TableRow key={order.id} hover>
                        <TableCell sx={{ fontWeight: 700 }}>#{order.id}</TableCell>
                        <TableCell>
                          {order.customer || order.customerName || order.user?.name || 'Customer'}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 160 }}>
                            {order.items ? order.items.map(item => `${item.quantity}x ${item.productName || item.name}`).join(', ') : 'No items'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          NPR {order.totalAmount || order.total || order.amount || '0.00'}
                        </TableCell>
                        <TableCell align="center"><StatusChip status={order.status} /></TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {order.time || new Date(order.createdAt || order.orderDate).toLocaleTimeString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', flexWrap: 'wrap' }}>
                            {/* Debug: Show current status */}
                            <Typography variant="caption" sx={{ fontSize: 10, color: 'gray' }}>
                              Status: "{order.status}"
                            </Typography>
                            {order.status?.toUpperCase() === 'PENDING' && (
                              <>
                                <Button size="small" variant="contained" color="success" onClick={() => handleUpdateOrderStatus(order.id, 'PREPARING')}>Accept</Button>
                                <Button size="small" variant="outlined" color="error" onClick={() => handleUpdateOrderStatus(order.id, 'CANCELLED')}>Reject</Button>
                              </>
                            )}
                            {order.status?.toUpperCase() === 'PREPARING' && (
                              <Button size="small" variant="contained" color="info" onClick={() => handleUpdateOrderStatus(order.id, 'READY')}>Mark Ready</Button>
                            )}
                            {order.status?.toUpperCase() === 'READY' && (
                              <Button size="small" variant="contained" color="success" onClick={() => handleUpdateOrderStatus(order.id, 'DELIVERED')}>Delivered</Button>
                            )}
                            {(order.status?.toUpperCase() === 'DELIVERED' || order.status?.toUpperCase() === 'CANCELLED') && (
                              <Chip label={order.status} size="small" color={order.status?.toUpperCase() === 'DELIVERED' ? 'success' : 'error'} />
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          {/* Recipe VIEW */}
          {currentView === 'recipes' && <RecipeManagement recipes={recipes} setRecipes={setRecipes} vendorData={vendorData} />}

          {/* ════════════════ ANALYTICS VIEW ════════════════ */}
          {currentView === 'analytics' && (
            <>
              <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>Analytics</Typography>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={6} md={3}>
                  <StatCard label="Total Revenue" value={`NPR ${totalRevenue.toFixed(0)}`} icon={<AttachMoney />} bgcolor="success.main" />
                </Grid>
                <Grid item xs={6} md={3}>
                  <StatCard label="Total Orders" value={vendorData.totalOrders || orders.length} icon={<ShoppingCart />} bgcolor="primary.main" />
                </Grid>
                <Grid item xs={6} md={3}>
                  <StatCard label="Avg. Order" value={`NPR ${orders.length ? Math.round(orders.reduce((s, o) => s + o.total, 0) / orders.length) : 0}`} icon={<TrendingUp />} bgcolor="info.main" />
                </Grid>
                <Grid item xs={6} md={3}>
                  <StatCard label="Vendor Rating" value={`${vendorData.rating || 0} ⭐`} icon={<Assessment />} bgcolor="warning.main" />
                </Grid>
              </Grid>

              <Grid container spacing={3}>
                {/* Stock Insights */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>Stock Insights</Typography>
                    {[
                      { label: 'Total Products', value: products.length, color: 'text.primary' },
                      { label: 'In Stock', value: products.filter(p => (p.stock || 0) > 0).length, color: 'success.main' },
                      { label: 'Low Stock (≤5)', value: lowStock, color: 'warning.main' },
                      { label: 'Out of Stock', value: products.filter(p => (p.stock || 0) === 0).length, color: 'error.main' },
                    ].map(({ label, value, color }) => (
                      <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Typography color="text.secondary">{label}</Typography>
                        <Typography fontWeight={700} color={color}>{value}</Typography>
                      </Box>
                    ))}
                  </Paper>
                </Grid>

                {/* Category Breakdown */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>Products by Category</Typography>
                    {['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages', 'Desserts'].map(cat => {
                      const count = products.filter(p => p.category === cat).length;
                      const pct = products.length ? Math.round(count / products.length * 100) : 0;
                      return (
                        <Box key={cat} sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2">{cat}</Typography>
                            <Typography variant="body2" color="text.secondary">{count} ({pct}%)</Typography>
                          </Box>
                          <LinearProgress variant="determinate" value={pct} sx={{ height: 6, borderRadius: 3 }} />
                        </Box>
                      );
                    })}
                  </Paper>
                </Grid>

                {/* Top Products */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>Top Products by Orders</Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Product</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell align="right">Price (NPR)</TableCell>
                            <TableCell align="right">Orders</TableCell>
                            <TableCell align="right">Revenue (NPR)</TableCell>
                            <TableCell align="center">Rating</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {[...products]
                            .sort((a, b) => (b.orders || 0) - (a.orders || 0))
                            .slice(0, 10)
                            .map(p => (
                              <TableRow key={p.id} hover>
                                <TableCell fontWeight={600}>{p.name}</TableCell>
                                <TableCell><Chip label={p.category} size="small" variant="outlined" /></TableCell>
                                <TableCell align="right">{p.price?.toFixed(2)}</TableCell>
                                <TableCell align="right">{p.orders || 0}</TableCell>
                                <TableCell align="right">{((p.orders || 0) * (p.price || 0)).toFixed(2)}</TableCell>
                                <TableCell align="center">⭐ {p.rating || '—'}</TableCell>
                              </TableRow>
                            ))}
                          {products.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={6} align="center">
                                <Typography color="text.secondary" sx={{ py: 2 }}>No products yet</Typography>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Grid>
              </Grid>
            </>
          )}

          {/* ════════════════ PROMOTIONS VIEW */}
          {currentView === 'promotions' && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" fontWeight={700}>Promotions</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={() => setPromotionDialogOpen(true)}>
                  Create Promotion
                </Button>
              </Box>

              {promotionLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              )}

              {promotionError && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setPromotionError('')}>
                  {promotionError}
                </Alert>
              )}

              {!PROMOTIONS_API_AVAILABLE && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Promotions backend is not available yet in this project.
                </Alert>
              )}

              {!promotionLoading && promotions.length === 0 ? (
                <Paper sx={{ p: 5, textAlign: 'center' }}>
                  <LocalOffer sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>No promotions yet</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Create your first promotion to attract customers with special discounts
                  </Typography>
                  <Button variant="contained" onClick={() => setPromotionDialogOpen(true)}>Create First Promotion</Button>
                </Paper>
              ) : (
                <Grid container spacing={3}>
                  {promotions.map(promo => {
                    const isExpired = new Date(promo.expiryDate) < new Date();
                    const isNotStarted = new Date(promo.startDate) > new Date();
                    const isValid = promo.isActive && !isExpired && !isNotStarted;
                    
                    return (
                      <Grid item xs={12} sm={6} md={4} key={promo.id}>
                        <Card sx={{
                          border: '2px solid',
                          borderColor: isValid ? 'success.light' : isExpired ? 'error.light' : 'grey.200',
                          transition: 'all 0.2s',
                          '&:hover': { boxShadow: 4 },
                          opacity: isExpired ? 0.7 : 1,
                        }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="h6" fontWeight={700}>{promo.title}</Typography>
                              <Chip 
                                label={
                                  isExpired ? 'Expired' : 
                                  isNotStarted ? 'Not Started' : 
                                  (promo.isActive ? 'Active' : 'Inactive')
                                } 
                                color={
                                  isExpired ? 'error' : 
                                  isNotStarted ? 'warning' : 
                                  (promo.isActive ? 'success' : 'default')
                                } 
                                size="small" 
                              />
                            </Box>
                            
                            <Typography variant="h3" color="primary.main" fontWeight={800} sx={{ mb: 1 }}>
                              {promo.discountType === 'PERCENT' ? `${promo.discountValue}%` : `NPR ${promo.discountValue}`}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">OFF</Typography>
                            
                            {promo.description && (
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {promo.description}
                              </Typography>
                            )}
                            
                            <Divider sx={{ my: 2 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="body2" color="text.secondary">Code</Typography>
                              <Chip label={promo.couponCode} size="small" variant="outlined" sx={{ fontFamily: 'monospace', fontWeight: 700 }} />
                            </Box>
                            
                            {promo.minOrderAmount > 0 && (
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="body2" color="text.secondary">Min Order</Typography>
                                <Typography variant="body2" fontWeight={600}>NPR {promo.minOrderAmount}</Typography>
                              </Box>
                            )}
                            
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="body2" color="text.secondary">Valid Until</Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {new Date(promo.expiryDate).toLocaleDateString()}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                              <Button
                                variant={promo.isActive ? 'outlined' : 'contained'}
                                size="small"
                                fullWidth
                                onClick={() => handleTogglePromotion(promo.id)}
                                disabled={isExpired}
                              >
                                {promo.isActive ? 'Deactivate' : 'Activate'}
                              </Button>
                              <IconButton size="small" color="error" onClick={() => handleDeletePromotion(promo.id)}>
                                <Delete fontSize="small" />
                              </IconButton>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </>
          )}

          {/* ════════════════ PROFILE VIEW */}
          {/* ════════════════ PROFILE VIEW ════════════════ */}
          {currentView === 'profile' && (
            <>
              <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>Vendor Profile</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Avatar sx={{ width: 96, height: 96, bgcolor: 'primary.main', fontSize: 40, mx: 'auto', mb: 2 }}>
                      {vendorData.name?.[0] || 'V'}
                    </Avatar>
                    <Typography variant="h5" fontWeight={700}>{vendorData.name}</Typography>
                    <Typography color="text.secondary" gutterBottom>{vendorData.email}</Typography>
                    <Chip label="VENDOR" color="primary" size="small" sx={{ mb: 3 }} />
                    <Button variant="outlined" color="error" fullWidth startIcon={<Logout />} onClick={() => { window.location.href = '/login'; }}>
                      Logout
                    </Button>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Paper sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" fontWeight={700}>Business Information</Typography>
                      <IconButton onClick={editBusinessInfo ? handleSaveBusinessInfo : handleEditBusinessInfo} color="primary">
                        {editBusinessInfo ? <Save /> : <Edit />}
                      </IconButton>
                    </Box>
                    <Divider sx={{ mb: 3 }} />
                    
                    {editBusinessInfo ? (
                      // Edit Mode
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Shop Name"
                            value={businessInfoData.name}
                            onChange={(e) => handleBusinessInfoChange('name', e.target.value)}
                            margin="normal"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Email"
                            value={businessInfoData.email}
                            onChange={(e) => handleBusinessInfoChange('email', e.target.value)}
                            margin="normal"
                            type="email"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Phone"
                            value={businessInfoData.phone}
                            onChange={(e) => handleBusinessInfoChange('phone', e.target.value)}
                            margin="normal"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth margin="normal">
                            <InputLabel>Business Type</InputLabel>
                            <Select
                              value={businessInfoData.businessType}
                              label="Business Type"
                              onChange={(e) => handleBusinessInfoChange('businessType', e.target.value)}
                            >
                              <MenuItem value="Restaurant">Restaurant</MenuItem>
                              <MenuItem value="Cafe">Cafe</MenuItem>
                              <MenuItem value="Bakery">Bakery</MenuItem>
                              <MenuItem value="Grocery">Grocery</MenuItem>
                              <MenuItem value="Other">Other</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Address"
                            value={businessInfoData.address}
                            onChange={(e) => handleBusinessInfoChange('address', e.target.value)}
                            margin="normal"
                            multiline
                            rows={2}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                            <Button variant="outlined" onClick={handleCancelBusinessInfoEdit}>Cancel</Button>
                            <Button variant="contained" onClick={handleSaveBusinessInfo}>Save Changes</Button>
                          </Box>
                        </Grid>
                      </Grid>
                    ) : (
                      // View Mode
                      <>
                        {[
                          ['Shop Name', vendorData.name || 'N/A'],
                          ['Email', vendorData.email || 'N/A'],
                          ['Phone', vendorData.phone || 'N/A'],
                          ['Address', vendorData.address || 'N/A'],
                          ['Business Type', vendorData.businessType || 'N/A'],
                          ['Registration Date', vendorData.registrationDate || 'N/A'],
                          ['Total Products', products.length],
                          ['Total Revenue', `NPR ${totalRevenue.toFixed(2)}`],
                          ['Active Orders', pendingOrders || 0],
                        ].map(([label, value]) => (
                          <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                            <Typography color="text.secondary">{label}</Typography>
                            <Typography fontWeight={600}>{value}</Typography>
                          </Box>
                        ))}
                      </>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </>
          )}

          </Container>
      </Box>

      {/* ════════════════ ADD / EDIT PRODUCT DIALOG ════════════════ */}
      <Dialog open={showAddProductForm} onClose={resetForm} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 700 }}>
          {editingProduct ? `Edit: ${editingProduct.name}` : 'Add New Product'}
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Product Name *" value={newProduct.name} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Price (NPR) *" type="number" value={newProduct.price} onChange={e => setNewProduct(p => ({ ...p, price: e.target.value }))} inputProps={{ min: 0, step: 0.01 }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category *</InputLabel>
                <Select value={newProduct.category} label="Category *" onChange={e => setNewProduct(p => ({ ...p, category: e.target.value }))}>
                  {['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages', 'Desserts'].map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Initial Stock" type="number" value={newProduct.stock} onChange={e => setNewProduct(p => ({ ...p, stock: parseInt(e.target.value) || 0 }))} inputProps={{ min: 0 }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Description *" multiline rows={3} value={newProduct.description} onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Image URL (optional)" value={newProduct.image} onChange={e => setNewProduct(p => ({ ...p, image: e.target.value, photoFile: null }))} placeholder="https://..." />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Or Upload Photo</Typography>
              <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ width: '100%', padding: 10, border: '2px dashed #ccc', borderRadius: 4 }} />
            </Grid>
            {newProduct.image && (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" color="text.secondary">Preview:</Typography>
                  <Box component="img" src={newProduct.image} alt="preview" sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 1, border: '1px solid #ddd' }} onError={e => { e.target.style.display = 'none'; }} />
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: 'grey.50' }}>
          <Button onClick={resetForm}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveProduct}>{editingProduct ? 'Update Product' : 'Save Product'}</Button>
        </DialogActions>
      </Dialog>

      {/* ════════════════ CREATE PROMOTION DIALOG ════════════════ */}
      <Dialog open={promotionDialogOpen} onClose={() => setPromotionDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Create Promotion</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField 
                fullWidth 
                label="Promotion Title" 
                value={newPromotion.title} 
                onChange={e => setNewPromotion(p => ({ ...p, title: e.target.value }))} 
                placeholder="e.g. Weekend Special"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                fullWidth 
                label="Description" 
                value={newPromotion.description} 
                onChange={e => setNewPromotion(p => ({ ...p, description: e.target.value }))} 
                placeholder="Optional description of the promotion"
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                fullWidth 
                label="Coupon Code" 
                value={newPromotion.couponCode} 
                onChange={e => setNewPromotion(p => ({ ...p, couponCode: e.target.value.toUpperCase() }))} 
                placeholder="e.g. SAVE20"
                inputProps={{ style: { fontFamily: 'monospace' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Discount Type</InputLabel>
                <Select
                  value={newPromotion.discountType}
                  onChange={e => setNewPromotion(p => ({ ...p, discountType: e.target.value }))}
                >
                  <MenuItem value="PERCENT">Percentage (%)</MenuItem>
                  <MenuItem value="FIXED">Fixed Amount (NPR)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                fullWidth 
                label={newPromotion.discountType === 'PERCENT' ? 'Discount %' : 'Discount Amount (NPR)'} 
                type="number" 
                value={newPromotion.discountValue} 
                onChange={e => setNewPromotion(p => ({ ...p, discountValue: e.target.value }))} 
                inputProps={{ 
                  min: 1, 
                  max: newPromotion.discountType === 'PERCENT' ? 100 : undefined 
                }} 
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                fullWidth 
                label="Min Order Amount (NPR)" 
                type="number" 
                value={newPromotion.minOrderAmount} 
                onChange={e => setNewPromotion(p => ({ ...p, minOrderAmount: e.target.value }))} 
                placeholder="Optional"
                inputProps={{ min: 0 }} 
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                fullWidth 
                label="Start Date" 
                type="date" 
                value={newPromotion.startDate} 
                onChange={e => setNewPromotion(p => ({ ...p, startDate: e.target.value }))}
                inputProps={{ min: new Date().toISOString().split('T')[0] }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                fullWidth 
                label="Expiry Date" 
                type="date" 
                value={newPromotion.expiryDate} 
                onChange={e => setNewPromotion(p => ({ ...p, expiryDate: e.target.value }))}
                inputProps={{ min: newPromotion.startDate || new Date().toISOString().split('T')[0] }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newPromotion.isActive}
                    onChange={e => setNewPromotion(p => ({ ...p, isActive: e.target.checked }))}
                  />
                }
                label="Active (customers can use this promotion)"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setPromotionDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreatePromotion}>Create Promotion</Button>
        </DialogActions>
      </Dialog>

      {/* ════════════════ EDIT REVENUE GOAL DIALOG ════════════════ */}
      <Dialog open={editGoalDialogOpen} onClose={handleCloseEditGoal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Monthly Revenue Goal</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Set your monthly revenue target. This helps track your progress and motivation.
          </Typography>
          <TextField
            fullWidth
            label="Revenue Goal (NPR)"
            type="number"
            value={tempRevenueGoal}
            onChange={e => setTempRevenueGoal(parseInt(e.target.value) || 0)}
            inputProps={{ min: 1000, step: 1000 }}
            helperText="Minimum: NPR 1,000"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseEditGoal}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveRevenueGoal}
            disabled={tempRevenueGoal < 1000}
          >
            Save Goal
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Notifications */}
      <Snackbar
        open={toast.open}
        autoHideDuration={6000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseToast} severity={toast.severity} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>

    </Box>
  );
};

export default SimpleVendorDashboard;
