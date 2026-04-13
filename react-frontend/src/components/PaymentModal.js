import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
} from '@mui/material';
import {
  Payment as PaymentIcon,
  AccountBalanceWallet,
  Security,
  CheckCircle,
  Error,
} from '@mui/icons-material';
import paymentService from '../services/paymentService';

const PaymentModal = ({ 
  open, 
  onClose, 
  amount, 
  cartItems, 
  onPaymentSuccess, 
  onPaymentFailed 
}) => {
  // Debug paymentService initialization
  React.useEffect(() => {
    console.log('PaymentModal: paymentService baseURL:', paymentService.baseURL);
  }, []);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('esewa');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, success, failed
  const [paymentError, setPaymentError] = useState('');
  const [paymentData, setPaymentData] = useState(null);

  const paymentMethods = [
    {
      id: 'esewa',
      name: 'eSewa',
      description: 'Pay with eSewa Digital Wallet',
      icon: <AccountBalanceWallet />,
      color: '#009688',
      popular: true
    },
    
  ];

  const handlePaymentMethodChange = (event) => {
    setSelectedPaymentMethod(event.target.value);
    setPaymentError('');
  };

  const initiatePayment = async () => {
    setIsProcessing(true);
    setPaymentStatus('processing');
    setPaymentError('');

    try {
      const purchaseOrderId = paymentService.generatePurchaseOrderId();
      
      if (selectedPaymentMethod === 'esewa') {
        const response = await paymentService.initiateEsewaPayment(amount, purchaseOrderId);
        
        if (response.success) {
          // Submit eSewa payment form directly - SIMPLE VERSION
          paymentService.submitPaymentForm(response.actionUrl, response.formData);
        } else {
          throw new Error(response.message || 'Failed to initiate payment');
        }
      } else {
        throw new Error('Payment method not supported yet');
      }

    } catch (error) {
      console.error('PaymentModal: Payment initiation failed', error);
      
      // Handle authentication errors specifically
      if (error.message.includes('Unauthorized') || error.message.includes('401')) {
        setPaymentError('Please login to continue with payment');
      } else {
        setPaymentError(error.message || 'Payment initiation failed');
      }
      
      setPaymentStatus('failed');
      setIsProcessing(false);
      
      if (onPaymentFailed) {
        onPaymentFailed(error);
      }
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setPaymentStatus('idle');
      setPaymentError('');
      setPaymentData(null);
      onClose();
    }
  };

  const renderPaymentContent = () => {
    switch (paymentStatus) {
      case 'processing':
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Processing Payment...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while we redirect you to {selectedPaymentMethod === 'esewa' ? 'eSewa' : 'payment gateway'}
            </Typography>
            {paymentData && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Transaction ID: {paymentData.transactionId}
              </Typography>
            )}
          </Box>
        );

      case 'success':
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircle color="success" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h6" gutterBottom color="success.main">
              Payment Successful!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your payment has been processed successfully.
            </Typography>
            {paymentData && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Order ID: {paymentData.orderId}
                </Typography>
                <Typography variant="body2">
                  Transaction ID: {paymentData.transactionId}
                </Typography>
              </Box>
            )}
          </Box>
        );

      case 'failed':
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Error color="error" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h6" gutterBottom color="error.main">
              Payment Failed
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {paymentError || 'Payment could not be processed. Please try again.'}
            </Typography>
          </Box>
        );

      default:
        return (
          <Box>
            {/* Order Summary */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              <List dense>
                {cartItems.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={item.name}
                      secondary={`Qty: ${item.quantity} × ${paymentService.formatAmount(item.price)}`}
                    />
                    <Typography variant="body2">
                      {paymentService.formatAmount(item.price * item.quantity)}
                    </Typography>
                  </ListItem>
                ))}
                <Divider />
                <ListItem>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" fontWeight="bold">
                        Total Amount
                      </Typography>
                    }
                  />
                  <Typography variant="h6" color="primary.main">
                    {paymentService.formatAmount(amount)}
                  </Typography>
                </ListItem>
              </List>
            </Box>

            {/* Payment Methods */}
            <Box sx={{ mb: 3 }}>
              <FormControl component="fieldset">
                <FormLabel component="legend">
                  <Typography variant="h6" gutterBottom>
                    Select Payment Method
                  </Typography>
                </FormLabel>
                <RadioGroup
                  value={selectedPaymentMethod}
                  onChange={handlePaymentMethodChange}
                >
                  {paymentMethods.map((method) => (
                    <Box key={method.id} sx={{ mb: 1 }}>
                      <FormControlLabel
                        value={method.id}
                        control={<Radio />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ color: method.color, mr: 1 }}>
                              {method.icon}
                            </Box>
                            <Box>
                              <Typography variant="body1">
                                {method.name}
                                {method.popular && (
                                  <Chip
                                    label="Popular"
                                    size="small"
                                    color="primary"
                                    sx={{ ml: 1 }}
                                  />
                                )}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {method.description}
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </Box>
                  ))}
                </RadioGroup>
              </FormControl>
            </Box>

            {/* Security Notice */}
            <Alert
              severity="info"
              icon={<Security />}
              sx={{ mb: 2 }}
            >
              <Typography variant="body2">
                Your payment information is secure and encrypted. We never store your payment details.
              </Typography>
            </Alert>

            {/* Error Message */}
            {paymentError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {paymentError}
              </Alert>
            )}
          </Box>
        );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <PaymentIcon color="primary" />
        <Typography variant="h6">Secure Payment</Typography>
      </DialogTitle>

      <DialogContent>
        {renderPaymentContent()}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        {paymentStatus === 'idle' && (
          <>
            <Button onClick={handleClose} disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              onClick={initiatePayment}
              variant="contained"
              disabled={isProcessing}
              startIcon={<PaymentIcon />}
              sx={{ minWidth: 120 }}
            >
              Pay {paymentService.formatAmount(amount)}
            </Button>
          </>
        )}
        
        {paymentStatus === 'failed' && (
          <>
            <Button onClick={handleClose}>
              Close
            </Button>
            <Button
              onClick={initiatePayment}
              variant="contained"
              startIcon={<PaymentIcon />}
            >
              Try Again
            </Button>
          </>
        )}
        
        {paymentStatus === 'success' && (
          <Button onClick={handleClose} variant="contained" fullWidth>
            Continue
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PaymentModal;
