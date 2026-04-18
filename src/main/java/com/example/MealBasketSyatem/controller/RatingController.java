package com.example.MealBasketSyatem.controller;

import com.example.MealBasketSyatem.dto.ApiResponse;
import com.example.MealBasketSyatem.entity.*;
import com.example.MealBasketSyatem.repo.*;
import com.example.MealBasketSyatem.service.ProductService;
import com.example.MealBasketSyatem.service.UserService;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/ratings")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class RatingController {

    @Autowired
    private RatingRepo ratingRepo;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private ProductService productService;

    private static final Logger logger = LoggerFactory.getLogger(RatingController.class);

    // Health check endpoint
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "healthy");
        response.put("service", "rating-service");
        response.put("database", "connected");
        response.put("timestamp", new Date().toString());
        return ResponseEntity.ok(response);
    }

    // Test endpoint for API connectivity
    @GetMapping("/test")
    public ResponseEntity<Map<String, String>> testEndpoint() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Rating API is working!");
        response.put("endpoint", "/api/ratings/test");
        response.put("timestamp", new Date().toString());
        return ResponseEntity.ok(response);
    }

    // Get all ratings for a user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Rating>> getUserRatings(@PathVariable Long userId) {
        logger.info("=== GETTING ALL USER RATINGS ===");
        logger.info("UserId: {}", userId);
        
        User user = userService.getUserById(userId);
        if (user == null) {
            logger.error("User not found: {}", userId);
            return ResponseEntity.notFound().build();
        }

        List<Rating> ratings = ratingRepo.findByUser(user);
        logger.info("Found {} ratings for user {}", ratings.size(), userId);
        
        return ResponseEntity.ok(ratings);
    }

    // Get user's rating for a specific product
    @GetMapping("/user/{userId}/product/{productId}")
    public ResponseEntity<Rating> getUserProductRating(@PathVariable Long userId, @PathVariable Long productId) {
        logger.info("=== GETTING USER PRODUCT RATING ===");
        logger.info("UserId: {}, ProductId: {}", userId, productId);
        
        User user = userService.getUserById(userId);
        Product product = productService.getProductById(productId);
        
        if (user == null) {
            logger.error("User not found: {}", userId);
            return ResponseEntity.notFound().build();
        }
        
        if (product == null) {
            logger.error("Product not found: {}", productId);
            return ResponseEntity.notFound().build();
        }

        Optional<Rating> rating = ratingRepo.findByUserAndProduct(user, product);
        if (rating.isPresent()) {
            logger.info("Found rating: User {}, Product {}, Rating {}", userId, productId, rating.get().getRating());
            return ResponseEntity.ok(rating.get());
        } else {
            logger.info("No rating found: User {}, Product {}", userId, productId);
            return ResponseEntity.ok(null);
        }
    }

    // Rate a product - EXACT SAME PATTERN AS FAVORITES
    @PostMapping("/rate")
    public ResponseEntity<ApiResponse<?>> saveRating(@RequestBody Map<String, Object> request) {
        try {
            System.out.println("=== RATING SUBMISSION (SAME AS FAVORITES) ===");
            
            // Get current user - EXACT SAME AS FAVORITES
            User currentUser = getCurrentUser();
            Long productId = Long.valueOf(request.get("productId").toString());
            Integer ratingValue = Integer.valueOf(request.get("rating").toString());

            System.out.println("User ID: " + currentUser.getId());
            System.out.println("Product ID: " + productId);
            System.out.println("Rating Value: " + ratingValue);

            // Get product - EXACT SAME AS FAVORITES
            Product product = productService.getProductById(productId);
            if (product == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Product not found"));
            }

            // Validate rating range
            if (ratingValue < 1 || ratingValue > 5) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Rating must be between 1 and 5"));
            }

            // Check if rating already exists
            Optional<Rating> existingRating = ratingRepo.findByUserAndProduct(currentUser, product);
            
            Rating ratingEntity;
            if (existingRating.isPresent()) {
                // Update existing rating
                ratingEntity = existingRating.get();
                ratingEntity.setRating(ratingValue);
                System.out.println("Updating existing rating for user " + currentUser.getId() + " and product " + productId);
            } else {
                // Create new rating - EXACT SAME AS FAVORITES
                ratingEntity = new Rating(currentUser, product, ratingValue);
                System.out.println("Creating new rating for user " + currentUser.getId() + " and product " + productId);
            }

            // Save to database - EXACT SAME AS FAVORITES
            Rating savedRating = ratingRepo.save(ratingEntity);
            System.out.println("Successfully saved rating with ID: " + savedRating.getId());
            
            // Transform the rating to match frontend expectations - EXACT SAME AS FAVORITES
            Map<String, Object> transformedRating = new java.util.HashMap<>();
            transformedRating.put("id", product.getId());
            transformedRating.put("name", product.getName());
            transformedRating.put("price", product.getPrice());
            transformedRating.put("image", product.getImage());
            transformedRating.put("description", product.getDescription());
            transformedRating.put("category", product.getCategory());
            transformedRating.put("vendor", product.getVendor() != null ? product.getVendor().getName() : "Unknown");
            transformedRating.put("ratingId", savedRating.getId());
            transformedRating.put("rating", savedRating.getRating());
            
            return ResponseEntity.ok(ApiResponse.success("Product rated successfully", transformedRating));
            
        } catch (Exception e) {
            System.err.println("Error saving rating: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to save rating: " + e.getMessage()));
        }
    }

    // Get user's ratings - EXACT SAME PATTERN AS FAVORITES
    @GetMapping
    public ResponseEntity<ApiResponse<?>> getRatings() {
        try {
            User currentUser = getCurrentUser();
            List<Rating> ratings = ratingRepo.findByUser(currentUser);
            
            // Transform ratings to match frontend expectations - EXACT SAME AS FAVORITES
            List<Map<String, Object>> transformedRatings = ratings.stream().map(rating -> {
                Map<String, Object> item = new java.util.HashMap<>();
                item.put("id", rating.getProduct().getId());
                item.put("name", rating.getProduct().getName());
                item.put("price", rating.getProduct().getPrice());
                item.put("image", rating.getProduct().getImage());
                item.put("description", rating.getProduct().getDescription());
                item.put("category", rating.getProduct().getCategory());
                item.put("vendor", rating.getProduct().getVendor() != null ? rating.getProduct().getVendor().getName() : "Unknown");
                item.put("ratingId", rating.getId());
                item.put("rating", rating.getRating());
                return item;
            }).collect(java.util.stream.Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success("Ratings retrieved successfully", transformedRatings));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve ratings: " + e.getMessage()));
        }
    }

    // Delete rating - EXACT SAME PATTERN AS FAVORITES
    @DeleteMapping("/{productId}")
    public ResponseEntity<ApiResponse<?>> removeRating(@PathVariable Long productId) {
        try {
            System.out.println("Attempting to remove rating - Product ID: " + productId);
            User currentUser = getCurrentUser();
            System.out.println("User ID: " + currentUser.getId());
            
            // Find the rating first - EXACT SAME AS FAVORITES
            Product product = productService.getProductById(productId);
            Optional<Rating> rating = ratingRepo.findByUserAndProduct(currentUser, product);
            if (!rating.isPresent()) {
                System.out.println("Rating not found for user " + currentUser.getId() + " and product " + productId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Rating not found"));
            }
            
            // Delete the rating - EXACT SAME AS FAVORITES
            ratingRepo.delete(rating.get());
            System.out.println("Successfully deleted rating");
            
            return ResponseEntity.ok(ApiResponse.success("Product rating removed successfully", null));
        } catch (Exception e) {
            System.err.println("Error removing rating: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to remove rating: " + e.getMessage()));
        }
    }

    // Check if user has rated product - EXACT SAME PATTERN AS FAVORITES
    @GetMapping("/check/{productId}")
    public ResponseEntity<ApiResponse<?>> hasRated(@PathVariable Long productId) {
        try {
            User currentUser = getCurrentUser();
            Product product = productService.getProductById(productId);
            boolean hasRated = ratingRepo.findByUserAndProduct(currentUser, product).isPresent();
            
            Map<String, Object> ratingInfo = new java.util.HashMap<>();
            ratingInfo.put("hasRated", hasRated);
            
            if (hasRated) {
                Optional<Rating> rating = ratingRepo.findByUserAndProduct(currentUser, product);
                ratingInfo.put("rating", rating.get().getRating());
            }
            
            return ResponseEntity.ok(ApiResponse.success("Rating status checked", ratingInfo));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to check rating status: " + e.getMessage()));
        }
    }

    // Get current user - EXACT SAME AS FAVORITES
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


    // Delete a rating
    @DeleteMapping("/user/{userId}/product/{productId}")
    @Transactional
    public ResponseEntity<Map<String, Object>> deleteRating(@PathVariable Long userId, @PathVariable Long productId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            logger.info("=== DELETING RATING ===");
            logger.info("UserId: {}, ProductId: {}", userId, productId);
            
            User user = userService.getUserById(userId);
            Product product = productService.getProductById(productId);
            
            if (user == null || product == null) {
                logger.error("User or product not found - User: {}, Product: {}", userId, productId);
                response.put("success", false);
                response.put("message", "User or product not found");
                return ResponseEntity.notFound().build();
            }

            Optional<Rating> rating = ratingRepo.findByUserAndProduct(user, product);
            if (rating.isPresent()) {
                ratingRepo.delete(rating.get());
                logger.info("Rating deleted successfully - User: {}, Product: {}", userId, productId);
                
                response.put("success", true);
                response.put("message", "Rating deleted successfully");
                response.put("action", "deleted");
            } else {
                logger.info("No rating found to delete - User: {}, Product: {}", userId, productId);
                response.put("success", true);
                response.put("message", "No rating found to delete");
                response.put("action", "none");
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error deleting rating", e);
            response.put("success", false);
            response.put("message", "Error deleting rating: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // Get product statistics (average rating, count, distribution)
    @GetMapping("/product/{productId}/stats")
    public ResponseEntity<Map<String, Object>> getProductRatingStats(@PathVariable Long productId) {
        logger.info("=== GETTING PRODUCT RATING STATS ===");
        logger.info("ProductId: {}", productId);
        
        Product product = productService.getProductById(productId);
        if (product == null) {
            logger.error("Product not found: {}", productId);
            return ResponseEntity.notFound().build();
        }

        Map<String, Object> response = new HashMap<>();
        
        // Get all ratings for this product
        List<Rating> ratings = ratingRepo.findByProduct(product);
        logger.info("Found {} ratings for product {}", ratings.size(), productId);
        
        // Calculate average rating manually to ensure correctness
        double totalRating = 0;
        int validRatings = 0;
        
        for (Rating rating : ratings) {
            if (rating.getRating() > 0) {
                totalRating += rating.getRating();
                validRatings++;
                logger.info("Rating: {} for product {}", rating.getRating(), productId);
            }
        }
        
        double averageRating = validRatings > 0 ? totalRating / validRatings : 0.0;
        long ratingCount = ratings.size();
        
        // Fix: Return correct rating values
        response.put("averageRating", averageRating);
        response.put("ratingCount", ratingCount);
        response.put("rating", validRatings > 0 ? (int) Math.round(averageRating) : 0); // Fix: Return actual rating value
        response.put("totalRatings", validRatings);
        
        // Add individual ratings for debugging
        response.put("individualRatings", ratings.stream().map(r -> Map.of(
            "id", r.getId(),
            "rating", r.getRating(),
            "userId", r.getUser().getId(),
            "productId", r.getProduct().getId()
        )).collect(java.util.stream.Collectors.toList()));
        
        logger.info("Product {} - Average Rating: {}, Count: {}, Valid Ratings: {}", productId, averageRating, ratingCount, validRatings);
        
        // Get rating distribution
        List<Object[]> ratingDistribution = ratingRepo.getRatingDistributionForProduct(product);
        Map<Integer, Long> distribution = new HashMap<>();
        for (Object[] result : ratingDistribution) {
            distribution.put((Integer) result[0], (Long) result[1]);
        }
        response.put("ratingDistribution", distribution);
        
        logger.info("Product stats - Product: {}, Avg: {}, Count: {}", productId, averageRating, ratingCount);
        
        return ResponseEntity.ok(response);
    }

    // Get top rated products
    @GetMapping("/top-rated")
    public ResponseEntity<List<Map<String, Object>>> getTopRatedProducts(@RequestParam(defaultValue = "10") int limit) {
        logger.info("=== GETTING TOP RATED PRODUCTS ===");
        logger.info("Limit: {}", limit);
        
        List<Map<String, Object>> topProducts = new ArrayList<>();
        
        // Get all products with ratings
        List<Product> products = productService.getAllProduct();
        
        for (Product product : products) {
            Double avgRating = ratingRepo.getAverageRatingForProduct(product);
            Long ratingCount = ratingRepo.getRatingCountForProduct(product);
            
            if (avgRating != null && ratingCount != null && ratingCount > 0) {
                Map<String, Object> productData = new HashMap<>();
                productData.put("product", product);
                productData.put("averageRating", avgRating);
                productData.put("ratingCount", ratingCount);
                topProducts.add(productData);
            }
        }
        
        // Sort by average rating (descending) and limit
        topProducts.sort((a, b) -> Double.compare((Double) b.get("averageRating"), (Double) a.get("averageRating")));
        
        if (topProducts.size() > limit) {
            topProducts = topProducts.subList(0, limit);
        }
        
        logger.info("Returning {} top rated products", topProducts.size());
        
        return ResponseEntity.ok(topProducts);
    }

    // Get rating summary for recommendation system
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getRatingSummary() {
        logger.info("=== GETTING RATING SUMMARY ===");
        
        Map<String, Object> summary = new HashMap<>();
        
        try {
            // Total ratings
            Long totalRatings = ratingRepo.count();
            summary.put("totalRatings", totalRatings);
            
            // Total users who rated - Use working alternative
            List<Rating> allRatings = ratingRepo.findAll();
            Set<User> usersWhoRated = new HashSet<>();
            Set<Product> productsRated = new HashSet<>();
            double totalRatingSum = 0;
            
            for (Rating rating : allRatings) {
                usersWhoRated.add(rating.getUser());
                productsRated.add(rating.getProduct());
                totalRatingSum += rating.getRating();
            }
            
            summary.put("usersWhoRated", usersWhoRated.size());
            summary.put("productsRated", productsRated.size());
            
            // Average rating across all products
            Double overallAverage = allRatings.isEmpty() ? 0.0 : totalRatingSum / allRatings.size();
            summary.put("overallAverageRating", overallAverage);
            
            logger.info("Rating summary generated - Total: {}, Users: {}, Products: {}, Avg: {}", 
                       totalRatings, usersWhoRated.size(), productsRated.size(), overallAverage);
            
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            logger.error("Error generating rating summary", e);
            summary.put("error", "Failed to generate summary: " + e.getMessage());
            return ResponseEntity.status(500).body(summary);
        }
    }
}
