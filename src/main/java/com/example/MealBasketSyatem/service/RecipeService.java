package com.example.MealBasketSyatem.service;

import com.example.MealBasketSyatem.entity.Recipe;
import com.example.MealBasketSyatem.entity.RecipeCategory;
import com.example.MealBasketSyatem.entity.Vendor;
import com.example.MealBasketSyatem.repository.RecipeRepository;
import com.example.MealBasketSyatem.repo.VendorRepo;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class RecipeService {

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired
    private VendorRepo vendorRepository;
    
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Get all recipes for a vendor
    public List<Recipe> getVendorRecipes(Long vendorId) {
        return recipeRepository.findByVendorIdAndIsActiveTrue(vendorId);
    }

    // Get all active recipes (for users)
    public List<Recipe> getAllActiveRecipes() {
        return recipeRepository.findByIsActiveTrue();
    }

    // Get all recipes for a vendor (including inactive)
    public List<Recipe> getAllVendorRecipes(Long vendorId) {
        return recipeRepository.findByVendorId(vendorId);
    }

    // Get recipe by ID
    public Recipe getRecipeById(Long id) {
        return recipeRepository.findById(id).orElse(null);
    }

    // Create new recipe
    public Recipe createRecipe(Long vendorId, Map<String, Object> recipeData) {
        try {
            // Validate vendor
            Optional<Vendor> vendorOpt = vendorRepository.findById(vendorId);
            if (!vendorOpt.isPresent()) {
                throw new RuntimeException("Vendor not found with ID: " + vendorId);
            }
            Vendor vendor = vendorOpt.get();

            // Create recipe
            Recipe recipe = new Recipe();
            recipe.setVendor(vendor);

            // Set basic fields
            recipe.setName((String) recipeData.get("name"));
            
            // Set category
            String categoryStr = (String) recipeData.get("category");
            if (categoryStr != null) {
                try {
                    recipe.setCategory(RecipeCategory.valueOf(categoryStr));
                } catch (IllegalArgumentException e) {
                    recipe.setCategory(RecipeCategory.MAIN_COURSE); // Default category
                }
            }

            // Set ingredients (store as proper JSON array for frontend compatibility)
            Object ingredientsObj = recipeData.get("ingredients");
            if (ingredientsObj instanceof List) {
                try {
                    // Store as proper JSON string so frontend can parse it back to array
                    String ingredientsJson = objectMapper.writeValueAsString(ingredientsObj);
                    recipe.setIngredients(ingredientsJson);
                } catch (Exception e) {
                    // Fallback to string representation if JSON serialization fails
                    recipe.setIngredients(ingredientsObj.toString());
                }
            } else if (ingredientsObj instanceof String) {
                recipe.setIngredients((String) ingredientsObj);
            }

            // Set cooking instructions
            recipe.setCookingInstructions((String) recipeData.get("cookingInstructions"));

            // Set cooking time
            Object cookingTimeObj = recipeData.get("cookingTime");
            if (cookingTimeObj instanceof Number) {
                recipe.setCookingTime(((Number) cookingTimeObj).intValue());
            } else if (cookingTimeObj instanceof String) {
                try {
                    recipe.setCookingTime(Integer.parseInt((String) cookingTimeObj));
                } catch (NumberFormatException e) {
                    recipe.setCookingTime(30); // Default cooking time
                }
            } else {
                recipe.setCookingTime(30); // Default cooking time
            }

            // Set nutritional value (as JSON string)
            Object nutritionalValueObj = recipeData.get("nutritionalValue");
            if (nutritionalValueObj instanceof Map) {
                // Convert Map to JSON string (simple implementation)
                recipe.setNutritionalValue(nutritionalValueObj.toString());
            } else if (nutritionalValueObj instanceof String) {
                recipe.setNutritionalValue((String) nutritionalValueObj);
            }

            // Set default values
            recipe.setIsActive(true);
            recipe.setCreatedAt(LocalDateTime.now());
            recipe.setUpdatedAt(LocalDateTime.now());

            return recipeRepository.save(recipe);

        } catch (Exception e) {
            throw new RuntimeException("Failed to create recipe: " + e.getMessage(), e);
        }
    }

    // Update recipe
    public Recipe updateRecipe(Long id, Map<String, Object> recipeData) {
        try {
            Recipe recipe = recipeRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Recipe not found with ID: " + id));

            // Update fields
            if (recipeData.containsKey("name")) {
                recipe.setName((String) recipeData.get("name"));
            }

            if (recipeData.containsKey("category")) {
                String categoryStr = (String) recipeData.get("category");
                if (categoryStr != null) {
                    try {
                        recipe.setCategory(RecipeCategory.valueOf(categoryStr));
                    } catch (IllegalArgumentException e) {
                        recipe.setCategory(RecipeCategory.MAIN_COURSE);
                    }
                }
            }

            if (recipeData.containsKey("ingredients")) {
                Object ingredientsObj = recipeData.get("ingredients");
                if (ingredientsObj instanceof List) {
                    try {
                        // Store as proper JSON string so frontend can parse it back to array
                        String ingredientsJson = objectMapper.writeValueAsString(ingredientsObj);
                        recipe.setIngredients(ingredientsJson);
                    } catch (Exception e) {
                        // Fallback to string representation if JSON serialization fails
                        recipe.setIngredients(ingredientsObj.toString());
                    }
                } else if (ingredientsObj instanceof String) {
                    recipe.setIngredients((String) ingredientsObj);
                }
            }

            if (recipeData.containsKey("cookingInstructions")) {
                recipe.setCookingInstructions((String) recipeData.get("cookingInstructions"));
            }

            if (recipeData.containsKey("cookingTime")) {
                Object cookingTimeObj = recipeData.get("cookingTime");
                if (cookingTimeObj instanceof Number) {
                    recipe.setCookingTime(((Number) cookingTimeObj).intValue());
                } else if (cookingTimeObj instanceof String) {
                    try {
                        recipe.setCookingTime(Integer.parseInt((String) cookingTimeObj));
                    } catch (NumberFormatException e) {
                        recipe.setCookingTime(30);
                    }
                }
            }

            if (recipeData.containsKey("nutritionalValue")) {
                Object nutritionalValueObj = recipeData.get("nutritionalValue");
                if (nutritionalValueObj instanceof Map) {
                    recipe.setNutritionalValue(nutritionalValueObj.toString());
                } else if (nutritionalValueObj instanceof String) {
                    recipe.setNutritionalValue((String) nutritionalValueObj);
                }
            }

            recipe.setUpdatedAt(LocalDateTime.now());
            return recipeRepository.save(recipe);

        } catch (Exception e) {
            throw new RuntimeException("Failed to update recipe: " + e.getMessage(), e);
        }
    }

    // Delete recipe (soft delete)
    public boolean deleteRecipe(Long id) {
        try {
            Recipe recipe = recipeRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Recipe not found with ID: " + id));
            
            recipe.setIsActive(false);
            recipe.setUpdatedAt(LocalDateTime.now());
            recipeRepository.save(recipe);
            
            return true;
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete recipe: " + e.getMessage(), e);
        }
    }

    // Search recipes
    public List<Recipe> searchRecipes(Long vendorId, String searchTerm) {
        return recipeRepository.searchRecipes(vendorId, searchTerm);
    }

    // Get recipes by category
    public List<Recipe> getRecipesByCategory(RecipeCategory category) {
        return recipeRepository.findByCategoryAndIsActiveTrue(category);
    }

    // Get recipes by vendor and category
    public List<Recipe> getVendorRecipesByCategory(Long vendorId, RecipeCategory category) {
        return recipeRepository.findByVendorIdAndCategoryAndIsActiveTrue(vendorId, category);
    }

    // Count active recipes for vendor
    public Long countVendorRecipes(Long vendorId) {
        return recipeRepository.countActiveRecipesByVendor(vendorId);
    }
}
