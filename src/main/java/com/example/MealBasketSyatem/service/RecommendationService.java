package com.example.MealBasketSyatem.service;

import com.example.MealBasketSyatem.entity.Product;
import com.example.MealBasketSyatem.entity.ProductReview;
import com.example.MealBasketSyatem.entity.User;
import com.example.MealBasketSyatem.repo.ProductRepo;
import com.example.MealBasketSyatem.repository.ProductReviewRepository;
import com.example.MealBasketSyatem.repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    @Autowired
    private ProductReviewRepository productReviewRepository;

    @Autowired
    private ProductRepo productRepository;

    @Autowired
    private UserRepo userRepository;

    // Minimum threshold for weighted rating
    private static final int MIN_REVIEWS_THRESHOLD = 10;
    
    // Minimum reviews for reliable recommendation
    private static final int MIN_RELIABLE_REVIEWS = 5;
    
    // Minimum rating threshold for recommendations
    private static final double MIN_RATING_THRESHOLD = 3.0;

    /**
     * Get top N recommended products for a given user
     * 
     * @param userId The user ID
     * @param topN Number of recommendations to return
     * @return List of recommended products with predicted ratings
     */
    public List<RecommendationResult> getRecommendationsForUser(Long userId, int topN) {
        // Get all users and products
        List<User> allUsers = userRepository.findAll();
        List<Product> allProducts = productRepository.findAll();
        
        // Get all reviews
        List<ProductReview> allReviews = productReviewRepository.findAll();
        
        // Build user-item rating matrix
        Map<Long, Map<Long, Double>> userItemRatings = buildUserItemRatingMatrix(allReviews);
        
        // Calculate global average rating
        double globalAverageRating = calculateGlobalAverageRating(allProducts);
        
        // Calculate improved ratings (weighted) for all products
        Map<Long, Double> improvedRatings = calculateImprovedRatings(allProducts, globalAverageRating);
        
        // Get current user's ratings
        Map<Long, Double> currentUserRatings = userItemRatings.getOrDefault(userId, new HashMap<>());
        
        // Calculate similarity between current user and all other users
        Map<Long, Double> userSimilarities = calculateUserSimilarities(
            userId, 
            allUsers, 
            userItemRatings, 
            improvedRatings
        );
        
        // Predict ratings for products not rated by current user
        Map<Long, Double> predictedRatings = predictRatings(
            userId,
            currentUserRatings,
            allProducts,
            userSimilarities,
            userItemRatings,
            improvedRatings
        );
        
        // Apply business rules and filter
        List<RecommendationResult> recommendations = applyBusinessRules(
            predictedRatings,
            allProducts,
            improvedRatings,
            currentUserRatings
        );
        
        // Sort by predicted rating and return top N
        return recommendations.stream()
            .sorted((r1, r2) -> Double.compare(r2.getPredictedRating(), r1.getPredictedRating()))
            .limit(topN)
            .collect(Collectors.toList());
    }

    /**
     * Build user-item rating matrix from reviews
     * 
     * @param reviews List of all product reviews
     * @return Map of userId -> (productId -> rating)
     */
    private Map<Long, Map<Long, Double>> buildUserItemRatingMatrix(List<ProductReview> reviews) {
        Map<Long, Map<Long, Double>> userItemRatings = new HashMap<>();
        
        for (ProductReview review : reviews) {
            Long userId = review.getUser().getId();
            Long productId = review.getProduct().getId();
            Double rating = review.getRating();
            
            userItemRatings
                .computeIfAbsent(userId, k -> new HashMap<>())
                .put(productId, rating);
        }
        
        return userItemRatings;
    }

    /**
     * Calculate global average rating across all products
     * 
     * @param products List of all products
     * @return Global average rating
     */
    private double calculateGlobalAverageRating(List<Product> products) {
        double totalRating = 0;
        int totalProducts = 0;
        
        for (Product product : products) {
            if (product.getRating() != null && product.getTotalRatings() != null && product.getTotalRatings() > 0) {
                totalRating += product.getRating();
                totalProducts++;
            }
        }
        
        return totalProducts > 0 ? totalRating / totalProducts : 0.0;
    }

    /**
     * Calculate improved ratings using weighted rating (Bayesian average)
     * R'(u,i) = (v / (v + m)) * R(u,i) + (m / (v + m)) * C
     * 
     * @param products List of all products
     * @param globalAverageRating Global average rating (C)
     * @return Map of productId -> improved rating
     */
    private Map<Long, Double> calculateImprovedRatings(List<Product> products, double globalAverageRating) {
        Map<Long, Double> improvedRatings = new HashMap<>();
        
        for (Product product : products) {
            Double rating = product.getRating();
            Integer reviewCount = product.getReviewCount();
            
            if (rating != null && reviewCount != null) {
                // v = number of reviews for item i
                double v = reviewCount;
                // m = minimum threshold
                double m = MIN_REVIEWS_THRESHOLD;
                // C = global average rating
                double C = globalAverageRating;
                
                // Calculate improved rating
                double improvedRating = (v / (v + m)) * rating + (m / (v + m)) * C;
                improvedRatings.put(product.getId(), improvedRating);
            }
        }
        
        return improvedRatings;
    }

    /**
     * Calculate cosine similarity between users using improved ratings
     * Sim(u,v) = Σ(R'(u,i) * R'(v,i)) / (sqrt(ΣR'(u,i)^2) * sqrt(ΣR'(v,i)^2))
     * 
     * @param targetUserId Target user ID
     * @param allUsers List of all users
     * @param userItemRatings User-item rating matrix
     * @param improvedRatings Map of improved ratings
     * @return Map of userId -> similarity score
     */
    private Map<Long, Double> calculateUserSimilarities(
            Long targetUserId,
            List<User> allUsers,
            Map<Long, Map<Long, Double>> userItemRatings,
            Map<Long, Double> improvedRatings) {
        
        Map<Long, Double> similarities = new HashMap<>();
        Map<Long, Double> targetUserRatings = userItemRatings.getOrDefault(targetUserId, new HashMap<>());
        
        for (User user : allUsers) {
            Long otherUserId = user.getId();
            
            // Skip the target user
            if (otherUserId.equals(targetUserId)) {
                continue;
            }
            
            Map<Long, Double> otherUserRatings = userItemRatings.getOrDefault(otherUserId, new HashMap<>());
            
            // Find common items rated by both users
            Set<Long> commonItems = new HashSet<>(targetUserRatings.keySet());
            commonItems.retainAll(otherUserRatings.keySet());
            
            if (commonItems.isEmpty()) {
                similarities.put(otherUserId, 0.0);
                continue;
            }
            
            // Calculate cosine similarity using improved ratings
            double dotProduct = 0.0;
            double norm1 = 0.0;
            double norm2 = 0.0;
            
            for (Long productId : commonItems) {
                Double targetRating = improvedRatings.getOrDefault(productId, targetUserRatings.get(productId));
                Double otherRating = improvedRatings.getOrDefault(productId, otherUserRatings.get(productId));
                
                dotProduct += targetRating * otherRating;
                norm1 += targetRating * targetRating;
                norm2 += otherRating * otherRating;
            }
            
            if (norm1 > 0 && norm2 > 0) {
                double similarity = dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
                similarities.put(otherUserId, similarity);
            } else {
                similarities.put(otherUserId, 0.0);
            }
        }
        
        return similarities;
    }

    /**
     * Predict ratings for products not rated by current user
     * Ŕ(u,i) = Σ(Sim(u,v) * R'(v,i)) / Σ|Sim(u,v)|
     * 
     * @param targetUserId Target user ID
     * @param currentUserRatings Current user's ratings
     * @param allProducts List of all products
     * @param userSimilarities User similarity scores
     * @param userItemRatings User-item rating matrix
     * @param improvedRatings Map of improved ratings
     * @return Map of productId -> predicted rating
     */
    private Map<Long, Double> predictRatings(
            Long targetUserId,
            Map<Long, Double> currentUserRatings,
            List<Product> allProducts,
            Map<Long, Double> userSimilarities,
            Map<Long, Map<Long, Double>> userItemRatings,
            Map<Long, Double> improvedRatings) {
        
        Map<Long, Double> predictedRatings = new HashMap<>();
        
        for (Product product : allProducts) {
            Long productId = product.getId();
            
            // Skip products already rated by current user
            if (currentUserRatings.containsKey(productId)) {
                continue;
            }
            
            // Calculate predicted rating
            double numerator = 0.0;
            double denominator = 0.0;
            
            for (Map.Entry<Long, Double> entry : userSimilarities.entrySet()) {
                Long otherUserId = entry.getKey();
                Double similarity = entry.getValue();
                
                // Only consider similar users (similarity > 0)
                if (similarity > 0) {
                    Map<Long, Double> otherUserRatings = userItemRatings.getOrDefault(otherUserId, new HashMap<>());
                    
                    // Use improved rating if available
                    Double rating = otherUserRatings.get(productId);
                    if (rating != null) {
                        Double improvedRating = improvedRatings.getOrDefault(productId, rating);
                        numerator += similarity * improvedRating;
                        denominator += Math.abs(similarity);
                    }
                }
            }
            
            if (denominator > 0) {
                double predictedRating = numerator / denominator;
                predictedRatings.put(productId, predictedRating);
            }
        }
        
        return predictedRatings;
    }

    /**
     * Apply business rules to filter recommendations
     * - Do not recommend items with rating < 3
     * - Reduce weight for items with very few reviews (<5)
     * 
     * @param predictedRatings Map of predicted ratings
     * @param allProducts List of all products
     * @param improvedRatings Map of improved ratings
     * @param currentUserRatings Current user's ratings
     * @return List of recommendation results
     */
    private List<RecommendationResult> applyBusinessRules(
            Map<Long, Double> predictedRatings,
            List<Product> allProducts,
            Map<Long, Double> improvedRatings,
            Map<Long, Double> currentUserRatings) {
        
        List<RecommendationResult> results = new ArrayList<>();
        
        for (Product product : allProducts) {
            Long productId = product.getId();
            
            // Skip if no predicted rating
            if (!predictedRatings.containsKey(productId)) {
                continue;
            }
            
            Double improvedRating = improvedRatings.get(productId);
            Integer reviewCount = product.getReviewCount();
            
            // Business rule: Do not recommend items with rating < 3
            if (improvedRating != null && improvedRating < MIN_RATING_THRESHOLD) {
                continue;
            }
            
            Double predictedRating = predictedRatings.get(productId);
            
            // Business rule: Reduce weight for items with very few reviews (<5)
            if (reviewCount != null && reviewCount < MIN_RELIABLE_REVIEWS) {
                // Apply a penalty factor for low review count
                double penaltyFactor = 0.5 + (reviewCount / (double) MIN_RELIABLE_REVIEWS) * 0.5;
                predictedRating *= penaltyFactor;
            }
            
            // Create recommendation result
            RecommendationResult result = new RecommendationResult();
            result.setProductId(productId);
            result.setProductName(product.getName());
            result.setPredictedRating(predictedRating);
            result.setOriginalRating(improvedRating);
            result.setReviewCount(reviewCount);
            result.setCategory(product.getCategory());
            result.setPrice(product.getPrice());
            result.setImage(product.getImage());
            
            results.add(result);
        }
        
        return results;
    }

    /**
     * Inner class to hold recommendation results
     */
    public static class RecommendationResult {
        private Long productId;
        private String productName;
        private Double predictedRating;
        private Double originalRating;
        private Integer reviewCount;
        private String category;
        private Double price;
        private String image;

        // Getters and Setters
        public Long getProductId() {
            return productId;
        }

        public void setProductId(Long productId) {
            this.productId = productId;
        }

        public String getProductName() {
            return productName;
        }

        public void setProductName(String productName) {
            this.productName = productName;
        }

        public Double getPredictedRating() {
            return predictedRating;
        }

        public void setPredictedRating(Double predictedRating) {
            this.predictedRating = predictedRating;
        }

        public Double getOriginalRating() {
            return originalRating;
        }

        public void setOriginalRating(Double originalRating) {
            this.originalRating = originalRating;
        }

        public Integer getReviewCount() {
            return reviewCount;
        }

        public void setReviewCount(Integer reviewCount) {
            this.reviewCount = reviewCount;
        }

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }

        public Double getPrice() {
            return price;
        }

        public void setPrice(Double price) {
            this.price = price;
        }

        public String getImage() {
            return image;
        }

        public void setImage(String image) {
            this.image = image;
        }
    }
}
