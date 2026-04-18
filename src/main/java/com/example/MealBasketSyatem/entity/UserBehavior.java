package com.example.MealBasketSyatem.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "user_behavior")
public class UserBehavior {

    public enum ActionType {
        VIEW,
        CLICK, 
        ADD_TO_CART,
        SEARCH,
        CATEGORY_BROWSE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(name = "action_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private ActionType actionType;

    @Column(name = "category")
    private String category; // For category browsing without specific product

    @Column(name = "search_query")
    private String searchQuery; // For search actions

    @Column(name = "timestamp", nullable = false)
    private java.time.LocalDateTime timestamp;

    @Column(name = "session_id")
    private String sessionId;

    @Column(name = "duration_seconds")
    private Integer durationSeconds; // Time spent on page/product

    // Constructors
    public UserBehavior() {
        this.timestamp = java.time.LocalDateTime.now();
    }

    public UserBehavior(User user, Product product, ActionType actionType) {
        this.user = user;
        this.product = product;
        this.actionType = actionType;
        this.timestamp = java.time.LocalDateTime.now();
    }

    public UserBehavior(User user, ActionType actionType, String category) {
        this.user = user;
        this.actionType = actionType;
        this.category = category;
        this.timestamp = java.time.LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public ActionType getActionType() {
        return actionType;
    }

    public void setActionType(ActionType actionType) {
        this.actionType = actionType;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getSearchQuery() {
        return searchQuery;
    }

    public void setSearchQuery(String searchQuery) {
        this.searchQuery = searchQuery;
    }

    public java.time.LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(java.time.LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public Integer getDurationSeconds() {
        return durationSeconds;
    }

    public void setDurationSeconds(Integer durationSeconds) {
        this.durationSeconds = durationSeconds;
    }
}
