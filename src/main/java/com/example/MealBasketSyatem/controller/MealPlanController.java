package com.example.MealBasketSyatem.controller;

import com.example.MealBasketSyatem.dto.ApiResponse;
import com.example.MealBasketSyatem.entity.MealPlan;
import com.example.MealBasketSyatem.entity.User;
import com.example.MealBasketSyatem.service.MealPlanService;
import com.example.MealBasketSyatem.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/meal-plans")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class MealPlanController {

    @Autowired
    private MealPlanService mealPlanService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<MealPlan>>> getAllMealPlans() {
        try {
            List<MealPlan> mealPlans = mealPlanService.getAllMealPlans();
            return ResponseEntity.ok(ApiResponse.success("Meal plans retrieved successfully", mealPlans));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve meal plans: " + e.getMessage()));
        }
    }

    @GetMapping("/user")
    public ResponseEntity<ApiResponse<List<MealPlan>>> getUserMealPlans(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            // Get user from email (you'll need to implement this in UserService)
            User user = getUserFromDetails(userDetails);
            List<MealPlan> mealPlans = mealPlanService.getMealPlansByUser(user);
            return ResponseEntity.ok(ApiResponse.success("User meal plans retrieved successfully", mealPlans));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve user meal plans: " + e.getMessage()));
        }
    }

    @GetMapping("/user/date/{date}")
    public ResponseEntity<ApiResponse<List<MealPlan>>> getUserMealPlansByDate(
            @PathVariable String date, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = getUserFromDetails(userDetails);
            LocalDate planDate = LocalDate.parse(date);
            List<MealPlan> mealPlans = mealPlanService.getMealPlansByUserAndDate(user, planDate);
            return ResponseEntity.ok(ApiResponse.success("Meal plans for date retrieved", mealPlans));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid date format: " + e.getMessage()));
        }
    }

    @GetMapping("/user/meal-type/{mealType}")
    public ResponseEntity<ApiResponse<List<MealPlan>>> getUserMealPlansByType(
            @PathVariable String mealType, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = getUserFromDetails(userDetails);
            List<MealPlan> mealPlans = mealPlanService.getMealPlansByUserAndMealType(user, mealType);
            return ResponseEntity.ok(ApiResponse.success("Meal plans by type retrieved", mealPlans));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve meal plans by type: " + e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MealPlan>> createMealPlan(
            @RequestBody MealPlan mealPlan, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = getUserFromDetails(userDetails);
            mealPlan.setUser(user);
            MealPlan createdPlan = mealPlanService.createMealPlan(mealPlan);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Meal plan created successfully", createdPlan));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create meal plan: " + e.getMessage()));
        }
    }

    @PostMapping("/ai-recommendation")
    public ResponseEntity<ApiResponse<MealPlan>> generateAIRecommendation(
            @RequestParam String mealType, @RequestParam String date, 
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = getUserFromDetails(userDetails);
            LocalDate planDate = LocalDate.parse(date);
            MealPlan recommendation = mealPlanService.generateAIRecommendation(user, mealType, planDate);
            return ResponseEntity.ok(ApiResponse.success("AI recommendation generated", recommendation));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Failed to generate AI recommendation: " + e.getMessage()));
        }
    }

    @GetMapping("/recommended")
    public ResponseEntity<ApiResponse<List<MealPlan>>> getRecommendedMealPlans() {
        try {
            List<MealPlan> recommendedPlans = mealPlanService.getRecommendedMealPlans();
            return ResponseEntity.ok(ApiResponse.success("Recommended meal plans retrieved", recommendedPlans));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve recommended meal plans: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MealPlan>> updateMealPlan(
            @PathVariable Long id, @RequestBody MealPlan mealPlan, 
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            mealPlan.setId(id);
            MealPlan updatedPlan = mealPlanService.updateMealPlan(mealPlan);
            return ResponseEntity.ok(ApiResponse.success("Meal plan updated successfully", updatedPlan));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update meal plan: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMealPlan(
            @PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            mealPlanService.deleteMealPlan(id);
            return ResponseEntity.ok(ApiResponse.success("Meal plan deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete meal plan: " + e.getMessage()));
        }
    }

    // Helper method to get User from UserDetails
    private User getUserFromDetails(UserDetails userDetails) {
        String email = userDetails.getUsername();
        User user = userService.findUserByEmail(email);
        if (user == null) {
            throw new RuntimeException("User not found: " + email);
        }
        return user;
    }
}
