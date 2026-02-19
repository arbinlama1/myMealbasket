import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  useTheme,
} from '@mui/material';
import {
  Search,
  ShoppingCart,
  Restaurant,
  Star,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { productAPI } from '../services/api';

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);

  const setFallbackProducts = () => {
    const demoProducts = [
      {
        id: 1,
        name: 'Delicious Nepali Thali',
        description: 'Traditional Nepali meal with rice, dal, curry, and vegetables',
        price: 12.99,
        rating: 4.5,
        vendorName: 'Kathmandu Kitchen'
      },
      {
        id: 2,
        name: 'Chicken Momo',
        description: 'Steamed dumplings filled with seasoned chicken and vegetables',
        price: 8.99,
        rating: 4.7,
        vendorName: 'Momo Palace'
      },
      {
        id: 3,
        name: 'Veggie Burger',
        description: 'Fresh vegetable patty with lettuce, tomato, and special sauce',
        price: 9.99,
        rating: 4.3,
        vendorName: 'Burger House'
      },
      {
        id: 4,
        name: 'Chicken Chowmein',
        description: 'Stir-fried noodles with chicken and mixed vegetables',
        price: 10.99,
        rating: 4.6,
        vendorName: 'Chinese Corner'
      },
      {
        id: 5,
        name: 'Fresh Salad Bowl',
        description: 'Mixed greens with fresh vegetables and healthy dressing',
        price: 7.99,
        rating: 4.4,
        vendorName: 'Green Garden'
      },
      {
        id: 6,
        name: 'Pizza Margherita',
        description: 'Classic Italian pizza with mozzarella and fresh basil',
        price: 14.99,
        rating: 4.8,
        vendorName: 'Pizza Hub'
      }
    ];
    setProducts(demoProducts);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getAll();
      if (response.data.success) {
        setProducts(response.data.data || []);
        setFilteredProducts(response.data.data || []);
      }
    } catch (error) {
      setError('Failed to load products');
      console.error('Error fetching products:', error);
      setFallbackProducts();
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      try {
        setLoading(true);
        const response = await productAPI.search(searchTerm);
        if (response.data.success) {
          setFilteredProducts(response.data.data || []);
        }
      } catch (error) {
        setError('Failed to search products');
        console.error('Error searching products:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box
        sx={{
          textAlign: 'center',
          py: 6,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          borderRadius: 2,
          mb: 4,
          color: 'white',
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to MealBasket 🍽️
        </Typography>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Your Smart Meal Planning and Food Delivery Platform
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<Restaurant />}
            onClick={() => navigate('/meal-planner')}
            sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
          >
            Plan Meals
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<ShoppingCart />}
            onClick={() => navigate('/products')}
            sx={{ borderColor: 'white', color: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
          >
            Browse Products
          </Button>
        </Box>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search for delicious meals..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Button onClick={handleSearch} variant="contained" sx={{ ml: 1 }}>
                  Search
                </Button>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              height: 56,
            },
          }}
        />
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Featured Products */}
      <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 3 }}>
        Featured Products
      </Typography>

      <Grid container spacing={3}>
        {filteredProducts.map((product) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8],
                },
                cursor: 'pointer',
              }}
              onClick={() => navigate(`/products/${product.id}`)}
            >
              <CardMedia
                component="div"
                sx={{
                  height: 200,
                  bgcolor: 'grey.200',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '3rem',
                }}
              >
                🍱
              </CardMedia>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="h3">
                  {product.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2, height: 40, overflow: 'hidden' }}
                >
                  {product.description || 'Delicious and fresh meal prepared with quality ingredients.'}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" color="primary.main">
                    ${product.price?.toFixed(2) || '0.00'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                      icon={<Star sx={{ fontSize: 16 }} />}
                      label="4.5"
                      size="small"
                      color="warning"
                      variant="outlined"
                    />
                    <Chip
                      label="Popular"
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<ShoppingCart />}
                  sx={{ mt: 2 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle add to cart
                    console.log('Add to cart:', product);
                  }}
                >
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredProducts.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            {searchTerm ? 'No products found matching your search.' : 'No products available at the moment.'}
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => setSearchTerm('')}
          >
            Clear Search
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default Home;
