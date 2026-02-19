import React, { useState, useEffect } from 'react';
import vendorService from '../services/vendorService';
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
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  LinearProgress,
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
  Store,
} from '@mui/icons-material';

const SimpleVendorDashboard = () => {
  const [vendorData, setVendorData] = useState({
    id: 1,
    name: 'Vendor One',
    email: 'vendor1@test.com',
    rating: 0.0,
    totalRatings: 0,
    totalOrders: 0,
    revenue: 0.0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, products, orders, analytics, promotions
  const [anchorEl, setAnchorEl] = useState(null);
  
  // Start with empty products - each vendor starts fresh
  const [products, setProducts] = useState([]);
  const [vendorId] = useState(vendorData.id); // This vendor's ID
  const [selectedCategory, setSelectedCategory] = useState('All'); // Category filter state
  
  // Dialog states
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [analyticsDialogOpen, setAnalyticsDialogOpen] = useState(false);
  const [promotionDialogOpen, setPromotionDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Initialize products from service and subscribe to updates
  useEffect(() => {
    const loadVendorData = async () => {
      try {
        console.log('Loading vendor data...');
        
        // Get current vendor from localStorage (logged-in user)
        const user = localStorage.getItem('user');
        if (user) {
          try {
            const parsedUser = JSON.parse(user);
            console.log('Logged in user:', parsedUser);
            
            // Check if user is a vendor
            if (parsedUser.role !== 'VENDOR') {
              setError('Access denied. Vendor account required.');
              setLoading(false);
              setTimeout(() => {
                window.location.href = '/login';
              }, 2000);
              return;
            }
            
            // Set the current vendor for the service
            vendorService.setCurrentVendor(parsedUser.id);
            
            // Load vendor data from database only
            try {
              // Load vendor's products from database
              const vendorProducts = await vendorService.getVendorProducts();
              setProducts(vendorProducts);
              
              // Load vendor profile from database
              const vendorProfile = await vendorService.getVendorProfile();
              
              // Use the vendor profile data
              setVendorData(vendorProfile);
              
              console.log('Vendor data loaded from database:', { vendorProfile, products: vendorProducts });
            } catch (backendError) {
              console.error('Vendor not found in database, creating vendor account:', backendError);
              
              // Create vendor in database from localStorage user data
              try {
                const createVendorResponse = await fetch('http://localhost:8081/api/auth/register/vendor', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                  },
                  body: JSON.stringify({
                    name: parsedUser.name,
                    email: parsedUser.email,
                    password: 'vendor123', // Default password
                    shopName: parsedUser.shopName || parsedUser.name + "'s Shop",
                    businessType: parsedUser.businessType || 'General',
                    phone: parsedUser.phone || 'Not provided',
                    address: parsedUser.address || 'Not provided'
                  })
                });
                
                if (createVendorResponse.ok) {
                  console.log('Vendor created in database successfully');
                  
                  // Now try to load the vendor data again
                  try {
                    const vendorProducts = await vendorService.getVendorProducts();
                    setProducts(vendorProducts);
                    
                    const vendorProfile = await vendorService.getVendorProfile();
                    setVendorData(vendorProfile);
                    
                    console.log('Vendor data loaded after creation:', { vendorProfile, products: vendorProducts });
                  } catch (retryError) {
                    console.error('Still failed to load vendor after creation:', retryError);
                    setError('Failed to setup vendor account. Please try logging out and back in.');
                    setLoading(false);
                    return;
                  }
                } else {
                  const errorData = await createVendorResponse.json().catch(() => ({}));
                  console.error('Failed to create vendor:', errorData);
                  setError('Failed to create vendor account. Please register again.');
                  setLoading(false);
                  setTimeout(() => {
                    window.location.href = '/login';
                  }, 3000);
                  return;
                }
              } catch (createError) {
                console.error('Error creating vendor:', createError);
                setError('Failed to create vendor account. Please try again.');
                setLoading(false);
                return;
              }
            }
            
            setLoading(false);
            
          } catch (err) {
            console.error('Error parsing user data:', err);
            setError('Invalid user data. Please login again.');
            setLoading(false);
            setTimeout(() => {
              window.location.href = '/login';
            }, 2000);
          }
        } else {
          setError('No user found. Please login again.');
          setLoading(false);
          // Redirect to login after 2 seconds
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        }
        
      } catch (error) {
        console.error('Error loading vendor data:', error);
        setError('Failed to load vendor dashboard. Please refresh the page.');
        setLoading(false);
      }
    };

    loadVendorData();
    
    // Listen for delete messages from user dashboard (only for this vendor)
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'PRODUCT_DELETED' && event.data.vendorId === vendorData.id) {
        console.log('Vendor Dashboard received delete message:', event.data);
        // Update local state - only if it's this vendor's product
        setProducts(prev => prev.filter(p => p.id !== event.data.product.id));
        
        // Update vendor profile
        const updatedVendorData = {
          ...vendorData,
          totalProducts: Math.max(0, (vendorData.totalProducts || 0) - 1)
        };
        setVendorData(updatedVendorData);
        localStorage.setItem(`vendor_${vendorData.id}_profile`, JSON.stringify(updatedVendorData));
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);
  
  // Sample data
  const [orders, setOrders] = useState([
    { id: 1234, customer: 'John Doe', items: 'Product A, Product B', total: 15.99, status: 'Pending', time: '2 mins ago' },
    { id: 1233, customer: 'Jane Smith', items: 'Product C, Product D', total: 22.50, status: 'Preparing', time: '5 mins ago' },
    { id: 1232, customer: 'Bob Johnson', items: 'Product E, Product F', total: 8.75, status: 'Ready', time: '8 mins ago' },
    { id: 1231, customer: 'Alice Brown', items: 'Product G, Product H', total: 18.25, status: 'Delivered', time: '12 mins ago' },
  ]);

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: 'Clothing',
    description: '',
    image: '',
    photoFile: null,
    stock: 0,
    inStock: false
  });
  const [showAddProductForm, setShowAddProductForm] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
      case 'dashboard': return 'Vendor Dashboard';
      case 'products': return 'Product Management';
      case 'orders': return 'Order Management';
      case 'analytics': return 'Analytics';
      case 'promotions': return 'Promotions';
      default: return 'Vendor Dashboard';
    }
  };

  // Product Management Functions using vendor service with strict isolation (NPR currency)
  const handleAddProduct = () => {
    setShowAddProductForm(true);
  };

  const handleSaveProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category || !newProduct.description) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      console.log('=== Starting Product Save ===');
      console.log('Form data:', newProduct);
      
      // Check if user is logged in
      const userStr = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      console.log('User in localStorage:', userStr);
      console.log('Token in localStorage:', token);
      
      if (!userStr) {
        alert('No user found. Please login again.');
        window.location.href = '/login';
        return;
      }
      
      const user = JSON.parse(userStr);
      console.log('Parsed user:', user);
      
      if (user.role !== 'VENDOR') {
        alert('Access denied. Vendor account required.');
        return;
      }
      
      const vendorId = user.id;
      console.log('Vendor ID:', vendorId);
      
      if (!vendorId) {
        alert('Invalid vendor ID. Please login again.');
        return;
      }
      
      let productImage = newProduct.image;
      
      // If vendor uploaded a photo, use it
      if (newProduct.photoFile) {
        console.log('Uploading photo...');
        productImage = await handlePhotoUpload(newProduct.photoFile);
        console.log('Photo uploaded:', productImage);
      }
      
      const productData = {
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        description: newProduct.description,
        category: newProduct.category,
        image: productImage
      };
      
      console.log('Product data to save:', productData);
      
      // Save to database
      console.log('Calling vendorService.addProduct...');
      const savedProduct = await vendorService.addProduct(productData);
      console.log('Product saved successfully:', savedProduct);
      
      // Update local state
      setProducts([...products, savedProduct]);
      
      // Update vendor profile - increment product count
      const updatedVendorData = {
        ...vendorData,
        totalProducts: (vendorData.totalProducts || 0) + 1
      };
      setVendorData(updatedVendorData);
      
      // Reset form
      setNewProduct({
        name: '',
        price: '',
        category: 'Clothing',
        description: '',
        image: '',
        photoFile: null,
        stock: 0,
        inStock: false
      });
      setShowAddProductForm(false);
      
      alert(`Product "${savedProduct.name}" added successfully! Price: NPR ${savedProduct.price}`);
      
    } catch (error) {
      console.error('=== Product Save Error ===');
      console.error('Error:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      // Provide specific error messages
      if (error.message.includes('401') || error.message.includes('UNAUTHORIZED')) {
        alert('Authentication error. Please login again.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else if (error.message.includes('403') || error.message.includes('FORBIDDEN')) {
        alert('You do not have permission to add products. Please login as a vendor.');
      } else if (error.message.includes('404') || error.message.includes('NOT_FOUND')) {
        alert('Vendor account not found. Please register again.');
      } else if (error.message.includes('500') || error.message.includes('INTERNAL_SERVER_ERROR')) {
        alert('Server error. Please check if the backend is running and try again.');
      } else if (error.message.includes('Failed to fetch')) {
        alert('Cannot connect to server. Please check if the backend is running on port 8081.');
      } else {
        alert(`Failed to add product: ${error.message}`);
      }
    }
  };

  // Handle photo upload
  const handlePhotoUpload = async (file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        resolve('');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        resolve(dataUrl);
      };
      reader.onerror = () => {
        reject(new Error('Failed to read photo'));
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPEG, PNG, etc.)');
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Photo size must be less than 5MB');
        return;
      }
      
      setNewProduct({
        ...newProduct,
        photoFile: file,
        image: URL.createObjectURL(file)  // Preview immediately
      });
    }
  };

  const handleEditProduct = async (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const newName = prompt('Update product name:', product.name);
    const newPrice = prompt('Update price:', product.price);
    const newCategory = prompt('Update category:', product.category);
    const newDescription = prompt('Update description:', product.description || '');
    
    if (newName && newPrice && newCategory) {
      try {
        const productData = {
          name: newName,
          price: parseFloat(newPrice),
          description: newDescription,
          category: newCategory
        };
        
        // Update product using vendor service (ensures vendor ownership)
        const updatedProduct = await vendorService.updateProduct(productId, productData);
        
        // Update local state
        setProducts(products.map(p => 
          p.id === productId ? updatedProduct : p
        ));
        
        // Notify user dashboard
        window.postMessage({
          type: 'PRODUCT_UPDATED',
          product: updatedProduct,
          vendorId: vendorData.id
        }, '*');
        
        alert(`Product "${newName}" updated successfully!`);
        
      } catch (error) {
        console.error('Error updating product:', error);
        alert(`Failed to update product: ${error.message}`);
      }
    } else {
      alert('Please fill in all required fields');
    }
  };

  const handleDeleteProduct = async (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      try {
        // Delete product using vendor service (ensures vendor ownership)
        const deletedProduct = await vendorService.deleteProduct(productId);
        
        // Update local state
        setProducts(products.filter(p => p.id !== productId));
        
        // Update vendor profile
        const updatedVendorData = {
          ...vendorData,
          totalProducts: Math.max(0, (vendorData.totalProducts || 0) - 1)
        };
        setVendorData(updatedVendorData);
        await vendorService.updateVendorProfile(updatedVendorData);
        
        // Notify user dashboard
        window.postMessage({
          type: 'PRODUCT_DELETED',
          product: deletedProduct,
          vendorId: vendorData.id
        }, '*');
        
        alert(`Product "${product.name}" deleted successfully!`);
        
      } catch (error) {
        console.error('Error deleting product:', error);
        alert(`Failed to delete product: ${error.message}`);
      }
    }
  };

  const handleToggleProductStatus = async (productId) => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) return;
      
      const updatedProduct = {
        ...product,
        inStock: !product.inStock
      };
      
      // Update product using vendor service
      const result = await vendorService.updateProduct(productId, { inStock: updatedProduct.inStock });
      
      // Update local state
      setProducts(products.map(p => 
        p.id === productId ? result : p
      ));
      
      // Notify user dashboard
      window.postMessage({
        type: 'PRODUCT_UPDATED',
        product: result,
        vendorId: vendorData.id
      }, '*');
      
      alert(`Product "${result.name}" is now ${result.inStock ? 'Available' : 'Unavailable'}!`);
      
    } catch (error) {
      console.error('Error toggling product status:', error);
      alert(`Failed to update product status: ${error.message}`);
    }
  };

  // Simulate product sale to update vendor metrics (NPR currency)
  const handleSimulateSale = async (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const quantity = prompt('Enter quantity sold:', '1');
    if (!quantity || isNaN(quantity) || parseInt(quantity) <= 0) {
      alert('Please enter a valid quantity');
      return;
    }
    
    const saleQuantity = parseInt(quantity);
    const totalSale = product.price * saleQuantity;
    
    try {
      // Update product orders
      const updatedProduct = {
        ...product,
        orders: (product.orders || 0) + saleQuantity,
        stock: Math.max(0, (product.stock || 0) - saleQuantity)
      };
      
      await vendorService.updateProduct(productId, { 
        orders: updatedProduct.orders,
        stock: updatedProduct.stock
      });
      
      // Update vendor profile
      const updatedVendorData = {
        ...vendorData,
        totalOrders: (vendorData.totalOrders || 0) + saleQuantity,
        revenue: (vendorData.revenue || 0) + totalSale
      };
      
      await vendorService.updateVendorProfile(updatedVendorData);
      
      // Update local state
      setProducts(products.map(p => p.id === productId ? updatedProduct : p));
      setVendorData(updatedVendorData);
      
      alert(`Sale recorded: ${saleQuantity} x "${product.name}" = NPR ${totalSale.toFixed(2)}\n` +
            `Total Orders: ${updatedVendorData.totalOrders}\n` +
            `Total Revenue: NPR ${updatedVendorData.revenue.toFixed(2)}`);
      
    } catch (error) {
      console.error('Error recording sale:', error);
      alert(`Failed to record sale: ${error.message}`);
    }
  };

  // Add stock to product
  const handleAddStock = async (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const quantity = prompt('Enter quantity to add:', '10');
    if (!quantity || isNaN(quantity) || parseInt(quantity) <= 0) {
      alert('Please enter a valid quantity');
      return;
    }
    
    const addQuantity = parseInt(quantity);
    
    try {
      // Update product stock
      const updatedProduct = {
        ...product,
        stock: (product.stock || 0) + addQuantity,
        inStock: true  // Product becomes available when stock is added
      };
      
      await vendorService.updateProduct(productId, { 
        stock: updatedProduct.stock,
        inStock: updatedProduct.inStock
      });
      
      // Update local state
      setProducts(products.map(p => p.id === productId ? updatedProduct : p));
      
      alert(`Stock added: ${addQuantity} units to "${product.name}"\n` +
            `New stock: ${updatedProduct.stock} units\n` +
            `Status: Available`);
      
    } catch (error) {
      console.error('Error adding stock:', error);
      alert(`Failed to add stock: ${error.message}`);
    }
  };

  const handleClearAllProducts = () => {
    if (confirm('Are you sure you want to delete ALL products? This will clear everything!')) {
      // Clear local state
      setProducts([]);
      
      // Clear vendor-specific localStorage
      const allVendorProducts = JSON.parse(localStorage.getItem('allVendorProducts') || '{}');
      allVendorProducts[`vendor_${vendorData.id}`] = [];
      localStorage.setItem('allVendorProducts', JSON.stringify(allVendorProducts));
      
      // Notify user dashboard
      window.postMessage({
        type: 'VENDOR_PRODUCTS_DELETED',
        vendorId: vendorData.id
      }, '*');
      
      alert('All products deleted! User dashboard updated.');
    }
  };

  const handleProductManagement = () => {
    if (products.length === 0) {
      alert('No products available. Add a product first!');
      return;
    }
    
    const productOptions = products.map((product, index) => 
      `${index + 1}. ${product.name} - NPR ${product.price} - ${product.inStock ? 'In Stock' : 'Out of Stock'}`
    ).join('\n');
    
    const choice = prompt(`Select a product to manage:\n\n${productOptions}\n\nEnter product number (1-${products.length}):`);
    
    if (choice) {
      const index = parseInt(choice) - 1;
      if (index >= 0 && index < products.length) {
        const selectedProduct = products[index];
        const action = prompt(`Manage "${selectedProduct.name}":\n\n1. Update Product\n2. Delete Product\n3. Toggle Status\n\nEnter action number (1-3):`);
        
        switch (action) {
          case '1':
            handleEditProduct(selectedProduct.id);
            break;
          case '2':
            handleDeleteProduct(selectedProduct.id);
            break;
          case '3':
            handleToggleProductStatus(selectedProduct.id);
            break;
          default:
            alert('Invalid action. Please try again.');
        }
      } else {
        alert('Invalid selection. Please try again.');
      }
    }
  };

  const handleViewProducts = () => {
    setCurrentView('products');
  };

  // Order Management Functions
  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(o => 
      o.id === orderId 
        ? { ...o, status: newStatus }
        : o
    ));
    alert(`Order #${orderId} status updated to ${newStatus}!`);
  };

  const handleViewOrderDetails = (order) => {
    alert(`Order Details:\n\nOrder ID: #${order.id}\nCustomer: ${order.customer}\nItems: ${order.items}\nTotal: NPR ${order.total}\nStatus: ${order.status}\nTime: ${order.time}`);
  };

  const handleViewOrders = () => {
    setCurrentView('orders');
  };

  // Analytics Functions
  const handleViewAnalytics = () => {
    setCurrentView('analytics');
  };

  // Promotion Functions
  const handleCreatePromotion = () => {
    alert('🎉 Promotion Created!\n\nPromotion: 20% OFF on selected items\nValid: Next 7 days\nCode: SAVE20\nStatus: Active');
    setPromotionDialogOpen(false);
  };

  const handleViewPromotions = () => {
    setCurrentView('promotions');
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
              <ListItemIcon><Store /></ListItemIcon>
              <ListItemText>{vendorData?.name || 'Vendor'}</ListItemText>
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
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <Store />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Welcome, {vendorData?.name || 'Vendor'}!
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Manage your business efficiently
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Vendor Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
                  <Typography variant="h4" fontWeight="bold">
                    {products.length}
                  </Typography>
                  <Typography variant="body2">
                    Total Products
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'success.main', color: 'white' }}>
                  <Typography variant="h4" fontWeight="bold">
                    {products.filter(p => (p.stock || 0) > 0).length}
                  </Typography>
                  <Typography variant="body2">
                    In Stock
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'warning.main', color: 'white' }}>
                  <Typography variant="h4" fontWeight="bold">
                    {products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 5).length}
                  </Typography>
                  <Typography variant="body2">
                    Low Stock
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'info.main', color: 'white' }}>
                  <Typography variant="h4" fontWeight="bold">
                    {vendorData.totalOrders || 0}
                  </Typography>
                  <Typography variant="body2">
                    Total Orders
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Add Product Form Dialog */}
      <Dialog open={showAddProductForm} onClose={() => setShowAddProductForm(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="h6" fontWeight="bold">
            Add New Product
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Product Name *"
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                sx={{ mb: 2 }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Price (NPR) *"
                type="number"
                value={newProduct.price}
                onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                sx={{ mb: 2 }}
                variant="outlined"
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Category *</InputLabel>
                <Select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  label="Category"
                >
                  <MenuItem value="Clothing">Clothing</MenuItem>
                  <MenuItem value="Electronic">Electronic</MenuItem>
                  <MenuItem value="Foods">Foods</MenuItem>
                  <MenuItem value="Books">Books</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Image URL (optional)"
                value={newProduct.image}
                onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                sx={{ mb: 2 }}
                variant="outlined"
                placeholder="https://example.com/image.jpg"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                OR Upload Photo
              </Typography>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: '2px dashed #ccc', 
                  borderRadius: '4px',
                  backgroundColor: '#f9f9f'
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description *"
                multiline
                rows={4}
                value={newProduct.description}
                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                sx={{ mb: 2 }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Product Image Preview:
                </Typography>
                {newProduct.photoFile && (
                  <Box
                    component="img"
                    src={newProduct.image}
                    alt="Product preview"
                    sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 1, border: '1px solid #ddd' }}
                  />
                )}
                {!newProduct.photoFile && newProduct.name && (
                  <Box
                    component="img"
                    src={`https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=${encodeURIComponent(newProduct.name)}`}
                    alt="Product preview"
                    sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 1, border: '1px solid #ddd' }}
                  />
                )}
                {!newProduct.photoFile && !newProduct.name && (
                  <Box sx={{ width: 80, height: 80, border: '2px dashed #ccc', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No Image
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: 'grey.50' }}>
          <Button onClick={() => setShowAddProductForm(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSaveProduct} variant="contained" color="primary">
            Save Product
          </Button>
        </DialogActions>
      </Dialog>

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
                      onClick={handleAddProduct}
                    >
                      <ListItemIcon>
                        <Restaurant color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Create Product" 
                        secondary="Add new products to your inventory" 
                      />
                    </ListItem>
                    <ListItem 
                      button 
                      sx={{ borderRadius: 1, mb: 1 }}
                      onClick={handleProductManagement}
                    >
                      <ListItemIcon>
                        <Assessment color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Manage Products" 
                        secondary={`Update, delete, or toggle status for ${products.length} products`} 
                      />
                    </ListItem>
                    <ListItem 
                      button 
                      sx={{ borderRadius: 1, mb: 1 }}
                      onClick={() => setCurrentView('orders')}
                    >
                      <ListItemIcon>
                        <ShoppingCart color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="View Orders" 
                        secondary="Manage customer orders and fulfillment" 
                      />
                    </ListItem>
                    <ListItem 
                      button 
                      sx={{ borderRadius: 1 }}
                      onClick={() => setCurrentView('analytics')}
                    >
                      <ListItemIcon>
                        <TrendingUp color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="View Analytics" 
                        secondary="Track sales performance and revenue" 
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
                    {orders.slice(0, 4).map((order) => (
                      <ListItem key={order.id} sx={{ borderRadius: 1, mb: 1, bgcolor: 'grey.50' }}>
                        <ListItemText 
                          primary={`Order #${order.id}`}
                          secondary={`${order.customer} • ${order.items} • NPR ${order.total}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                  <Button variant="outlined" fullWidth sx={{ mt: 2 }} onClick={() => setCurrentView('orders')}>
                    View All Orders
                  </Button>
                </Paper>
              </Grid>
            </Grid>

            {/* Category Filter */}
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Filter by Category
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="All">All Categories</MenuItem>
                  <MenuItem value="Clothing">Clothing</MenuItem>
                  <MenuItem value="Electronic">Electronic</MenuItem>
                  <MenuItem value="Foods">Foods</MenuItem>
                  <MenuItem value="Books">Books</MenuItem>
                </Select>
              </FormControl>
            </Paper>

            {/* Top Products and Customer Insights */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                    Top Products
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Debug: Found {products.length} products for vendor {vendorData?.id || 'N/A'}
                  </Typography>
                  <List>
                    {products
                      .filter(product => selectedCategory === 'All' || product.category === selectedCategory)
                      .slice(0, 5)
                      .map((product) => (
                        <ListItem key={product.id} sx={{ borderRadius: 1, mb: 1, bgcolor: 'grey.50' }}>
                          <ListItemText 
                            primary={product.name}
                            secondary={`${product.category} • NPR ${product.price.toFixed(2)} • Stock: ${product.stock || 0} • Orders: ${product.orders || 0}`}
                          />
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" color="success.main">
                              ⭐ {product.rating || '0.0'}
                            </Typography>
                            <Button 
                              variant="outlined" 
                              size="small"
                              onClick={() => handleAddStock(product.id)}
                              sx={{ minWidth: 'auto', px: 1 }}
                            >
                              📦+
                            </Button>
                            <Button 
                              variant="contained" 
                              size="small"
                              onClick={() => handleSimulateSale(product.id)}
                              sx={{ minWidth: 'auto', px: 1 }}
                            >
                              💰
                            </Button>
                          </Box>
                        </ListItem>
                      ))}
                  </List>
                  {products.filter(product => selectedCategory === 'All' || product.category === selectedCategory).length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No products available{selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}.
                      </Typography>
                      <Button variant="contained" sx={{ mt: 2 }} onClick={() => {
                        console.log('Vendor Dashboard - Manual refresh - checking products...');
                        console.log('Vendor Dashboard - Manual refresh products:', products);
                        // Products are already loaded in state
                      }}>
                        Refresh Products
                      </Button>
                    </Box>
                  )}
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    sx={{ mt: 2 }}
                    onClick={handleViewProducts}
                  >
                    View All Products ({products.filter(product => selectedCategory === 'All' || product.category === selectedCategory).length})
                  </Button>
                  <Button 
                    variant="contained" 
                    color="error"
                    fullWidth 
                    sx={{ mt: 1 }}
                    onClick={handleClearAllProducts}
                  >
                    Clear All Products
                  </Button>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                    Vendor Profile
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    {vendorData.name} ({vendorData.email}) - {products.length} products
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Chip label={`Rating: ${vendorData.rating || 0.0} ⭐`} size="small" color="primary" />
                    <Chip label={`Orders: ${vendorData.totalOrders || 0}`} size="small" color="success" />
                    <Chip label={`Revenue: NPR ${(vendorData.revenue || 0).toFixed(2)}`} size="small" color="warning" />
                  </Box>
                </Paper>

                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                    Stock Insights
                  </Typography>
                  <List>
                    <ListItem sx={{ borderRadius: 1, mb: 1, bgcolor: 'grey.50' }}>
                      <ListItemText 
                        primary="Stock Health"
                        secondary="Overall inventory status"
                      />
                      <Typography variant="h6" color="success.main">
                        75% Good
                      </Typography>
                    </ListItem>
                    <ListItem sx={{ borderRadius: 1, mb: 1, bgcolor: 'grey.50' }}>
                      <ListItemText 
                        primary="Stock Alerts"
                        secondary="Items needing attention"
                      />
                      <Typography variant="h6" color="warning.main">
                        6 Items
                      </Typography>
                    </ListItem>
                    <ListItem sx={{ borderRadius: 1, mb: 1, bgcolor: 'grey.50' }}>
                      <ListItemText 
                        primary="Prediction Accuracy"
                        secondary="AI forecast precision"
                      />
                      <Typography variant="h6" color="info.main">
                        92% ⭐
                      </Typography>
                    </ListItem>
                    <ListItem sx={{ borderRadius: 1, mb: 1, bgcolor: 'grey.50' }}>
                      <ListItemText 
                        primary="Restock Needed"
                        secondary="Items to reorder soon"
                      />
                      <Typography variant="h6" color="error.main">
                        3 Items
                      </Typography>
                    </ListItem>
                  </List>
                  <Button 
                    variant="contained" 
                    fullWidth 
                    sx={{ mt: 2 }}
                    onClick={handleViewAnalytics}
                  >
                    View Stock Analytics
                  </Button>
                </Paper>
              </Grid>
            </Grid>

            {/* Performance Progress */}
            <Paper sx={{ p: 3, mt: 4 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Monthly Performance
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Revenue Goal: NPR 12,450 / NPR 15,000
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={83} 
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Typography variant="body2" color="primary.main">
                🎯 You're NPR 2,550 away from your monthly revenue goal!
              </Typography>
            </Paper>

            {/* Account Info */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                Account Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Business Name
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {vendorData?.name || 'Vendor Business'}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {vendorData?.email || 'vendor@example.com'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Role
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {vendorData?.role || 'VENDOR'}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    User ID
                  </Typography>
                  <Typography variant="body1">
                    {vendorData?.id || 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Product Management Dialog */}
            <Dialog open={productDialogOpen} onClose={() => setProductDialogOpen(false)} maxWidth="md" fullWidth>
              <DialogTitle>Manage Products</DialogTitle>
              <DialogContent>
                <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
                  <Tab label="Add Product" />
                  <Tab label="Existing Products" />
                </Tabs>
                
                {activeTab === 0 && (
                  <Box sx={{ p: 2 }}>
                    <TextField
                      fullWidth
                      label="Product Name"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Price"
                      type="number"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Category"
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Description"
                      multiline
                      rows={3}
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                      sx={{ mb: 2 }}
                    />
                    <Button variant="contained" onClick={handleAddProduct} startIcon={<Add />}>
                      Add Product
                    </Button>
                  </Box>
                )}
                
                {activeTab === 1 && (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Product</TableCell>
                          <TableCell>Price</TableCell>
                          <TableCell>Category</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Orders</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {products.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>${product.price}</TableCell>
                            <TableCell>{product.category}</TableCell>
                            <TableCell>
                              <Chip 
                                label={product.status} 
                                color={product.status === 'Available' ? 'success' : 'error'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{product.orders}</TableCell>
                            <TableCell>
                              <Button 
                                size="small" 
                                onClick={() => handleToggleProductStatus(product.id)}
                              >
                                {product.status === 'Available' ? 'Disable' : 'Enable'}
                              </Button>
                              <Button 
                                size="small" 
                                color="error"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                <Delete />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setProductDialogOpen(false)}>Close</Button>
              </DialogActions>
            </Dialog>

            {/* Order Management Dialog */}
            <Dialog open={orderDialogOpen} onClose={() => setOrderDialogOpen(false)} maxWidth="lg" fullWidth>
              <DialogTitle>All Orders</DialogTitle>
              <DialogContent>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Order ID</TableCell>
                        <TableCell>Customer</TableCell>
                        <TableCell>Items</TableCell>
                        <TableCell>Total</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Time</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>#{order.id}</TableCell>
                          <TableCell>{order.customer}</TableCell>
                          <TableCell>{order.items}</TableCell>
                          <TableCell>${order.total}</TableCell>
                          <TableCell>
                            <Chip 
                              label={order.status} 
                              color={
                                order.status === 'Delivered' ? 'success' :
                                order.status === 'Ready' ? 'info' :
                                order.status === 'Preparing' ? 'warning' : 'default'
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{order.time}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button 
                                size="small" 
                                variant="outlined"
                                onClick={() => handleViewOrderDetails(order)}
                              >
                                <Visibility fontSize="small" />
                              </Button>
                              {order.status === 'Pending' && (
                                <Button 
                                  size="small" 
                                  variant="contained"
                                  color="success"
                                  onClick={() => handleUpdateOrderStatus(order.id, 'Preparing')}
                                >
                                  Accept
                                </Button>
                              )}
                              {order.status === 'Preparing' && (
                                <Button 
                                  size="small" 
                                  variant="contained"
                                  color="info"
                                  onClick={() => handleUpdateOrderStatus(order.id, 'Ready')}
                                >
                                  Ready
                                </Button>
                              )}
                              {order.status === 'Ready' && (
                                <Button 
                                  size="small" 
                                  variant="contained"
                                  color="success"
                                  onClick={() => handleUpdateOrderStatus(order.id, 'Delivered')}
                                >
                                  Deliver
                                </Button>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOrderDialogOpen(false)}>Close</Button>
              </DialogActions>
            </Dialog>

            {/* Promotion Dialog */}
            <Dialog open={promotionDialogOpen} onClose={() => setPromotionDialogOpen(false)} maxWidth="sm" fullWidth>
              <DialogTitle>Create Promotion</DialogTitle>
              <DialogContent>
                <TextField
                  fullWidth
                  label="Promotion Name"
                  defaultValue="Weekend Special"
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Discount Percentage"
                  type="number"
                  defaultValue="20"
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Promotion Code"
                  defaultValue="WEEKEND20"
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Duration (days)"
                  type="number"
                  defaultValue="7"
                  sx={{ mb: 2 }}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setPromotionDialogOpen(false)}>Cancel</Button>
                <Button variant="contained" onClick={handleCreatePromotion}>Create Promotion</Button>
              </DialogActions>
            </Dialog>
          </>
        )}
      </Container>
    </Box>
  );
};

export default SimpleVendorDashboard;
