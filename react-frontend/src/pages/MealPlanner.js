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

  const [formData, setFormData] = useState({
    planName: '',
    mealType: 'BREAKFAST',
    ingredients: '',
    instructions: '',
  });

  const mealTypes = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];

  useEffect(() => {
    fetchMealPlans();
  }, [selectedDate]);

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
      setMealPlans(response.data.data || []);
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

  const handleGenerateAIRecommendation = async () => {
    if (
      formData.planName.trim() ||
      formData.ingredients.trim() ||
      formData.instructions.trim()
    ) {
      if (!window.confirm('Generate new AI suggestion? Current fields will be overwritten.')) {
        return;
      }
    }

    try {
      const response = await mealPlanAPI.getAIRecommendation(
        formData.mealType,
        selectedDate
      );
      if (response.data?.success) {
        const rec = response.data.data;
        setAiRecommendation(rec);
        // Optional: auto-fill form fields from AI response
        setFormData((prev) => ({
          ...prev,
          planName: rec.suggestedName || `AI ${formData.mealType} Suggestion`,
          ingredients: rec.ingredients || prev.ingredients,
          instructions: rec.instructions || prev.instructions,
        }));
      }
    } catch (err) {
      setError('Failed to generate AI recommendation');
      console.error('Error generating AI recommendation:', err);
    }
  };

  const isFormValid = () =>
    formData.planName.trim() !== '' &&
    formData.mealType &&
    formData.ingredients.trim() !== '' &&
    formData.instructions.trim() !== '';

  const handleSaveMealPlan = async () => {
    if (!isFormValid()) {
      setError('Please fill in all required fields');
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

      if (editingPlan) {
        await mealPlanAPI.update(editingPlan.id, planData);
      } else {
        await mealPlanAPI.create(planData);
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
      fetchMealPlans();
    } catch (err) {
      setError('Failed to save meal plan');
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
    if (!window.confirm('Are you sure you want to delete this meal plan?')) return;

    try {
      await mealPlanAPI.delete(planId);
      fetchMealPlans();
    } catch (err) {
      setError('Failed to delete meal plan');
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          🍽️ Smart Meal Planner
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Plan your meals with AI-powered recommendations
        </Typography>
      </Box>

      {/* Date & Add Button */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          type="date"
          label="Select Date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          InputProps={{
            startAdornment: <CalendarToday sx={{ mr: 1, color: 'action.active' }} />,
          }}
        />
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenDialog}
        >
          Add Meal Plan
        </Button>
      </Box>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Meal Plans Grid */}
      <Grid container spacing={3}>
        {mealPlans.map((plan) => (
          <Grid item xs={12} sm={6} md={4} key={plan.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                border: plan.isRecommended ? `2px solid ${theme.palette.success.main}` : 'none',
              }}
            >
              {plan.isRecommended && (
                <Chip
                  icon={<AutoAwesome />}
                  label="AI Recommended"
                  color="success"
                  size="small"
                  sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1 }}
                />
              )}

              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h2" sx={{ mr: 1 }}>
                    {getMealTypeIcon(plan.mealType)}
                  </Typography>
                  <Box>
                    <Typography variant="h6" component="h3">
                      {plan.planName}
                    </Typography>
                    <Chip
                      label={plan.mealType}
                      color={getMealTypeColor(plan.mealType)}
                      size="small"
                    />
                  </Box>
                </Box>

                {plan.aiRecommendation && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      {plan.aiRecommendation}
                    </Typography>
                  </Alert>
                )}

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Ingredients:</strong> {plan.ingredients || 'Not specified'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Instructions:</strong> {plan.instructions || 'Not specified'}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip
                    icon={<LocalFireDepartment />}
                    label={`${plan.calories || 0} cal`}
                    size="small"
                    color="warning"
                    variant="outlined"
                  />
                  <Chip
                    icon={<AttachMoney />}
                    label={`NPR ${(plan.estimatedCost || 0).toFixed(0)}`}
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                  <Button
                    size="small"
                    startIcon={<Edit />}
                    onClick={() => handleEdit(plan)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<Delete />}
                    onClick={() => handleDelete(plan.id)}
                  >
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {mealPlans.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Restaurant sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No meal plans for this date
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Create your first meal plan or generate AI recommendations
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenDialog}
            sx={{ mt: 2 }}
          >
            Create Meal Plan
          </Button>
        </Box>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPlan ? 'Edit Meal Plan' : 'Create Meal Plan'}
          <IconButton
            onClick={() => setOpenDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Plan Name"
              fullWidth
              value={formData.planName}
              onChange={(e) => setFormData((prev) => ({ ...prev, planName: e.target.value }))}
              required
            />

            <TextField
              select
              label="Meal Type"
              fullWidth
              value={formData.mealType}
              onChange={(e) => setFormData((prev) => ({ ...prev, mealType: e.target.value }))}
              required
            >
              {mealTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {getMealTypeIcon(type)} {type}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Ingredients"
              fullWidth
              multiline
              rows={3}
              value={formData.ingredients}
              onChange={(e) => setFormData((prev) => ({ ...prev, ingredients: e.target.value }))}
              required
            />

            <TextField
              label="Instructions"
              fullWidth
              multiline
              rows={3}
              value={formData.instructions}
              onChange={(e) => setFormData((prev) => ({ ...prev, instructions: e.target.value }))}
              required
            />

            <Button
              variant="outlined"
              startIcon={<AutoAwesome />}
              onClick={handleGenerateAIRecommendation}
              disabled={!formData.mealType}
            >
              Generate AI Recommendation
            </Button>

            {aiRecommendation && (
              <Alert severity="success" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>AI Suggestion:</strong> {aiRecommendation.aiRecommendation}
                </Typography>
                <Typography variant="body2">
                  <strong>Calories:</strong> {aiRecommendation.calories} kcal
                </Typography>
                <Typography variant="body2">
                  <strong>Est. Cost:</strong> NPR {(aiRecommendation.estimatedCost || 0).toFixed(0)}
                </Typography>
              </Alert>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveMealPlan}
            disabled={!isFormValid()}
          >
            {editingPlan ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MealPlanner;