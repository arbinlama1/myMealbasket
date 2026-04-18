package com.example.MealBasketSyatem.service;

import com.example.MealBasketSyatem.entity.Product;
import com.example.MealBasketSyatem.entity.ProductReview;
import com.example.MealBasketSyatem.entity.User;
import com.example.MealBasketSyatem.repository.ProductReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductReviewService {

    @Autowired
    private ProductReviewRepository productReviewRepository;

    @Autowired
    private ProductRatingService productRatingService;

    @Autowired
    private ProductService productService;

    @Autowired
    private UserService userService;

    @Transactional
    public ProductReview addOrUpdateReview(Long userId, Long productId, Double rating, String reviewText) {
        ProductReview existingReview = productReviewRepository
                .findByUserIdAndProductId(userId, productId)
                .orElse(null);

        Product product = productService.getProductById(productId);
        if (product == null) return null;

        if (existingReview != null) {
            existingReview.setRating(rating);
            existingReview.setReviewText(reviewText);
            existingReview.setUpdatedAt(java.time.LocalDateTime.now());
            ProductReview saved = productReviewRepository.save(existingReview);
            productRatingService.addOrUpdateRating(userId, productId, rating);
            return saved;
        } else {
            User user = userService.getUserById(userId);

            if (user != null) {
                ProductReview newReview = new ProductReview(user, product, rating, reviewText);
                ProductReview saved = productReviewRepository.save(newReview);
                productRatingService.addOrUpdateRating(userId, productId, rating);

                // Update review count
                product.setReviewCount((product.getReviewCount() != null ? product.getReviewCount() : 0) + 1);
                productService.updateProduct(product);

                return saved;
            }
            return null;
        }
    }

    public ProductReview getUserReview(Long userId, Long productId) {
        return productReviewRepository.findByUserIdAndProductId(userId, productId).orElse(null);
    }

    public List<ProductReview> getProductReviews(Long productId) {
        return productReviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
    }

    public List<ProductReview> getUserReviews(Long userId) {
        return productReviewRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public void deleteReview(Long userId, Long productId) {
        Product product = productService.getProductById(productId);
        if (product == null) {
            throw new RuntimeException("Product not found");
        }

        ProductReview review = productReviewRepository.findByUserIdAndProductId(userId, productId).orElse(null);
        if (review == null) {
            throw new RuntimeException("Review not found");
        }

        productReviewRepository.delete(review);

        // Decrement review count
        if (product.getReviewCount() != null && product.getReviewCount() > 0) {
            product.setReviewCount(product.getReviewCount() - 1);
            productService.updateProduct(product);
        }
    }
}
