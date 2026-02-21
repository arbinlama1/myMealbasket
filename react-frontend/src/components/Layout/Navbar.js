import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem,
  Avatar, useTheme, useMediaQuery, Drawer, List, ListItem, ListItemText,
  ListItemIcon, Divider,
} from '@mui/material';
import {
  Menu as MenuIcon, Home, ShoppingCart, Restaurant, Store, Assessment,
  Person, Logout, Login, AppRegistration, Email,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, isAuthenticated, logout, role } = useAuth();

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  // FIX: removed the <a href="/home"> wrapper and use navigate directly
  const handleLogout = async () => {
    handleMenuClose();
    await logout();
  };

  const handleDrawerToggle = () => setMobileMenuOpen((prev) => !prev);

  const menuItems = [
    { text: 'Home', icon: <Home />, path: '/' },
    { text: 'About Us', icon: <Person />, path: '/about-us' },
    { text: 'Contact', icon: <Email />, path: '/contact' },
  ];

  if (isAuthenticated) {
    if (role === 'USER') {
      menuItems.push(
        { text: 'Meal Planner', icon: <Restaurant />, path: '/meal-planner' },
        { text: 'My Orders', icon: <ShoppingCart />, path: '/orders' }
      );
    } else if (role === 'VENDOR') {
      menuItems.push({ text: 'Dashboard', icon: <Store />, path: '/vendor' });
    } else if (role === 'ADMIN') {
      menuItems.push(
        { text: 'Dashboard', icon: <Assessment />, path: '/admin/dashboard' },
        { text: 'Users', icon: <Person />, path: '/admin/users' },
        { text: 'Products', icon: <Store />, path: '/admin/products' },
        { text: 'Orders', icon: <ShoppingCart />, path: '/admin/orders' }
      );
    }
  }

  const drawer = (
    <Box sx={{ textAlign: 'center', width: 250 }}>
      <Typography variant="h6" sx={{ my: 2 }}>MealBasket</Typography>
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => { navigate(item.path); handleDrawerToggle(); }}
            selected={location.pathname === item.path}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        {/* Mobile drawer logout */}
        {isAuthenticated && (
          <>
            <Divider />
            <ListItem button onClick={handleLogout}>
              <ListItemIcon><Logout /></ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static" sx={{ bgcolor: 'primary.main' }}>
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            🍽️ MealBasket
          </Typography>

          {isMobile ? (
            <IconButton color="inherit" aria-label="open drawer" onClick={handleDrawerToggle}>
              <MenuIcon />
            </IconButton>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {menuItems.map((item) => (
                <Button
                  key={item.text}
                  color="inherit"
                  startIcon={item.icon}
                  onClick={() => navigate(item.path)}
                  sx={{
                    bgcolor: location.pathname === item.path
                      ? 'rgba(255,255,255,0.15)'
                      : 'transparent',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
                  }}
                >
                  {item.text}
                </Button>
              ))}

              {isAuthenticated ? (
                <>
                  <IconButton color="inherit" onClick={handleMenuOpen} sx={{ ml: 1 }}>
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: 'secondary.main',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                      }}
                    >
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </Avatar>
                  </IconButton>

                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    PaperProps={{ elevation: 4, sx: { minWidth: 180, mt: 1 } }}
                  >
                    <Box sx={{ px: 2, py: 1.5 }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {user?.name || 'User'}
                      </Typography>
                      {role && (
                        <Typography variant="caption" color="text.secondary">
                          {role.charAt(0) + role.slice(1).toLowerCase()}
                        </Typography>
                      )}
                    </Box>
                    <Divider />
                    {/* FIX: plain MenuItem with onClick, no <a> tag */}
                    <MenuItem onClick={handleLogout}>
                      <Logout sx={{ mr: 1.5 }} fontSize="small" />
                      Logout
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Button color="inherit" startIcon={<Login />} onClick={() => navigate('/login')}>
                    Login
                  </Button>
                  <Button color="inherit" startIcon={<AppRegistration />} onClick={() => navigate('/register')}>
                    Register
                  </Button>
                </>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {isMobile && (
        <Drawer anchor="left" open={mobileMenuOpen} onClose={handleDrawerToggle}>
          {drawer}
        </Drawer>
      )}
    </>
  );
};

export default Navbar;