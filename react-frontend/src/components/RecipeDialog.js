import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem,
  Button, Grid, Box, Typography, IconButton, Chip
} from '@mui/material';
import { Add, Delete, Timer, LocalFireDepartment } from '@mui/icons-material';

const RecipeDialog = ({
  open,
  editingRecipe,
  recipeFormData,
  setRecipeFormData,
  onClose,
  onSave,
  RECIPE_CATEGORIES,
  UNITS
}) => {
  // Debug logging
  console.log('RecipeDialog - open:', open);
  console.log('RecipeDialog - recipeFormData:', recipeFormData);

  // Don't return null - always render the dialog when open is true
  if (!open) {
    return null;
  }

  // Ensure recipeFormData exists and has default values
  const safeRecipeFormData = recipeFormData || {
    name: '',
    category: 'MAIN_COURSE',
    ingredients: [{ name: '', quantity: '', unit: 'g' }],
    cookingInstructions: '',
    cookingTime: 30,
    nutritionalValue: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0
    }
  };
  
  // Ensure ingredients array exists
  const ingredients = safeRecipeFormData.ingredients || [];
  
  // Ensure nutritional values exist
  const nutritionalValue = safeRecipeFormData.nutritionalValue || {};
  
  const addIngredient = () => {
    setRecipeFormData(prev => ({
      ...prev,
      ingredients: [...(prev.ingredients || []), { name: '', quantity: '', unit: 'g' }]
    }));
  };

  const removeIngredient = (index) => {
    setRecipeFormData(prev => ({
      ...prev,
      ingredients: (prev.ingredients || []).filter((_, i) => i !== index)
    }));
  };

  const updateIngredient = (index, field, value) => {
    setRecipeFormData(prev => ({
      ...prev,
      ingredients: (prev.ingredients || []).map((ing, i) => 
        i === index ? { ...ing, [field]: value } : ing
      )
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {editingRecipe ? 'Edit Recipe' : 'Create Recipe'}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Recipe Name"
              value={safeRecipeFormData.name}
              onChange={(e) => setRecipeFormData({ ...safeRecipeFormData, name: e.target.value })}
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Category</InputLabel>
              <Select
                value={safeRecipeFormData.category || 'MAIN_COURSE'}
                onChange={(e) => setRecipeFormData({ ...safeRecipeFormData, category: e.target.value })}
              >
                {RECIPE_CATEGORIES.map(category => (
                  <MenuItem key={category} value={category}>
                    {category.replace('_', ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Cooking Time (minutes)"
              type="number"
              value={safeRecipeFormData.cookingTime}
              onChange={(e) => setRecipeFormData({ ...safeRecipeFormData, cookingTime: parseInt(e.target.value) })}
              margin="normal"
              InputProps={{
                startAdornment: <Timer sx={{ mr: 1, color: 'action.active' }} />
              }}
            />
          </Grid>

          {/* Ingredients Section */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Ingredients</Typography>
            {ingredients.map((ingredient, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                <TextField
                  label="Ingredient Name"
                  value={ingredient.name}
                  onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                  size="small"
                  sx={{ flex: 2 }}
                />
                <TextField
                  label="Quantity"
                  value={ingredient.quantity}
                  onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                  size="small"
                  sx={{ flex: 1 }}
                />
                <FormControl size="small" sx={{ flex: 1 }}>
                  <InputLabel>Unit</InputLabel>
                  <Select
                    value={ingredient.unit}
                    onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                  >
                    {UNITS.map(unit => (
                      <MenuItem key={unit} value={unit}>{unit}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <IconButton onClick={() => removeIngredient(index)} color="error">
                  <Delete />
                </IconButton>
              </Box>
            ))}
            <Button onClick={addIngredient} startIcon={<Add />} sx={{ mt: 1 }}>
              Add Ingredient
            </Button>
          </Grid>

          {/* Cooking Instructions */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Cooking Instructions"
              value={safeRecipeFormData.cookingInstructions}
              onChange={(e) => setRecipeFormData({ ...safeRecipeFormData, cookingInstructions: e.target.value })}
              margin="normal"
              helperText="Enter step-by-step cooking instructions"
            />
          </Grid>

          {/* Nutritional Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Nutritional Information (per serving)</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  label="Calories"
                  type="number"
                  value={nutritionalValue.calories || 0}
                  onChange={(e) => setRecipeFormData({
                    ...recipeFormData,
                    nutritionalValue: { ...nutritionalValue, calories: parseInt(e.target.value) }
                  })}
                  margin="normal"
                  InputProps={{
                    startAdornment: <LocalFireDepartment sx={{ mr: 1, color: 'action.active' }} />
                  }}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  label="Protein (g)"
                  type="number"
                  value={nutritionalValue.protein || 0}
                  onChange={(e) => setRecipeFormData({
                    ...recipeFormData,
                    nutritionalValue: { ...nutritionalValue, protein: parseInt(e.target.value) }
                  })}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  label="Carbs (g)"
                  type="number"
                  value={nutritionalValue.carbs || 0}
                  onChange={(e) => setRecipeFormData({
                    ...recipeFormData,
                    nutritionalValue: { ...nutritionalValue, carbs: parseInt(e.target.value) }
                  })}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  label="Fat (g)"
                  type="number"
                  value={nutritionalValue.fat || 0}
                  onChange={(e) => setRecipeFormData({
                    ...recipeFormData,
                    nutritionalValue: { ...nutritionalValue, fat: parseInt(e.target.value) }
                  })}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  label="Fiber (g)"
                  type="number"
                  value={nutritionalValue.fiber || 0}
                  onChange={(e) => setRecipeFormData({
                    ...recipeFormData,
                    nutritionalValue: { ...nutritionalValue, fiber: parseInt(e.target.value) }
                  })}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  label="Sugar (g)"
                  type="number"
                  value={nutritionalValue.sugar || 0}
                  onChange={(e) => setRecipeFormData({
                    ...recipeFormData,
                    nutritionalValue: { ...nutritionalValue, sugar: parseInt(e.target.value) }
                  })}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  label="Sodium (mg)"
                  type="number"
                  value={nutritionalValue.sodium || 0}
                  onChange={(e) => setRecipeFormData({
                    ...recipeFormData,
                    nutritionalValue: { ...nutritionalValue, sodium: parseInt(e.target.value) }
                  })}
                  margin="normal"
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSave} variant="contained">
          {editingRecipe ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RecipeDialog;
