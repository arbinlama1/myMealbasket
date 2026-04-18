# User-Based Collaborative Filtering (UBCF) Recommendation System

## Overview

This document describes the User-Based Collaborative Filtering recommendation system implemented for the MealBasket application. The system recommends products to users based on their similarity to other users who have rated similar products.

## Algorithm Details

### 1. User-Item Rating Matrix

The system builds a matrix where:
- **Rows**: Users (U)
- **Columns**: Products/Food Items (I)
- **Values**: Ratings R(u,i) given by user u to product i

### 2. Weighted Rating (Bayesian Average)

To improve rating reliability, we use weighted ratings:

**Formula:**
```
R'(u,i) = (v / (v + m)) * R(u,i) + (m / (v + m)) * C
```

**Where:**
- `v` = number of reviews for item i
- `m` = minimum threshold (10 reviews)
- `C` = global average rating across all products
- `R(u,i)` = original rating
- `R'(u,i)` = improved weighted rating

**Purpose:** This reduces the impact of ratings from products with very few reviews, making recommendations more reliable.

### 3. Cosine Similarity

We calculate similarity between users using the improved ratings:

**Formula:**
```
Sim(u,v) = Σ(R'(u,i) * R'(v,i)) / (sqrt(ΣR'(u,i)^2) * sqrt(ΣR'(v,i)^2))
```

**Where:**
- `Sim(u,v)` = similarity between user u and user v
- `R'(u,i)` = improved rating of user u for product i
- `R'(v,i)` = improved rating of user v for product i
- The sum is over all products rated by both users

**Range:** -1 to 1 (1 = identical preferences, 0 = no similarity, -1 = opposite preferences)

### 4. Predicted Rating

For a user u and product i that user hasn't rated:

**Formula:**
```
Ŕ(u,i) = Σ(Sim(u,v) * R'(v,i)) / Σ|Sim(u,v)|
```

**Where:**
- `Ŕ(u,i)` = predicted rating for user u on product i
- `Sim(u,v)` = similarity between user u and user v
- `R'(v,i)` = improved rating of user v for product i
- The sum is over all users who have rated product i

### 5. Business Rules

The system applies the following business rules:

1. **Minimum Rating Threshold**: Do not recommend items with rating < 3.0
2. **Review Count Penalty**: Reduce weight for items with very few reviews (< 5)
   - Penalty factor = 0.5 + (reviewCount / 5) * 0.5
   - Example: 2 reviews → 0.5 + (2/5)*0.5 = 0.7 (30% penalty)

## Implementation

### Backend (Spring Boot)

#### Service Class: `RecommendationService.java`

**Location:** `src/main/java/com/example/MealBasketSyatem/service/RecommendationService.java`

**Key Methods:**
- `getRecommendationsForUser(userId, topN)` - Main entry point
- `buildUserItemRatingMatrix()` - Builds user-item rating matrix from reviews
- `calculateGlobalAverageRating()` - Calculates global average rating
- `calculateImprovedRatings()` - Calculates weighted ratings (Bayesian average)
- `calculateUserSimilarities()` - Calculates cosine similarity between users
- `predictRatings()` - Predicts ratings for unrated products
- `applyBusinessRules()` - Applies business rules to filter recommendations

#### API Endpoint

**Location:** `src/main/java/com/example/MealBasketSyatem/controller/ProductApiController.java`

**Endpoint:** `GET /api/products/recommendations?topN=10`

**Response:**
```json
{
  "success": true,
  "message": "Recommendations retrieved successfully",
  "data": [
    {
      "productId": 1,
      "productName": "Classic Burger",
      "predictedRating": 4.5,
      "originalRating": 4.2,
      "reviewCount": 15,
      "category": "Main Course",
      "price": 12.99,
      "image": "https://example.com/image.jpg"
    }
  ]
}
```

### Frontend (React)

#### API Integration

**Location:** `react-frontend/src/services/api.js`

**API Call:**
```javascript
import { productAPI } from './services/api';

// Get top 10 recommendations
const getRecommendations = async (topN = 10) => {
  try {
    const response = await productAPI.getRecommendations(topN);
    return response.data.data;
  } catch (error) {
    console.error('Failed to get recommendations:', error);
    return [];
  }
};
```

#### Example Component Usage

```javascript
import React, { useState, useEffect } from 'react';
import { productAPI } from '../services/api';
import { Card, CardMedia, CardContent, Typography, Grid, CircularProgress } from '@mui/material';

const RecommendationSection = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await productAPI.getRecommendations(10);
      setRecommendations(response);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Recommended For You
      </Typography>
      <Grid container spacing={3}>
        {recommendations.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.productId}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={item.image}
                alt={item.productName}
              />
              <CardContent>
                <Typography variant="h6">
                  {item.productName}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Predicted Rating: {item.predictedRating.toFixed(2)} ⭐
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Original Rating: {item.originalRating?.toFixed(2) || 'N/A'} ⭐
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {item.reviewCount} reviews
                </Typography>
                <Typography variant="h6" color="primary">
                  ${item.price.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default RecommendationSection;
```

## Sample Data for Testing

### Sample Product Reviews

```sql
-- Insert sample reviews for testing
INSERT INTO product_reviews (user_id, product_id, rating, review_text, created_at, updated_at) VALUES
-- User 1 ratings
(1, 1, 5.0, 'Excellent burger!', NOW(), NOW()),
(1, 2, 4.5, 'Great pizza', NOW(), NOW()),
(1, 3, 3.0, 'Average salad', NOW(), NOW()),
(1, 4, 4.0, 'Good chicken', NOW(), NOW()),

-- User 2 ratings (similar to user 1)
(2, 1, 4.5, 'Nice burger', NOW(), NOW()),
(2, 2, 5.0, 'Best pizza ever!', NOW(), NOW()),
(2, 3, 2.5, 'Not great', NOW(), NOW()),
(2, 4, 4.5, 'Tasty chicken', NOW(), NOW()),

-- User 3 ratings (different preferences)
(3, 1, 3.0, 'Okay burger', NOW(), NOW()),
(3, 2, 3.5, 'Average pizza', NOW(), NOW()),
(3, 3, 5.0, 'Amazing salad!', NOW(), NOW()),
(3, 4, 2.0, 'Did not like chicken', NOW(), NOW()),

-- User 4 ratings (similar to user 3)
(4, 1, 3.5, 'Decent burger', NOW(), NOW()),
(4, 2, 3.0, 'Just okay pizza', NOW(), NOW()),
(4, 3, 4.5, 'Fresh salad', NOW(), NOW()),
(4, 4, 2.5, 'Dry chicken', NOW(), NOW());
```

### Sample Product Data

```sql
-- Ensure products have review counts
UPDATE products SET review_count = 15, rating = 4.5 WHERE id = 1;
UPDATE products SET review_count = 20, rating = 4.7 WHERE id = 2;
UPDATE products SET review_count = 8, rating = 4.2 WHERE id = 3;
UPDATE products SET review_count = 12, rating = 4.3 WHERE id = 4;
```

## Testing the System

### 1. Start the Backend

```bash
cd Mealbasket1
mvn spring-boot:run
```

### 2. Start the Frontend

```bash
cd react-frontend
npm start
```

### 3. Test the API

```bash
# Get recommendations (requires authentication)
curl -X GET "http://localhost:8081/api/products/recommendations?topN=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Test in Browser

1. Login to the application
2. Navigate to a page that displays recommendations
3. The system will recommend products based on your rating history

## Algorithm Walkthrough Example

### Scenario: Recommend products for User 1

**Step 1: Build User-Item Matrix**
```
        Product 1  Product 2  Product 3  Product 4
User 1    5.0        4.5        3.0        4.0
User 2    4.5        5.0        2.5        4.5
User 3    3.0        3.5        5.0        2.0
User 4    3.5        3.0        4.5        2.5
```

**Step 2: Calculate Global Average**
- Global average rating = 4.0

**Step 3: Calculate Improved Ratings (m=10, C=4.0)**
- Product 1 (15 reviews): R' = (15/25)*4.5 + (10/25)*4.0 = 4.3
- Product 2 (20 reviews): R' = (20/30)*4.7 + (10/30)*4.0 = 4.47
- Product 3 (8 reviews): R' = (8/18)*4.2 + (10/18)*4.0 = 4.09
- Product 4 (12 reviews): R' = (12/22)*4.3 + (10/22)*4.0 = 4.16

**Step 4: Calculate Similarity (User 1 vs User 2)**
- Common products: 1, 2, 3, 4
- Sim(1,2) = (4.3*4.47 + 4.47*4.47 + 4.09*4.09 + 4.16*4.16) / (sqrt(4.3²+4.47²+4.09²+4.16²) * sqrt(4.47²+4.47²+4.09²+4.16²))
- Sim(1,2) ≈ 0.95 (high similarity)

**Step 5: Predict Rating for New Product**
- If User 2 rated Product 5 as 4.5
- Predicted rating for User 1 = 0.95 * 4.5 = 4.27

**Step 6: Apply Business Rules**
- If predicted rating < 3.0: exclude
- If review count < 5: apply penalty

## Configuration

### Constants in RecommendationService.java

```java
// Minimum threshold for weighted rating
private static final int MIN_REVIEWS_THRESHOLD = 10;

// Minimum reviews for reliable recommendation
private static final int MIN_RELIABLE_REVIEWS = 5;

// Minimum rating threshold for recommendations
private static final double MIN_RATING_THRESHOLD = 3.0;
```

You can adjust these values to tune the recommendation system:
- Increase `MIN_REVIEWS_THRESHOLD` to be more conservative about low-review products
- Increase `MIN_RELIABLE_REVIEWS` to require more reviews for reliability
- Increase `MIN_RATING_THRESHOLD` to only recommend higher-rated products

## Troubleshooting

### No recommendations returned

**Possible causes:**
1. Not enough users with rating history
2. No common products between users
3. All products filtered out by business rules

**Solution:**
- Add more sample reviews to the database
- Adjust the business rule thresholds
- Check if users have rated at least 3-5 products

### Recommendations are not accurate

**Possible causes:**
1. Insufficient rating data
2. Users have very different preferences
3. Products have very few reviews

**Solution:**
- Collect more user ratings
- Adjust the similarity threshold
- Tune the MIN_REVIEWS_THRESHOLD parameter

## Performance Considerations

The current implementation uses in-memory calculations. For large datasets:
- Consider caching user similarity scores
- Implement batch processing for similarity calculations
- Use database indexing for faster queries
- Consider using a dedicated recommendation engine (like Apache Mahout) for production

## Future Enhancements

1. **Item-Based Collaborative Filtering**: Recommend based on item similarities
2. **Hybrid Approach**: Combine collaborative filtering with content-based filtering
3. **Matrix Factorization**: Use SVD or ALS for better scalability
4. **Real-time Updates**: Update recommendations as users rate products
5. **A/B Testing**: Test different recommendation algorithms
6. **Cold Start Problem**: Handle new users with no rating history

## Summary

This UBCF recommendation system:
- Uses user similarity based on rating patterns
- Improves rating reliability with Bayesian average
- Applies business rules to ensure quality recommendations
- Returns top N recommended products for each user
- Is implemented safely without breaking existing functionality

The system is beginner-friendly, well-documented, and ready for testing with sample data.
