import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  ContentCopy as CopyIcon,
  Print as PrintIcon,
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as UncheckedIcon,
} from '@mui/icons-material';
import { shoppingListAPI, cartAPI, productAPI, contactAPI } from '../services/api';

/**
 * Toolbar + dialog: calls POST /api/shopping-list/generate and shows merged ingredients.
 * Selection checkboxes live on each recipe card (parent passes selected ids).
 */
export default function ShoppingListGeneratorPanel({
  visibleRecipes,
  selectedIds,
  onSelectAllVisible,
  onClearSelection,
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkedItems, setCheckedItems] = useState(new Set());
  const [copied, setCopied] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartResult, setCartResult] = useState(null);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const handleGenerate = async () => {
    const ids = selectedIds
      .map((id) => (typeof id === 'string' ? Number(id) : id))
      .filter((id) => id != null && !Number.isNaN(id));
    if (ids.length === 0) {
      setError('Select at least one recipe.');
      return;
    }
    setError('');
    setItems([]);
    setDialogOpen(true);
    setLoading(true);
    try {
      const response = await shoppingListAPI.generate(ids);
      const body = response.data;
      // Backend returns { items: [...], totalItems: N, recipeCount: M }
      const data = body?.data || {};
      const list = Array.isArray(data.items) ? data.items : [];
      if (body && body.success === false) {
        setError(body.message || 'Could not generate list');
        setItems([]);
      } else {
        setItems(list);
      }
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Request failed');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setError('');
    setCheckedItems(new Set());
    setCopied(false);
    setCartResult(null);
    setRequestSent(false);
  };

  const handleOpenRequestDialog = () => {
    const notFoundItems = cartResult?.notFound || [];
    const autoMessage = `Hello!\n\nI'm interested in purchasing the following ingredients for my recipes:\n\n${notFoundItems.map(item => `- ${item}`).join('\n')}\n\nCould you please add these products to your store?\n\nThank you!`;
    setRequestMessage(autoMessage);
    setRequestDialogOpen(true);
    setRequestSent(false);
  };

  const handleCloseRequestDialog = () => {
    setRequestDialogOpen(false);
    setRequestMessage('');
    setRequestSent(false);
  };

  const handleSendRequest = async () => {
    if (!requestMessage.trim()) return;
    setRequestLoading(true);
    try {
      await contactAPI.sendMessage({
        subject: 'Product Request - Missing Ingredients',
        message: requestMessage,
        type: 'product_request'
      });
      setRequestSent(true);
      setTimeout(() => {
        handleCloseRequestDialog();
      }, 2000);
    } catch (e) {
      console.error('Failed to send request:', e);
    } finally {
      setRequestLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (items.length === 0) return;
    setCartLoading(true);
    setCartResult(null);
    try {
      // Fetch all products
      const response = await productAPI.getAll();
      const products = response.data?.data || [];
      
      const added = [];
      const notFound = [];
      
      // Try to match each ingredient to a product
      for (const item of items) {
        const ingredientName = item.name.toLowerCase().trim();
        // Find product with matching name (partial match)
        const matchedProduct = products.find(p => 
          p.name.toLowerCase().includes(ingredientName) || 
          ingredientName.includes(p.name.toLowerCase())
        );
        
        if (matchedProduct) {
          // Add to cart with calculated quantity
          const qty = Math.ceil(item.quantity / (matchedProduct.quantity || 1));
          await cartAPI.addToCart(matchedProduct.id, qty);
          added.push({
            ingredient: item.name,
            product: matchedProduct.name,
            quantity: qty
          });
        } else {
          notFound.push(item.name);
        }
      }
      
      setCartResult({ added, notFound, success: added.length > 0 });
    } catch (e) {
      setCartResult({ error: e.message || 'Failed to add to cart' });
    } finally {
      setCartLoading(false);
    }
  };

  const toggleItemCheck = (itemKey) => {
    setCheckedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemKey)) {
        newSet.delete(itemKey);
      } else {
        newSet.add(itemKey);
      }
      return newSet;
    });
  };

  const handleCopyToClipboard = () => {
    const text = items
      .map((row) => `${row.name}: ${row.quantity}${row.unit || ''}`)
      .join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const checkedCount = checkedItems.size;

  const nVisible = visibleRecipes?.length ?? 0;
  const nSel = selectedIds?.length ?? 0;

  return (
    <>
      <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Automatic shopping list
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
          <Button size="small" variant="outlined" onClick={onSelectAllVisible} disabled={nVisible === 0}>
            Select all visible
          </Button>
          <Button size="small" variant="outlined" onClick={onClearSelection} disabled={nSel === 0}>
            Clear selection
          </Button>
          <Button
            size="medium"
            variant="contained"
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <ShoppingCartIcon />}
            onClick={handleGenerate}
            disabled={loading || nSel === 0}
          >
            Generate shopping list
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            {nSel} recipe{nSel !== 1 ? 's' : ''} selected
          </Typography>
        </Box>
        {error && !dialogOpen && (
          <Alert severity="warning" sx={{ mt: 1 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
      </Paper>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Your shopping list</DialogTitle>
        <DialogContent dividers>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}
          {!loading && error && (
            <Alert severity="error" sx={{ mb: 1 }}>
              {error}
            </Alert>
          )}
          {!loading && !error && items.length === 0 && (
            <Typography color="text.secondary">No ingredients found for the selected recipes.</Typography>
          )}
          {!loading && items.length > 0 && (
            <>
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={copied ? <CheckIcon /> : <CopyIcon />}
                  onClick={handleCopyToClipboard}
                  color={copied ? 'success' : 'primary'}
                >
                  {copied ? 'Copied!' : 'Copy list'}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<PrintIcon />}
                  onClick={handlePrint}
                >
                  Print
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  color="secondary"
                  startIcon={cartLoading ? <CircularProgress size={16} color="inherit" /> : <ShoppingCartIcon />}
                  onClick={handleAddToCart}
                  disabled={cartLoading}
                >
                  {cartLoading ? 'Adding...' : 'Add to cart'}
                </Button>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto', alignSelf: 'center' }}>
                  {checkedCount}/{items.length} checked
                </Typography>
              </Box>
              
              {/* Cart Result Messages */}
              {cartResult && !cartResult.error && cartResult.success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Added {cartResult.added.length} items to cart!
                  {cartResult.notFound.length > 0 && (
                    <>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Not found: {cartResult.notFound.join(', ')}
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        sx={{ mt: 1 }}
                        onClick={handleOpenRequestDialog}
                      >
                        Request missing items from vendor
                      </Button>
                    </>
                  )}
                </Alert>
              )}
              {cartResult && !cartResult.error && !cartResult.success && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  No matching products found for these ingredients.
                </Alert>
              )}
              {cartResult?.error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {cartResult.error}
                </Alert>
              )}
              <List dense disablePadding className="shopping-list-print">
                {items.map((row, idx) => {
                  const itemKey = `${row.name}-${row.unit}-${idx}`;
                  const isChecked = checkedItems.has(itemKey);
                  return (
                    <ListItem
                      key={itemKey}
                      sx={{
                        py: 0.5,
                        cursor: 'pointer',
                        opacity: isChecked ? 0.6 : 1,
                        textDecoration: isChecked ? 'line-through' : 'none',
                        transition: 'all 0.2s',
                      }}
                      onClick={() => toggleItemCheck(itemKey)}
                    >
                      <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                        {isChecked ? (
                          <CheckIcon color="success" fontSize="small" />
                        ) : (
                          <UncheckedIcon color="action" fontSize="small" />
                        )}
                      </Box>
                      <ListItemText
                        primary={row.label || `${row.name} - ${row.quantity}${row.unit || ''}`}
                        primaryTypographyProps={{
                          variant: 'body1',
                          fontWeight: isChecked ? 400 : 500,
                        }}
                      />
                    </ListItem>
                  );
                })}
              </List>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 'auto', ml: 2 }}>
            Click items to mark as purchased
          </Typography>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Request Product Dialog */}
      <Dialog open={requestDialogOpen} onClose={handleCloseRequestDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Request Products from Vendor</DialogTitle>
        <DialogContent dividers>
          {requestSent ? (
            <Alert severity="success">
              Request sent successfully! The vendor will be notified.
            </Alert>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Send a message to the vendor requesting these missing ingredients:
              </Typography>
              <Box
                component="textarea"
                sx={{
                  width: '100%',
                  minHeight: 150,
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  fontFamily: 'inherit',
                  fontSize: '0.875rem',
                  resize: 'vertical',
                  '&:focus': {
                    outline: 'none',
                    borderColor: 'primary.main',
                  },
                }}
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder="Describe what products you need..."
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRequestDialog} disabled={requestLoading}>
            Cancel
          </Button>
          {!requestSent && (
            <Button
              variant="contained"
              onClick={handleSendRequest}
              disabled={requestLoading || !requestMessage.trim()}
              startIcon={requestLoading ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {requestLoading ? 'Sending...' : 'Send Request'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}
