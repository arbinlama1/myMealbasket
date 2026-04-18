package com.example.MealBasketSyatem.service;

import com.example.MealBasketSyatem.entity.*;
import com.example.MealBasketSyatem.repo.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    @Autowired
    private RatingRepo ratingRepo;

    @Autowired
    private UserBehaviorRepo userBehaviorRepo;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private OrderRepo orderRepo;

    // Collaborative Filtering Implementation
    public List<Product> getCollaborativeFilteringRecommendations(Long userId, int limit) {
        User user = userRepo.findById(userId).orElse(null);
        if (user == null) return Collections.emptyList();

        // Find similar users based on rating patterns
        List<Long> similarUserIds = findSimilarUsers(userId);
        
        if (similarUserIds.isEmpty()) {
            return Collections.emptyList();
        }

        // Get products rated highly by similar users
        List<Object[]> similarUserProducts = ratingRepo.findProductsRatedBySimilarUsers(similarUserIds);
        
        // Filter out products already rated/purchased by current user
        Set<Long> excludedProductIds = getExcludedProductIds(userId);
        
        return similarUserProducts.stream()
            .filter(obj -> {
                Product product = (Product) obj[0];
                return !excludedProductIds.contains(product.getId());
            })
            .map(obj -> (Product) obj[0])
            .distinct()
            .limit(limit)
            .collect(Collectors.toList());
    }

    // Content-Based Filtering Implementation
    public List<Product> getContentBasedRecommendations(Long userId, int limit) {
        User user = userRepo.findById(userId).orElse(null);
        if (user == null) return Collections.emptyList();

        // Get user's highly rated products
        List<Rating> userHighRatings = ratingRepo.findHighlyRatedProductsByUser(userId, 4);
        
        if (userHighRatings.isEmpty()) {
            // If no ratings, use browsing behavior
            return getRecommendationsFromBrowsingBehavior(userId, limit);
        }

        // Extract preferred categories and similar products
        Set<String> preferredCategories = userHighRatings.stream()
            .map(rating -> rating.getProduct().getCategory())
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());

        // Find highly rated products in preferred categories
        List<Product> categoryRecommendations = new ArrayList<>();
        for (String category : preferredCategories) {
            List<Rating> categoryRatings = ratingRepo.findHighlyRatedProductsByCategory(category, 4);
            categoryRecommendations.addAll(
                categoryRatings.stream()
                    .map(Rating::getProduct)
                    .collect(Collectors.toList())
            );
        }

        // Filter out already rated/purchased products
        Set<Long> excludedProductIds = getExcludedProductIds(userId);
        
        return categoryRecommendations.stream()
            .filter(product -> !excludedProductIds.contains(product.getId()))
            .distinct()
            .limit(limit)
            .collect(Collectors.toList());
    }

    // Hybrid Approach combining both methods
    public List<Product> getHybridRecommendations(Long userId, int limit) {
        List<Product> collaborativeRecs = getCollaborativeFilteringRecommendations(userId, limit);
        List<Product> contentBasedRecs = getContentBasedRecommendations(userId, limit);

        // Combine and weight the recommendations
        Map<Product, Double> productScores = new HashMap<>();
        
        // Weight collaborative filtering higher (0.6) for users with more ratings
        int userRatingCount = ratingRepo.findByUser(userRepo.findById(userId).orElse(null)).size();
        double collaborativeWeight = userRatingCount > 5 ? 0.6 : 0.4;
        double contentBasedWeight = 1.0 - collaborativeWeight;

        // Score collaborative recommendations
        for (int i = 0; i < collaborativeRecs.size(); i++) {
            Product product = collaborativeRecs.get(i);
            double score = (collaborativeRecs.size() - i) * collaborativeWeight;
            productScores.merge(product, score, (oldVal, newVal) -> oldVal + newVal);
        }

        // Score content-based recommendations
        for (int i = 0; i < contentBasedRecs.size(); i++) {
            Product product = contentBasedRecs.get(i);
            double score = (contentBasedRecs.size() - i) * contentBasedWeight;
            productScores.merge(product, score, (oldVal, newVal) -> oldVal + newVal);
        }

        // Sort by combined score and return top N
        return productScores.entrySet().stream()
            .sorted(Map.Entry.<Product, Double>comparingByValue().reversed())
            .limit(limit)
            .map(Map.Entry::getKey)
            .collect(Collectors.toList());
    }

    // Get top N recommendations with minimum rating threshold
    public List<Product> getTopRecommendations(Long userId, int n) {
        List<Product> hybridRecs = getHybridRecommendations(userId, n * 2); // Get more to filter
        
        // Filter by products with average rating >= 4.0
        return hybridRecs.stream()
            .filter(product -> {
                Double avgRating = ratingRepo.getAverageRatingForProduct(product);
                return avgRating != null && avgRating >= 4.0;
            })
            .limit(n)
            .collect(Collectors.toList());
    }

    // Helper methods
    private List<Long> findSimilarUsers(Long userId) {
        List<Object[]> activeUsers = ratingRepo.findActiveUsersWithMinRatings(4, 3);
        
        if (activeUsers.isEmpty()) {
            return Collections.emptyList();
        }

        List<Long> activeUserIds = activeUsers.stream()
            .map(obj -> (Long) obj[0])
            .collect(Collectors.toList());

        // Simple similarity based on common highly rated products
        List<Rating> userRatings = ratingRepo.findHighlyRatedProductsByUser(userId, 4);
        Set<Long> userHighlyRatedProductIds = userRatings.stream()
            .map(rating -> rating.getProduct().getId())
            .collect(Collectors.toSet());

        Map<Long, Integer> similarityScores = new HashMap<>();
        
        for (Long otherUserId : activeUserIds) {
            if (otherUserId.equals(userId)) continue;
            
            List<Rating> otherUserRatings = ratingRepo.findHighlyRatedProductsByUser(otherUserId, 4);
            Set<Long> otherUserProductIds = otherUserRatings.stream()
                .map(rating -> rating.getProduct().getId())
                .collect(Collectors.toSet());
            
            // Calculate Jaccard similarity
            Set<Long> intersection = new HashSet<>(userHighlyRatedProductIds);
            intersection.retainAll(otherUserProductIds);
            
            Set<Long> union = new HashSet<>(userHighlyRatedProductIds);
            union.addAll(otherUserProductIds);
            
            if (!union.isEmpty()) {
                double similarity = (double) intersection.size() / union.size();
                if (similarity > 0.2) { // Minimum similarity threshold
                    similarityScores.put(otherUserId, (int) (similarity * 100));
                }
            }
        }

        return similarityScores.entrySet().stream()
            .sorted(Map.Entry.<Long, Integer>comparingByValue().reversed())
            .limit(5) // Top 5 similar users
            .map(Map.Entry::getKey)
            .collect(Collectors.toList());
    }

    private Set<Long> getExcludedProductIds(Long userId) {
        Set<Long> excludedIds = new HashSet<>();
        
        // Add rated products
        List<Rating> userRatings = ratingRepo.findByUser(userRepo.findById(userId).orElse(null));
        excludedIds.addAll(userRatings.stream()
            .map(rating -> rating.getProduct().getId())
            .collect(Collectors.toList()));
        
        // Add purchased products
        List<Order> userOrders = orderRepo.findByUser(userRepo.findById(userId).orElse(null));
        excludedIds.addAll(userOrders.stream()
            .filter(order -> order.getProduct() != null)
            .map(order -> order.getProduct().getId())
            .collect(Collectors.toList()));
        
        return excludedIds;
    }

    private List<Product> getRecommendationsFromBrowsingBehavior(Long userId, int limit) {
        User user = userRepo.findById(userId).orElse(null);
        if (user == null) return Collections.emptyList();

        // Get most browsed categories
        List<Object[]> categoryData = userBehaviorRepo.findMostBrowsedCategoriesByUser(user);
        
        if (categoryData.isEmpty()) {
            // Fallback to trending products
            return getTrendingProducts(limit);
        }

        List<Product> recommendations = new ArrayList<>();
        for (Object[] obj : categoryData) {
            String category = (String) obj[0];
            List<Rating> categoryRatings = ratingRepo.findHighlyRatedProductsByCategory(category, 4);
            recommendations.addAll(
                categoryRatings.stream()
                    .map(Rating::getProduct)
                    .collect(Collectors.toList())
            );
        }

        Set<Long> excludedProductIds = getExcludedProductIds(userId);
        return recommendations.stream()
            .filter(product -> !excludedProductIds.contains(product.getId()))
            .distinct()
            .limit(limit)
            .collect(Collectors.toList());
    }

    private List<Product> getTrendingProducts(int limit) {
        List<Object[]> trendingData = userBehaviorRepo.findTrendingProducts(
            LocalDateTime.now().minusDays(7)
        );
        
        return trendingData.stream()
            .map(obj -> (Product) obj[0])
            .limit(limit)
            .collect(Collectors.toList());
    }

    // Additional utility methods
    public List<Product> getHighlyRatedProducts(int limit) {
        List<Object[]> productData = ratingRepo.findAllProductsOrderedByAverageRating();
        return productData.stream()
            .map(obj -> (Product) obj[0])
            .limit(limit)
            .collect(Collectors.toList());
    }

    public Map<String, Object> getUserPreferences(Long userId) {
        User user = userRepo.findById(userId).orElse(null);
        if (user == null) return Collections.emptyMap();

        Map<String, Object> preferences = new HashMap<>();
        
        // Rating preferences
        List<Rating> userRatings = ratingRepo.findByUser(user);
        if (!userRatings.isEmpty()) {
            double avgRating = userRatings.stream()
                .mapToInt(Rating::getRating)
                .average()
                .orElse(0.0);
            preferences.put("averageRatingGiven", avgRating);
            
            Set<String> preferredCategories = userRatings.stream()
                .filter(rating -> rating.getRating() >= 4)
                .map(rating -> rating.getProduct().getCategory())
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
            preferences.put("preferredCategories", preferredCategories);
        }
        
        // Browsing preferences
        List<Object[]> categoryData = userBehaviorRepo.findMostBrowsedCategoriesByUser(user);
        if (!categoryData.isEmpty()) {
            List<String> browsedCategories = categoryData.stream()
                .map(obj -> (String) obj[0])
                .collect(Collectors.toList());
            preferences.put("browsedCategories", browsedCategories);
        }
        
        return preferences;
    }
}
