import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Typography, Paper, Button, Card, CardContent,
  TextField, FormControl, InputLabel, Select, MenuItem, Avatar,
  Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, Snackbar
} from '@mui/material';
import {
  MenuBook, Add, Edit, Delete, Search, Timer, LocalFireDepartment, Restaurant
} from '@mui/icons-material';
import RecipeDialog from './RecipeDialog';
import { recipeAPI } from '../services/api';

const RecipeManagement = ({ recipes, setRecipes, onRecipesUpdate }) => {
  // Enable API calls now that backend endpoints are implemented
  const USE_API = true; // Set to false to use mock data for testing
  const [openRecipeDialog, setOpenRecipeDialog] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [recipeSearchQuery, setRecipeSearchQuery] = useState('');
  const [recipeFilterCategory, setRecipeFilterCategory] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [recipeFormData, setRecipeFormData] = useState({
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
  });

  // Recipe Management Constants ('ALL' is filter-only, not a valid stored category)
  const RECIPE_CATEGORIES = ['ALL', 'APPETIZER', 'MAIN_COURSE', 'DESSERT', 'BEVERAGE', 'SNACK', 'SALAD', 'SOUP'];
  const RECIPE_FORM_CATEGORIES = RECIPE_CATEGORIES.filter((c) => c !== 'ALL');
  const UNITS = ['g', 'kg', 'ml', 'l', 'cup', 'tbsp', 'tsp', 'piece', 'pieces'];

  
  // Helper function to show snackbar messages
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Recipe Management Functions
  const fetchRecipes = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Use API only if enabled
      if (USE_API) {
        console.log('Fetching recipes from API');
        try {
          const response = await recipeAPI.getVendorRecipes(8); // Using vendor ID 8 for demo
          
          if (response.data) {
            const raw = response.data;
            const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
            setRecipes(list);
            console.log('Recipes loaded successfully from API:', list);
            return;
          } else {
            throw new Error('Failed to fetch recipes');
          }
        } catch (apiError) {
          console.warn('API not available, falling back to mock data:', apiError);
        }
      } else {
        console.log('API disabled, using mock data only');
      }
      
      // Fallback to mock data when backend is not available
      const mockRecipes = [
        {
          id: '1',
          name: 'Chicken Biryani',
          category: 'MAIN_COURSE',
          ingredients: [
            { name: 'Chicken', quantity: '500', unit: 'g' },
            { name: 'Basmati Rice', quantity: '2', unit: 'cup' },
            { name: 'Onion', quantity: '1', unit: 'piece' },
            { name: 'Tomatoes', quantity: '2', unit: 'piece' },
            { name: 'Garlic', quantity: '3', unit: 'tsp' },
            { name: 'Ginger', quantity: '2', unit: 'tsp' },
            { name: 'Turmeric', quantity: '1', unit: 'tsp' },
            { name: 'Oil', quantity: '2', unit: 'tbsp' }
          ],
          cookingInstructions: 'Wash and soak rice for 30 minutes. Heat oil in large pan, add onions and sauté until golden. Add chicken pieces and cook until white. Add ginger-garlic paste and green chilies, cook for 2 minutes. Add tomatoes and cook until soft. Add yogurt, turmeric, cumin, coriander and salt. Add soaked rice and 4 cups water. Cover and cook on low heat for 20 minutes. Garnish with fresh coriander and serve hot.',
          cookingTime: 45,
          nutritionalValue: {
            calories: 450,
            protein: 25,
            carbs: 45,
            fat: 15,
            fiber: 3,
            sugar: 8,
            sodium: 800
          },
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Vegetable Stir Fry',
          category: 'MAIN_COURSE',
          ingredients: [
            { name: 'Mixed Vegetables', quantity: '2', unit: 'cup' },
            { name: 'Soy Sauce', quantity: '2', unit: 'tbsp' },
            { name: 'Sesame Oil', quantity: '1', unit: 'tbsp' },
            { name: 'Garlic', quantity: '2', unit: 'tsp' },
            { name: 'Ginger', quantity: '1', unit: 'tsp' },
            { name: 'Cooked Rice', quantity: '2', unit: 'cup' },
            { name: 'Cornstarch', quantity: '1', unit: 'tbsp' },
            { name: 'Green Onions', quantity: '2', unit: 'piece' }
          ],
          cookingInstructions: 'Heat sesame oil in wok or large pan. Add garlic and ginger, stir for 30 seconds. Add vegetables and stir-fry for 3-4 minutes. Add soy sauce and cook for 1 minute. Mix cornstarch with 2 tbsp water, add to pan. Add cooked rice and toss everything together. Garnish with sesame seeds and green onions.',
          cookingTime: 30,
          nutritionalValue: {
            calories: 280,
            protein: 12,
            carbs: 35,
            fat: 8,
            fiber: 6,
            sugar: 12,
            sodium: 600
          },
          createdAt: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Momo (Nepalese Dumplings)',
          category: 'APPETIZER',
          ingredients: [
            { name: 'Flour', quantity: '2', unit: 'cup' },
            { name: 'Ground Meat', quantity: '500', unit: 'g' },
            { name: 'Onion', quantity: '1', unit: 'piece' },
            { name: 'Ginger', quantity: '2', unit: 'tsp' },
            { name: 'Garlic', quantity: '2', unit: 'tsp' },
            { name: 'Cumin', quantity: '1', unit: 'tsp' },
            { name: 'Coriander', quantity: '2', unit: 'tsp' },
            { name: 'Oil', quantity: '1', unit: 'tbsp' }
          ],
          cookingInstructions: 'Mix flour with water to make dough. Let rest for 30 minutes. Prepare filling with ground meat, onions, ginger, garlic, and spices. Roll dough into small circles, add filling, and fold into dumpling shape. Steam for 15-20 minutes. Serve with achar (pickle) or tomato chutney.',
          cookingTime: 60,
          nutritionalValue: {
            calories: 320,
            protein: 18,
            carbs: 28,
            fat: 12,
            fiber: 2,
            sugar: 1,
            sodium: 450
          },
          createdAt: new Date().toISOString()
        }
      ];
      
      setRecipes(mockRecipes);
      showSnackbar('Using demo data - Backend API not available yet', 'info');
      console.log('Using mock recipes:', mockRecipes);
      
    } catch (error) {
      console.error('Error fetching recipes:', error);
      setError(error.message || 'Failed to fetch recipes');
      showSnackbar('Failed to load recipes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const saveRecipe = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Validate required fields
      if (!recipeFormData.name.trim()) {
        throw new Error('Recipe name is required');
      }
      
      if (!recipeFormData.cookingInstructions.trim()) {
        throw new Error('Cooking instructions are required');
      }
      
      // Validate ingredients
      const validIngredients = recipeFormData.ingredients.filter(
        ing => ing.name.trim() && ing.quantity.trim()
      );
      
      if (validIngredients.length === 0) {
        throw new Error('At least one ingredient is required');
      }
      
      // Prepare recipe data for API - match backend DTO exactly
      const recipeData = {
        name: recipeFormData.name?.trim(),
        category: recipeFormData.category || 'MAIN_COURSE',
        cookingInstructions: recipeFormData.cookingInstructions?.trim(),
        cookingTime: parseInt(recipeFormData.cookingTime) || 30,
        vendorId: 8, // Using vendor ID 8 for demo
        ingredients: validIngredients.map(ing => ({
          name: ing.name?.trim(),
          quantity: ing.quantity?.trim(),
          unit: (ing.unit && String(ing.unit).trim()) || 'g',
        })),
        nutritionalValue: {
          calories: parseInt(recipeFormData.nutritionalValue?.calories) || 0,
          protein: parseFloat(recipeFormData.nutritionalValue?.protein) || 0.0,
          carbs: parseFloat(recipeFormData.nutritionalValue?.carbs) || 0.0,
          fat: parseFloat(recipeFormData.nutritionalValue?.fat) || 0.0,
          fiber: parseFloat(recipeFormData.nutritionalValue?.fiber) || 0.0,
          sugar: parseFloat(recipeFormData.nutritionalValue?.sugar) || 0.0,
          sodium: parseInt(recipeFormData.nutritionalValue?.sodium) || 0
        }
      };
      
      // Debug: Log the complete payload being sent
      console.log('=== RECIPE PAYLOAD DEBUG ===');
      console.log('Complete recipeData:', recipeData);
      console.log('vendorId in payload:', recipeData.vendorId);
      console.log('nutritionalValue types:', {
        calories: typeof recipeData.nutritionalValue.calories,
        protein: typeof recipeData.nutritionalValue.protein,
        carbs: typeof recipeData.nutritionalValue.carbs,
        fat: typeof recipeData.nutritionalValue.fat
      });
      
      if (USE_API) {
        try {
          if (editingRecipe?._localOnly) {
            setRecipes((prev) =>
              prev.map((r) =>
                r.id === editingRecipe.id
                  ? { ...recipeData, id: editingRecipe.id, _localOnly: true }
                  : r
              )
            );
            setEditingRecipe(null);
            setOpenRecipeDialog(false);
            resetRecipeForm();
            showSnackbar('Recipe updated locally', 'success');
            return;
          }

          let response;
          if (editingRecipe) {
            response = await recipeAPI.update(editingRecipe.id, recipeData);
          } else {
            response = await recipeAPI.create(recipeData);
          }

          const ok =
            response?.status >= 200 &&
            response?.status < 300 &&
            response?.data &&
            response.data.success !== false;
          if (ok) {
            await fetchRecipes();
            setEditingRecipe(null);
            setOpenRecipeDialog(false);
            resetRecipeForm();
            showSnackbar(
              editingRecipe ? 'Recipe updated successfully!' : 'Recipe created successfully!',
              'success'
            );
            return;
          }
          throw new Error(response?.data?.message || 'Failed to save recipe');
        } catch (apiError) {
          console.warn('Recipe API error:', apiError);
          if (!editingRecipe) {
            setRecipes((prev) => [
              ...prev,
              { ...recipeData, id: Date.now().toString(), _localOnly: true },
            ]);
            setEditingRecipe(null);
            setOpenRecipeDialog(false);
            resetRecipeForm();
            showSnackbar('Recipe saved locally (backend unavailable)', 'info');
            return;
          }
          if (editingRecipe._localOnly) {
            setRecipes((prev) =>
              prev.map((r) =>
                r.id === editingRecipe.id
                  ? { ...recipeData, id: editingRecipe.id, _localOnly: true }
                  : r
              )
            );
            setEditingRecipe(null);
            setOpenRecipeDialog(false);
            resetRecipeForm();
            showSnackbar('Recipe updated locally', 'success');
            return;
          }
          const msg =
            apiError?.response?.data?.message ||
            apiError?.message ||
            'Failed to save recipe';
          showSnackbar(msg, 'error');
          return;
        }
      }

      // API disabled: local-only mode
      if (editingRecipe) {
        setRecipes((prev) =>
          prev.map((r) =>
            r.id === editingRecipe.id
              ? { ...recipeData, id: editingRecipe.id, _localOnly: true }
              : r
          )
        );
      } else {
        setRecipes((prev) => [
          ...prev,
          { ...recipeData, id: Date.now().toString(), _localOnly: true },
        ]);
      }
      setEditingRecipe(null);
      setOpenRecipeDialog(false);
      resetRecipeForm();
      showSnackbar('Recipe saved locally', 'info');
      
    } catch (error) {
      console.error('Error saving recipe:', error);
      setError(error.message || 'Failed to save recipe');
      showSnackbar(error.message || 'Failed to save recipe', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteRecipe = async (recipeId) => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      setLoading(true);
      setError('');
      
      try {
        // Try API only if enabled
        if (USE_API) {
          try {
            // Delete recipe from API
            const response = await recipeAPI.delete(recipeId);
            
            if (response.data) {
              // Refresh recipes list
              await fetchRecipes();
              
              // Show success message
              showSnackbar('Recipe deleted successfully!', 'success');
              return;
            } else {
              throw new Error('Failed to delete recipe');
            }
          } catch (apiError) {
            console.warn('API not available, deleting from local state:', apiError);
          }
        } else {
          console.log('API disabled, deleting from local state only');
        }
        
        // Delete from local state for demo
        setRecipes(prev => prev.filter(r => r.id !== recipeId));
        
        // Show info message
        showSnackbar('Recipe deleted locally (demo mode - Backend API not available yet)', 'info');
        
      } catch (error) {
        console.error('Error deleting recipe:', error);
        setError(error.message || 'Failed to delete recipe');
        showSnackbar(error.message || 'Failed to delete recipe', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  // Helper functions
  const resetRecipeForm = () => {
    setRecipeFormData({
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
    });
  };

  const getFilteredRecipes = () => {
    // Handle null/undefined recipes
    if (!recipes || !Array.isArray(recipes)) {
      return [];
    }
    
    let filtered = recipes;
    
    // Filter by category
    if (recipeFilterCategory !== 'ALL') {
      filtered = filtered.filter(recipe => recipe.category === recipeFilterCategory);
    }
    
    // Filter by search query
    if (recipeSearchQuery.trim()) {
      const query = recipeSearchQuery.toLowerCase();
      filtered = filtered.filter(recipe => 
        recipe.name.toLowerCase().includes(query) ||
        recipe.ingredients.some(ing => ing.name.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  };

  // Load recipes on component mount
  useEffect(() => {
    fetchRecipes();
  }, []);

  return (
    <>
      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" fontWeight={700}>Recipe Management</Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          onClick={() => {
            setEditingRecipe(null);
            resetRecipeForm();
            setOpenRecipeDialog(true);
          }}
          sx={{ cursor: 'pointer' }}
        >
          Create Recipe
        </Button>
      </Box>

      {/* Search and Filter */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search recipes..."
              value={recipeSearchQuery}
              onChange={(e) => setRecipeSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={recipeFilterCategory}
                onChange={(e) => setRecipeFilterCategory(e.target.value)}
                label="Category"
              >
                {RECIPE_CATEGORIES.map(cat => (
                  <MenuItem key={cat} value={cat}>{cat.replace('_', ' ')}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              {getFilteredRecipes().length} recipes found
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Recipe Cards Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <Typography>Loading recipes...</Typography>
        </Box>
      ) : getFilteredRecipes().length > 0 ? (
        <Grid container spacing={3}>
          {getFilteredRecipes().map((recipe) => (
            <Grid item xs={12} sm={6} md={4} key={recipe.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                  },
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Category Badge */}
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: 16, 
                    right: 16, 
                    zIndex: 1 
                  }}
                >
                  <Chip 
                    label={recipe.category?.replace('_', ' ') || 'MAIN COURSE'} 
                    size="small" 
                    sx={{ 
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      backdropFilter: 'blur(10px)',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      fontSize: '0.7rem',
                      color: 'primary.main'
                    }}
                  />
                </Box>

                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  {/* Recipe Title */}
                  <Typography 
                    variant="h6" 
                    component="h3" 
                    sx={{ 
                      fontWeight: 700,
                      mb: 2,
                      color: 'text.primary',
                      lineHeight: 1.3,
                      pr: 8 // Make room for the category badge
                    }}
                  >
                    {recipe.name}
                  </Typography>
                  
                  {/* Cooking Time */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      backgroundColor: 'primary.light',
                      borderRadius: 2,
                      px: 1.5,
                      py: 0.5
                    }}>
                      <Timer sx={{ fontSize: 16, mr: 0.5, color: 'primary.main' }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        {recipe.cookingTime || 30} min
                      </Typography>
                    </Box>
                  </Box>

                  {/* Ingredients Section */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Restaurant sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        Ingredients ({recipe.ingredients?.length || 0})
                      </Typography>
                    </Box>
                    <Box sx={{ pl: 2.5 }}>
                      {recipe.ingredients?.slice(0, 3).map((ing, idx) => (
                        <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                            {ing.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            {ing.quantity} {ing.unit}
                          </Typography>
                        </Box>
                      ))}
                      {recipe.ingredients?.length > 3 && (
                        <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600, mt: 0.5 }}>
                          +{recipe.ingredients.length - 3} more ingredients
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {/* Cooking Instructions */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <MenuBook sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        Instructions
                      </Typography>
                    </Box>
                    <Box sx={{ pl: 2.5 }}>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          lineHeight: 1.5,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {recipe.cookingInstructions || 'No instructions provided'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
                
                {/* Action Buttons */}
                <Box sx={{ 
                  p: 2, 
                  pt: 0, 
                  display: 'flex', 
                  gap: 1, 
                  justifyContent: 'flex-end',
                  borderTop: '1px solid',
                  borderColor: 'divider'
                }}>
                  <Button
                    size="small"
                    startIcon={<Edit />}
                    onClick={() => {
                      setEditingRecipe(recipe);
                      setRecipeFormData({
                        name: recipe.name,
                        category:
                          recipe.category && recipe.category !== 'ALL'
                            ? recipe.category
                            : 'MAIN_COURSE',
                        ingredients: recipe.ingredients || [{ name: '', quantity: '', unit: 'g' }],
                        cookingInstructions: recipe.cookingInstructions || '',
                        cookingTime: recipe.cookingTime || 30,
                        nutritionalValue: recipe.nutritionalValue || {
                          calories: 0,
                          protein: 0,
                          carbs: 0,
                          fat: 0,
                          fiber: 0,
                          sugar: 0,
                          sodium: 0
                        }
                      });
                      setOpenRecipeDialog(true);
                    }}
                    sx={{ 
                      textTransform: 'none',
                      fontWeight: 600,
                      '&:hover': { backgroundColor: 'primary.light' }
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    startIcon={<Delete />}
                    color="error"
                    onClick={() => deleteRecipe(recipe.id)}
                    sx={{ 
                      textTransform: 'none',
                      fontWeight: 600,
                      '&:hover': { backgroundColor: 'error.light' }
                    }}
                  >
                    Delete
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <MenuBook sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No recipes found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {recipeSearchQuery || recipeFilterCategory !== 'ALL' 
              ? 'Try adjusting your search or filter criteria' 
              : 'Create your first recipe to get started'}
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<Add />}
            onClick={() => {
              setEditingRecipe(null);
              resetRecipeForm();
              setOpenRecipeDialog(true);
            }}
          >
            Create Recipe
          </Button>
        </Paper>
      )}

      {/* Recipe Dialog */}
      <RecipeDialog
        open={openRecipeDialog}
        onClose={() => {
          setOpenRecipeDialog(false);
          setEditingRecipe(null);
          resetRecipeForm();
        }}
        recipeFormData={recipeFormData}
        setRecipeFormData={setRecipeFormData}
        onSave={saveRecipe}
        editingRecipe={editingRecipe}
        RECIPE_CATEGORIES={RECIPE_FORM_CATEGORIES}
        UNITS={UNITS}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default RecipeManagement;
