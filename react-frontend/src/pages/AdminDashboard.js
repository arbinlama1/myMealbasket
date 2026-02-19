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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  CircularProgress,
  LinearProgress,
  Chip,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Person,
  ShoppingCart,
  Restaurant,
  Assessment,
  Store,
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
  AdminPanelSettings,
  People,
  Business,
  Logout,
} from '@mui/icons-material';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  
  // Users management
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'user@test.com', role: 'user', status: 'active', joinDate: '2024-01-15', lastLogin: '2024-02-14' },
    { id: 2, name: 'Jane Smith', email: 'user2@test.com', role: 'user', status: 'active', joinDate: '2024-01-20', lastLogin: '2024-02-13' },
  ]);
  
  // Vendors management
  const [vendors, setVendors] = useState([
    { id: 1, name: 'Vendor One', email: 'vendor1@test.com', status: 'active', joinDate: '2024-01-10', products: 3, revenue: 1250.50 },
    { id: 2, name: 'Vendor Two', email: 'vendor2@test.com', status: 'active', joinDate: '2024-01-12', products: 2, revenue: 890.25 },
    { id: 3, name: 'Vendor Three', email: 'vendor3@test.com', status: 'pending', joinDate: '2024-02-01', products: 0, revenue: 0 },
  ]);
  
  // Dialog states
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [vendorDialogOpen, setVendorDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);

  // Tab change handler
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // User management functions
  const handleAddUser = () => {
    const name = prompt('Enter user name:');
    const email = prompt('Enter user email:');
    
    if (name && email) {
      const newUser = {
        id: Date.now(),
        name: name,
        email: email,
        role: 'user',
        status: 'active',
        joinDate: new Date().toISOString().split('T')[0],
        lastLogin: new Date().toISOString().split('T')[0]
      };
      setUsers([...users, newUser]);
      alert(`User "${name}" added successfully!`);
    }
  };

  const handleEditUser = (userId) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const newName = prompt('Update user name:', user.name);
    const newEmail = prompt('Update user email:', user.email);
    
    if (newName && newEmail) {
      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, name: newName, email: newEmail }
          : u
      ));
      alert(`User "${newName}" updated successfully!`);
    }
  };

  const handleDeleteUser = (userId) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    if (confirm(`Are you sure you want to delete user "${user.name}"?`)) {
      setUsers(users.filter(u => u.id !== userId));
      alert(`User "${user.name}" deleted successfully!`);
    }
  };

  const handleToggleUserStatus = (userId) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    setUsers(users.map(u => 
      u.id === userId 
        ? { ...u, status: newStatus }
        : u
    ));
    alert(`User "${user.name}" is now ${newStatus}!`);
  };

  // Vendor management functions
  const handleAddVendor = () => {
    const name = prompt('Enter vendor name:');
    const email = prompt('Enter vendor email:');
    
    if (name && email) {
      const newVendor = {
        id: Date.now(),
        name: name,
        email: email,
        status: 'pending',
        joinDate: new Date().toISOString().split('T')[0],
        products: 0,
        revenue: 0
      };
      setVendors([...vendors, newVendor]);
      alert(`Vendor "${name}" added successfully! Status: Pending Approval`);
    }
  };

  const handleEditVendor = (vendorId) => {
    const vendor = vendors.find(v => v.id === vendorId);
    if (!vendor) return;
    
    const newName = prompt('Update vendor name:', vendor.name);
    const newEmail = prompt('Update vendor email:', vendor.email);
    
    if (newName && newEmail) {
      setVendors(vendors.map(v => 
        v.id === vendorId 
          ? { ...v, name: newName, email: newEmail }
          : v
      ));
      alert(`Vendor "${newName}" updated successfully!`);
    }
  };

  const handleDeleteVendor = (vendorId) => {
    const vendor = vendors.find(v => v.id === vendorId);
    if (!vendor) return;
    
    if (confirm(`Are you sure you want to delete vendor "${vendor.name}"? This will also delete all their products!`)) {
      // Delete vendor and their products
      setVendors(vendors.filter(v => v.id !== vendorId));
      
      // Remove vendor's products from localStorage
      const allVendorProducts = JSON.parse(localStorage.getItem('allVendorProducts') || '{}');
      delete allVendorProducts[`vendor_${vendorId}`];
      localStorage.setItem('allVendorProducts', JSON.stringify(allVendorProducts));
      
      // Notify user dashboard
      window.postMessage({
        type: 'VENDOR_DELETED',
        vendorId: vendorId
      }, '*');
      
      alert(`Vendor "${vendor.name}" and all their products deleted successfully!`);
    }
  };

  const handleToggleVendorStatus = (vendorId) => {
    const vendor = vendors.find(v => v.id === vendorId);
    if (!vendor) return;
    
    const newStatus = vendor.status === 'active' ? 'inactive' : 
                      vendor.status === 'inactive' ? 'pending' : 'active';
    
    setVendors(vendors.map(v => 
      v.id === vendorId 
        ? { ...v, status: newStatus }
        : v
    ));
    alert(`Vendor "${vendor.name}" is now ${newStatus}!`);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    alert('Admin logged out successfully!');
    // In real app, navigate to login
  };

  const getViewTitle = () => {
    switch(currentView) {
      case 'dashboard': return 'Admin Dashboard';
      case 'users': return 'User Management';
      case 'vendors': return 'Vendor Management';
      default: return 'Admin Dashboard';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ bgcolor: 'primary.main' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" sx={{ mr: 2 }}>
            <AdminPanelSettings />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Admin Panel
          </Typography>
          <IconButton
            color="inherit"
            onClick={(e) => setAnchorEl(e.currentTarget)}
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
              <ListItemText>Admin Profile</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => { handleMenuClose(); handleLogout(); }}>
              <ListItemIcon><Logout /></ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" fontWeight="bold" color="primary.main">
            {getViewTitle()}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" startIcon={<Home />} onClick={() => setCurrentView('dashboard')}>
              Dashboard
            </Button>
            <Button variant="outlined" startIcon={<People />} onClick={() => setCurrentView('users')}>
              Users
            </Button>
            <Button variant="outlined" startIcon={<Business />} onClick={() => setCurrentView('vendors')}>
              Vendors
            </Button>
          </Box>
        </Box>

        {/* Dashboard View */}
        {currentView === 'dashboard' && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Card sx={{ p: 3, textAlign: 'center' }}>
                <People sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                <Typography variant="h4" fontWeight="bold">{users.length}</Typography>
                <Typography variant="body2" color="text.secondary">Total Users</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card sx={{ p: 3, textAlign: 'center' }}>
                <Business sx={{ fontSize: 40, color: 'success.main', mb: 2 }} />
                <Typography variant="h4" fontWeight="bold">{vendors.length}</Typography>
                <Typography variant="body2" color="text.secondary">Total Vendors</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card sx={{ p: 3, textAlign: 'center' }}>
                <Store sx={{ fontSize: 40, color: 'warning.main', mb: 2 }} />
                <Typography variant="h4" fontWeight="bold">
                  {vendors.reduce((sum, v) => sum + v.products, 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">Total Products</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card sx={{ p: 3, textAlign: 'center' }}>
                <Assessment sx={{ fontSize: 40, color: 'info.main', mb: 2 }} />
                <Typography variant="h4" fontWeight="bold">
                  ${vendors.reduce((sum, v) => sum + v.revenue, 0).toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">Total Revenue</Typography>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Users Management */}
        {currentView === 'users' && (
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">
                User Management
              </Typography>
              <Button variant="contained" startIcon={<Add />} onClick={handleAddUser}>
                Add User
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Join Date</TableCell>
                    <TableCell>Last Login</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip label={user.role} size="small" color="primary" />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.status} 
                          size="small" 
                          color={user.status === 'active' ? 'success' : 'default'} 
                        />
                      </TableCell>
                      <TableCell>{user.joinDate}</TableCell>
                      <TableCell>{user.lastLogin}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button size="small" onClick={() => handleEditUser(user.id)}>
                            <Edit />
                          </Button>
                          <Button size="small" onClick={() => handleToggleUserStatus(user.id)}>
                            {user.status === 'active' ? <Cancel /> : <CheckCircle />}
                          </Button>
                          <Button size="small" color="error" onClick={() => handleDeleteUser(user.id)}>
                            <Delete />
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* Vendors Management */}
        {currentView === 'vendors' && (
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">
                Vendor Management
              </Typography>
              <Button variant="contained" startIcon={<Add />} onClick={handleAddVendor}>
                Add Vendor
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Products</TableCell>
                    <TableCell>Revenue</TableCell>
                    <TableCell>Join Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vendors.map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell>{vendor.id}</TableCell>
                      <TableCell>{vendor.name}</TableCell>
                      <TableCell>{vendor.email}</TableCell>
                      <TableCell>
                        <Chip 
                          label={vendor.status} 
                          size="small" 
                          color={
                            vendor.status === 'active' ? 'success' : 
                            vendor.status === 'pending' ? 'warning' : 'default'
                          } 
                        />
                      </TableCell>
                      <TableCell>{vendor.products}</TableCell>
                      <TableCell>${vendor.revenue.toFixed(2)}</TableCell>
                      <TableCell>{vendor.joinDate}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button size="small" onClick={() => handleEditVendor(vendor.id)}>
                            <Edit />
                          </Button>
                          <Button size="small" onClick={() => handleToggleVendorStatus(vendor.id)}>
                            {vendor.status === 'active' ? <Cancel /> : <CheckCircle />}
                          </Button>
                          <Button size="small" color="error" onClick={() => handleDeleteVendor(vendor.id)}>
                            <Delete />
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default AdminDashboard;