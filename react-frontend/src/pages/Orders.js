import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  ShoppingCart,
  Restaurant,
  AccessTime,
  AttachMoney,
  Visibility,
  LocalShipping,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { orderAPI } from '../services/api';
import { format } from 'date-fns';

const Orders = () => {
  const { user } = useAuth();
  const theme = useTheme();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getUserOrders();
      console.log('=== ORDERS API RESPONSE ===');
      console.log('Full response:', response);
      console.log('Response data:', response.data);
      if (response.data && response.data.success) {
        console.log('Orders array:', response.data.data);
        console.log('Number of orders:', response.data.data?.length || 0);
        setOrders(response.data.data || []);
      } else {
        console.log('Orders API failed:', response);
        setError('Failed to load orders');
      }
    } catch (error) {
      setError('Failed to load orders');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'CONFIRMED':
        return 'info';
      case 'PREPARING':
        return 'primary';
      case 'READY':
        return 'success';
      case 'DELIVERED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <AccessTime />;
      case 'CONFIRMED':
        return <Visibility />;
      case 'PREPARING':
        return <Restaurant />;
      case 'READY':
      case 'DELIVERED':
        return <LocalShipping />;
      default:
        return <ShoppingCart />;
    }
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          🛒 My Orders
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Track and manage your meal orders
        </Typography>
      </Box>

      {/* Status Filter */}
      <Box sx={{ mb: 4, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        {['all', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'].map((status) => (
          <Button
            key={status}
            variant={filterStatus === status ? 'contained' : 'outlined'}
            onClick={() => setFilterStatus(status)}
            sx={{ borderRadius: 20 }}
          >
            {status.charAt(0) + status.slice(1).toLowerCase()}
          </Button>
        ))}
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <ShoppingCart sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {filterStatus === 'all' ? 'No orders yet' : `No ${filterStatus.toLowerCase()} orders`}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {filterStatus === 'all' 
              ? 'Start ordering delicious meals to see them here!'
              : 'Try changing the status filter to see more orders.'
            }
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => window.location.href = '/home'}
          >
            Browse Products
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredOrders.map((order) => (
            <Grid item xs={12} sm={6} md={4} key={order.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[6],
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Order Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" component="h3" gutterBottom>
                        Order #{order.id}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {order.createdAt ? format(new Date(order.createdAt), 'MMM dd, yyyy HH:mm') : 'Recent order'}
                      </Typography>
                    </Box>
                    <Chip
                      icon={getStatusIcon(order.status)}
                      label={order.status}
                      color={getStatusColor(order.status)}
                      size="small"
                    />
                  </Box>

                  {/* Order Items */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Order Details:
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">
                        Status: {order.status}
                      </Typography>
                      <Typography variant="body2" color="primary.main">
                        Amount: NPR {order.totalAmount || order.amount || '0.00'}
                      </Typography>
                    </Box>
                    {order.user && (
                      <Typography variant="body2" color="text.secondary">
                        Customer: {order.user.name}
                      </Typography>
                    )}
                  </Box>

                  {/* Order Details */}
                  <Box sx={{ mt: 'auto' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" color="primary.main">
                        Total:
                      </Typography>
                      <Typography variant="h6" color="primary.main">
                        NPR {order.totalAmount || order.amount || '0.00'}
                      </Typography>
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => console.log('View order details:', order.id)}
                      >
                        View Details
                      </Button>
                      {order.status === 'DELIVERED' && (
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => console.log('Reorder:', order.id)}
                        >
                          Reorder
                        </Button>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Orders;