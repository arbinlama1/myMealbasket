package com.example.MealBasketSyatem.controller;

import com.example.MealBasketSyatem.dto.ApiResponse;
import com.example.MealBasketSyatem.entity.Product;
import com.example.MealBasketSyatem.entity.ProductReview;
import com.example.MealBasketSyatem.entity.User;
import com.example.MealBasketSyatem.service.ProductRatingService;
import com.example.MealBasketSyatem.service.ProductReviewService;
import com.example.MealBasketSyatem.service.ProductService;
import com.example.MealBasketSyatem.service.UserService;
import com.example.MealBasketSyatem.service.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003"})
public class ProductApiController {

    @Autowired
    private ProductService productService;

    @Autowired
    private ProductRatingService productRatingService;

    @Autowired
    private ProductReviewService productReviewService;

    @Autowired
    private UserService userService;

    @Autowired
    private RecommendationService recommendationService;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String email = authentication.getName();
            return userService.findUserByEmail(email);
        }
        return null;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Product>>> getAllProducts() {
        try {
            List<Product> products = productService.getAllProduct();
            return ResponseEntity.ok(ApiResponse.success("Products retrieved successfully", products));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve products: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Product>> getProductById(@PathVariable Long id) {
        try {
            Product product = productService.getProductById(id);
            return ResponseEntity.ok(ApiResponse.success("Product retrieved successfully", product));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Product not found: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve product: " + e.getMessage()));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<Product>>> searchProducts(@RequestParam String name) {
        try {
            List<Product> products = productService.findProductByName(name);
            return ResponseEntity.ok(ApiResponse.success("Products found", products));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Search failed: " + e.getMessage()));
        }
    }

    @GetMapping("/vendor/{vendorId}")
    public ResponseEntity<ApiResponse<List<Product>>> getProductsByVendorId(@PathVariable Long vendorId) {
        try {
            List<Product> products = productService.getProductsByVendorId(vendorId);
            return ResponseEntity.ok(ApiResponse.success("Products by vendor retrieved", products));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to get products by vendor: " + e.getMessage()));
        }
    }

    @GetMapping("/vendor/{vendorName}")
    public ResponseEntity<ApiResponse<List<Product>>> getProductsByVendor(@PathVariable String vendorName) {
        try {
            List<Product> products = productService.getProductsByVendorName(vendorName);
            return ResponseEntity.ok(ApiResponse.success("Products by vendor retrieved", products));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to get products by vendor: " + e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Product>> createProduct(@RequestBody Product product) {
        try {
            productService.createProduct(product);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Product created successfully", product));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create product: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Product>> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        try {
            product.setId(id);
            productService.updateProduct(product);
            return ResponseEntity.ok(ApiResponse.success("Product updated successfully", product));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Product not found: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update product: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        try {
            productService.deleteProduct(id);
            return ResponseEntity.ok(ApiResponse.success("Product deleted successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Product not found: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete product: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/rate")
    public ResponseEntity<ApiResponse<Product>> rateProduct(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("User not authenticated"));
            }

            Product product = productService.getProductById(id);
            if (product == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Product not found"));
            }

            Double rating = ((Number) request.get("rating")).doubleValue();

            // Add or update rating using the new service
            productRatingService.addOrUpdateRating(currentUser.getId(), id, rating);

            // Get updated product with new average rating
            Product updatedProduct = productService.getProductById(id);

            return ResponseEntity.ok(ApiResponse.success("Rating submitted successfully", updatedProduct));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to rate product: " + e.getMessage()));
        }
    }

    // ── Review Endpoints ───────────────────────────────────────────────────────────────

    @GetMapping("/{id}/reviews")
    public ResponseEntity<ApiResponse<List<ProductReview>>> getProductReviews(@PathVariable Long id) {
        try {
            List<ProductReview> reviews = productReviewService.getProductReviews(id);
            return ResponseEntity.ok(ApiResponse.success("Reviews retrieved successfully", reviews));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve reviews: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}/reviews/my")
    public ResponseEntity<ApiResponse<ProductReview>> getMyReview(@PathVariable Long id) {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("User not authenticated"));
            }

            ProductReview review = productReviewService.getUserReview(currentUser.getId(), id);
            return ResponseEntity.ok(ApiResponse.success("Review retrieved successfully", review));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve review: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/reviews")
    public ResponseEntity<ApiResponse<ProductReview>> addReview(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("User not authenticated"));
            }

            Product product = productService.getProductById(id);
            if (product == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Product not found"));
            }

            Double rating = ((Number) request.get("rating")).doubleValue();
            String reviewText = (String) request.get("reviewText");

            ProductReview review = productReviewService.addOrUpdateReview(currentUser.getId(), id, rating, reviewText);

            if (review == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(ApiResponse.error("Failed to save review"));
            }

            return ResponseEntity.ok(ApiResponse.success("Review submitted successfully", review));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to submit review: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}/reviews")
    public ResponseEntity<ApiResponse<Void>> deleteReview(@PathVariable Long id) {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("User not authenticated"));
            }

            productReviewService.deleteReview(currentUser.getId(), id);

            return ResponseEntity.ok(ApiResponse.success("Review deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete review: " + e.getMessage()));
        }
    }

    // ── Recommendation Endpoint ─────────────────────────────────────────────────────────────

    @GetMapping("/recommendations")
    public ResponseEntity<ApiResponse<List<RecommendationService.RecommendationResult>>> getRecommendations(
            @RequestParam(defaultValue = "10") int topN) {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("User not authenticated"));
            }

            List<RecommendationService.RecommendationResult> recommendations =
                recommendationService.getRecommendationsForUser(currentUser.getId(), topN);

            return ResponseEntity.ok(ApiResponse.success("Recommendations retrieved successfully", recommendations));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to get recommendations: " + e.getMessage()));
        }
    }
}
