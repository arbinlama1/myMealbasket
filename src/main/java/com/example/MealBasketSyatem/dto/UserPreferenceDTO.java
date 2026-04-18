package com.example.MealBasketSyatem.dto;

import java.util.List;
import java.util.Map;

public class UserPreferenceDTO {
    private Long userId;
    private String userName;
    private Double averageRatingGiven;
    private List<String> preferredCategories;
    private List<String> browsedCategories;
    private Map<String, Integer> categoryPreferences;
    private int totalRatings;
    private int totalPurchases;
    private List<String> recentSearches;
    private Map<String, Object> behaviorMetrics;

    public UserPreferenceDTO() {}

    public UserPreferenceDTO(Long userId, String userName) {
        this.userId = userId;
        this.userName = userName;
    }

    // Getters and Setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public Double getAverageRatingGiven() {
        return averageRatingGiven;
    }

    public void setAverageRatingGiven(Double averageRatingGiven) {
        this.averageRatingGiven = averageRatingGiven;
    }

    public List<String> getPreferredCategories() {
        return preferredCategories;
    }

    public void setPreferredCategories(List<String> preferredCategories) {
        this.preferredCategories = preferredCategories;
    }

    public List<String> getBrowsedCategories() {
        return browsedCategories;
    }

    public void setBrowsedCategories(List<String> browsedCategories) {
        this.browsedCategories = browsedCategories;
    }

    public Map<String, Integer> getCategoryPreferences() {
        return categoryPreferences;
    }

    public void setCategoryPreferences(Map<String, Integer> categoryPreferences) {
        this.categoryPreferences = categoryPreferences;
    }

    public int getTotalRatings() {
        return totalRatings;
    }

    public void setTotalRatings(int totalRatings) {
        this.totalRatings = totalRatings;
    }

    public int getTotalPurchases() {
        return totalPurchases;
    }

    public void setTotalPurchases(int totalPurchases) {
        this.totalPurchases = totalPurchases;
    }

    public List<String> getRecentSearches() {
        return recentSearches;
    }

    public void setRecentSearches(List<String> recentSearches) {
        this.recentSearches = recentSearches;
    }

    public Map<String, Object> getBehaviorMetrics() {
        return behaviorMetrics;
    }

    public void setBehaviorMetrics(Map<String, Object> behaviorMetrics) {
        this.behaviorMetrics = behaviorMetrics;
    }
}
