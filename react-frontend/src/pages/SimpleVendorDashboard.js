import React, { useState, useEffect } from 'react';
import vendorService from '../services/vendorService';
import {
  Container, Paper, Typography, Box, Grid, Card, CardContent, Button,
  Avatar, List, ListItem, ListItemText, ListItemIcon, Divider, Alert,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, Tabs, Tab, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, Menu,
  MenuItem, LinearProgress, Badge, Drawer, useTheme, useMediaQuery,
} from '@mui/material';
import {
  Person, ShoppingCart, Restaurant, Assessment, TrendingUp, AttachMoney,
  Logout, Add, Edit, Delete, Visibility, CheckCircle, Pending, Cancel,
  ArrowBack, AccountCircle, Store, Menu as MenuIcon, Close as CloseIcon,
  Inventory, LocalOffer, BarChart, Dashboard, Storefront, Warning,
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
    Pending: 'default', Preparing: 'warning', Ready: 'info', Delivered: 'success', Cancelled: 'error',
  };
  return <Chip label={status} color={colorMap[status] || 'default'} size="small" />;
};

// ── Main Component ────────────────────────────────────────────────────────────
const SimpleVendorDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [vendorData, setVendorData] = useState({
    id: 1, name: 'Vendor One', email: 'vendor1@test.com',
    rating: 0.0, totalRatings: 0, totalOrders: 0, revenue: 0.0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentView, setCurrentView] = useState('dashboard');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [orders, setOrders] = useState([
    { id: 1234, customer: 'John Doe', items: 'Product A, Product B', total: 1599, status: 'Pending', time: '2 mins ago' },
    { id: 1233, customer: 'Jane Smith', items: 'Product C, Product D', total: 2250, status: 'Preparing', time: '5 mins ago' },
    { id: 1232, customer: 'Bob Johnson', items: 'Product E', total: 875, status: 'Ready', time: '8 mins ago' },
    { id: 1231, customer: 'Alice Brown', items: 'Product G, Product H', total: 1825, status: 'Delivered', time: '12 mins ago' },
  ]);

  // Dialog / form state
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '', price: '', category: 'Clothing', description: '', image: '', photoFile: null, stock: 0,
  });

  // Promotion state
  const [promotions, setPromotions] = useState([
    { id: 1, name: 'Weekend Special', code: 'WEEKEND20', discount: 20, duration: 7, active: true },
  ]);
  const [promotionDialogOpen, setPromotionDialogOpen] = useState(false);
  const [newPromotion, setNewPromotion] = useState({ name: '', code: '', discount: '', duration: '' });

  // ── Auth & Load ───────────────────────────────
  useEffect(() => {
    const loadVendorData = async () => {
      try {
        const user = localStorage.getItem('user');
        if (!user) {
          setError('No user found. Please login again.');
          setLoading(false);
          setTimeout(() => { window.location.href = '/login'; }, 2000);
          return;
        }
        const parsedUser = JSON.parse(user);
        if (parsedUser.role !== 'VENDOR') {
          setError('Access denied. Vendor account required.');
          setLoading(false);
          setTimeout(() => { window.location.href = '/login'; }, 2000);
          return;
        }
        vendorService.setCurrentVendor(parsedUser.id);
        try {
          const [vendorProducts, vendorProfile] = await Promise.all([
            vendorService.getVendorProducts(),
            vendorService.getVendorProfile(),
          ]);
          setProducts(vendorProducts);
          setVendorData(vendorProfile);
        } catch (err) {
          console.error('Failed to load vendor data:', err);
        }
        setLoading(false);
      } catch (err) {
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
    if (!file.type.startsWith('image/')) { alert('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('Photo must be under 5MB'); return; }
    setNewProduct(p => ({ ...p, photoFile: file, image: URL.createObjectURL(file) }));
  };

  const resetForm = () => {
    setNewProduct({ name: '', price: '', category: 'Clothing', description: '', image: '', photoFile: null, stock: 0 });
    setEditingProduct(null);
    setShowAddProductForm(false);
  };

  const handleSaveProduct = async () => {
    const { name, price, category, description } = newProduct;
    if (!name || !price || !category || !description) { alert('Please fill in all required fields'); return; }
    try {
      let productImage = newProduct.image;
      if (newProduct.photoFile) productImage = await handlePhotoUpload(newProduct.photoFile);
      const productData = { name, price: parseFloat(price), description, category, image: productImage };

      if (editingProduct) {
        const updated = await vendorService.updateProduct(editingProduct.id, productData);
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? updated : p));
        window.postMessage({ type: 'PRODUCT_UPDATED', product: updated, vendorId: vendorData.id }, '*');
        alert(`Product "${updated.name}" updated!`);
      } else {
        const saved = await vendorService.addProduct(productData);
        setProducts(prev => [...prev, saved]);
        setVendorData(prev => ({ ...prev, totalProducts: (prev.totalProducts || 0) + 1 }));
        alert(`Product "${saved.name}" added! Price: NPR ${saved.price}`);
      }
      resetForm();
    } catch (err) {
      alert(`Failed to save product: ${err.message}`);
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
      const deleted = await vendorService.deleteProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
      setVendorData(prev => ({ ...prev, totalProducts: Math.max(0, (prev.totalProducts || 0) - 1) }));
      window.postMessage({ type: 'PRODUCT_DELETED', product: deleted, vendorId: vendorData.id }, '*');
      alert(`"${product.name}" deleted.`);
    } catch (err) {
      alert(`Failed to delete: ${err.message}`);
    }
  };

  const handleToggleStock = async (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    try {
      const updated = await vendorService.updateProduct(productId, { inStock: !product.inStock });
      setProducts(prev => prev.map(p => p.id === productId ? updated : p));
    } catch (err) {
      alert(`Failed to update: ${err.message}`);
    }
  };

  const handleClearAllProducts = () => {
    if (!window.confirm('Delete ALL products?')) return;
    setProducts([]);
    window.postMessage({ type: 'VENDOR_PRODUCTS_DELETED', vendorId: vendorData.id }, '*');
  };

  // ── Order Actions ─────────────────────────────
  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  // ── Promotions ────────────────────────────────
  const handleCreatePromotion = () => {
    const { name, code, discount, duration } = newPromotion;
    if (!name || !code || !discount || !duration) { alert('Fill all fields'); return; }
    setPromotions(prev => [...prev, { id: Date.now(), name, code, discount: parseInt(discount), duration: parseInt(duration), active: true }]);
    setNewPromotion({ name: '', code: '', discount: '', duration: '' });
    setPromotionDialogOpen(false);
  };

  const handleTogglePromotion = (id) => {
    setPromotions(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
  };

  const handleDeletePromotion = (id) => {
    setPromotions(prev => prev.filter(p => p.id !== id));
  };

  // ── Misc ──────────────────────────────────────
  const handleLogout = () => {
    ['token', 'user'].forEach(k => localStorage.removeItem(k));
    window.location.href = '/login';
  };

  const switchView = (view) => {
    setCurrentView(view);
    setMobileDrawerOpen(false);
  };

  const filteredProducts = products.filter(p => selectedCategory === 'All' || p.category === selectedCategory);
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const totalRevenue = vendorData.revenue || 0;
  const lowStock = products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 5).length;

  const navItems = [
    { view: 'dashboard', label: 'Dashboard', icon: <Dashboard /> },
    { view: 'products', label: 'Products', icon: <Inventory />, count: products.length },
    { view: 'orders', label: 'Orders', icon: <ShoppingCart />, count: pendingOrders || undefined },
    { view: 'analytics', label: 'Analytics', icon: <BarChart /> },
    { view: 'promotions', label: 'Promotions', icon: <LocalOffer /> },
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
            <Badge badgeContent={pendingOrders} color="error">
              <IconButton onClick={() => switchView('orders')}><ShoppingCart /></IconButton>
            </Badge>
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
                            primary={`#${order.id} — ${order.customer}`}
                            secondary={`NPR ${order.total} • ${order.time}`}
                            primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }}
                            secondaryTypographyProps={{ fontSize: 12 }}
                          />
                          <StatusChip status={order.status} />
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
                <Typography variant="h6" fontWeight={700} gutterBottom>Monthly Revenue Goal</Typography>
                <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">NPR {totalRevenue.toFixed(0)} / NPR 15,000</Typography>
                  <Typography variant="body2" color="primary.main" fontWeight={600}>{Math.min(100, Math.round(totalRevenue / 150))}%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={Math.min(100, totalRevenue / 150)} sx={{ height: 8, borderRadius: 4 }} />
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
                    {['Clothing', 'Electronic', 'Foods', 'Books'].map(c => (
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
                          <TableCell align="center">{product.orders || 0}</TableCell>
                          <TableCell align="center">⭐ {product.rating || '—'}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={product.inStock ? 'In Stock' : 'Out'}
                              size="small"
                              color={product.inStock ? 'success' : 'default'}
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
              <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>Order Management</Typography>

              {/* Order Stats */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                  { label: 'Pending', color: 'default', count: orders.filter(o => o.status === 'Pending').length },
                  { label: 'Preparing', color: 'warning', count: orders.filter(o => o.status === 'Preparing').length },
                  { label: 'Ready', color: 'info', count: orders.filter(o => o.status === 'Ready').length },
                  { label: 'Delivered', color: 'success', count: orders.filter(o => o.status === 'Delivered').length },
                ].map(({ label, color, count }) => (
                  <Grid item xs={6} sm={3} key={label}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h5" fontWeight={700}>{count}</Typography>
                      <Chip label={label} color={color} size="small" sx={{ mt: 0.5 }} />
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
                    {orders.map(order => (
                      <TableRow key={order.id} hover>
                        <TableCell sx={{ fontWeight: 700 }}>#{order.id}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 160 }}>{order.items}</Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>{order.total}</TableCell>
                        <TableCell align="center"><StatusChip status={order.status} /></TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">{order.time}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', flexWrap: 'wrap' }}>
                            {order.status === 'Pending' && (
                              <>
                                <Button size="small" variant="contained" color="success" onClick={() => handleUpdateOrderStatus(order.id, 'Preparing')}>Accept</Button>
                                <Button size="small" variant="outlined" color="error" onClick={() => handleUpdateOrderStatus(order.id, 'Cancelled')}>Reject</Button>
                              </>
                            )}
                            {order.status === 'Preparing' && (
                              <Button size="small" variant="contained" color="info" onClick={() => handleUpdateOrderStatus(order.id, 'Ready')}>Mark Ready</Button>
                            )}
                            {order.status === 'Ready' && (
                              <Button size="small" variant="contained" color="success" onClick={() => handleUpdateOrderStatus(order.id, 'Delivered')}>Delivered</Button>
                            )}
                            {(order.status === 'Delivered' || order.status === 'Cancelled') && (
                              <Chip label={order.status} size="small" color={order.status === 'Delivered' ? 'success' : 'error'} />
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

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
                    {['Clothing', 'Electronic', 'Foods', 'Books'].map(cat => {
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

          {/* ════════════════ PROMOTIONS VIEW ════════════════ */}
          {currentView === 'promotions' && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" fontWeight={700}>Promotions</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={() => setPromotionDialogOpen(true)}>
                  Create Promotion
                </Button>
              </Box>

              {promotions.length === 0 ? (
                <Paper sx={{ p: 5, textAlign: 'center' }}>
                  <LocalOffer sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>No promotions yet</Typography>
                  <Button variant="contained" onClick={() => setPromotionDialogOpen(true)}>Create First Promotion</Button>
                </Paper>
              ) : (
                <Grid container spacing={3}>
                  {promotions.map(promo => (
                    <Grid item xs={12} sm={6} md={4} key={promo.id}>
                      <Card sx={{
                        border: '2px solid',
                        borderColor: promo.active ? 'success.light' : 'grey.200',
                        transition: 'all 0.2s',
                        '&:hover': { boxShadow: 4 },
                      }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="h6" fontWeight={700}>{promo.name}</Typography>
                            <Chip label={promo.active ? 'Active' : 'Inactive'} color={promo.active ? 'success' : 'default'} size="small" />
                          </Box>
                          <Typography variant="h3" color="primary.main" fontWeight={800} sx={{ mb: 1 }}>
                            {promo.discount}%
                          </Typography>
                          <Typography variant="body2" color="text.secondary">OFF</Typography>
                          <Divider sx={{ my: 2 }} />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2" color="text.secondary">Code</Typography>
                            <Chip label={promo.code} size="small" variant="outlined" sx={{ fontFamily: 'monospace', fontWeight: 700 }} />
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">Duration</Typography>
                            <Typography variant="body2" fontWeight={600}>{promo.duration} days</Typography>
                          </Box>
                          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                            <Button
                              variant={promo.active ? 'outlined' : 'contained'}
                              size="small"
                              fullWidth
                              onClick={() => handleTogglePromotion(promo.id)}
                            >
                              {promo.active ? 'Deactivate' : 'Activate'}
                            </Button>
                            <IconButton size="small" color="error" onClick={() => handleDeletePromotion(promo.id)}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
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
                  {['Clothing', 'Electronic', 'Foods', 'Books'].map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
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
      <Dialog open={promotionDialogOpen} onClose={() => setPromotionDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Create Promotion</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Promotion Name" value={newPromotion.name} onChange={e => setNewPromotion(p => ({ ...p, name: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Promo Code" value={newPromotion.code} onChange={e => setNewPromotion(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="e.g. SAVE20" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Discount %" type="number" value={newPromotion.discount} onChange={e => setNewPromotion(p => ({ ...p, discount: e.target.value }))} inputProps={{ min: 1, max: 100 }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Duration (days)" type="number" value={newPromotion.duration} onChange={e => setNewPromotion(p => ({ ...p, duration: e.target.value }))} inputProps={{ min: 1 }} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setPromotionDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreatePromotion}>Create</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default SimpleVendorDashboard;