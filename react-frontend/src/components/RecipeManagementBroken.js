// import React, { useState, useEffect } from 'react';
// import {
//   Box, Grid, Typography, Paper, Button, Card, CardContent,
//   TextField, FormControl, InputLabel, Select, MenuItem, Avatar,
//   Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
//   Alert, Snackbar
// } from '@mui/material';
// import {
//   MenuBook, Add, Edit, Delete, Search, Timer, LocalFireDepartment
// } from '@mui/icons-material';
// import RecipeDialog from './RecipeDialog';
// import { recipeAPI } from '../services/api';

// const RecipeManagement = () => {
//   // Enable API calls now that backend endpoints are implemented
//   const USE_API = true; // Set to false to use mock data for testing
//   // Recipe Management State
//   const [recipes, setRecipes] = useState([]);
//   const [openRecipeDialog, setOpenRecipeDialog] = useState(false);
//   const [editingRecipe, setEditingRecipe] = useState(null);
//   const [recipeSearchQuery, setRecipeSearchQuery] = useState('');
//   const [recipeFilterCategory, setRecipeFilterCategory] = useState('ALL');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
//   const [recipeFormData, setRecipeFormData] = useState({
//     name: '',
//     category: 'MAIN_COURSE',
//     ingredients: [{ name: '', quantity: '', unit: 'g' }],
//     cookingInstructions: '',
//     cookingTime: 30,
//     nutritionalValue: {
//       calories: 0,
//       protein: 0,
//       carbs: 0,
//       fat: 0,
//       fiber: 0,
//       sugar: 0,
//       sodium: 0
//     }
//   });

//   // Recipe Management Constants
//   const RECIPE_CATEGORIES = ['ALL', 'APPETIZER', 'MAIN_COURSE', 'DESSERT', 'BEVERAGE', 'SNACK', 'SALAD', 'SOUP'];
//   const UNITS = ['g', 'kg', 'ml', 'l', 'cup', 'tbsp', 'tsp', 'piece', 'pieces'];

//   // Helper function to show snackbar messages
//   const showSnackbar = (message, severity = 'success') => {
//     setSnackbar({ open: true, message, severity });
//   };

//   // Recipe Management Functions
//   const fetchRecipes = async () => {
//     setLoading(true);
//     setError('');
    
//     try {
//       // Use API only if enabled
//       if (USE_API) {
//         console.log('Fetching recipes from API');
//         try {
//           const response = await recipeAPI.getVendorRecipes(8); // Using vendor ID 8 for demo
          
//           if (response.data) {
//             setRecipes(response.data || []);
//             console.log('Recipes loaded successfully from API:', response.data);
//             return;
//           } else {
//             throw new Error('Failed to fetch recipes');
//           }
//         } catch (apiError) {
//           console.warn('API not available, falling back to mock data:', apiError);
//         }
//       } else {
//         console.log('API disabled, using mock data only');
//       }
      
//       // Fallback to mock data when backend is not available
//       const mockRecipes = [
//         {
//           id: '1',
//           name: 'Chicken Biryani',
//           category: 'MAIN_COURSE',
//           ingredients: [
//             { name: 'Chicken', quantity: '500', unit: 'g' },
//             { name: 'Basmati Rice', quantity: '2', unit: 'cup' },
//             { name: 'Onion', quantity: '1', unit: 'piece' },
//             { name: 'Tomatoes', quantity: '2', unit: 'piece' },
//             { name: 'Garlic', quantity: '3', unit: 'tsp' },
//             { name: 'Ginger', quantity: '2', unit: 'tsp' },
//             { name: 'Turmeric', quantity: '1', unit: 'tsp' },
//             { name: 'Oil', quantity: '2', unit: 'tbsp' }
//           ],
//           cookingInstructions: 'Wash and soak rice for 30 minutes. Heat oil in large pan, add onions and sauté until golden. Add chicken pieces and cook until white. Add ginger-garlic paste and green chilies, cook for 2 minutes. Add tomatoes and cook until soft. Add yogurt, turmeric, cumin, coriander and salt. Add soaked rice and 4 cups water. Cover and cook on low heat for 20 minutes. Garnish with fresh coriander and serve hot.',
//           cookingTime: 45,
//           nutritionalValue: {
//             calories: 450,
//             protein: 25,
//             carbs: 45,
//             fat: 15,
//             fiber: 3,
//             sugar: 8,
//             sodium: 800
//           },
//           createdAt: new Date().toISOString()
//         },
//         {
//           id: '2',
//           name: 'Vegetable Stir Fry',
//           category: 'MAIN_COURSE',
//           ingredients: [
//             { name: 'Mixed Vegetables', quantity: '2', unit: 'cup' },
//             { name: 'Soy Sauce', quantity: '2', unit: 'tbsp' },
//             { name: 'Sesame Oil', quantity: '1', unit: 'tbsp' },
//             { name: 'Garlic', quantity: '2', unit: 'tsp' },
//             { name: 'Ginger', quantity: '1', unit: 'tsp' },
//             { name: 'Cooked Rice', quantity: '2', unit: 'cup' },
//             { name: 'Cornstarch', quantity: '1', unit: 'tbsp' },
//             { name: 'Green Onions', quantity: '2', unit: 'piece' }
//           ],
//           cookingInstructions: 'Heat sesame oil in wok or large pan. Add garlic and ginger, stir for 30 seconds. Add vegetables and stir-fry for 3-4 minutes. Add soy sauce and cook for 1 minute. Mix cornstarch with 2 tbsp water, add to pan. Add cooked rice and toss everything together. Garnish with sesame seeds and green onions.',
//           cookingTime: 30,
//           nutritionalValue: {
//             calories: 280,
//             protein: 12,
//             carbs: 35,
//             fat: 8,
//             fiber: 6,
//             sugar: 12,
//             sodium: 600
//           },
//           createdAt: new Date().toISOString()
//         },
//         {
//           id: '3',
//           name: 'Momo (Nepalese Dumplings)',
//           category: 'APPETIZER',
//           ingredients: [
//             { name: 'Flour', quantity: '2', unit: 'cup' },
//             { name: 'Ground Meat', quantity: '500', unit: 'g' },
//             { name: 'Onion', quantity: '1', unit: 'piece' },
//             { name: 'Ginger', quantity: '2', unit: 'tsp' },
//             { name: 'Garlic', quantity: '2', unit: 'tsp' },
//             { name: 'Cumin', quantity: '1', unit: 'tsp' },
//             { name: 'Coriander', quantity: '2', unit: 'tsp' },
//             { name: 'Oil', quantity: '1', unit: 'tbsp' }
//           ],
//           cookingInstructions: 'Mix flour with water to make dough. Let rest for 30 minutes. Prepare filling with ground meat, onions, ginger, garlic, and spices. Roll dough into small circles, add filling, and fold into dumpling shape. Steam for 15-20 minutes. Serve with achar (pickle) or tomato chutney.',
//           cookingTime: 60,
//           nutritionalValue: {
//             calories: 320,
//             protein: 18,
//             carbs: 28,
//             fat: 12,
//             fiber: 2,
//             sugar: 1,
//             sodium: 450
//           },
//           createdAt: new Date().toISOString()
//         }
//       ];
      
//       setRecipes(mockRecipes);
//       showSnackbar('Using demo data - Backend API not available yet', 'info');
//       console.log('Using mock recipes:', mockRecipes);
      
//     } catch (error) {
//       console.error('Error fetching recipes:', error);
//       setError(error.message || 'Failed to fetch recipes');
//       showSnackbar('Failed to load recipes', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const saveRecipe = async () => {
//     setLoading(true);
//     setError('');
    
//     try {
//       // Validate required fields
//       if (!recipeFormData.name.trim()) {
//         throw new Error('Recipe name is required');
//       }
      
//       if (!recipeFormData.cookingInstructions.trim()) {
//         throw new Error('Cooking instructions are required');
//       }
      
//       // Validate ingredients
//       const validIngredients = recipeFormData.ingredients.filter(
//         ing => ing.name.trim() && ing.quantity.trim()
//       );
      
//       if (validIngredients.length === 0) {
//         throw new Error('At least one ingredient is required');
//       }
      
//       // Prepare recipe data for API
//       const recipeData = {
//         ...recipeFormData,
//         ingredients: validIngredients,
//         vendorId: 8, // Using vendor ID 8 for demo
//         updatedAt: new Date().toISOString()
//       };
      
//       // Use API only if enabled
//       if (USE_API) {
//         try {
//           let response;
//           if (editingRecipe) {
//             // Update existing recipe
//             response = await recipeAPI.update(editingRecipe.id, recipeData);
//           } else {
//             // Create new recipe
//             response = await recipeAPI.create(recipeData);
//           }
          
//           if (response.data) {
//             // Refresh recipes list
//             await fetchRecipes();
            
//             // Reset form and close dialog
//             setEditingRecipe(null);
//             setOpenRecipeDialog(false);
//             resetRecipeForm();
            
//             // Show success message
//             showSnackbar(
//               editingRecipe ? 'Recipe updated successfully!' : 'Recipe created successfully!',
//               'success'
//             );
//             return;
//           } else {
//             throw new Error('Failed to save recipe');
//           }
//         } catch (apiError) {
//           console.warn('API not available, saving to local state:', apiError);
//         }
//       } else {
//         console.log('API disabled, saving to local state only');
//       }
      
//       // Save to local state for demo
//       if (editingRecipe) {
//         // Update existing recipe in local state
//         setRecipes(prev => prev.map(r => r.id === editingRecipe.id ? { ...recipeData, id: editingRecipe.id } : r));
//       } else {
//         // Add new recipe to local state
//         setRecipes(prev => [...prev, { ...recipeData, id: Date.now().toString() }]);
//       }
      
//       // Reset form and close dialog
//       setEditingRecipe(null);
//       setOpenRecipeDialog(false);
//       resetRecipeForm();
      
//       // Show info message
//       showSnackbar('Recipe saved locally (demo mode - Backend API not available yet)', 'info');
      
//     } catch (error) {
//       console.error('Error saving recipe:', error);
//       setError(error.message || 'Failed to save recipe');
//       showSnackbar(error.message || 'Failed to save recipe', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const deleteRecipe = async (recipeId) => {
//     if (window.confirm('Are you sure you want to delete this recipe?')) {
//       setLoading(true);
//       setError('');
      
//       try {
//         // Try API only if enabled
//         if (USE_API) {
//           try {
//             // Delete recipe from API
//             const response = await recipeAPI.delete(recipeId);
            
//             if (response.data) {
//               // Refresh recipes list
//               await fetchRecipes();
              
//               // Show success message
//               showSnackbar('Recipe deleted successfully!', 'success');
//               return;
//             } else {
//               throw new Error('Failed to delete recipe');
//             }
//           } catch (apiError) {
//             console.warn('API not available, deleting from local state:', apiError);
//           }
//         } else {
//           console.log('API disabled, deleting from local state only');
//         }
        
//         // Delete from local state for demo
//         setRecipes(prev => prev.filter(r => r.id !== recipeId));
        
//         // Show info message
//         showSnackbar('Recipe deleted locally (demo mode - Backend API not available yet)', 'info');
        
//       } catch (error) {
//         console.error('Error deleting recipe:', error);
//         setError(error.message || 'Failed to delete recipe');
//         showSnackbar(error.message || 'Failed to delete recipe', 'error');
//       } finally {
//         setLoading(false);
//       }
//     }
//   };

//   // Helper functions
//   const resetRecipeForm = () => {
//     setRecipeFormData({
//       name: '',
//       category: 'MAIN_COURSE',
//       ingredients: [{ name: '', quantity: '', unit: 'g' }],
//       cookingInstructions: '',
//       cookingTime: 30,
//       nutritionalValue: {
//         calories: 0,
//         protein: 0,
//         carbs: 0,
//         fat: 0,
//         fiber: 0,
//         sugar: 0,
//         sodium: 0
//       }
//     });
//   };

//   const getFilteredRecipes = () => {
//     let filtered = recipes;
    
//     // Filter by category
//     if (recipeFilterCategory !== 'ALL') {
//       filtered = filtered.filter(recipe => recipe.category === recipeFilterCategory);
//     }
    
//     // Filter by search query
//     if (recipeSearchQuery.trim()) {
//       const query = recipeSearchQuery.toLowerCase();
//       filtered = filtered.filter(recipe => 
//         recipe.name.toLowerCase().includes(query) ||
//         recipe.ingredients.some(ing => ing.name.toLowerCase().includes(query))
//       );
//     }
    
//     return filtered;
//   };

//   // Load recipes on component mount
//   useEffect(() => {
//     fetchRecipes();
//   }, []);

//   return (
//     <>
//       {/* Error Display */}
//       {error && (
//         <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
//           {error}
//         </Alert>
//       )}

//       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
//         <Typography variant="h4" fontWeight={700}>Recipe Management</Typography>
//         <Button variant="contained" startIcon={<Add />} onClick={() => setOpenRecipeDialog(true)} disabled={loading}>
//           Create Recipe
//         </Button>
//       </Box>

//       {/* Search and Filter */}
//       <Paper sx={{ p: 3, mb: 3 }}>
//         <Grid container spacing={3} alignItems="center">
//           <Grid item xs={12} md={6}>
//             <TextField
//               fullWidth
//               placeholder="Search recipes..."
//               value={recipeSearchQuery}
//               onChange={(e) => setRecipeSearchQuery(e.target.value)}
//               InputProps={{
//                 startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
//               }}
//             />
//           </Grid>
//           <Grid item xs={12} md={3}>
//             <FormControl fullWidth>
//               <InputLabel>Category</InputLabel>
//               <Select
//                 value={recipeFilterCategory}
//                 onChange={(e) => setRecipeFilterCategory(e.target.value)}
//                 label="Category"
//               >
//                 {RECIPE_CATEGORIES.map(cat => (
//                   <MenuItem key={cat} value={cat}>{cat.replace('_', ' ')}</MenuItem>
//                 ))}
//               </Select>
//             </FormControl>
//           </Grid>
//           <Grid item xs={12} md={3}>
//             <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
//               {getFilteredRecipes().length} recipes found
//             </Typography>
//           </Grid>
//         </Grid>
//       </Paper>

//       {/* Recipe Cards Grid */}
//       {loading ? (
//         <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
//           <Typography>Loading recipes...</Typography>
//         </Box>
//       ) : getFilteredRecipes().length > 0 ? (
//         <Grid container spacing={3}>
//           {getFilteredRecipes().map((recipe) => (
//             <Grid item xs={12} sm={6} md={4} key={recipe.id}>
//               <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
//                 <CardContent sx={{ flexGrow: 1 }}>
//                   <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
//                     <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
//                       {recipe.name}
//                     </Typography>
//                     <Chip 
//                       label={recipe.category?.replace('_', ' ') || 'MAIN_COURSE'} 
//                       size="small" 
//                       color="primary" 
//                       variant="outlined"
//                     />
//                   </Box>
                  
//                   <Box sx={{ mb: 2 }}>
//                     <Typography variant="body2" color="text.secondary" gutterBottom>
//                       <Timer sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
//                       {recipe.cookingTime || 30} min
//                     </Typography>
//                   </Box>

//                   <Box sx={{ mb: 2 }}>
//                     <Typography variant="subtitle2" gutterBottom>
//                       Ingredients ({recipe.ingredients?.length || 0}):
//                     </Typography>
//                     {recipe.ingredients?.slice(0, 3).map((ing, idx) => (
//                       <Typography key={idx} variant="body2" color="text.secondary">
//                         {ing.name} - {ing.quantity} {ing.unit}
//                       </Typography>
//                     ))}
//                     {recipe.ingredients?.length > 3 && (
//                       <Typography variant="body2" color="text.secondary">
//                         +{recipe.ingredients.length - 3} more...
//                       </Typography>
//                     )}
//                   </Box>

//                   {recipe.nutritionalValue && (
//                     <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
//                       <Typography variant="caption" color="text.secondary">
//                         <LocalFireDepartment sx={{ fontSize: 14, mr: 0.5 }} />
//                         {recipe.nutritionalValue.calories || 0} cal
//                       </Typography>
//                       <Typography variant="caption" color="text.secondary">
//                         P: {recipe.nutritionalValue.protein || 0}g
//                       </Typography>
//                       <Typography variant="caption" color="text.secondary">
//                         C: {recipe.nutritionalValue.carbs || 0}g
//                       </Typography>
//                       <Typography variant="caption" color="text.secondary">
//                         F: {recipe.nutritionalValue.fat || 0}g
//                       </Typography>
//                     </Box>
//                   )}
//                 </CardContent>
                
//                 <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
//                   <IconButton 
//                     size="small" 
//                     onClick={() => {
//                       setEditingRecipe(recipe);
//                       setRecipeFormData({
//                         name: recipe.name,
//                         category: recipe.category || 'MAIN_COURSE',
//                         ingredients: recipe.ingredients || [{ name: '', quantity: '', unit: 'g' }],
//                         cookingInstructions: recipe.cookingInstructions || '',
//                         cookingTime: recipe.cookingTime || 30,
//                         nutritionalValue: recipe.nutritionalValue || {
//                           calories: 0,
//                           protein: 0,
//                           carbs: 0,
//                           fat: 0,
//                           fiber: 0,
//                           sugar: 0,
//                           sodium: 0
//                         }
//                       });
//                       setOpenRecipeDialog(true);
//                     }}
//                   >
//                     <Edit />
//                   </IconButton>
//                   <IconButton 
//                     size="small" 
//                     color="error"
//                     onClick={() => deleteRecipe(recipe.id)}
//                   >
//                     <Delete />
//                   </IconButton>
//                 </Box>
//               </Card>
//             </Grid>
//           ))}
//         </Grid>
//       ) : (
//         <Paper sx={{ p: 6, textAlign: 'center' }}>
//           <MenuBook sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
//           <Typography variant="h6" color="text.secondary" gutterBottom>
//             No recipes found
//           </Typography>
//           <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
//             {recipeSearchQuery || recipeFilterCategory !== 'ALL' 
//               ? 'Try adjusting your search or filter criteria' 
//               : 'Create your first recipe to get started'}
//           </Typography>
//           <Button 
//             variant="contained" 
//             startIcon={<Add />}
//             onClick={() => setOpenRecipeDialog(true)}
//           >
//             Create Recipe
//           </Button>
//         </Paper>
//       )}

//       {/* Recipe Dialog */}
//       <RecipeDialog
//         open={openRecipeDialog}
//         onClose={() => {
//           setOpenRecipeDialog(false);
//           setEditingRecipe(null);
//           resetRecipeForm();
//         }}
//         recipeData={recipeFormData}
//         setRecipeData={setRecipeFormData}
//         onSave={saveRecipe}
//         editingRecipe={editingRecipe}
//         RECIPE_CATEGORIES={RECIPE_CATEGORIES}
//         UNITS={UNITS}
//       />

//       {/* Snackbar for notifications */}
//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={6000}
//         onClose={() => setSnackbar({ ...snackbar, open: false })}
//         anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
//       >
//         <Alert
//           onClose={() => setSnackbar({ ...snackbar, open: false })}
//           severity={snackbar.severity}
//           sx={{ width: '100%' }}
//         >
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </>
//   );
// };

// export default RecipeManagement;
//         <Typography variant="h4" fontWeight={700}>Recipe Management</Typography>
//         <Button variant="contained" startIcon={<Add />} onClick={() => setOpenRecipeDialog(true)}>
//           Create Recipe
//         </Button>
//       </Box>

//       {/* Recipe Search and Filter */}
//       <Paper sx={{ p: 2, mb: 3 }}>
//         <Grid container spacing={2} alignItems="center">
//           <Grid item xs={12} md={4}>
//             <TextField
//               fullWidth
//               placeholder="Search recipes..."
//               value={recipeSearchQuery}
//               onChange={(e) => setRecipeSearchQuery(e.target.value)}
//               InputProps={{
//                 startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />
//               }}
//               size="small"
//             />
//           </Grid>
//           <Grid item xs={12} md={3}>
//             <FormControl fullWidth size="small">
//               <InputLabel>Filter by Category</InputLabel>
//               <Select
//                 value={recipeFilterCategory}
//                 onChange={(e) => setRecipeFilterCategory(e.target.value)}
//               >
//                 {RECIPE_CATEGORIES.map(category => (
//                   <MenuItem key={category} value={category}>
//                     {category.replace('_', ' ')}
//                   </MenuItem>
//                 ))}
//               </Select>
//             </FormControl>
//           </Grid>
//         </Grid>
//       </Paper>

//       {/* Recipe Cards Grid */}
//       {getFilteredRecipes().length > 0 ? (
//         <Grid container spacing={3}>
//           {getFilteredRecipes().map((recipe) => (
//             <Grid item xs={12} sm={6} md={4} key={recipe.id}>
//               <Card sx={{ 
//                 cursor: 'pointer',
//                 transition: 'all 0.3s ease',
//                 '&:hover': { 
//                   boxShadow: 4,
//                   transform: 'translateY(-4px)' 
//                 }
//               }}>
//                 <CardContent>
//                   <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//                     <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
//                       <MenuBook />
//                     </Avatar>
//                     <Box sx={{ flexGrow: 1 }}>
//                       <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
//                         {recipe.name}
//                       </Typography>
//                       <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
//                         <Chip 
//                           label={recipe.category?.replace('_', ' ') || 'MAIN_COURSE'}
//                           size="small"
//                           color="primary"
//                           variant="outlined"
//                         />
//                       </Box>
//                     </Box>
//                   </Box>
                  
//                   <Typography variant="body2" color="text.secondary" gutterBottom>
//                     {recipe.cookingInstructions?.slice(0, 100)}...
//                   </Typography>
                  
//                   {/* Recipe Stats */}
//                   <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
//                     <Chip 
//                       icon={<Timer />} 
//                       label={`${recipe.cookingTime} min`} 
//                       size="small" 
//                       color="info" 
//                     />
//                     <Chip 
//                       icon={<LocalFireDepartment />} 
//                       label={`${recipe.nutritionalValue?.calories || 0} cal`} 
//                       size="small" 
//                       color="error" 
//                     />
//                     <Chip 
//                       label={`${recipe.ingredients?.length || 0} ingredients`} 
//                       size="small" 
//                       color="success" 
//                     />
//                   </Box>
                  
//                   {/* Recipe Actions */}
//                   <Box sx={{ display: 'flex', gap: 1 }}>
//                     <Button 
//                       size="small" 
//                       variant="outlined" 
//                       startIcon={<Edit />}
//                       onClick={() => openRecipeEditor(recipe)}
//                     >
//                       Edit
//                     </Button>
//                     <Button 
//                       size="small" 
//                       variant="outlined" 
//                       startIcon={<Delete />}
//                       onClick={() => deleteRecipe(recipe.id)}
//                     >
//                       Delete
//                     </Button>
//                   </Box>
//                 </CardContent>
//               </Card>
//             </Grid>
//           ))}
//         </Grid>
//       ) : (
//         <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
//           <MenuBook sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
//           <Typography variant="h6" color="text.secondary" gutterBottom>
//             No recipes found
//           </Typography>
//           <Typography variant="body2" color="text.secondary">
//             {recipeSearchQuery || recipeFilterCategory !== 'ALL' 
//               ? 'Try adjusting your search or filter criteria' 
//               : 'Start by creating your first recipe'}
//           </Typography>
//           {!recipeSearchQuery && recipeFilterCategory === 'ALL' && (
//             <Button
//               variant="contained"
//               startIcon={<Add />}
//               onClick={() => setOpenRecipeDialog(true)}
//               sx={{ mt: 2 }}
//             >
//               Create Your First Recipe
//             </Button>
//           )}
//         </Paper>
//       )}

//       {/* Recipe Dialog */}
//       <RecipeDialog
//         open={openRecipeDialog}
//         editingRecipe={editingRecipe}
//         recipeFormData={recipeFormData}
//         setRecipeFormData={setRecipeFormData}
//         onClose={closeRecipeDialog}
//         onSave={saveRecipe}
//         RECIPE_CATEGORIES={RECIPE_CATEGORIES}
//         UNITS={UNITS}
//       />
//     </>
//   );
// };

// export default RecipeManagement;
