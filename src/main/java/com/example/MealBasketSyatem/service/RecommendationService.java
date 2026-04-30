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
    
    // Top N similar users to consider for prediction
    private static final int TOP_SIMILAR_USERS = 5;
    
    // Minimum contributors required for reliable similarity score
    private static final int MIN_CONTRIBUTORS = 2;
    
    // Minimum common items required to calculate similarity between users
    private static final int MIN_COMMON_ITEMS = 3;
    
    // Enable user confidence weighting
    private static final boolean ENABLE_USER_CONFIDENCE = true;
    
    // Cache for global average rating (performance optimization)
    private Double cachedGlobalAverageRating = null;

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
        
        // Edge case: User has no ratings - return popular items
        if (currentUserRatings.isEmpty()) {
            return getPopularItems(allProducts, improvedRatings, currentUserRatings, topN);
        }
        
        // Calculate similarity between current user and all other users
        Map<Long, Double> userSimilarities = calculateUserSimilarities(
            userId, 
            allUsers, 
            userItemRatings, 
            improvedRatings
        );
        
        // Edge case: No similar users found - return popular items
        boolean hasSimilarUsers = userSimilarities.values().stream().anyMatch(sim -> sim > 0);
        if (!hasSimilarUsers) {
            return getPopularItems(allProducts, improvedRatings, currentUserRatings, topN);
        }
        
        // Predict ratings for products not rated by current user
        Map<Long, Object[]> predictedData = predictRatings(
            userId,
            currentUserRatings,
            allProducts,
            userSimilarities,
            userItemRatings,
            improvedRatings
        );
        
        // Edge case: No predictions generated - return popular items
        if (predictedData.isEmpty()) {
            return getPopularItems(allProducts, improvedRatings, currentUserRatings, topN);
        }
        
        // Apply business rules and filter
        List<RecommendationResult> recommendations = applyBusinessRules(
            predictedData,
            allProducts,
            improvedRatings,
            currentUserRatings
        );
        
        // Edge case: No recommendations after filtering - return popular items
        if (recommendations.isEmpty()) {
            return getPopularItems(allProducts, improvedRatings, currentUserRatings, topN);
        }
        
        // Sort by similarity score (highest first), then by predicted rating
        return recommendations.stream()
            .sorted((r1, r2) -> {
                // First sort by similarity score (nulls last)
                if (r1.getSimilarityScore() == null && r2.getSimilarityScore() == null) {
                    return Double.compare(r2.getPredictedRating(), r1.getPredictedRating());
                }
                if (r1.getSimilarityScore() == null) return 1; // r1 goes last
                if (r2.getSimilarityScore() == null) return -1; // r2 goes last
                int similarityCompare = Double.compare(r2.getSimilarityScore(), r1.getSimilarityScore());
                if (similarityCompare != 0) return similarityCompare;
                // If similarity is equal, sort by predicted rating
                return Double.compare(r2.getPredictedRating(), r1.getPredictedRating());
            })
            .limit(topN)
            .collect(Collectors.toList());
    }
    
    /**
     * Get popular items as fallback when collaborative filtering fails
     * Returns top rated products with sufficient reviews
     * 
     * @param allProducts List of all products
     * @param improvedRatings Map of improved ratings
     * @param currentUserRatings Current user's ratings (to exclude already rated)
     * @param topN Number of items to return
     * @return List of popular recommendation results
     */
    private List<RecommendationResult> getPopularItems(
            List<Product> allProducts,
            Map<Long, Double> improvedRatings,
            Map<Long, Double> currentUserRatings,
            int topN) {
        
        List<RecommendationResult> results = new ArrayList<>();
        
        for (Product product : allProducts) {
            Long productId = product.getId();
            
            // Skip products already rated by current user
            if (currentUserRatings.containsKey(productId)) {
                continue;
            }
            
            Double improvedRating = improvedRatings.get(productId);
            Integer reviewCount = product.getReviewCount();
            
            // Only recommend items with sufficient reviews and good ratings
            if (improvedRating != null && 
                improvedRating >= MIN_RATING_THRESHOLD && 
                reviewCount != null && 
                reviewCount >= MIN_RELIABLE_REVIEWS) {
                
                RecommendationResult result = new RecommendationResult();
                result.setProductId(productId);
                result.setProductName(product.getName());
                result.setPredictedRating(improvedRating); // Use improved rating as predicted
                result.setOriginalRating(improvedRating);
                result.setReviewCount(reviewCount);
                result.setCategory(product.getCategory());
                result.setPrice(product.getPrice());
                result.setImage(product.getImage());
                result.setSimilarityScore(0.0); // No similarity for popular items
                
                results.add(result);
            }
        }
        
        // Sort by rating and return top N
        return results.stream()
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
     * Calculate global average rating across all products (with caching)
     * 
     * @param products List of all products
     * @return Global average rating
     */
    private double calculateGlobalAverageRating(List<Product> products) {
        // Return cached value if available
        if (cachedGlobalAverageRating != null) {
            return cachedGlobalAverageRating;
        }
        
        double totalRating = 0;
        int totalProducts = 0;
        
        for (Product product : products) {
            if (product.getRating() != null && product.getTotalRatings() != null && product.getTotalRatings() > 0) {
                totalRating += product.getRating();
                totalProducts++;
            }
        }
        
        double average = totalProducts > 0 ? totalRating / totalProducts : 0.0;
        
        // Cache the result
        cachedGlobalAverageRating = average;
        
        return average;
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
            
            // Require minimum common items for reliable similarity
            if (commonItems.size() < MIN_COMMON_ITEMS) {
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
     * Ŕ(u,i) = Σ(Sim(u,v) * Confidence(v) * R'(v,i)) / Σ(|Sim(u,v)| * Confidence(v))
     * 
     * @param targetUserId Target user ID
     * @param currentUserRatings Current user's ratings
     * @param allProducts List of all products
     * @param userSimilarities User similarity scores
     * @param userItemRatings User-item rating matrix
     * @param improvedRatings Map of improved ratings
     * @return Map of productId -> [predicted rating, similarity score, contributing users]
     */
    private Map<Long, Object[]> predictRatings(
            Long targetUserId,
            Map<Long, Double> currentUserRatings,
            List<Product> allProducts,
            Map<Long, Double> userSimilarities,
            Map<Long, Map<Long, Double>> userItemRatings,
            Map<Long, Double> improvedRatings) {
        
        Map<Long, Object[]> predictedData = new HashMap<>();
        
        // Calculate user confidence (total ratings given by each user)
        Map<Long, Integer> userConfidence = calculateUserConfidence(userItemRatings);
        
        // Filter to top N similar users
        List<Map.Entry<Long, Double>> topSimilarUsers = userSimilarities.entrySet().stream()
            .filter(entry -> entry.getValue() > 0) // Only positive similarity
            .sorted((e1, e2) -> Double.compare(e2.getValue(), e1.getValue())) // Sort descending
            .limit(TOP_SIMILAR_USERS)
            .collect(Collectors.toList());
        
        for (Product product : allProducts) {
            Long productId = product.getId();
            
            // Skip products already rated by current user
            if (currentUserRatings.containsKey(productId)) {
                continue;
            }
            
            // Calculate predicted rating and track contributing similarities
            double numerator = 0.0;
            double denominator = 0.0;
            double totalSimilarity = 0.0;
            int contributorCount = 0;
            List<SimilarUser> contributingUsers = new ArrayList<>();
            
            for (Map.Entry<Long, Double> entry : topSimilarUsers) {
                Long otherUserId = entry.getKey();
                Double similarity = entry.getValue();
                
                Map<Long, Double> otherUserRatings = userItemRatings.getOrDefault(otherUserId, new HashMap<>());
                
                // Use improved rating if available
                Double rating = otherUserRatings.get(productId);
                if (rating != null) {
                    Double improvedRating = improvedRatings.getOrDefault(productId, rating);
                    
                    // Apply user confidence weighting if enabled
                    double confidenceWeight = ENABLE_USER_CONFIDENCE 
                        ? (userConfidence.getOrDefault(otherUserId, 1) / 10.0) // Normalize confidence
                        : 1.0;
                    
                    numerator += similarity * confidenceWeight * improvedRating;
                    denominator += Math.abs(similarity) * confidenceWeight;
                    totalSimilarity += similarity;
                    contributorCount++;
                    
                    // Track contributing user
                    contributingUsers.add(new SimilarUser(
                        otherUserId, 
                        similarity, 
                        userConfidence.getOrDefault(otherUserId, 1)
                    ));
                }
            }
            
            if (denominator > 0) {
                double predictedRating = numerator / denominator;
                // Calculate average similarity score (0 to 1 scale)
                // Only set similarity if we have enough contributors, otherwise set to null
                Double avgSimilarity = (contributorCount >= MIN_CONTRIBUTORS) 
                    ? (totalSimilarity / contributorCount) 
                    : null;
                
                // Debug logging
                if (contributorCount > 0 && (avgSimilarity == null || avgSimilarity > 0.9)) {
                    System.out.println("DEBUG - Product " + productId + ": avgSimilarity=" + avgSimilarity + 
                        ", contributorCount=" + contributorCount + ", totalSimilarity=" + totalSimilarity);
                    for (SimilarUser su : contributingUsers) {
                        System.out.println("  - User " + su.getUserId() + ": similarity=" + su.getSimilarity() + 
                            ", confidence=" + su.getConfidence());
                    }
                }
                
                predictedData.put(productId, new Object[]{predictedRating, avgSimilarity, contributingUsers});
            }
        }
        
        return predictedData;
    }
    
    /**
     * Calculate user confidence based on total ratings given
     * Confidence(u) = total ratings given by user
     * 
     * @param userItemRatings User-item rating matrix
     * @return Map of userId -> confidence score
     */
    private Map<Long, Integer> calculateUserConfidence(Map<Long, Map<Long, Double>> userItemRatings) {
        Map<Long, Integer> confidence = new HashMap<>();
        
        for (Map.Entry<Long, Map<Long, Double>> entry : userItemRatings.entrySet()) {
            Long userId = entry.getKey();
            int ratingCount = entry.getValue().size();
            confidence.put(userId, ratingCount);
        }
        
        return confidence;
    }

    /**
     * Apply business rules to filter recommendations
     * - Do not recommend items with rating < 3
     * - Reduce weight for items with very few reviews (<5)
     * 
     * @param predictedData Map of productId -> [predicted rating, similarity score, contributing users]
     * @param allProducts List of all products
     * @param improvedRatings Map of improved ratings
     * @param currentUserRatings Current user's ratings
     * @return List of recommendation results
     */
    private List<RecommendationResult> applyBusinessRules(
            Map<Long, Object[]> predictedData,
            List<Product> allProducts,
            Map<Long, Double> improvedRatings,
            Map<Long, Double> currentUserRatings) {
        
        List<RecommendationResult> results = new ArrayList<>();
        
        for (Product product : allProducts) {
            Long productId = product.getId();
            
            // Skip if no predicted data
            if (!predictedData.containsKey(productId)) {
                continue;
            }
            
            Double improvedRating = improvedRatings.get(productId);
            Integer reviewCount = product.getReviewCount();
            
            // Business rule: Do not recommend items with rating < 3
            if (improvedRating != null && improvedRating < MIN_RATING_THRESHOLD) {
                continue;
            }
            
            Object[] data = predictedData.get(productId);
            Double predictedRating = (Double) data[0];
            Double similarityScore = (Double) data[1];
            @SuppressWarnings("unchecked")
            List<SimilarUser> contributingUsers = (List<SimilarUser>) data[2];
            
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
            result.setSimilarityScore(similarityScore);
            result.setContributingSimilarUsers(contributingUsers);
            
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
        private Double similarityScore;
        private List<SimilarUser> contributingSimilarUsers;

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

        public Double getSimilarityScore() {
            return similarityScore;
        }

        public void setSimilarityScore(Double similarityScore) {
            this.similarityScore = similarityScore;
        }

        public List<SimilarUser> getContributingSimilarUsers() {
            return contributingSimilarUsers;
        }

        public void setContributingSimilarUsers(List<SimilarUser> contributingSimilarUsers) {
            this.contributingSimilarUsers = contributingSimilarUsers;
        }
    }

    /**
     * Inner class to hold similar user information
     */
    public static class SimilarUser {
        private Long userId;
        private Double similarity;
        private Integer confidence;

        public SimilarUser(Long userId, Double similarity, Integer confidence) {
            this.userId = userId;
            this.similarity = similarity;
            this.confidence = confidence;
        }

        public Long getUserId() {
            return userId;
        }

        public void setUserId(Long userId) {
            this.userId = userId;
        }

        public Double getSimilarity() {
            return similarity;
        }

        public void setSimilarity(Double similarity) {
            this.similarity = similarity;
        }

        public Integer getConfidence() {
            return confidence;
        }

        public void setConfidence(Integer confidence) {
            this.confidence = confidence;
        }
    }
}
