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
  Fab,
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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  FormControlLabel,
  Slider,
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
  Save,
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
import { mealPlanAPI, productAPI } from '../services/api';
import { format } from 'date-fns';

const MealPlanner = () => {
  const { user } = useAuth();
  const theme = useTheme();

  const [mealPlans, setMealPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [availableProducts, setAvailableProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
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
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [mealPrepTime, setMealPrepTime] = useState(30); // minutes
  const [dietaryPreferences, setDietaryPreferences] = useState(['balanced']);

  const [formData, setFormData] = useState({
    planName: '',
    mealType: 'BREAKFAST',
    ingredients: '',
    instructions: '',
  });

  const mealTypes = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];

  useEffect(() => {
    fetchMealPlans();
    fetchAvailableProducts();
  }, [selectedDate]);

  // Organize meals for calendar view
  useEffect(() => {
    organizeCalendarMeals();
  }, [mealPlans]);

  
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

  const getDietaryIcon = (preference) => {
    switch (preference) {
      case 'vegetarian': return '🥗';
      case 'vegan': return '🌱';
      case 'gluten-free': return '🌾';
      case 'keto': return '🥑';
      default: return '⚖️';
    }
  };

  
  const organizeCalendarMeals = () => {
    console.log('Organizing calendar meals. Current mealPlans:', mealPlans);
    const organized = {};
    
    // Get meals from local storage (fallback for backend API issues)
    const localMeals = JSON.parse(localStorage.getItem('userMealPlans') || '[]');
    console.log('Local meals from storage:', localMeals);
    
    // Process local storage meals first
    localMeals.forEach(meal => {
      const date = meal.planDate;
      const mealName = meal.planName || 'Unnamed meal';
      const mealType = meal.mealType || 'breakfast';
      
      console.log(`Processing local meal - Date: ${date}, Name: ${mealName}, Type: ${mealType}`);
      
      if (date) {
        if (!organized[date]) {
          organized[date] = { breakfast: [], lunch: [], dinner: [], snack: [] };
        }
        
        const mealTypeLower = mealType.toLowerCase();
        console.log(`Adding local meal to ${date} - ${mealTypeLower}: ${mealName}`);
        organized[date][mealTypeLower].push(meal);
      }
    });
    
    // Process API data if it's correct (but skip user order data)
    mealPlans.forEach(plan => {
      console.log('Processing API meal plan:', plan);
      
      // Check if this looks like meal plan data (has meal plan fields)
      if (plan.planName || plan.name || plan.planDate || plan.mealType) {
        const mealData = plan.data || plan;
        const date = mealData.planDate || mealData.date;
        const mealName = mealData.planName || mealData.name || 'Unnamed meal';
        const mealType = mealData.mealType || mealData.type || 'breakfast';
        
        console.log(`Found meal plan data - Date: ${date}, Name: ${mealName}, Type: ${mealType}`);
        
        if (date) {
          if (!organized[date]) {
            organized[date] = { breakfast: [], lunch: [], dinner: [], snack: [] };
          }
          
          const mealTypeLower = mealType.toLowerCase();
          console.log(`Adding API meal to ${date} - ${mealTypeLower}: ${mealName}`);
          organized[date][mealTypeLower].push(mealData);
        }
      } else {
        console.log('Skipping user/order data, not meal plan data:', plan);
      }
    });
    
    console.log('Final organized calendarMeals:', organized);
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
  };

  const estimateCalories = (mealType) => {
    // Add null check for mealType
    const type = mealType ? mealType.toLowerCase() : 'breakfast';
    switch (type) {
      case 'breakfast': return 400;
      case 'lunch': return 600;
      case 'dinner': return 700;
      case 'snack': return 200;
      default: return 500;
    }
  };

  const estimateCost = (mealType) => {
    // Direct rupee prices
    const type = mealType ? mealType.toLowerCase() : 'breakfast';
    switch (type) {
      case 'breakfast': return 850;   // Rs 850
      case 'lunch': return 1275;      // Rs 1,275
      case 'dinner': return 1525;     // Rs 1,525
      case 'snack': return 425;       // Rs 425
      default: return 1050;          // Rs 1,050
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

  // Fetch available products for meal selection
  const fetchAvailableProducts = async () => {
    try {
      setProductsLoading(true);
      const response = await productAPI.getAll();
      if (response.data?.success) {
        setAvailableProducts(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setProductsLoading(false);
    }
  };

  // Fetch meal plans from API
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
      
      // Log detailed structure of first plan
      if (response.data.data && response.data.data.length > 0) {
        console.log("First plan structure:", JSON.stringify(response.data.data[0], null, 2));
        console.log("First plan keys:", Object.keys(response.data.data[0]));
        console.log("First plan user keys:", response.data.data[0].user ? Object.keys(response.data.data[0].user) : 'No user field');
      }
      
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
    // Get all unique dates that have meals
    const allMealDates = Object.keys(calendarMeals).filter(date => {
      const dayMeals = calendarMeals[date] || {};
      return Object.values(dayMeals).some(meal => meal !== null);
    });

    // Sort dates chronologically
    allMealDates.sort((a, b) => new Date(a) - new Date(b));

    return (
      <Box>
        {allMealDates.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
            <CalendarToday sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No meals planned yet
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
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              All Your Planned Meals ({allMealDates.length} {allMealDates.length === 1 ? 'day' : 'days'})
            </Typography>
            
            <Grid container spacing={3}>
              {allMealDates.map((dateStr) => {
                const dayMeals = calendarMeals[dateStr] || {};
                const isSelected = dateStr === selectedDate;
                const dateObj = new Date(dateStr);
                
                return (
                  <Grid item xs={12} sm={6} md={4} key={dateStr}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        border: isSelected ? '3px solid primary.main' : '1px solid grey.300',
                        '&:hover': { 
                          boxShadow: 4,
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.2s ease-in-out'
                      }}
                      onClick={() => setSelectedDate(dateStr)}
                    >
                      <CardContent sx={{ p: 2 }}>
                        {/* Date Header */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6" fontWeight={600} color="primary.main">
                            {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                          </Typography>
                        </Box>
                        
                        {/* Year for different years */}
                        {dateObj.getFullYear() !== new Date().getFullYear() && (
                          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                            {dateObj.getFullYear()}
                          </Typography>
                        )}
                        
                        {/* Meals for this day */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                          {['breakfast', 'lunch', 'dinner', 'snack'].map((mealType) => {
                            const meals = dayMeals[mealType] || [];
                            console.log(`Rendering ${dateStr} ${mealType}:`, meals);
                            
                            if (meals.length === 0) return null;
                            
                            return (
                              <Box key={mealType}>
                                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, textTransform: 'uppercase' }}>
                                  {mealType.charAt(0).toUpperCase() + mealType.slice(1)} ({meals.length})
                                </Typography>
                                {meals.map((meal, mealIndex) => (
                                  <Box
                                    key={`${mealType}-${mealIndex}`}
                                    sx={{
                                      border: '1px solid',
                                      borderColor: 'primary.light',
                                      borderRadius: 2,
                                      p: 1.5,
                                      bgcolor: 'primary.50',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 1,
                                      mb: 0.5,
                                      position: 'relative'
                                    }}
                                  >
                                    {getMealIcon(mealType)}
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                      <Typography variant="subtitle2" fontWeight={500} noWrap>
                                        {meal.planName || 'Unnamed meal'}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {meal.calories || 0} cal · Rs {meal.estimatedCost || 0}
                                      </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                      <IconButton
                                        size="small"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditMeal(meal);
                                        }}
                                        sx={{ 
                                          color: 'primary.main',
                                          '&:hover': { bgcolor: 'primary.light' }
                                        }}
                                      >
                                        <Edit fontSize="small" />
                                      </IconButton>
                                      <IconButton
                                        size="small"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteMeal(meal, dateStr, mealType);
                                        }}
                                        sx={{ 
                                          color: 'error.main',
                                          '&:hover': { bgcolor: 'error.light' }
                                        }}
                                      >
                                        <Delete fontSize="small" />
                                      </IconButton>
                                    </Box>
                                  </Box>
                                ))}
                              </Box>
                            );
                          })}
                          
                          {/* If no meals for this day */}
                          {Object.values(dayMeals).every(meals => meals.length === 0) && (
                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                              No meals planned
                            </Typography>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
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
      
      // Create the new meal object
      const newMeal = {
        ...planData,
        id: Date.now(), // Temporary ID
        createdAt: new Date().toISOString()
      };
      
      // Save to local storage as backup (for when API returns wrong data)
      const existingMeals = JSON.parse(localStorage.getItem('userMealPlans') || '[]');
      const updatedMeals = [...existingMeals, newMeal];
      localStorage.setItem('userMealPlans', JSON.stringify(updatedMeals));
      console.log("Saved meal to local storage:", updatedMeals);
      
      // Trigger calendar reorganization to show the new meal
      organizeCalendarMeals();
      
    } catch (err) {
      showSnackbar('Failed to save meal plan', 'error');
      console.error('Error saving meal plan:', err);
    }
  };

  const handleEditMeal = (meal) => {
    console.log('Editing meal:', meal);
    setEditingPlan(meal);
    setFormData({
      planName: meal.planName || '',
      mealType: meal.mealType || 'BREAKFAST',
      ingredients: meal.ingredients || '',
      instructions: meal.instructions || '',
    });
    setSelectedDate(meal.planDate);
    setOpenDialog(true);
  };

  const handleDeleteMeal = (meal, date, mealType) => {
    console.log('Deleting meal:', meal, 'from date:', date, 'type:', mealType);
    
    // Remove from local storage
    const existingMeals = JSON.parse(localStorage.getItem('userMealPlans') || '[]');
    const updatedMeals = existingMeals.filter(m => 
      !(m.planName === meal.planName && 
        m.planDate === meal.planDate && 
        m.mealType === meal.mealType &&
        m.ingredients === meal.ingredients)
    );
    localStorage.setItem('userMealPlans', JSON.stringify(updatedMeals));
    
    // Remove from calendar meals state
    setCalendarMeals(prev => {
      const updated = { ...prev };
      if (updated[date] && updated[date][mealType]) {
        updated[date][mealType] = updated[date][mealType].filter(m => 
          !(m.planName === meal.planName && 
            m.planDate === meal.planDate && 
            m.mealType === meal.mealType &&
            m.ingredients === meal.ingredients)
        );
      }
      return updated;
    });
    
    // Remove from meal plans state
    setMealPlans(prev => prev.filter(m => 
      !(m.planName === meal.planName && 
        m.planDate === meal.planDate && 
        m.mealType === meal.mealType &&
        m.ingredients === meal.ingredients)
    ));
    
    showSnackbar('Meal deleted successfully!', 'success');
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
      </Tabs>

      {/* Content based on active tab */}
      {activeTab === 0 && renderCalendarView()}

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
                  <Typography variant="h6">{mealType}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {estimateCalories(mealType)} cal · Rs {estimateCost(mealType)}
                  </Typography>
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
                  <Chip icon={<AttachMoney />} label={`Rs ${aiRecommendation.estimatedCost}`} />
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
            {/* Available Products Section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Choose from Available Meals
              </Typography>
              {productsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <Box sx={{ maxHeight: 300, overflowY: 'auto', mb: 2 }}>
                  {availableProducts.length > 0 ? (
                    <Grid container spacing={2}>
                      {availableProducts.map((product) => (
                        <Grid item xs={12} sm={6} key={product.id}>
                          <Card 
                            sx={{ 
                              cursor: 'pointer',
                              border: '1px solid',
                              borderColor: 'divider',
                              '&:hover': { 
                                bgcolor: 'primary.50', 
                                borderColor: 'primary.main',
                                transform: 'translateY(-2px)'
                              },
                              transition: 'all 0.2s ease-in-out'
                            }}
                            onClick={() => {
                              setFormData({
                                planName: product.name,
                                mealType: 'BREAKFAST',
                                ingredients: product.description || 'Available from ' + (product.vendor?.name || product.vendor || 'Unknown vendor'),
                                instructions: 'Order from ' + (product.vendor?.name || product.vendor || 'Unknown vendor')
                              });
                            }}
                          >
                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                              <Typography variant="subtitle2" fontWeight={600} noWrap>
                                {product.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {product.vendor?.name || product.vendor || 'Unknown vendor'}
                              </Typography>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body1" fontWeight={500} color="primary.main">
                                  Rs {product.price}
                                </Typography>
                                {product.category && (
                                  <Chip size="small" label={product.category} variant="outlined" />
                                )}
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
                      <Restaurant sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        No available meals found
                      </Typography>
                    </Paper>
                  )}
                </Box>
              )}
              
              <Divider sx={{ my: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  OR create custom meal
                </Typography>
              </Divider>
            </Box>

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

      
      {/* AI Recommendations Dialog */}
      <Dialog 
        open={openAiDialog} 
        onClose={() => setOpenAiDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesome color="primary" />
            AI Meal Recommendations
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Get personalized AI-powered meal recommendations based on your preferences and dietary needs
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {mealTypes.map((mealType) => (
                <Grid item xs={12} sm={6} key={mealType}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      border: '2px solid',
                      borderColor: 'divider',
                      '&:hover': { 
                        bgcolor: 'primary.50', 
                        borderColor: 'primary.main',
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                    onClick={() => handleGenerateAIRecommendation(mealType)}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <Avatar sx={{ 
                        bgcolor: 'primary.main', 
                        mx: 'auto', 
                        mb: 1,
                        width: 48,
                        height: 48
                      }}>
                        {getMealIcon(mealType)}
                      </Avatar>
                      <Typography variant="h6" gutterBottom>
                        {mealType}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {generateRecommendationText(mealType)}
                      </Typography>
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <Chip size="small" icon={<LocalFireDepartment />} label={`${estimateCalories(mealType)} cal`} />
                        <Chip size="small" icon={<AttachMoney />} label={`Rs ${estimateCost(mealType)}`} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            
            {aiRecommendation && (
              <Paper sx={{ p: 2, bgcolor: 'success.50', border: '1px solid', borderColor: 'success.light' }}>
                <Typography variant="h6" gutterBottom color="success.main">
                  AI Recommendation Generated!
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {aiRecommendation.planName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {aiRecommendation.aiRecommendation}
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                  <Button 
                    variant="contained" 
                    onClick={handleSaveAIRecommendation}
                    startIcon={<Save />}
                  >
                    Save to Meal Plan
                  </Button>
                  <Button 
                    variant="outlined" 
                    onClick={() => setAiRecommendation(null)}
                  >
                    Generate Another
                  </Button>
                </Box>
              </Paper>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAiDialog(false)}>Close</Button>
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
