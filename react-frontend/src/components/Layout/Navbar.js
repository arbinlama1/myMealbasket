import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home,
  ShoppingCart,
  Restaurant,
  Store,
  Assessment,
  Person,
  Logout,
  Login,
  AppRegistration,
  Email,
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

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    handleMenuClose();
  };

  const handleDrawerToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const menuItems = [
    { text: 'Home', icon: <Home />, path: '/' },
    // { text: 'Products', icon: <ShoppingCart />, path: '/products' },
    { text: 'About Us', icon: <Person />, path: '/about-us' },
    { text: 'Contact', icon: <Email />, path: '/contact' },
  ];

  // Add role-specific menu items
  if (isAuthenticated) {
    if (role === 'USER') {
      menuItems.push(
        { text: 'Meal Planner', icon: <Restaurant />, path: '/meal-planner' },
        { text: 'My Orders', icon: <ShoppingCart />, path: '/orders' }
      );
    } else if (role === 'VENDOR') {
      menuItems.push(
        { text: 'Dashboard', icon: <Store />, path: '/vendor' },
        // { text: 'My Products', icon: <Store />, path: '/vendor' },
        // { text: 'Stock Alerts', icon: <Assessment />, path: '/vendor' },
        // { text: 'Orders', icon: <ShoppingCart />, path: '/vendor' }
      );
    } else if (role === 'ADMIN') {
      menuItems.push(
        { text: 'Dashboard', icon: <Assessment />, path: '/admin/dashboard' },
        { text: 'Users', icon: <Person />, path: '/admin/users' },
        { text: 'Products', icon: <Store />, path: '/admin/products' },
        { text: 'Orders', icon: <ShoppingCart />, path: '/admin/orders' },
        { text: 'Analytics', icon: <Assessment />, path: '/admin/analytics' }
      );
    }
  }

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', width: 250 }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        MealBasket
      </Typography>
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => navigate(item.path)}
            selected={location.pathname === item.path}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
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
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Main navigation links */}
              {menuItems.map((item) => (
                <Button
                  key={item.text}
                  color="inherit"
                  startIcon={item.icon}
                  onClick={() => navigate(item.path)}
                  sx={{
                    bgcolor: location.pathname === item.path ? 'rgba(255,255,255,0.12)' : 'transparent',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
                  }}
                >
                  {item.text}
                </Button>
              ))}

              {/* Authenticated user area - only avatar */}
              {isAuthenticated ? (
                <IconButton
                  color="inherit"
                  onClick={handleMenuOpen}
                  sx={{ ml: 2 }}
                >
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: 'secondary.main',
                      fontWeight: 'bold',
                      fontSize: '1.2rem',
                    }}
                  >
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </Avatar>
                </IconButton>
              ) : (
                <>
                  <Button
                    color="inherit"
                    startIcon={<Login />}
                    onClick={() => navigate('/login')}
                  >
                    Login
                  </Button>
                  <Button
                    color="inherit"
                    startIcon={<AppRegistration />}
                    onClick={() => navigate('/register')}
                  >
                    Register
                  </Button>
                </>
              )}

              {/* User dropdown menu */}
              {isAuthenticated && (
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  PaperProps={{
                    elevation: 4,
                    sx: { minWidth: 180, mt: 1 },
                  }}
                >
                  {/* User's name as non-clickable header */}
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {user?.name || 'User'}
                    </Typography>
                    {role && (
                      <Typography variant="caption" color="text.secondary">
                        {role.toLowerCase()}
                      </Typography>
                    )}
                  </Box>

                  <Divider />

                  {/* <MenuItem
                    onClick={() => {
                      navigate('/profile');
                      handleMenuClose();
                    }}
                  >
                    <Person sx={{ mr: 1.5 }} fontSize="small" />
                    Profile
                  </MenuItem> */}

                  <MenuItem onClick={handleLogout}>
                    <Logout sx={{ mr: 1.5 }} fontSize="small" />
                   <a href='/home'>Logout</a> 
                  </MenuItem>
                </Menu>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          anchor="left"
          open={mobileMenuOpen}
          onClose={handleDrawerToggle}
        >
          {drawer}
        </Drawer>
      )}
    </>
  );
};

export default Navbar;