import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  CircularProgress,
  Typography,
  Alert,
  Button,
  Container,
  Paper,
  Chip,
  Divider,
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Refresh,
  ShoppingCart,
  ArrowBack,
} from '@mui/icons-material';
import paymentService from '../services/paymentService';

const PaymentReturnHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, failed, error
  const [paymentResult, setPaymentResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    handlePaymentReturn();
  }, []);

  const handlePaymentReturn = async () => {
    try {
      setStatus('loading');

      const encodedResponse = searchParams.get('data');
      const returnStatus = searchParams.get('status');
      let transactionId = searchParams.get('transactionId');

      if (encodedResponse) {
        const response = await paymentService.verifyEsewaPayment(encodedResponse);
        const result = response?.data || response;

        if (result?.success) {
          setStatus('success');
          setPaymentResult({
            status: 'success',
            transactionId: result.transactionId || result.orderId || 'Verified',
            message: result.message || 'Payment completed successfully',
            orderId: result.orderId
          });
          return;
        }

        throw new Error(result?.message || result?.reason || 'Payment verification failed');
      }

      if (!returnStatus || !transactionId) {
        throw new Error('Missing required return parameters');
      }

      // Clean up transaction ID - remove URL-encoded data if present
      if (transactionId.includes('?data=')) {
        transactionId = transactionId.split('?data=')[0];
      }

      // Simple return handling - just display the result
      if (returnStatus === 'success') {
        setStatus('success');
        setPaymentResult({
          status: 'success',
          transactionId: transactionId,
          message: 'Payment completed successfully'
        });
      } else {
        setStatus('failed');
        setPaymentResult({
          status: 'failed',
          transactionId: transactionId,
          message: 'Payment failed'
        });
      }

    } catch (error) {
      console.error('PaymentReturnHandler: Error processing payment return', error);
      setStatus('error');
      setError(error.message);
    }
  };

  const handleGoToOrders = () => {
    navigate('/orders');
  };

  const handleGoToHome = () => {
    navigate('/');
  };

  const handleRetryPayment = () => {
    navigate('/cart');
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CircularProgress size={80} sx={{ mb: 3 }} />
            <Typography variant="h5" gutterBottom>
              Verifying Payment...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while we verify your payment with eSewa
            </Typography>
          </Box>
        );

      case 'success':
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircle
              color="success"
              sx={{ fontSize: 80, mb: 3 }}
            />
            <Typography variant="h4" gutterBottom color="success.main">
              Payment Successful!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Thank you for your order. Your payment has been successfully processed.
            </Typography>
            
            {paymentResult && (
              <Paper sx={{ p: 3, mb: 3, textAlign: 'left' }}>
                <Typography variant="h6" gutterBottom>
                  Order Details
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Transaction ID
                  </Typography>
                  <Typography 
                    variant="body1" 
                    fontWeight="bold"
                    sx={{ 
                      wordBreak: 'break-all',
                      fontSize: '0.9rem',
                      fontFamily: 'monospace',
                      backgroundColor: '#f5f5f5',
                      p: 1,
                      borderRadius: 1,
                      border: '1px solid #e0e0e0'
                    }}
                  >
                    {paymentResult.transactionId}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Payment Status
                  </Typography>
                  <Chip
                    label="Completed"
                    color="success"
                    size="small"
                  />
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Message
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {paymentResult.message}
                  </Typography>
                </Box>
              </Paper>
            )}
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                startIcon={<ShoppingCart />}
                onClick={handleGoToOrders}
                size="large"
              >
                View My Orders
              </Button>
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={handleGoToHome}
                size="large"
              >
                Back to Home
              </Button>
            </Box>
          </Box>
        );

      case 'failed':
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Error
              color="error"
              sx={{ fontSize: 80, mb: 3 }}
            />
            <Typography variant="h4" gutterBottom color="error.main">
              Payment Failed
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              We couldn't process your payment. Please try again or contact support.
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
                <Typography variant="body2">
                  {error}
                </Typography>
              </Alert>
            )}
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={handleRetryPayment}
                size="large"
              >
                Try Again
              </Button>
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={handleGoToHome}
                size="large"
              >
                Back to Home
              </Button>
            </Box>
          </Box>
        );

      case 'error':
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Error
              color="error"
              sx={{ fontSize: 80, mb: 3 }}
            />
            <Typography variant="h4" gutterBottom color="error.main">
              Payment Error
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              An unexpected error occurred while processing your payment.
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
                <Typography variant="body2">
                  Error: {error}
                </Typography>
              </Alert>
            )}
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={handleRetryPayment}
                size="large"
              >
                Try Again
              </Button>
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={handleGoToHome}
                size="large"
              >
                Back to Home
              </Button>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        {renderContent()}
      </Box>
    </Container>
  );
};

export default PaymentReturnHandler;
