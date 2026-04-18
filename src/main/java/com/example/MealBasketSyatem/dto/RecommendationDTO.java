package com.example.MealBasketSyatem.dto;

import com.example.MealBasketSyatem.entity.Product;

import java.util.List;

public class RecommendationDTO {
    private Long userId;
    private List<ProductRecommendation> recommendations;
    private String recommendationType;
    private String algorithm;
    private int totalCount;

    public RecommendationDTO() {}

    public RecommendationDTO(Long userId, List<ProductRecommendation> recommendations, 
                           String recommendationType, String algorithm) {
        this.userId = userId;
        this.recommendations = recommendations;
        this.recommendationType = recommendationType;
        this.algorithm = algorithm;
        this.totalCount = recommendations != null ? recommendations.size() : 0;
    }

    // Getters and Setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public List<ProductRecommendation> getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(List<ProductRecommendation> recommendations) {
        this.recommendations = recommendations;
        this.totalCount = recommendations != null ? recommendations.size() : 0;
    }

    public String getRecommendationType() {
        return recommendationType;
    }

    public void setRecommendationType(String recommendationType) {
        this.recommendationType = recommendationType;
    }

    public String getAlgorithm() {
        return algorithm;
    }

    public void setAlgorithm(String algorithm) {
        this.algorithm = algorithm;
    }

    public int getTotalCount() {
        return totalCount;
    }

    public void setTotalCount(int totalCount) {
        this.totalCount = totalCount;
    }

    public static class ProductRecommendation {
        private Product product;
        private double predictedRating;
        private double confidenceScore;
        private String reason;
        private String category;

        public ProductRecommendation() {}

        public ProductRecommendation(Product product, double predictedRating, 
                                   double confidenceScore, String reason) {
            this.product = product;
            this.predictedRating = predictedRating;
            this.confidenceScore = confidenceScore;
            this.reason = reason;
            this.category = product != null ? product.getCategory() : null;
        }

        // Getters and Setters
        public Product getProduct() {
            return product;
        }

        public void setProduct(Product product) {
            this.product = product;
            this.category = product != null ? product.getCategory() : null;
        }

        public double getPredictedRating() {
            return predictedRating;
        }

        public void setPredictedRating(double predictedRating) {
            this.predictedRating = predictedRating;
        }

        public double getConfidenceScore() {
            return confidenceScore;
        }

        public void setConfidenceScore(double confidenceScore) {
            this.confidenceScore = confidenceScore;
        }

        public String getReason() {
            return reason;
        }

        public void setReason(String reason) {
            this.reason = reason;
        }

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }
    }
}
