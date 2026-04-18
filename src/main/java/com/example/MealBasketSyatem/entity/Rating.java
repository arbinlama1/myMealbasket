package com.example.MealBasketSyatem.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ratings", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "product_id"})
})
public class Rating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "rating", nullable = false)
    private Integer rating; // 1 to 5 stars

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Constructors
    public Rating() {
        this.createdAt = LocalDateTime.now();
    }

    public Rating(User user, Product product, Integer rating) {
        this.user = user;
        this.product = product;
        this.rating = rating;
        this.createdAt = LocalDateTime.now();
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

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        if (rating < 0 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 0 and 5");
        }
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

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        // Validate before saving
        if (this.user == null) {
            throw new IllegalArgumentException("User cannot be null when saving rating");
        }
        if (this.product == null) {
            throw new IllegalArgumentException("Product cannot be null when saving rating");
        }
        if (this.rating == null || this.rating < 0 || this.rating > 5) {
            throw new IllegalArgumentException("Rating must be between 0 and 5");
        }
    }

    // Utility methods for debugging
    @Override
    public String toString() {
        return "Rating{" +
                "id=" + id +
                ", user=" + (user != null ? user.getId() : "null") +
                ", product=" + (product != null ? product.getId() : "null") +
                ", rating=" + rating +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }

    // Method to check if entity is ready for database save
    public boolean isValidForDatabase() {
        return user != null && 
               product != null && 
               rating != null && 
               rating >= 0 && 
               rating <= 5;
    }

    // Method to get database-ready representation
    public String getDatabaseInfo() {
        return String.format("Rating[User=%d, Product=%d, Rating=%d, Created=%s]",
                user != null ? user.getId() : null,
                product != null ? product.getId() : null,
                rating,
                createdAt);
    }
}
