package com.example.MealBasketSyatem.service;

import com.example.MealBasketSyatem.entity.Product;
import com.example.MealBasketSyatem.entity.ProductRating;
import com.example.MealBasketSyatem.entity.User;
import com.example.MealBasketSyatem.repository.ProductRatingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductRatingService {

    @Autowired
    private ProductRatingRepository productRatingRepository;

    @Autowired
    private ProductService productService;

    @Autowired
    private UserService userService;

    @Transactional
    public ProductRating addOrUpdateRating(Long userId, Long productId, Double rating) {
        // Check if user already rated this product
        ProductRating existingRating = productRatingRepository
                .findByUserIdAndProductId(userId, productId)
                .orElse(null);

        if (existingRating != null) {
            // Update existing rating
            existingRating.setRating(rating);
            existingRating.setUpdatedAt(java.time.LocalDateTime.now());
            ProductRating saved = productRatingRepository.save(existingRating);
            updateProductAverageRating(productId);
            return saved;
        } else {
            // Create new rating
            User user = userService.getUserById(userId);
            Product product = productService.getProductById(productId);

            if (user != null && product != null) {
                ProductRating newRating = new ProductRating(user, product, rating);
                ProductRating saved = productRatingRepository.save(newRating);
                updateProductAverageRating(productId);
                return saved;
            }
            return null;
        }
    }

    public ProductRating getUserRating(Long userId, Long productId) {
        return productRatingRepository.findByUserIdAndProductId(userId, productId).orElse(null);
    }

    public List<ProductRating> getProductRatings(Long productId) {
        return productRatingRepository.findByProductId(productId);
    }

    private void updateProductAverageRating(Long productId) {
        List<ProductRating> ratings = productRatingRepository.findByProductId(productId);
        Product product = productService.getProductById(productId);

        if (product != null && !ratings.isEmpty()) {
            double average = ratings.stream()
                    .mapToDouble(ProductRating::getRating)
                    .average()
                    .orElse(0.0);

            product.setRating(average);
            product.setTotalRatings(ratings.size());
            productService.updateProduct(product);
        } else if (product != null) {
            product.setRating(0.0);
            product.setTotalRatings(0);
            productService.updateProduct(product);
        }
    }

    public Double getProductAverageRating(Long productId) {
        List<ProductRating> ratings = productRatingRepository.findByProductId(productId);
        if (ratings.isEmpty()) {
            return 0.0;
        }
        return ratings.stream()
                .mapToDouble(ProductRating::getRating)
                .average()
                .orElse(0.0);
    }
}
