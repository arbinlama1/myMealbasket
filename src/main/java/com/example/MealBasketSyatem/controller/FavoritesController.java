package com.example.MealBasketSyatem.controller;

import com.example.MealBasketSyatem.dto.ApiResponse;
import com.example.MealBasketSyatem.entity.Favorite;
import com.example.MealBasketSyatem.entity.Product;
import com.example.MealBasketSyatem.entity.User;
import com.example.MealBasketSyatem.service.ProductService;
import com.example.MealBasketSyatem.service.UserService;
import com.example.MealBasketSyatem.repository.FavoriteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/favorites")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class FavoritesController {

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private ProductService productService;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getFavorites() {
        try {
            User currentUser = getCurrentUser();
            List<Favorite> favorites = favoriteRepository.findByUserId(currentUser.getId());
            
            // Transform favorites to match frontend expectations
            List<Map<String, Object>> transformedFavorites = favorites.stream().map(favorite -> {
                Map<String, Object> item = new java.util.HashMap<>();
                item.put("id", favorite.getProduct().getId());
                item.put("name", favorite.getProduct().getName());
                item.put("price", favorite.getProduct().getPrice());
                item.put("image", favorite.getProduct().getImage());
                item.put("description", favorite.getProduct().getDescription());
                item.put("category", favorite.getProduct().getCategory());
                item.put("vendor", favorite.getProduct().getVendor() != null ? favorite.getProduct().getVendor().getName() : "Unknown");
                item.put("favoriteId", favorite.getId());
                return item;
            }).collect(java.util.stream.Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success("Favorites retrieved successfully", transformedFavorites));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve favorites: " + e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<?>> addToFavorites(@RequestBody Map<String, Object> request) {
        try {
            User currentUser = getCurrentUser();
            Long productId = Long.valueOf(request.get("productId").toString());

            Product product = productService.getProductById(productId);
            if (product == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Product not found"));
            }

            // Check if already in favorites
            if (favoriteRepository.findByUserIdAndProductId(currentUser.getId(), productId).isPresent()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Product already in favorites"));
            }

            Favorite favorite = new Favorite(currentUser, product);
            favoriteRepository.save(favorite);
            
            // Transform the favorite to match frontend expectations
            Map<String, Object> transformedFavorite = new java.util.HashMap<>();
            transformedFavorite.put("id", product.getId());
            transformedFavorite.put("name", product.getName());
            transformedFavorite.put("price", product.getPrice());
            transformedFavorite.put("image", product.getImage());
            transformedFavorite.put("description", product.getDescription());
            transformedFavorite.put("category", product.getCategory());
            transformedFavorite.put("vendor", product.getVendor() != null ? product.getVendor().getName() : "Unknown");
            transformedFavorite.put("favoriteId", favorite.getId());
            
            return ResponseEntity.ok(ApiResponse.success("Product added to favorites successfully", transformedFavorite));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to add to favorites: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<ApiResponse<?>> removeFromFavorites(@PathVariable Long productId) {
        try {
            System.out.println("Attempting to remove from favorites - Product ID: " + productId);
            User currentUser = getCurrentUser();
            System.out.println("User ID: " + currentUser.getId());
            
            // Find the favorite first
            Optional<Favorite> favorite = favoriteRepository.findByUserIdAndProductId(currentUser.getId(), productId);
            if (!favorite.isPresent()) {
                System.out.println("Favorite not found for user " + currentUser.getId() + " and product " + productId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Favorite not found"));
            }
            
            // Delete the favorite
            favoriteRepository.delete(favorite.get());
            System.out.println("Successfully deleted favorite");
            
            return ResponseEntity.ok(ApiResponse.success("Product removed from favorites successfully", null));
        } catch (Exception e) {
            System.err.println("Error removing from favorites: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to remove from favorites: " + e.getMessage()));
        }
    }

    @GetMapping("/check/{productId}")
    public ResponseEntity<ApiResponse<?>> isFavorite(@PathVariable Long productId) {
        try {
            User currentUser = getCurrentUser();
            boolean isFavorite = favoriteRepository.findByUserIdAndProductId(currentUser.getId(), productId).isPresent();
            return ResponseEntity.ok(ApiResponse.success("Favorite status checked", 
                Map.of("isFavorite", isFavorite)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to check favorite status: " + e.getMessage()));
        }
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth instanceof org.springframework.security.authentication.AnonymousAuthenticationToken) {
            throw new RuntimeException("User not authenticated");
        }
        
        String email = auth.getName();
        User user = userService.findUserByEmail(email);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        
        return user;
    }
}
