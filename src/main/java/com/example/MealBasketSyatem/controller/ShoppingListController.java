package com.example.MealBasketSyatem.controller;

import com.example.MealBasketSyatem.dto.ApiResponse;
import com.example.MealBasketSyatem.entity.Recipe;
import com.example.MealBasketSyatem.service.RecipeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/shopping-list")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003"})
public class ShoppingListController {

    @Autowired
    private RecipeService recipeService;

    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> generateShoppingList(@RequestBody Map<String, Object> body) {
        try {
            @SuppressWarnings("unchecked")
            List<Integer> recipeIds = (List<Integer>) body.get("recipeIds");
            
            if (recipeIds == null || recipeIds.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("No recipes selected"));
            }

            // Aggregate ingredients from all recipes
            Map<String, Map<String, Object>> aggregatedIngredients = new HashMap<>();
            
            for (Integer recipeId : recipeIds) {
                Recipe recipe = recipeService.getRecipeById(recipeId.longValue());
                System.out.println("[ShoppingList] Recipe " + recipeId + ": " + (recipe != null ? recipe.getName() : "null"));
                if (recipe != null && recipe.getIngredients() != null) {
                    System.out.println("[ShoppingList] Recipe " + recipeId + " ingredients: " + recipe.getIngredients());
                    // Parse ingredients from JSON string
                    List<Map<String, Object>> ingredients = parseIngredients(recipe.getIngredients());
                    System.out.println("[ShoppingList] Recipe " + recipeId + " parsed " + ingredients.size() + " ingredients");
                    
                    for (Map<String, Object> ing : ingredients) {
                        String name = (String) ing.getOrDefault("name", ing.getOrDefault("ingredient", ""));
                        String unit = (String) ing.getOrDefault("unit", "pcs");
                        
                        // Handle quantity as either Number or String
                        Object qtyObj = ing.getOrDefault("quantity", ing.getOrDefault("qty", 0));
                        double quantity = 0;
                        if (qtyObj instanceof Number) {
                            quantity = ((Number) qtyObj).doubleValue();
                        } else if (qtyObj instanceof String) {
                            try {
                                quantity = Double.parseDouble((String) qtyObj);
                            } catch (NumberFormatException e) {
                                quantity = 0;
                            }
                        }
                        
                        String key = name.toLowerCase() + "_" + unit.toLowerCase();
                        
                        if (aggregatedIngredients.containsKey(key)) {
                            Map<String, Object> existing = aggregatedIngredients.get(key);
                            double currentQty = ((Number) existing.get("quantity")).doubleValue();
                            existing.put("quantity", currentQty + quantity);
                        } else {
                            Map<String, Object> item = new HashMap<>();
                            item.put("name", name);
                            item.put("unit", unit);
                            item.put("quantity", quantity);
                            aggregatedIngredients.put(key, item);
                        }
                    }
                }
            }

            List<Map<String, Object>> shoppingList = new ArrayList<>(aggregatedIngredients.values());
            
            // Sort by name
            shoppingList.sort(Comparator.comparing(item -> (String) item.get("name")));

            Map<String, Object> response = new HashMap<>();
            response.put("items", shoppingList);
            response.put("totalItems", shoppingList.size());
            response.put("recipeCount", recipeIds.size());

            return ResponseEntity.ok(ApiResponse.success("Shopping list generated successfully", response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to generate shopping list: " + e.getMessage()));
        }
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> parseIngredients(Object ingredientsObj) {
        if (ingredientsObj == null) {
            System.out.println("[ShoppingList] parseIngredients: null input");
            return new ArrayList<>();
        }
        
        if (ingredientsObj instanceof List) {
            System.out.println("[ShoppingList] parseIngredients: already a List");
            return (List<Map<String, Object>>) ingredientsObj;
        }
        
        if (ingredientsObj instanceof String) {
            String str = (String) ingredientsObj;
            System.out.println("[ShoppingList] parseIngredients: parsing String: " + str.substring(0, Math.min(str.length(), 100)));
            try {
                // Try to parse as JSON
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                List<Map<String, Object>> result = mapper.readValue(str, 
                    mapper.getTypeFactory().constructCollectionType(List.class, Map.class));
                System.out.println("[ShoppingList] parseIngredients: parsed " + result.size() + " items");
                return result;
            } catch (Exception e) {
                System.out.println("[ShoppingList] parseIngredients: parse error: " + e.getMessage());
                // If parsing fails, return empty list
                return new ArrayList<>();
            }
        }
        
        System.out.println("[ShoppingList] parseIngredients: unknown type: " + ingredientsObj.getClass());
        return new ArrayList<>();
    }
}
