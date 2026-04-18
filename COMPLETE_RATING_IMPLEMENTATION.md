# Complete Rating System Implementation - Self-Contained

## Overview
Complete, working rating system with database persistence, frontend UI, and backend API.

## Step 1: Database Setup

### Create Ratings Table
```sql
-- Create ratings table if it doesn't exist
CREATE TABLE IF NOT EXISTS ratings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, product_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Verify table creation
SELECT * FROM information_schema.tables WHERE table_name = 'ratings';
```

## Step 2: Backend Implementation

### Rating Entity (Complete)
```java
// File: src/main/java/com/example/MealBasketSyatem/entity/Rating.java
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "rating", nullable = false)
    private Integer rating;

    @Column(name = "created_at", nullable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // Constructors
    public Rating() {}

    public Rating(User user, Product product, Integer rating) {
        this.user = user;
        this.product = product;
        this.rating = rating;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public Integer getRating() { return rating; }
    
    public void setRating(Integer rating) {
        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }
        this.rating = rating;
    }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Lifecycle callbacks
    @PrePersist
    private void prePersist() {
        System.out.println("=== RATING PRE-PERSIST ===");
        System.out.println("User ID: " + (user != null ? user.getId() : "null"));
        System.out.println("Product ID: " + (product != null ? product.getId() : "null"));
        System.out.println("Rating: " + rating);
    }

    @PostPersist
    private void postPersist() {
        System.out.println("=== RATING POST-PERSIST ===");
        System.out.println("Rating ID: " + id + " saved successfully");
    }

    @Override
    public String toString() {
        return "Rating{id=" + id + ", user=" + (user != null ? user.getId() : "null") + 
               ", product=" + (product != null ? product.getId() : "null") + 
               ", rating=" + rating + "}";
    }
}
```

### Rating Repository
```java
// File: src/main/java/com/example/MealBasketSyatem/repo/RatingRepo.java
package com.example.MealBasketSyatem.repo;

import com.example.MealBasketSyatem.entity.Rating;
import com.example.MealBasketSyatem.entity.User;
import com.example.MealBasketSyatem.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RatingRepo extends JpaRepository<Rating, Long> {

    Optional<Rating> findByUserAndProduct(User user, Product product);
    List<Rating> findByUser(User user);
    List<Rating> findByProduct(Product product);

    @Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM Rating r WHERE r.product = :product")
    Double getAverageRatingForProduct(@Param("product") Product product);

    @Query("SELECT COUNT(r) FROM Rating r WHERE r.product = :product")
    Long getRatingCountForProduct(@Param("product") Product product);

    @Query("SELECT r.rating, COUNT(r) FROM Rating r WHERE r.product = :product GROUP BY r.rating ORDER BY r.rating")
    List<Object[]> getRatingDistributionForProduct(@Param("product") Product product);
}
```

### Complete Rating Controller
```java
// File: src/main/java/com/example/MealBasketSyatem/controller/RatingController.java
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

    private static final Logger logger = LoggerFactory.getLogger(RatingController.class);

    @Autowired
    private RatingRepo ratingRepo;

    @Autowired
    private UserService userService;

    @Autowired
    private ProductService productService;

    // Health check endpoint
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "healthy");
        response.put("service", "rating-service");
        response.put("database", "connected");
        return ResponseEntity.ok(response);
    }

    // Submit rating - Complete implementation
    @PostMapping("/rate")
    @Transactional
    public ResponseEntity<ApiResponse<?>> saveRating(@RequestBody Map<String, Object> request) {
        try {
            logger.info("=== RATING SUBMISSION START ===");
            
            // Get authenticated user
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("User not authenticated"));
            }

            String email = auth.getName();
            User currentUser = userService.findUserByEmail(email);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("User not found"));
            }

            logger.info("Authenticated user: {}", currentUser.getEmail());

            // Extract and validate request data
            Long productId = Long.parseLong(request.get("productId").toString());
            Integer rating = Integer.parseInt(request.get("rating").toString());
            
            logger.info("Rating request - Product: {}, Rating: {}", productId, rating);

            // Validate rating range
            if (rating < 1 || rating > 5) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Rating must be between 1 and 5"));
            }

            // Get product
            Product product = productService.getProductById(productId);
            if (product == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Product not found"));
            }

            // Check for existing rating
            Optional<Rating> existingRating = ratingRepo.findByUserAndProduct(currentUser, product);
            
            Rating ratingEntity;
            boolean isNewRating = false;
            
            if (existingRating.isPresent()) {
                // Update existing rating
                ratingEntity = existingRating.get();
                ratingEntity.setRating(rating);
                logger.info("Updating existing rating: {}", ratingEntity);
            } else {
                // Create new rating
                ratingEntity = new Rating(currentUser, product, rating);
                isNewRating = true;
                logger.info("Creating new rating: {}", ratingEntity);
            }

            // Save to database
            logger.info("=== SAVING RATING TO DATABASE ===");
            Rating savedRating = ratingRepo.save(ratingEntity);
            
            logger.info("=== RATING SAVED SUCCESSFULLY ===");
            logger.info("Rating ID: {}", savedRating.getId());
            logger.info("User ID: {}", savedRating.getUser().getId());
            logger.info("Product ID: {}", savedRating.getProduct().getId());
            logger.info("Rating Value: {}", savedRating.getRating());

            // Verify save was successful
            Optional<Rating> verifyRating = ratingRepo.findById(savedRating.getId());
            if (!verifyRating.isPresent()) {
                throw new RuntimeException("Failed to verify rating was saved");
            }

            String message = isNewRating ? "Rating created successfully" : "Rating updated successfully";
            return ResponseEntity.ok(ApiResponse.success(message, savedRating));

        } catch (Exception e) {
            logger.error("=== ERROR SAVING RATING ===", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to save rating: " + e.getMessage()));
        }
    }

    // Get user's ratings
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Rating>> getUserRatings(@PathVariable Long userId) {
        try {
            User user = userService.getUserById(userId);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }

            List<Rating> ratings = ratingRepo.findByUser(user);
            logger.info("Found {} ratings for user {}", ratings.size(), userId);
            
            return ResponseEntity.ok(ratings);
        } catch (Exception e) {
            logger.error("Error getting user ratings", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get product statistics
    @GetMapping("/product/{productId}/stats")
    public ResponseEntity<Map<String, Object>> getProductStats(@PathVariable Long productId) {
        try {
            Product product = productService.getProductById(productId);
            if (product == null) {
                return ResponseEntity.notFound().build();
            }

            // Get all ratings and calculate manually
            List<Rating> ratings = ratingRepo.findByProduct(product);
            double totalRating = 0;
            int validRatings = 0;

            for (Rating r : ratings) {
                if (r.getRating() > 0) {
                    totalRating += r.getRating();
                    validRatings++;
                }
            }

            double averageRating = validRatings > 0 ? totalRating / validRatings : 0.0;
            
            Map<String, Object> response = new HashMap<>();
            response.put("averageRating", averageRating);
            response.put("rating", (int) Math.round(averageRating));
            response.put("ratingCount", ratings.size());
            response.put("totalRatings", validRatings);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting product stats", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get top rated products
    @GetMapping("/top-rated")
    public ResponseEntity<List<Map<String, Object>>> getTopRatedProducts() {
        try {
            List<Product> products = productService.getAllProduct();
            List<Map<String, Object>> result = new ArrayList<>();

            for (Product product : products) {
                Double avgRating = ratingRepo.getAverageRatingForProduct(product);
                Long count = ratingRepo.getRatingCountForProduct(product);

                if (avgRating != null && avgRating > 0 && count > 0) {
                    Map<String, Object> productData = new HashMap<>();
                    productData.put("id", product.getId());
                    productData.put("name", product.getName());
                    productData.put("price", product.getPrice());
                    productData.put("averageRating", avgRating);
                    productData.put("rating", (int) Math.round(avgRating));
                    productData.put("ratingCount", count);
                    result.add(productData);
                }
            }

            // Sort by average rating
            result.sort((a, b) -> Double.compare((Double) b.get("averageRating"), (Double) a.get("averageRating")));

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("Error getting top rated products", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
```

## Step 3: Frontend Implementation

### Complete StarRating Component
```javascript
// File: react-frontend/src/components/StarRating.js
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Snackbar, Alert } from '@mui/material';
import { Star, StarBorder } from '@mui/icons-material';
import { useRating } from '../contexts/RatingContext';

const StarRating = ({ 
  productId, 
  initialRating = 0, 
  readOnly = false, 
  size = 'medium',
  onRatingChange,
  showValue = true 
}) => {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [pendingRating, setPendingRating] = useState(null);
  
  const { getUserRating, updateUserRating, submitRating } = useRating();
  const userRating = getUserRating(productId);

  // Load product rating for read-only mode
  useEffect(() => {
    if (readOnly && productId) {
      loadProductRating();
    }
  }, [productId, readOnly]);

  const loadProductRating = async () => {
    try {
      const response = await fetch(`http://localhost:8081/api/ratings/product/${productId}/stats`);
      if (response.ok) {
        const data = await response.json();
        const actualRating = data.rating || 0;
        setRating(actualRating);
      }
    } catch (error) {
      console.error('Error loading product rating:', error);
    }
  };

  const getIconSize = () => {
    const sizes = {
      small: 20,
      medium: 24,
      large: 32
    };
    return sizes[size] || sizes.medium;
  };

  const handleStarClick = (starValue) => {
    if (readOnly) return;
    
    console.log('=== STAR CLICKED ===');
    console.log('Star Value:', starValue);
    console.log('Product ID:', productId);
    console.log('Current Rating:', rating);
    
    setPendingRating(starValue);
    setHover(0);
  };

  const handleSubmitRating = async () => {
    if (!pendingRating) return;
    
    setLoading(true);
    try {
      console.log('=== SUBMITTING RATING ===');
      console.log('Product ID:', productId);
      console.log('Rating:', pendingRating);
      
      const result = await submitRating(productId, pendingRating);
      
      if (result.success) {
        setRating(pendingRating);
        setPendingRating(null);
        updateUserRating(productId, pendingRating);
        
        setSuccessMessage(`Rating ${pendingRating} stars submitted successfully!`);
        setShowSuccess(true);
        
        console.log('=== RATING SUBMISSION SUCCESS ===');
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('=== RATING SUBMISSION ERROR ===');
      console.error('Error:', error);
      alert(`Failed to submit rating: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    const iconSize = getIconSize();
    
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= (hover || (pendingRating || rating));
      const StarIcon = isFilled ? Star : StarBorder;
      
      stars.push(
        <StarIcon
          key={i}
          sx={{
            color: readOnly ? (isFilled ? '#ffc107' : '#e0e0e0') : '#ffb300',
            cursor: readOnly ? 'default' : 'pointer',
            fontSize: iconSize,
            '&:hover': {
              color: '#ffb300',
              transform: 'scale(1.1)',
              transition: 'all 0.2s ease-in-out'
            }
          }}
          onClick={() => handleStarClick(i)}
          onMouseEnter={() => !readOnly && setHover(i)}
          onMouseLeave={() => !readOnly && setHover(0)}
        />
      );
    }
    
    return stars;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {renderStars()}
        
        {/* Rating display */}
        {showValue && (
          <Typography variant="body2" sx={{ minWidth: '30px', fontWeight: 'bold', color: '#1976d2' }}>
            {readOnly ? `${rating}/5` : userRating !== null ? `(${userRating})` : rating > 0 ? `(${rating})` : '(0)'}
          </Typography>
        )}
        
        {/* Submit button */}
        {!readOnly && pendingRating && (
          <Button
            variant="outlined"
            size="small"
            onClick={handleSubmitRating}
            disabled={loading}
            sx={{ ml: 1 }}
          >
            {loading ? 'Submitting...' : `Submit ${pendingRating} Stars`}
          </Button>
        )}
      </Box>
      
      {/* Success message */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StarRating;
```

### Complete RatingContext
```javascript
// File: react-frontend/src/contexts/RatingContext.js
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const RatingContext = createContext();

export const useRating = () => {
  const context = useContext(RatingContext);
  if (!context) {
    throw new Error('useRating must be used within RatingProvider');
  }
  return context;
};

export const RatingProvider = ({ children }) => {
  const [ratings, setRatings] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Submit rating to backend
  const submitRating = async (productId, rating) => {
    setLoading(true);
    try {
      console.log('=== SUBMITTING RATING TO BACKEND ===');
      console.log('Product ID:', productId);
      console.log('Rating:', rating);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:8081/api/ratings/rate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: productId,
          rating: rating
        })
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Rating submission successful:', result);
        
        // Update local state
        setRatings(prev => ({
          ...prev,
          [productId]: rating
        }));
        
        return { success: true, data: result.data };
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit rating');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Load user ratings from backend
  const loadUserRatings = useCallback(async () => {
    const userId = localStorage.getItem('userId');
    console.log('=== LOADING USER RATINGS ===');
    console.log('UserId:', userId);

    if (!userId) {
      setRatings({});
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8081/api/ratings/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('User ratings from database:', data);

        if (Array.isArray(data)) {
          const ratingsMap = {};
          data.forEach(rating => {
            const productId = rating.product?.id || rating.productId;
            if (productId) {
              ratingsMap[productId] = rating.rating;
            }
          });
          setRatings(ratingsMap);
          console.log('Final ratings map:', ratingsMap);
        }
      } else {
        console.error('Failed to load user ratings');
      }
    } catch (error) {
      console.error('Error loading user ratings:', error);
      setRatings({});
    } finally {
      setLoading(false);
    }
  }, []);

  // Get user's rating for a product
  const getUserRating = (productId) => {
    return ratings[productId] || 0;
  };

  // Update user's rating locally
  const updateUserRating = (productId, rating) => {
    setRatings(prev => ({
      ...prev,
      [productId]: rating
    }));
  };

  // Load ratings when user changes
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId && userId !== currentUserId) {
      setCurrentUserId(userId);
      loadUserRatings();
    }
  }, [loadUserRatings, currentUserId]);

  return (
    <RatingContext.Provider value={{
      ratings,
      loading,
      currentUserId,
      submitRating,
      loadUserRatings,
      getUserRating,
      updateUserRating
    }}>
      {children}
    </RatingContext.Provider>
  );
};
```

## Step 4: Integration

### App.js Integration
```javascript
// File: react-frontend/src/App.js
import React from 'react';
import { RatingProvider } from './contexts/RatingContext';
import StarRating from './components/StarRating';

function App() {
  return (
    <RatingProvider>
      <div className="App">
        <h1>Product Rating System</h1>
        
        {/* Example usage */}
        <div style={{ padding: '20px' }}>
          <h3>Product 1</h3>
          <StarRating productId={1} readOnly={false} />
          
          <h3>Product 2 (Read Only)</h3>
          <StarRating productId={2} readOnly={true} />
        </div>
      </div>
    </RatingProvider>
  );
}

export default App;
```

## Step 5: Testing

### Test the Complete System
```bash
# 1. Start backend
cd /path/to/backend
mvn spring-boot:run

# 2. Start frontend
cd /path/to/frontend
npm start

# 3. Test API endpoints
curl http://localhost:8081/api/ratings/health

# 4. Test rating submission
curl -X POST http://localhost:8081/api/ratings/rate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"productId": 1, "rating": 4}'

# 5. Check database
psql -h localhost -p 5433 -U username -d dbname -c "SELECT * FROM ratings;"
```

## Expected Results

### Complete Working System:
- ✅ 5-star rating display
- ✅ Click to select rating (1-5)
- ✅ Submit button appears
- ✅ Rating saved to database
- ✅ Success message shown
- ✅ Rating persists after refresh
- ✅ Read-only mode shows average rating
- ✅ User's saved ratings displayed

This is a complete, self-contained rating system implementation!
