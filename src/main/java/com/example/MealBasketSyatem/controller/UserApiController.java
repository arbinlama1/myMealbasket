package com.example.MealBasketSyatem.controller;

import com.example.MealBasketSyatem.dto.ApiResponse;
import com.example.MealBasketSyatem.entity.User;
import com.example.MealBasketSyatem.entity.Order;
import com.example.MealBasketSyatem.service.UserService;
import com.example.MealBasketSyatem.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class UserApiController {

    @Autowired
    private UserService userService;

    @Autowired
    private OrderService orderService;

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        try {
            List<User> users = userService.getAllUser();
            // Remove passwords from response
            users.forEach(user -> user.setPassword(null));
            return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", users));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve users: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> getUserById(@PathVariable Long id) {
        try {
            User user = userService.getUserById(id);
            if (user != null) {
                user.setPassword(null); // Don't return password
                return ResponseEntity.ok(ApiResponse.success("User retrieved successfully", user));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("User not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve user: " + e.getMessage()));
        }
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<String>> createUser(@RequestBody User user) {
        try {
            // Check if user already exists
            User existingUser = userService.findUserByEmail(user.getEmail());
            if (existingUser != null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("User with this email already exists"));
            }

            userService.createUser(user);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("User created successfully", "User created successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create user: " + e.getMessage()));
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ApiResponse<String>> updateUser(@PathVariable Long id, @RequestBody User user) {
        try {
            User existingUser = userService.getUserById(id);
            if (existingUser == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("User not found"));
            }

            user.setId(id);
            userService.updateUser(user);
            return ResponseEntity.ok(ApiResponse.success("User updated successfully", "User updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update user: " + e.getMessage()));
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable Long id) {
        try {
            User existingUser = userService.getUserById(id);
            if (existingUser == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("User not found"));
            }

            userService.deleteUser(id);
            return ResponseEntity.ok(ApiResponse.success("User deleted successfully", "User with ID " + id + " has been deleted"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete user: " + e.getMessage()));
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<?>> getUserStats() {
        try {
            // Use the same authentication pattern as other controllers
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth instanceof org.springframework.security.authentication.AnonymousAuthenticationToken) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("User not authenticated"));
            }
            
            String email = auth.getName();
            User user = userService.findUserByEmail(email);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("User not found"));
            }
            
            // Calculate real stats from user's orders
            List<Order> userOrders = orderService.getOrdersByUser(user.getId());
            System.out.println("Found " + userOrders.size() + " orders for user " + user.getId());
            
            double totalSpent = userOrders.stream()
                .mapToDouble(order -> order.getTotalAmount() != null ? order.getTotalAmount() : order.getAmount())
                .sum();
            
            int totalOrders = userOrders.size();
            
            // Calculate points (1 point per NPR spent)
            int points = (int) totalSpent;
            
            // Calculate average order value
            double avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0.0;
            
            // Get member since date (static for now since User entity doesn't have createdAt)
            String memberSince = "January 2024";
            
            // Get last order date (simplified)
            String lastOrder = userOrders.isEmpty() ? "No orders yet" : 
                userOrders.get(userOrders.size() - 1).getCreatedAt() != null ? 
                userOrders.get(userOrders.size() - 1).getCreatedAt().toString() : "Recent order";
            
            System.out.println("User stats - Orders: " + totalOrders + ", Spent: " + totalSpent + ", Points: " + points);
            
            Map<String, Object> stats = Map.of(
                "totalOrders", totalOrders,
                "totalSpent", totalSpent,
                "points", points,
                "memberSince", memberSince,
                "lastOrder", lastOrder,
                "avgOrderValue", avgOrderValue,
                "favoriteItemsCount", 0 // This would need to be calculated from favorites
            );
            
            return ResponseEntity.ok(ApiResponse.success("User stats retrieved successfully", stats));
        } catch (Exception e) {
            System.err.println("Error in getUserStats: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve user stats: " + e.getMessage()));
        }
    }
}
