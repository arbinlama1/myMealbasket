package com.example.MealBasketSyatem.service;

import com.example.MealBasketSyatem.entity.MealPlan;
import com.example.MealBasketSyatem.entity.User;
import com.example.MealBasketSyatem.entity.Product;
import com.example.MealBasketSyatem.repo.MealPlanRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class MealPlanService {

    @Autowired
    private MealPlanRepo mealPlanRepo;

    public List<MealPlan> getAllMealPlans() {
        return mealPlanRepo.findAll();
    }

    public List<MealPlan> getMealPlansByUser(User user) {
        return mealPlanRepo.findByUserOrderByPlanDateDesc(user);
    }

    public List<MealPlan> getMealPlansByUserAndDate(User user, LocalDate date) {
        return mealPlanRepo.findByUserAndPlanDate(user, date);
    }

    public Optional<MealPlan> getMealPlanById(Long id) {
        return mealPlanRepo.findById(id);
    }

    public MealPlan createMealPlan(MealPlan mealPlan) {
        // Calculate estimated cost based on products
        if (mealPlan.getProducts() != null) {
            double totalCost = mealPlan.getProducts().stream()
                .mapToDouble(Product::getPrice)
                .sum();
            mealPlan.setEstimatedCost(totalCost);
        }
        
        return mealPlanRepo.save(mealPlan);
    }

    public MealPlan updateMealPlan(MealPlan mealPlan) {
        return mealPlanRepo.save(mealPlan);
    }

    public void deleteMealPlan(Long id) {
        mealPlanRepo.deleteById(id);
    }

    public List<MealPlan> getRecommendedMealPlans() {
        return mealPlanRepo.findByIsRecommendedTrue();
    }

    public List<MealPlan> getMealPlansInDateRange(LocalDate startDate, LocalDate endDate) {
        return mealPlanRepo.findByPlanDateBetween(startDate, endDate);
    }

    public List<MealPlan> getMealPlansByUserAndMealType(User user, String mealType) {
        return mealPlanRepo.findByUserAndMealType(user, mealType);
    }

    // AI Recommendation Methods
    public MealPlan generateAIRecommendation(User user, String mealType, LocalDate date) {
        MealPlan recommendation = new MealPlan();
        recommendation.setUser(user);
        recommendation.setPlanName("AI Recommended " + mealType);
        recommendation.setPlanDate(date);
        recommendation.setMealType(mealType);
        recommendation.setIsRecommended(true);
        
        // Simple AI recommendation logic (can be enhanced with ML)
        String aiRecommendation = generateRecommendationText(user, mealType);
        recommendation.setAiRecommendation(aiRecommendation);
        
        // Estimate calories and cost
        recommendation.setCalories(estimateCalories(mealType));
        recommendation.setEstimatedCost(estimateCost(mealType));
        
        return recommendation;
    }

    private String generateRecommendationText(User user, String mealType) {
        // Simple recommendation logic based on meal type
        switch (mealType.toLowerCase()) {
            case "breakfast":
                return "Recommended: High-protein breakfast with eggs and whole grain toast. Packed with vitamins and minerals to start your day energized.";
            case "lunch":
                return "Recommended: Balanced lunch with grilled chicken, quinoa, and mixed vegetables. Provides sustained energy for afternoon activities.";
            case "dinner":
                return "Recommended: Light dinner with baked fish, sweet potato, and steamed broccoli. Easy to digest and promotes better sleep.";
            case "snack":
                return "Recommended: Healthy snack with mixed nuts and Greek yogurt. Provides protein and healthy fats between meals.";
            default:
                return "Recommended: Balanced meal with lean protein, complex carbs, and fresh vegetables for optimal nutrition.";
        }
    }

    private Integer estimateCalories(String mealType) {
        switch (mealType.toLowerCase()) {
            case "breakfast": return 350;
            case "lunch": return 550;
            case "dinner": return 650;
            case "snack": return 200;
            default: return 450;
        }
    }

    private Double estimateCost(String mealType) {
        switch (mealType.toLowerCase()) {
            case "breakfast": return 8.50;
            case "lunch": return 12.75;
            case "dinner": return 15.25;
            case "snack": return 4.25;
            default: return 10.50;
        }
    }
}
