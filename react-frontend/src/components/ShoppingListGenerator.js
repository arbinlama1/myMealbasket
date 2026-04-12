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
import { ShoppingCart as ShoppingCartIcon } from '@mui/icons-material';
import { shoppingListAPI } from '../services/api';

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
      const list = Array.isArray(body?.data) ? body.data : [];
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
  };

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
            <List dense disablePadding>
              {items.map((row, idx) => (
                <ListItem key={`${row.name}-${row.unit}-${idx}`} sx={{ py: 0.5 }}>
                  <ListItemText
                    primary={row.label || `${row.name} - ${row.quantity}${row.unit || ''}`}
                    primaryTypographyProps={{ variant: 'body1', fontWeight: 500 }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
