package com.example.MealBasketSyatem.dto;

import com.example.MealBasketSyatem.entity.Rating;
import com.example.MealBasketSyatem.entity.User;
import com.example.MealBasketSyatem.entity.Product;

import java.time.LocalDateTime;

public class RatingDTO {
    private Long id;
    private Integer rating; // 1 to 5 stars
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // User information
    private Long userId;
    private String userName;
    private String userEmail;
    
    // Product information
    private Long productId;
    private String productName;
    private String productCategory;
    private Double productPrice;
    private String vendorName;
    private String vendorShopName;

    // Default constructor
    public RatingDTO() {}

    // Constructor from Rating entity
    public RatingDTO(Rating rating) {
        this.id = rating.getId();
        this.rating = rating.getRating();
        this.createdAt = rating.getCreatedAt();
        this.updatedAt = rating.getUpdatedAt();
        
        // Extract user information
        if (rating.getUser() != null) {
            this.userId = rating.getUser().getId();
            this.userName = rating.getUser().getName();
            this.userEmail = rating.getUser().getEmail();
        }
        
        // Extract product information
        if (rating.getProduct() != null) {
            this.productId = rating.getProduct().getId();
            this.productName = rating.getProduct().getName();
            this.productCategory = rating.getProduct().getCategory();
            this.productPrice = rating.getProduct().getPrice();
            
            // Extract vendor information from product
            if (rating.getProduct().getVendor() != null) {
                this.vendorName = rating.getProduct().getVendor().getName();
                this.vendorShopName = rating.getProduct().getVendor().getShopName();
            }
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

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

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

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

    public String getProductCategory() {
        return productCategory;
    }

    public void setProductCategory(String productCategory) {
        this.productCategory = productCategory;
    }

    public Double getProductPrice() {
        return productPrice;
    }

    public void setProductPrice(Double productPrice) {
        this.productPrice = productPrice;
    }

    public String getVendorName() {
        return vendorName;
    }

    public void setVendorName(String vendorName) {
        this.vendorName = vendorName;
    }

    public String getVendorShopName() {
        return vendorShopName;
    }

    public void setVendorShopName(String vendorShopName) {
        this.vendorShopName = vendorShopName;
    }
}
