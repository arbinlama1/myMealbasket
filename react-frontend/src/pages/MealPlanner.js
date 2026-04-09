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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  Tabs,
  Tab,
  Paper,
  LinearProgress,
  Badge,
  Tooltip,
  Zoom,
  Slide,
  Snackbar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Avatar,
  Checkbox,
} from '@mui/material';
import {
  Restaurant,
  CalendarToday,
  LocalFireDepartment,
  AttachMoney,
  AutoAwesome,
  Add,
  Edit,
  Delete,
  Close,
  BreakfastDining,
  LunchDining,
  DinnerDining,
  Schedule,
  DragIndicator,
  TrendingUp,
  Star,
  Favorite,
  Share,
  Download,
  Upload,
  FilterList,
  Search,
  ExpandMore,
  RestaurantMenu,
  Fastfood,
  LocalDining,
  Kitchen,
  Timer,
  ShoppingCart,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { mealPlanAPI } from '../services/api';
import { format } from 'date-fns';

const MealPlanner = () => {
  const { user } = useAuth();
  const theme = useTheme();

  const [mealPlans, setMealPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [aiRecommendation, setAiRecommendation] = useState(null);

  // Enhanced Smart Planning States
  const [activeTab, setActiveTab] = useState(0);
  const [planningMode, setPlanningMode] = useState('daily'); // daily, weekly, monthly
  const [budget, setBudget] = useState(100);
  const [dailyCalorieTarget, setDailyCalorieTarget] = useState(2000);
  const [openAiDialog, setOpenAiDialog] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [draggedMeal, setDraggedMeal] = useState(null);
  const [calendarMeals, setCalendarMeals] = useState({});

  // New Enhanced Features States
  const [favorites, setFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMealType, setFilterMealType] = useState('ALL');
  const [showStats, setShowStats] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [weeklyStats, setWeeklyStats] = useState({ totalCalories: 0, totalCost: 0, mealsCompleted: 0 });
  const [mealPrepTime, setMealPrepTime] = useState(30); // minutes
  const [dietaryPreferences, setDietaryPreferences] = useState(['balanced']);
  const [shoppingList, setShoppingList] = useState([]);
  const [showShoppingList, setShowShoppingList] = useState(false);

  const [formData, setFormData] = useState({
    planName: '',
    mealType: 'BREAKFAST',
    ingredients: '',
    instructions: '',
  });

  const mealTypes = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];

  useEffect(() => {
    fetchMealPlans();
    calculateWeeklyStats();
  }, [selectedDate]);

  // Organize meals for calendar view
  useEffect(() => {
    organizeCalendarMeals();
  }, [mealPlans]);

  // Enhanced Features Effects
  useEffect(() => {
    generateShoppingList();
  }, [mealPlans]);

  // Enhanced Functions
  const calculateWeeklyStats = () => {
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    
    const weekMeals = mealPlans.filter(meal => {
      if (!meal.planDate) return false;
      try {
        const mealDate = new Date(meal.planDate);
        return mealDate >= weekStart && mealDate <= weekEnd && !isNaN(mealDate.getTime());
      } catch (error) {
        return false;
      }
    });

    const totalCalories = weekMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
    const totalCost = weekMeals.reduce((sum, meal) => sum + (meal.estimatedCost || 0), 0);
    const mealsCompleted = weekMeals.filter(meal => meal.completed).length;

    setWeeklyStats({ totalCalories, totalCost, mealsCompleted });
  };

  const generateShoppingList = () => {
    const ingredients = {};
    mealPlans.forEach(meal => {
      if (meal.ingredients) {
        const mealIngredients = meal.ingredients.split(',').map(ing => ing.trim());
        mealIngredients.forEach(ingredient => {
          if (ingredient) {
            ingredients[ingredient] = (ingredients[ingredient] || 0) + 1;
          }
        });
      }
    });
    
    const shoppingListItems = Object.entries(ingredients).map(([ingredient, count]) => ({
      ingredient,
      quantity: count,
      checked: false
    }));
    
    setShoppingList(shoppingListItems);
  };

  const toggleFavorite = (mealId) => {
    setFavorites(prev => 
      prev.includes(mealId) 
        ? prev.filter(id => id !== mealId)
        : [...prev, mealId]
    );
    showSnackbar('Favorite updated successfully!');
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const shareMealPlan = () => {
    const shareData = {
      title: 'My Meal Plan',
      text: `Check out my meal plan for ${selectedDate}!`,
      url: window.location.href
    };
    
    if (navigator.share) {
      navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(window.location.href);
      showSnackbar('Meal plan link copied to clipboard!');
    }
  };

  const exportMealPlan = () => {
    const dataStr = JSON.stringify(mealPlans, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `meal-plan-${selectedDate}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showSnackbar('Meal plan exported successfully!');
  };

  const importMealPlan = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedMeals = JSON.parse(e.target.result);
          setMealPlans(prev => [...prev, ...importedMeals]);
          showSnackbar('Meal plan imported successfully!');
        } catch (error) {
          showSnackbar('Failed to import meal plan', 'error');
        }
      };
      reader.readAsText(file);
    }
  };

  const getFilteredMeals = () => {
    let filtered = mealPlans;
    
    if (searchQuery) {
      filtered = filtered.filter(meal => 
        (meal.planName && meal.planName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (meal.ingredients && meal.ingredients.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    if (filterMealType !== 'ALL') {
      filtered = filtered.filter(meal => meal.mealType === filterMealType);
    }
    
    return filtered;
  };

  const getDietaryIcon = (preference) => {
    switch (preference) {
      case 'vegetarian': return '🥗';
      case 'vegan': return '🌱';
      case 'gluten-free': return '🌾';
      case 'keto': return '🥑';
      default: return '⚖️';
    }
  };

  const getProgressPercentage = () => {
    const targetCalories = dailyCalorieTarget;
    const currentCalories = mealPlans.reduce((sum, meal) => sum + (meal.calories || 0), 0);
    return Math.min((currentCalories / targetCalories) * 100, 100);
  };

  const organizeCalendarMeals = () => {
    const organized = {};
    mealPlans.forEach(plan => {
      const date = plan.planDate;
      if (!organized[date]) {
        organized[date] = { breakfast: null, lunch: null, dinner: null, snack: null };
      }
      // Add null check for mealType
      const mealType = plan.mealType ? plan.mealType.toLowerCase() : 'breakfast';
      organized[date][mealType] = plan;
    });
    setCalendarMeals(organized);
  };

  // AI Recommendation Functions
  const handleGenerateAIRecommendation = async (mealType) => {
    try {
      setLoading(true);
      setError(null);
      
      // Call AI recommendation API
      const response = await mealPlanAPI.create({
        planName: `AI Recommended ${mealType}`,
        mealType: mealType,
        planDate: selectedDate,
        ingredients: 'Auto-generated ingredients',
        instructions: 'Auto-generated instructions',
        calories: estimateCalories(mealType),
        estimatedCost: estimateCost(mealType),
        isRecommended: true,
        aiRecommendation: generateRecommendationText(mealType)
      });

      if (response.data?.success) {
        setAiRecommendation(response.data.data);
      }
    } catch (err) {
      setError('Failed to generate AI recommendation');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAIRecommendation = async () => {
    if (!aiRecommendation) return;
    
    try {
      setLoading(true);
      const response = await mealPlanAPI.create(aiRecommendation);
      if (response.data?.success) {
        setAiRecommendation(null);
        setOpenAiDialog(false);
        fetchMealPlans();
      }
    } catch (err) {
      setError('Failed to save meal plan');
    } finally {
      setLoading(false);
    }
  };

  // Drag and Drop Functions
  const handleDragStart = (meal) => {
    setDraggedMeal(meal);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, date, mealType) => {
    e.preventDefault();
    if (!draggedMeal) return;

    // Update the meal plan with new date and meal type
    const updatedMeal = {
      ...draggedMeal,
      planDate: date,
      mealType: mealType.toUpperCase()
    };

    // Update calendar meals
    setCalendarMeals(prev => ({
      ...prev,
      [date]: {
        ...prev[date],
        [mealType]: updatedMeal
      }
    }));

    setDraggedMeal(null);
  };

  // Utility Functions
  const estimateCalories = (mealType) => {
    // Add null check for mealType
    const type = mealType ? mealType.toLowerCase() : 'breakfast';
    switch (type) {
      case 'breakfast': return 350;
      case 'lunch': return 550;
      case 'dinner': return 650;
      case 'snack': return 200;
      default: return 450;
    }
  };

  const estimateCost = (mealType) => {
    // Add null check for mealType
    const type = mealType ? mealType.toLowerCase() : 'breakfast';
    switch (type) {
      case 'breakfast': return 8.50;
      case 'lunch': return 12.75;
      case 'dinner': return 15.25;
      case 'snack': return 4.25;
      default: return 10.50;
    }
  };

  const generateRecommendationText = (mealType) => {
    // Add null check for mealType
    const type = mealType ? mealType.toLowerCase() : 'breakfast';
    switch (type) {
      case 'breakfast':
        return 'Recommended: High-protein breakfast with eggs and whole grain toast. Packed with vitamins and minerals to start your day energized.';
      case 'lunch':
        return 'Recommended: Balanced lunch with grilled chicken, quinoa, and mixed vegetables. Provides sustained energy for afternoon activities.';
      case 'dinner':
        return 'Recommended: Light dinner with baked fish, sweet potato, and steamed broccoli. Easy to digest and promotes better sleep.';
      case 'snack':
        return 'Recommended: Healthy snack with mixed nuts and Greek yogurt. Provides protein and healthy fats between meals.';
      default:
        return 'Recommended: Balanced meal with lean protein, complex carbs, and fresh vegetables for optimal nutrition.';
    }
  };

  const getMealIcon = (mealType) => {
    // Add null check for mealType
    const type = mealType ? mealType.toLowerCase() : 'breakfast';
    switch (type) {
      case 'breakfast': return <BreakfastDining />;
      case 'lunch': return <LunchDining />;
      case 'dinner': return <DinnerDining />;
      default: return <Restaurant />;
    }
  };

 const fetchMealPlans = async () => {
  if (!user) {
    setError("Please log in to view meal plans");
    setLoading(false);
    return;
  }

  try {
    setLoading(true);
    setError(null);

    console.log("Fetching meal plans for date:", selectedDate);
    console.log("User token:", localStorage.getItem('token')?.substring(0, 20) + "..."); // partial for security

    const response = await mealPlanAPI.getPlansByDate(selectedDate);

    console.log("API full response:", response);

    if (response.data?.success) {
      console.log("Plans received:", response.data.data);
      console.log("Number of plans:", response.data.data?.length || 0);
      setMealPlans(response.data.data || []);
      
      // Log the updated meal plans state
      setTimeout(() => {
        console.log("Updated meal plans state:", response.data.data);
      }, 100);
      
    } else {
      const serverMsg = response.data?.message || "No success flag in response";
      console.error("API returned unsuccessful:", serverMsg);
      setError(`Server responded with error: ${serverMsg}`);
    }
  } catch (err) {
    console.error("Fetch meal plans failed:", err);
    if (err.response) {
      // Server responded with error status (4xx/5xx)
      console.error("Response data:", err.response.data);
      console.error("Status:", err.response.status);
      setError(
        err.response.data?.message ||
        `Server error (${err.response.status})`
      );
    } else if (err.request) {
      // No response received (network/CORS/timeout)
      console.error("No response received - possible CORS or network issue");
      setError("Cannot reach the server. Check your internet or if backend is running.");
    } else {
      setError("Unexpected error: " + err.message);
    }
  } finally {
    setLoading(false);
  }
};

  // Render Functions
  const renderCalendarView = () => {
    // Simple calendar view
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateStr = date.toISOString().split('T')[0];
      days.push(dateStr);
    }

    // Check if there are any meals in the current month
    const hasAnyMeals = days.some(dateStr => {
      const dayMeals = calendarMeals[dateStr] || {};
      return Object.values(dayMeals).some(meal => meal !== null);
    });

    return (
      <Box>
        {!hasAnyMeals ? (
          <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
            <CalendarToday sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No meals planned this month
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Start planning your meals by adding your first meal plan
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenDialog(true)}
            >
              Add Your First Meal
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {days.map((dateStr) => {
              const dayMeals = calendarMeals[dateStr] || {};
              const isSelected = dateStr === selectedDate;
              
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={dateStr}>
                  <Card 
                    sx={{ 
                      height: 200, 
                      cursor: 'pointer',
                      border: isSelected ? '2px solid primary.main' : '1px solid grey.300'
                    }}
                    onClick={() => setSelectedDate(dateStr)}
                  >
                    <CardContent sx={{ p: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        {new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {['breakfast', 'lunch', 'dinner'].map((mealType) => (
                          <Box
                            key={mealType}
                            sx={{
                              border: '1px dashed grey.300',
                              borderRadius: 1,
                              p: 0.5,
                              minHeight: 40,
                              display: 'flex',
                              alignItems: 'center',
                              bgcolor: dayMeals[mealType] ? 'primary.light' : 'transparent'
                            }}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, dateStr, mealType)}
                          >
                            {dayMeals[mealType] ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                {getMealIcon(mealType)}
                                <Typography variant="caption" sx={{ fontSize: 10 }}>
                                  {dayMeals[mealType].planName || 'Unnamed meal'}
                                </Typography>
                              </Box>
                            ) : (
                              <Typography variant="caption" color="text.secondary">
                                {mealType}
                              </Typography>
                            )}
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>
    );
  };

  const renderMealCards = () => {
    const filteredMeals = getFilteredMeals();
    
    return (
      <Box>
        {/* Search and Filter Bar */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Search meals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
              }}
              sx={{ minWidth: 200 }}
            />
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Filter</InputLabel>
              <Select
                value={filterMealType}
                onChange={(e) => setFilterMealType(e.target.value)}
              >
                <MenuItem value="ALL">All Meals</MenuItem>
                {mealTypes.map(type => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
              <Tooltip title="Export Meal Plan">
                <IconButton size="small" onClick={exportMealPlan}>
                  <Download />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Import Meal Plan">
                <IconButton size="small" component="label">
                  <Upload />
                  <input type="file" hidden accept=".json" onChange={importMealPlan} />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Share Meal Plan">
                <IconButton size="small" onClick={shareMealPlan}>
                  <Share />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Paper>

        {/* Empty State */}
        {filteredMeals.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
            <Restaurant sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No meals found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {searchQuery || filterMealType !== 'ALL' 
                ? 'Try adjusting your search or filters'
                : 'Start by adding your first meal plan'
              }
            </Typography>
            {!searchQuery && filterMealType === 'ALL' && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setOpenDialog(true)}
              >
                Add Your First Meal
              </Button>
            )}
          </Paper>
        ) : (
          /* Enhanced Meal Cards Grid */
          <Grid container spacing={3}>
            {filteredMeals.map((meal) => (
              <Grid item xs={12} sm={6} md={4} key={`meal-${meal.id || Math.random()}`}>
                <Card
                  draggable
                  onDragStart={() => handleDragStart(meal)}
                  sx={{ 
                    cursor: 'grab', 
                    '&:dragging': { opacity: 0.5 },
                    position: 'relative',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)' }
                  }}
                >
                  {/* Favorite Badge */}
                  <IconButton
                    sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
                    onClick={() => toggleFavorite(meal.id)}
                  >
                    <Favorite color={favorites.includes(meal.id) ? 'error' : 'action'} />
                  </IconButton>

                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {getMealIcon(meal.mealType)}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {meal.planName}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                          <Chip 
                            label={meal.mealType}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          {meal.isRecommended && (
                            <Chip 
                              icon={<Star />}
                              label="AI Recommended"
                              size="small"
                              color="secondary"
                            />
                          )}
                        </Box>
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {meal.planDate ? format(new Date(meal.planDate), 'MMM dd, yyyy') : 'Date not set'}
                    </Typography>
                    
                    {/* Enhanced Stats */}
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <Chip 
                        icon={<LocalFireDepartment />} 
                        label={`${meal.calories || 0} cal`} 
                        size="small" 
                        color="error" 
                      />
                      <Chip 
                        icon={<AttachMoney />} 
                        label={`$${meal.estimatedCost || 0}`} 
                        size="small" 
                        color="success" 
                      />
                      <Chip 
                        icon={<Timer />} 
                        label={`${mealPrepTime} min`} 
                        size="small" 
                        color="info" 
                      />
                    </Box>
                    
                    {/* Dietary Preferences */}
                    {dietaryPreferences.length > 0 && (
                      <Box sx={{ display: 'flex', gap: 0.5, mb: 2, flexWrap: 'wrap' }}>
                        {dietaryPreferences.map((pref, index) => (
                          <Chip
                            key={`${pref}-${index}`}
                            label={getDietaryIcon(pref) + ' ' + pref}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    )}
                    
                    {meal.aiRecommendation && (
                      <Alert severity="info" sx={{ mb: 2 }}>
                        <Typography variant="caption">
                          {meal.aiRecommendation}
                        </Typography>
                      </Alert>
                    )}
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Ingredients:</strong> {meal.ingredients || 'Not specified'}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between' }}>
                      <Box>
                        <IconButton size="small" color="primary" onClick={() => handleEdit(meal)}>
                          <Edit />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDelete(meal.id)}>
                          <Delete />
                        </IconButton>
                      </Box>
                      <IconButton size="small">
                        <DragIndicator />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    );
  };

  const isFormValid = () =>
    formData.planName.trim() !== '' &&
    formData.mealType &&
    formData.ingredients.trim() !== '' &&
    formData.instructions.trim() !== '';

  const handleSaveMealPlan = async () => {
    if (!isFormValid()) {
      showSnackbar('Please fill in all required fields', 'error');
      return;
    }

    try {
      const planData = {
        ...formData,
        planDate: selectedDate,
        calories: aiRecommendation?.calories || 400,
        estimatedCost: aiRecommendation?.estimatedCost || 150, // NPR default
        aiRecommendation: aiRecommendation?.aiRecommendation || '',
        isRecommended: !!aiRecommendation,
      };

      console.log("Saving meal plan data:", planData);

      if (editingPlan && editingPlan.id) {
        const response = await mealPlanAPI.update(editingPlan.id, planData);
        console.log("Update response:", response);
        showSnackbar('Meal plan updated successfully!');
      } else {
        const response = await mealPlanAPI.create(planData);
        console.log("Create response:", response);
        showSnackbar('Meal plan created successfully!');
      }

      setOpenDialog(false);
      setEditingPlan(null);
      setAiRecommendation(null);
      setFormData({
        planName: '',
        mealType: 'BREAKFAST',
        ingredients: '',
        instructions: '',
      });
      
      // Force refresh the meal plans
      console.log("Refreshing meal plans after save...");
      await fetchMealPlans();
      
    } catch (err) {
      showSnackbar('Failed to save meal plan', 'error');
      console.error('Error saving meal plan:', err);
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      planName: plan.planName || '',
      mealType: plan.mealType || 'BREAKFAST',
      ingredients: plan.ingredients || '',
      instructions: plan.instructions || '',
    });
    setOpenDialog(true);
  };

  const handleDelete = async (planId) => {
    if (!planId) {
      showSnackbar('Invalid meal ID', 'error');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this meal plan?')) return;

    try {
      await mealPlanAPI.delete(planId);
      fetchMealPlans();
      showSnackbar('Meal plan deleted successfully!');
    } catch (err) {
      showSnackbar('Failed to delete meal plan', 'error');
      console.error('Error deleting meal plan:', err);
    }
  };

  const handleOpenDialog = () => {
    setEditingPlan(null);
    setAiRecommendation(null);
    setFormData({
      planName: '',
      mealType: 'BREAKFAST',
      ingredients: '',
      instructions: '',
    });
    setOpenDialog(true);
  };

  const getMealTypeIcon = (mealType) => {
    switch (mealType) {
      case 'BREAKFAST': return '🌅';
      case 'LUNCH':     return '☀️';
      case 'DINNER':    return '🌙';
      case 'SNACK':     return '🍿';
      default:          return '🍽️';
    }
  };

  const getMealTypeColor = (mealType) => {
    switch (mealType) {
      case 'BREAKFAST': return 'warning';
      case 'LUNCH':     return 'info';
      case 'DINNER':    return 'secondary';
      case 'SNACK':     return 'success';
      default:          return 'primary';
    }
  };

  if (loading && mealPlans.length === 0) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Enhanced Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          🍽️ Smart Meal Planning System
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Plan your meals with AI recommendations, drag-and-drop calendar, and advanced analytics
        </Typography>
      </Box>

      {/* Weekly Stats Dashboard */}
      {showStats && (
        <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.50' }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUp /> Weekly Analytics
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">{weeklyStats.totalCalories}</Typography>
                <Typography variant="body2" color="text.secondary">Total Calories</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">${weeklyStats.totalCost.toFixed(2)}</Typography>
                <Typography variant="body2" color="text.secondary">Total Cost</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="info.main">{weeklyStats.mealsCompleted}</Typography>
                <Typography variant="body2" color="text.secondary">Meals Completed</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">{getProgressPercentage().toFixed(0)}%</Typography>
                <Typography variant="body2" color="text.secondary">Daily Goal Progress</Typography>
              </Box>
            </Grid>
          </Grid>
          <LinearProgress 
            variant="determinate" 
            value={getProgressPercentage()} 
            sx={{ mt: 2, height: 8, borderRadius: 4 }}
          />
        </Paper>
      )}

      {/* Enhanced Smart Planning Controls */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <RestaurantMenu /> Planning Controls
        </Typography>
        
        <Accordion sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>Advanced Settings</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Prep Time (min)"
                  type="number"
                  value={mealPrepTime}
                  onChange={(e) => setMealPrepTime(Number(e.target.value))}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Dietary Preferences</InputLabel>
                  <Select
                    multiple
                    value={dietaryPreferences}
                    onChange={(e) => setDietaryPreferences(e.target.value)}
                    renderValue={(selected) => selected.join(', ')}
                  >
                    <MenuItem value="balanced">Balanced</MenuItem>
                    <MenuItem value="vegetarian">Vegetarian</MenuItem>
                    <MenuItem value="vegan">Vegan</MenuItem>
                    <MenuItem value="gluten-free">Gluten-Free</MenuItem>
                    <MenuItem value="keto">Keto</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            label="Select Date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Planning Mode</InputLabel>
            <Select
              value={planningMode}
              onChange={(e) => setPlanningMode(e.target.value)}
            >
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            label="Budget ($)"
            type="number"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            sx={{ width: 120 }}
            size="small"
          />
          
          <TextField
            label="Daily Calories"
            type="number"
            value={dailyCalorieTarget}
            onChange={(e) => setDailyCalorieTarget(Number(e.target.value))}
            sx={{ width: 150 }}
            size="small"
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<AutoAwesome />}
            onClick={() => setOpenAiDialog(true)}
          >
            AI Recommendations
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
          >
            Add Meal Plan
          </Button>

          <Button
            variant="outlined"
            startIcon={<ShoppingCart />}
            onClick={() => setShowShoppingList(true)}
          >
            Shopping List ({shoppingList.length})
          </Button>

          <Button
            variant="text"
            startIcon={<TrendingUp />}
            onClick={() => setShowStats(!showStats)}
          >
            {showStats ? 'Hide' : 'Show'} Stats
          </Button>
        </Box>
      </Paper>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Enhanced Tabs */}
      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Calendar View" icon={<CalendarToday />} />
        <Tab label="Meal Cards" icon={<Restaurant />} />
        <Tab 
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              Favorites
              {favorites.length > 0 && (
                <Chip 
                  label={favorites.length} 
                  size="small" 
                  color="secondary" 
                  sx={{ height: 20, minWidth: 20 }}
                />
              )}
            </Box>
          } 
          icon={<Favorite />} 
        />
      </Tabs>

      {/* Content based on active tab */}
      {activeTab === 0 && renderCalendarView()}
      {activeTab === 1 && renderMealCards()}
      {activeTab === 2 && (
        <Grid container spacing={3}>
          {mealPlans.filter(meal => favorites.includes(meal.id)).map(meal => (
            <Grid item xs={12} sm={6} md={4} key={meal.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{meal.planName}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {meal.mealType} • {meal.calories} cal
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* AI Recommendation Dialog */}
      <Dialog 
        open={openAiDialog} 
        onClose={() => setOpenAiDialog(false)} 
        maxWidth="md" 
        fullWidth
        disableEnforceFocus
        disableAutoFocus
      >
        <DialogTitle>AI Meal Recommendations</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {['BREAKFAST', 'LUNCH', 'DINNER'].map((mealType) => (
              <Card key={mealType} sx={{ cursor: 'pointer' }} onClick={() => handleGenerateAIRecommendation(mealType)}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {getMealIcon(mealType)}
                    <Box>
                      <Typography variant="h6">{mealType}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {estimateCalories(mealType)} cal • ${estimateCost(mealType)}
                      </Typography>
                    </Box>
                    <IconButton sx={{ ml: 'auto' }}>
                      <AutoAwesome />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAiDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* AI Recommendation Result Dialog */}
      {aiRecommendation && (
        <Dialog 
          open={true} 
          onClose={() => setAiRecommendation(null)} 
          maxWidth="md" 
          fullWidth
          disableEnforceFocus
          disableAutoFocus
        >
          <DialogTitle>AI Recommendation</DialogTitle>
          <DialogContent>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {aiRecommendation.planName}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip icon={<LocalFireDepartment />} label={`${aiRecommendation.calories} cal`} />
                  <Chip icon={<AttachMoney />} label={`$${aiRecommendation.estimatedCost}`} />
                </Box>
                
                <Alert severity="info">
                  {aiRecommendation.aiRecommendation}
                </Alert>
              </CardContent>
            </Card>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAiRecommendation(null)}>Cancel</Button>
            <Button onClick={handleSaveAIRecommendation} variant="contained">
              Save Meal Plan
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Add/Edit Meal Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="sm" 
        fullWidth
        disableEnforceFocus
        disableAutoFocus
      >
        <DialogTitle>{editingPlan ? 'Edit Meal Plan' : 'Add Meal Plan'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Meal Name"
              value={formData.planName}
              onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
              margin="normal"
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Meal Type</InputLabel>
              <Select
                value={formData.mealType}
                onChange={(e) => setFormData({ ...formData, mealType: e.target.value })}
              >
                {mealTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Ingredients"
              multiline
              rows={3}
              value={formData.ingredients}
              onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
              margin="normal"
            />
            
            <TextField
              fullWidth
              label="Instructions"
              multiline
              rows={3}
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveMealPlan} variant="contained" disabled={!isFormValid()}>
            {editingPlan ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Shopping List Dialog */}
      <Dialog 
        open={showShoppingList} 
        onClose={() => setShowShoppingList(false)} 
        maxWidth="sm" 
        fullWidth
        disableEnforceFocus
        disableAutoFocus
      >
        <DialogTitle>Shopping List</DialogTitle>
        <DialogContent>
          {shoppingList.length > 0 ? (
            <Box>
              {shoppingList.map((item, index) => (
                <Box key={`shopping-item-${index}`} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
                  <Checkbox
                    checked={item.checked}
                    onChange={(e) => {
                      const updatedList = [...shoppingList];
                      updatedList[index].checked = e.target.checked;
                      setShoppingList(updatedList);
                    }}
                  />
                  <Typography sx={{ flexGrow: 1 }}>{item.ingredient}</Typography>
                  <Chip label={`x${item.quantity}`} size="small" />
                </Box>
              ))}
            </Box>
          ) : (
            <Typography color="text.secondary">No items in shopping list</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowShoppingList(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Enhanced Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        TransitionComponent={Slide}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MealPlanner;
