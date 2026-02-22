package com.example.MealBasketSyatem.controller;

import com.example.MealBasketSyatem.dto.ApiResponse;
import com.example.MealBasketSyatem.entity.Cart;
import com.example.MealBasketSyatem.entity.Order;
import com.example.MealBasketSyatem.entity.Product;
import com.example.MealBasketSyatem.entity.User;
import com.example.MealBasketSyatem.service.CartService;
import com.example.MealBasketSyatem.service.OrderService;
import com.example.MealBasketSyatem.service.ProductService;
import com.example.MealBasketSyatem.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserService userService;

    @Autowired
    private ProductService productService;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getCart() {
        try {
            User currentUser = getCurrentUser();
            List<Cart> cartItems = cartService.getCartByUser(currentUser.getId());
            
            // Transform cart items to match frontend expectations
            List<Map<String, Object>> transformedItems = cartItems.stream().map(cart -> {
                Map<String, Object> item = new java.util.HashMap<>();
                item.put("id", cart.getId());
                item.put("quantity", cart.getQuantity());
                item.put("name", cart.getProduct().getName());
                item.put("price", cart.getProduct().getPrice());
                item.put("image", cart.getProduct().getImage());
                item.put("vendor", cart.getProduct().getVendor() != null ? cart.getProduct().getVendor().getName() : "Unknown");
                item.put("productId", cart.getProduct().getId());
                return item;
            }).collect(java.util.stream.Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success("Cart retrieved successfully", 
                Map.of("items", transformedItems, "total", transformedItems.size())));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve cart: " + e.getMessage()));
        }
    }

    @PostMapping("/add")
    public ResponseEntity<ApiResponse<?>> addToCart(@RequestBody Map<String, Object> request) {
        try {
            User currentUser = getCurrentUser();
            Long productId = Long.valueOf(request.get("productId").toString());
            Integer quantity = request.containsKey("quantity") ? 
                Integer.valueOf(request.get("quantity").toString()) : 1;

            Product product = productService.getProductById(productId);
            if (product == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Product not found"));
            }

            Cart cartItem = cartService.addToCart(currentUser.getId(), productId, quantity);
            
            // Transform the cart item to match frontend expectations
            Map<String, Object> transformedItem = new java.util.HashMap<>();
            transformedItem.put("id", cartItem.getId());
            transformedItem.put("quantity", cartItem.getQuantity());
            transformedItem.put("name", cartItem.getProduct().getName());
            transformedItem.put("price", cartItem.getProduct().getPrice());
            transformedItem.put("image", cartItem.getProduct().getImage());
            transformedItem.put("vendor", cartItem.getProduct().getVendor() != null ? cartItem.getProduct().getVendor().getName() : "Unknown");
            transformedItem.put("productId", cartItem.getProduct().getId());
            
            return ResponseEntity.ok(ApiResponse.success("Item added to cart successfully", transformedItem));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to add to cart: " + e.getMessage()));
        }
    }

    @PutMapping("/{itemId}")
    public ResponseEntity<ApiResponse<?>> updateCartItem(@PathVariable Long itemId, 
                                                         @RequestBody Map<String, Object> request) {
        try {
            User currentUser = getCurrentUser();
            Integer quantity = Integer.valueOf(request.get("quantity").toString());
            
            Cart cartItem = cartService.updateCartItem(itemId, quantity, currentUser.getId());
            if (cartItem == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Cart item not found"));
            }
            
            return ResponseEntity.ok(ApiResponse.success("Cart item updated successfully", cartItem));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update cart item: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<ApiResponse<?>> removeFromCart(@PathVariable Long itemId) {
        try {
            User currentUser = getCurrentUser();
            boolean deleted = cartService.removeFromCart(itemId, currentUser.getId());
            
            if (!deleted) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Cart item not found"));
            }
            
            return ResponseEntity.ok(ApiResponse.success("Item removed from cart successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to remove from cart: " + e.getMessage()));
        }
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<?>> clearCart() {
        try {
            User currentUser = getCurrentUser();
            cartService.clearCart(currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success("Cart cleared successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to clear cart: " + e.getMessage()));
        }
    }

    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<?>> checkout(@RequestBody Map<String, Object> orderData) {
        try {
            User currentUser = getCurrentUser();
            
            // Create order using OrderService
            Order order = orderService.createOrder(currentUser.getId(), orderData);
            
            // Clear cart after successful order
            cartService.clearCart(currentUser.getId());
            
            return ResponseEntity.ok(ApiResponse.success("Order placed successfully", order));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to place order: " + e.getMessage()));
        }
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userService.findUserByEmail(email);
    }
}
