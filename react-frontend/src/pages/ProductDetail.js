import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  IconButton,
  useTheme,
} from '@mui/material';
import {
  ShoppingCart,
  ArrowBack,
  Favorite,
  Share,
  Star,
  LocalFireDepartment,
  AccessTime,
} from '@mui/icons-material';
import { productAPI } from '../services/api';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getById(id);
      if (response.data.success) {
        setProduct(response.data.data);
      }
    } catch (error) {
      setError('Failed to load product details');
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    // Handle add to cart logic
    console.log('Adding to cart:', { product, quantity });
    // Show success message
    alert(`Added ${quantity} x ${product?.name} to cart!`);
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // Handle favorite logic
    console.log('Toggle favorite:', !isFavorite);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: product?.description,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Product link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container sx={{ textAlign: 'center', mt: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Product not found'}
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/products')}
        >
          Back to Products
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back Button */}
      <Button
        variant="outlined"
        startIcon={<ArrowBack />}
        onClick={() => navigate('/products')}
        sx={{ mb: 3 }}
      >
        Back to Products
      </Button>

      <Grid container spacing={4}>
        {/* Product Image */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardMedia
              component="div"
              sx={{
                height: 400,
                bgcolor: 'grey.200',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '8rem',
              }}
            >
              🍱
            </CardMedia>
          </Card>
        </Grid>

        {/* Product Details */}
        <Grid item xs={12} md={6}>
          <Box>
            {/* Title and Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {product.name}
              </Typography>
              <Box>
                <IconButton onClick={handleToggleFavorite} color={isFavorite ? 'error' : 'default'}>
                  <Favorite />
                </IconButton>
                <IconButton onClick={handleShare}>
                  <Share />
                </IconButton>
              </Box>
            </Box>

            {/* Category and Rating */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip
                label={product.category || 'General'}
                color="primary"
                variant="outlined"
              />
              <Chip
                icon={<Star />}
                label={`${product.rating?.toFixed(1) || '4.5'} (${product.reviews || 128} reviews)`}
                color="warning"
                variant="outlined"
              />
              {product.isVegetarian && (
                <Chip label="Vegetarian" color="success" variant="outlined" />
              )}
              {product.isSpicy && (
                <Chip label="Spicy" color="error" variant="outlined" />
              )}
            </Box>

            {/* Price */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" color="primary.main">
                ${product.price?.toFixed(2) || '0.00'}
              </Typography>
              {product.originalPrice && product.originalPrice > product.price && (
                <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                  ${product.originalPrice.toFixed(2)}
                </Typography>
              )}
            </Box>

            {/* Description */}
            <Typography variant="body1" paragraph sx={{ mb: 3 }}>
              {product.description || 'A delicious and fresh meal prepared with the finest ingredients. Perfect for any time of day.'}
            </Typography>

            {/* Nutritional Info */}
            <Card sx={{ mb: 3, bgcolor: 'grey.50' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Nutritional Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <LocalFireDepartment color="error" />
                      <Typography variant="body2">
                        {product.calories || 350} cal
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="primary.main">P</Typography>
                      <Typography variant="body2">
                        {product.protein || 25}g
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="secondary.main">C</Typography>
                      <Typography variant="body2">
                        {product.carbs || 45}g
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="success.main">F</Typography>
                      <Typography variant="body2">
                        {product.fat || 15}g
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Preparation Time */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <AccessTime sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Preparation time: {product.prepTime || '15-20'} minutes
              </Typography>
            </Box>

            {/* Quantity and Add to Cart */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Typography variant="body1">Quantity:</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <Typography sx={{ mx: 2, minWidth: 40, textAlign: 'center' }}>
                  {quantity}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </Button>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<ShoppingCart />}
                onClick={handleAddToCart}
                sx={{ flexGrow: 1, py: 1.5 }}
              >
                Add to Cart - ${(product.price * quantity).toFixed(2)}
              </Button>
            </Box>

            {/* Stock Information */}
            {product.stock !== undefined && (
              <Alert
                severity={product.stock > 10 ? 'success' : product.stock > 0 ? 'warning' : 'error'}
                sx={{ mt: 2 }}
              >
                {product.stock > 10 
                  ? 'In Stock - Plenty available'
                  : product.stock > 0 
                  ? `Only ${product.stock} left in stock!`
                  : 'Out of Stock'
                }
              </Alert>
            )}
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductDetail;
