package com.example.MealBasketSyatem.controller;

import com.example.MealBasketSyatem.dto.RecommendationDTO;
import com.example.MealBasketSyatem.dto.UserPreferenceDTO;
import com.example.MealBasketSyatem.entity.*;
import com.example.MealBasketSyatem.repo.RatingRepo;
import com.example.MealBasketSyatem.repo.UserBehaviorRepo;
import com.example.MealBasketSyatem.repo.UserRepo;
import com.example.MealBasketSyatem.repo.ProductRepo;
import com.example.MealBasketSyatem.service.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin(origins = "*")
public class RecommendationController {

    private static final Logger logger = LoggerFactory.getLogger(RecommendationController.class);

    @Autowired
    private RecommendationService recommendationService;

    @Autowired
    private RatingRepo ratingRepo;

    @Autowired
    private UserBehaviorRepo userBehaviorRepo;

    @Autowired
    private UserRepo userRepo;

    // Get hybrid recommendations for a user
    @GetMapping("/user/{userId}")
    public ResponseEntity<RecommendationDTO> getUserRecommendations(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "10") int limit) {
        
        if (!userRepo.existsById(userId)) {
            return ResponseEntity.notFound().build();
        }

        List<Product> recommendedProducts = recommendationService.getTopRecommendations(userId, limit);
        
        List<RecommendationDTO.ProductRecommendation> productRecommendations = 
            recommendedProducts.stream()
                .map(product -> {
                    Double avgRating = ratingRepo.getAverageRatingForProduct(product);
                    double predictedRating = avgRating != null ? avgRating : 4.0;
                    double confidence = calculateConfidence(userId, product);
                    String reason = generateRecommendationReason(userId, product);
                    
                    return new RecommendationDTO.ProductRecommendation(
                        product, predictedRating, confidence, reason);
                })
                .collect(Collectors.toList());

        RecommendationDTO response = new RecommendationDTO(
            userId, productRecommendations, "HYBRID", "Collaborative + Content-Based Filtering");

        return ResponseEntity.ok(response);
    }

    // Get collaborative filtering recommendations
    @GetMapping("/user/{userId}/collaborative")
    public ResponseEntity<RecommendationDTO> getCollaborativeRecommendations(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "10") int limit) {
        
        if (!userRepo.existsById(userId)) {
            return ResponseEntity.notFound().build();
        }

        List<Product> recommendedProducts = recommendationService.getCollaborativeFilteringRecommendations(userId, limit);
        
        List<RecommendationDTO.ProductRecommendation> productRecommendations = 
            recommendedProducts.stream()
                .map(product -> {
                    Double avgRating = ratingRepo.getAverageRatingForProduct(product);
                    double predictedRating = avgRating != null ? avgRating : 4.0;
                    double confidence = 0.7; // Moderate confidence for collaborative
                    String reason = "Users with similar tastes also liked this product";
                    
                    return new RecommendationDTO.ProductRecommendation(
                        product, predictedRating, confidence, reason);
                })
                .collect(Collectors.toList());

        RecommendationDTO response = new RecommendationDTO(
            userId, productRecommendations, "COLLABORATIVE", "User-Based Collaborative Filtering");

        return ResponseEntity.ok(response);
    }

    // Get content-based recommendations
    @GetMapping("/user/{userId}/content-based")
    public ResponseEntity<RecommendationDTO> getContentBasedRecommendations(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "10") int limit) {
        
        if (!userRepo.existsById(userId)) {
            return ResponseEntity.notFound().build();
        }

        List<Product> recommendedProducts = recommendationService.getContentBasedRecommendations(userId, limit);
        
        List<RecommendationDTO.ProductRecommendation> productRecommendations = 
            recommendedProducts.stream()
                .map(product -> {
                    Double avgRating = ratingRepo.getAverageRatingForProduct(product);
                    double predictedRating = avgRating != null ? avgRating : 4.0;
                    double confidence = 0.8; // Higher confidence for content-based
                    String reason = "Similar to products you've rated highly";
                    
                    return new RecommendationDTO.ProductRecommendation(
                        product, predictedRating, confidence, reason);
                })
                .collect(Collectors.toList());

        RecommendationDTO response = new RecommendationDTO(
            userId, productRecommendations, "CONTENT_BASED", "Content-Based Filtering");

        return ResponseEntity.ok(response);
    }

    // Get highly rated products globally
    @GetMapping("/highly-rated")
    public ResponseEntity<RecommendationDTO> getHighlyRatedProducts(
            @RequestParam(defaultValue = "20") int limit) {
        
        List<Product> topProducts = recommendationService.getHighlyRatedProducts(limit);
        
        List<RecommendationDTO.ProductRecommendation> productRecommendations = 
            topProducts.stream()
                .map(product -> {
                    Double avgRating = ratingRepo.getAverageRatingForProduct(product);
                    double predictedRating = avgRating != null ? avgRating : 4.0;
                    double confidence = 0.9; // High confidence for globally rated products
                    String reason = "Highly rated by all users";
                    
                    return new RecommendationDTO.ProductRecommendation(
                        product, predictedRating, confidence, reason);
                })
                .collect(Collectors.toList());

        RecommendationDTO response = new RecommendationDTO(
            null, productRecommendations, "GLOBAL", "Globally Highly Rated Products");

        return ResponseEntity.ok(response);
    }

    // Get user's ratings for all products
    @GetMapping("/user/{userId}/ratings")
    public ResponseEntity<List<Rating>> getUserRatings(@PathVariable Long userId) {
        User user = userRepo.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        List<Rating> ratings = ratingRepo.findByUser(user);
        return ResponseEntity.ok(ratings);
    }

    // Get user's rating for a specific product
    @GetMapping("/user/{userId}/product/{productId}/rating")
    public ResponseEntity<Rating> getUserProductRating(@PathVariable Long userId, @PathVariable Long productId) {
        User user = userRepo.findById(userId).orElse(null);
        Product product = productRepo.findById(productId).orElse(null);
        
        if (user == null || product == null) {
            return ResponseEntity.notFound().build();
        }

        Optional<Rating> rating = ratingRepo.findByUserAndProduct(user, product);
        return rating.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.ok(null));
    }

    // Get comprehensive product rating (user rating + average rating)
    @GetMapping("/product/{productId}/ratings")
    public ResponseEntity<Map<String, Object>> getProductRating(@PathVariable Long productId, 
                                                               @RequestParam(required = false) Long userId) {
        Product product = productRepo.findById(productId).orElse(null);
        if (product == null) {
            return ResponseEntity.notFound().build();
        }

        // Get average rating for all users
        Double avgRating = ratingRepo.getAverageRatingForProduct(product);
        Long ratingCount = ratingRepo.getRatingCountForProduct(product);

        Map<String, Object> response = new HashMap<>();
        response.put("averageRating", avgRating != null ? avgRating : 0.0);
        response.put("ratingCount", ratingCount != null ? ratingCount : 0L);
        
        // If userId is provided, get user's specific rating
        if (userId != null) {
            User user = userRepo.findById(userId).orElse(null);
            if (user != null) {
                Optional<Rating> userRating = ratingRepo.findByUserAndProduct(user, product);
                if (userRating.isPresent()) {
                    response.put("userRating", userRating.get().getRating());
                    response.put("userRatingId", userRating.get().getId());
                    response.put("userRatedAt", userRating.get().getCreatedAt());
                } else {
                    response.put("userRating", null);
                    response.put("userRatingId", null);
                    response.put("userRatedAt", null);
                }
            }
        }

        // Get rating distribution
        List<Object[]> ratingDistribution = ratingRepo.getRatingDistributionForProduct(product);
        Map<Integer, Long> distribution = new HashMap<>();
        for (Object[] result : ratingDistribution) {
            distribution.put((Integer) result[0], (Long) result[1]);
        }
        response.put("ratingDistribution", distribution);
        
        return ResponseEntity.ok(response);
    }

    // Get user preferences
    @GetMapping("/user/{userId}/preferences")
    public ResponseEntity<UserPreferenceDTO> getUserPreferences(@PathVariable Long userId) {
        User user = userRepo.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        Map<String, Object> preferences = recommendationService.getUserPreferences(userId);
        UserPreferenceDTO dto = new UserPreferenceDTO(userId, user.getName());
        
        // Set basic preferences
        dto.setAverageRatingGiven((Double) preferences.getOrDefault("averageRatingGiven", 0.0));
        dto.setPreferredCategories((List<String>) preferences.getOrDefault("preferredCategories", new ArrayList<>()));
        dto.setBrowsedCategories((List<String>) preferences.getOrDefault("browsedCategories", new ArrayList<>()));

        // Calculate additional metrics
        List<Rating> userRatings = ratingRepo.findByUser(user);
        dto.setTotalRatings(userRatings.size());

        // Get recent searches from behavior
        List<Object[]> searchQueries = userBehaviorRepo.findPopularSearchQueries();
        List<String> recentSearches = searchQueries.stream()
            .limit(5)
            .map(obj -> (String) obj[0])
            .collect(Collectors.toList());
        dto.setRecentSearches(recentSearches);

        // Create behavior metrics
        Map<String, Object> behaviorMetrics = new HashMap<>();
        behaviorMetrics.put("hasRatings", !userRatings.isEmpty());
        behaviorMetrics.put("avgRating", dto.getAverageRatingGiven());
        behaviorMetrics.put("preferredCategoriesCount", dto.getPreferredCategories().size());
        behaviorMetrics.put("browsedCategoriesCount", dto.getBrowsedCategories().size());
        dto.setBehaviorMetrics(behaviorMetrics);

        return ResponseEntity.ok(dto);
    }

    // Rate a product (Create or Update)
    @PostMapping("/rate")
    @Transactional
    public ResponseEntity<Map<String, Object>> rateProduct(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            logger.info("Rating request received: {}", request);
            
            Long userId = Long.valueOf(request.get("userId").toString());
            Long productId = Long.valueOf(request.get("productId").toString());
            Integer rating = Integer.valueOf(request.get("rating").toString());
            
            logger.info("Processing rating - User: {}, Product: {}, Rating: {}", userId, productId, rating);

            // Validate rating
            if (rating < 0 || rating > 5) {
                response.put("success", false);
                response.put("message", "Rating must be between 0 and 5");
                return ResponseEntity.badRequest().body(response);
            }

            User user = userRepo.findById(userId).orElse(null);
            Product product = productRepo.findById(productId).orElse(null);

            if (user == null) {
                response.put("success", false);
                response.put("message", "User not found");
                return ResponseEntity.notFound().build();
            }

            if (product == null) {
                response.put("success", false);
                response.put("message", "Product not found");
                return ResponseEntity.notFound().build();
            }

            // Check if rating already exists
            Optional<Rating> existingRating = ratingRepo.findByUserAndProduct(user, product);
            
            if (existingRating.isPresent()) {
                // Update existing rating
                Rating ratingToUpdate = existingRating.get();
                logger.info("Updating existing rating - Old rating: {}, New rating: {}", ratingToUpdate.getRating(), rating);
                ratingToUpdate.setRating(rating);
                Rating savedRating = ratingRepo.save(ratingToUpdate);
                logger.info("Rating updated successfully - ID: {}, User: {}, Product: {}, Rating: {}", 
                           savedRating.getId(), userId, productId, savedRating.getRating());
                
                response.put("success", true);
                response.put("message", "Rating updated successfully");
                response.put("action", "updated");
            } else {
                // Create new rating
                logger.info("Creating new rating - User: {}, Product: {}, Rating: {}", userId, productId, rating);
                Rating newRating = new Rating(user, product, rating);
                Rating savedRating = ratingRepo.save(newRating);
                logger.info("New rating saved successfully - ID: {}, User: {}, Product: {}, Rating: {}", 
                           savedRating.getId(), userId, productId, savedRating.getRating());
                
                response.put("success", true);
                response.put("message", "Rating submitted successfully");
                response.put("action", "created");
            }

            // Get updated statistics
            Double avgRating = ratingRepo.getAverageRatingForProduct(product);
            Long ratingCount = ratingRepo.getRatingCountForProduct(product);
            
            response.put("averageRating", avgRating != null ? avgRating : 0.0);
            response.put("ratingCount", ratingCount != null ? ratingCount : 0L);
            response.put("userRating", rating);
            
            logger.info("Rating operation completed successfully - User: {}, Product: {}, Rating: {}, Action: {}", 
                       userId, productId, rating, response.get("action"));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error processing rating request: {}", request, e);
            response.put("success", false);
            response.put("message", "Error processing rating: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // Track user behavior
    @PostMapping("/behavior")
    public ResponseEntity<Map<String, String>> trackBehavior(@RequestBody Map<String, Object> behaviorData) {
        try {
            Long userId = Long.valueOf(behaviorData.get("userId").toString());
            String actionTypeStr = behaviorData.get("actionType").toString();
            
            User user = userRepo.findById(userId).orElse(null);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }

            UserBehavior.ActionType actionType = UserBehavior.ActionType.valueOf(actionTypeStr.toUpperCase());
            UserBehavior behavior = new UserBehavior(user, actionType, null);

            // Set product if present
            if (behaviorData.containsKey("productId")) {
                Long productId = Long.valueOf(behaviorData.get("productId").toString());
                Product product = productRepo.findById(productId).orElse(null);
                if (product != null) {
                    behavior.setProduct(product);
                }
            }

            // Set category if present
            if (behaviorData.containsKey("category")) {
                behavior.setCategory(behaviorData.get("category").toString());
            }

            // Set search query if present
            if (behaviorData.containsKey("searchQuery")) {
                behavior.setSearchQuery(behaviorData.get("searchQuery").toString());
            }

            // Set session ID if present
            if (behaviorData.containsKey("sessionId")) {
                behavior.setSessionId(behaviorData.get("sessionId").toString());
            }

            userBehaviorRepo.save(behavior);

            return ResponseEntity.ok(Map.of("message", "Behavior tracked successfully"));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid behavior data: " + e.getMessage()));
        }
    }

    // Helper methods
    private double calculateConfidence(Long userId, Product product) {
        // Simple confidence calculation based on number of ratings
        Long ratingCount = ratingRepo.getRatingCountForProduct(product);
        if (ratingCount == null) ratingCount = 0L;
        
        // Confidence increases with more ratings
        return Math.min(0.9, 0.3 + (ratingCount * 0.1));
    }

    private String generateRecommendationReason(Long userId, Product product) {
        List<Rating> userRatings = ratingRepo.findByUser(userRepo.findById(userId).orElse(null));
        
        if (userRatings.isEmpty()) {
            return "Popular product in our catalog";
        }

        // Check if same category
        boolean sameCategory = userRatings.stream()
            .anyMatch(rating -> product.getCategory() != null && 
                               product.getCategory().equals(rating.getProduct().getCategory()));
        
        if (sameCategory) {
            return "Similar category to your highly rated products";
        }

        return "Recommended based on your preferences";
    }

    @Autowired
    private com.example.MealBasketSyatem.repo.ProductRepo productRepo;
}
