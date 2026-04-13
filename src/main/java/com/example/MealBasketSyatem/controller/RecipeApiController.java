package com.example.MealBasketSyatem.controller;

import com.example.MealBasketSyatem.dto.ApiResponse;
import com.example.MealBasketSyatem.entity.Recipe;
import com.example.MealBasketSyatem.entity.RecipeCategory;
import com.example.MealBasketSyatem.service.RecipeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recipes")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003"})
public class RecipeApiController {

    @Autowired
    private RecipeService recipeService;

    
    // Get all recipes for a vendor
    @GetMapping("/vendor/{vendorId}")
    public ResponseEntity<ApiResponse<List<Recipe>>> getVendorRecipes(@PathVariable Long vendorId) {
        try {
            List<Recipe> recipes = recipeService.getVendorRecipes(vendorId);
            return ResponseEntity.ok(ApiResponse.success("Recipes retrieved successfully", recipes));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve recipes: " + e.getMessage()));
        }
    }

    // Get recipe by ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Recipe>> getRecipeById(@PathVariable Long id) {
        try {
            Recipe recipe = recipeService.getRecipeById(id);
            if (recipe != null) {
                return ResponseEntity.ok(ApiResponse.success("Recipe retrieved successfully", recipe));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Recipe not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve recipe: " + e.getMessage()));
        }
    }

    // Create new recipe
    @PostMapping("/vendor/{vendorId}")
    public ResponseEntity<ApiResponse<Recipe>> createRecipe(@PathVariable Long vendorId, 
                                                           @RequestBody Map<String, Object> recipeData) {
        try {
            Recipe recipe = recipeService.createRecipe(vendorId, recipeData);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Recipe created successfully", recipe));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create recipe: " + e.getMessage()));
        }
    }

    // Update recipe
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Recipe>> updateRecipe(@PathVariable Long id, 
                                                           @RequestBody Map<String, Object> recipeData) {
        try {
            Recipe recipe = recipeService.updateRecipe(id, recipeData);
            return ResponseEntity.ok(ApiResponse.success("Recipe updated successfully", recipe));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update recipe: " + e.getMessage()));
        }
    }

    // Delete recipe (soft delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteRecipe(@PathVariable Long id) {
        try {
            boolean deleted = recipeService.deleteRecipe(id);
            if (deleted) {
                return ResponseEntity.ok(ApiResponse.success("Recipe deleted successfully", "Recipe deleted"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Recipe not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete recipe: " + e.getMessage()));
        }
    }

    // Search recipes
    @GetMapping("/vendor/{vendorId}/search")
    public ResponseEntity<ApiResponse<List<Recipe>>> searchRecipes(@PathVariable Long vendorId,
                                                                   @RequestParam String q) {
        try {
            List<Recipe> recipes = recipeService.searchRecipes(vendorId, q);
            return ResponseEntity.ok(ApiResponse.success("Recipes retrieved successfully", recipes));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to search recipes: " + e.getMessage()));
        }
    }

    // Get recipes by category
    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<List<Recipe>>> getRecipesByCategory(@PathVariable RecipeCategory category) {
        try {
            List<Recipe> recipes = recipeService.getRecipesByCategory(category);
            return ResponseEntity.ok(ApiResponse.success("Recipes retrieved successfully", recipes));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve recipes: " + e.getMessage()));
        }
    }

    // Get vendor recipes by category
    @GetMapping("/vendor/{vendorId}/category/{category}")
    public ResponseEntity<ApiResponse<List<Recipe>>> getVendorRecipesByCategory(@PathVariable Long vendorId,
                                                                               @PathVariable RecipeCategory category) {
        try {
            List<Recipe> recipes = recipeService.getVendorRecipesByCategory(vendorId, category);
            return ResponseEntity.ok(ApiResponse.success("Recipes retrieved successfully", recipes));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve recipes: " + e.getMessage()));
        }
    }

    // Get recipe statistics for vendor
    @GetMapping("/vendor/{vendorId}/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getVendorRecipeStats(@PathVariable Long vendorId) {
        try {
            Map<String, Object> stats = new HashMap<>();
            
            // Total recipes count
            Long totalRecipes = recipeService.countVendorRecipes(vendorId);
            stats.put("totalRecipes", totalRecipes);
            
            // Recipes by category
            for (RecipeCategory category : RecipeCategory.values()) {
                List<Recipe> categoryRecipes = recipeService.getVendorRecipesByCategory(vendorId, category);
                stats.put(category.name().toLowerCase() + "Count", categoryRecipes.size());
            }
            
            return ResponseEntity.ok(ApiResponse.success("Recipe statistics retrieved successfully", stats));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve recipe statistics: " + e.getMessage()));
        }
    }
}
