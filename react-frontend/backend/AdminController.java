package com.mealbasket.controller;

import com.mealbasket.model.User;
import com.mealbasket.model.Product;
import com.mealbasket.service.AdminService;
import com.mealbasket.dto.DashboardStatsDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    @Autowired
    private AdminService adminService;

    /**
     * Get all users and vendors (ADMIN only)
     */
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAllUsers(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            System.out.println("AdminController: Getting all users for admin: " + userDetails.getUsername());
            
            List<User> users = adminService.getAllUsers();
            
            Map<String, Object> response = Map.of(
                "success", true,
                "message", "Users retrieved successfully",
                "data", users,
                "count", users.size()
            );
            
            System.out.println("AdminController: Successfully retrieved " + users.size() + " users");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("AdminController: Error getting users: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> response = Map.of(
                "success", false,
                "message", "Error retrieving users: " + e.getMessage(),
                "data", List.of()
            );
            
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * Get all vendors specifically (ADMIN only)
     */
    @GetMapping("/vendors")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAllVendors(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            System.out.println("AdminController: Getting all vendors for admin: " + userDetails.getUsername());
            
            List<User> vendors = adminService.getAllVendors();
            
            Map<String, Object> response = Map.of(
                "success", true,
                "message", "Vendors retrieved successfully",
                "data", vendors,
                "count", vendors.size()
            );
            
            System.out.println("AdminController: Successfully retrieved " + vendors.size() + " vendors");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("AdminController: Error getting vendors: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> response = Map.of(
                "success", false,
                "message", "Error retrieving vendors: " + e.getMessage(),
                "data", List.of()
            );
            
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * Get dashboard statistics (ADMIN only)
     */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getDashboardStats(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            System.out.println("AdminController: Getting dashboard stats for admin: " + userDetails.getUsername());
            
            DashboardStatsDTO stats = adminService.getDashboardStats();
            
            Map<String, Object> response = Map.of(
                "success", true,
                "message", "Dashboard stats retrieved successfully",
                "data", stats
            );
            
            System.out.println("AdminController: Successfully retrieved dashboard stats");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("AdminController: Error getting dashboard stats: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> response = Map.of(
                "success", false,
                "message", "Error retrieving dashboard stats: " + e.getMessage(),
                "data", Map.of()
            );
            
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * Get all products from all vendors (ADMIN only)
     */
    @GetMapping("/products")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAllProducts(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            System.out.println("AdminController: Getting all products for admin: " + userDetails.getUsername());
            
            List<Product> products = adminService.getAllProducts();
            
            Map<String, Object> response = Map.of(
                "success", true,
                "message", "Products retrieved successfully",
                "data", products,
                "count", products.size()
            );
            
            System.out.println("AdminController: Successfully retrieved " + products.size() + " products");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("AdminController: Error getting products: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> response = Map.of(
                "success", false,
                "message", "Error retrieving products: " + e.getMessage(),
                "data", List.of()
            );
            
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * Delete a user (ADMIN only)
     */
    @DeleteMapping("/users/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> deleteUser(
            @PathVariable Long userId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            System.out.println("AdminController: Deleting user " + userId + " by admin: " + userDetails.getUsername());
            
            boolean deleted = adminService.deleteUser(userId);
            
            if (deleted) {
                Map<String, Object> response = Map.of(
                    "success", true,
                    "message", "User deleted successfully"
                );
                
                System.out.println("AdminController: Successfully deleted user " + userId);
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = Map.of(
                    "success", false,
                    "message", "User not found or could not be deleted"
                );
                
                return ResponseEntity.status(404).body(response);
            }
            
        } catch (Exception e) {
            System.err.println("AdminController: Error deleting user: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> response = Map.of(
                "success", false,
                "message", "Error deleting user: " + e.getMessage()
            );
            
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * Update user role (ADMIN only)
     */
    @PutMapping("/users/{userId}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> updateUserRole(
            @PathVariable Long userId,
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            String newRole = request.get("role");
            System.out.println("AdminController: Updating role for user " + userId + " to " + newRole + " by admin: " + userDetails.getUsername());
            
            User updatedUser = adminService.updateUserRole(userId, newRole);
            
            if (updatedUser != null) {
                Map<String, Object> response = Map.of(
                    "success", true,
                    "message", "User role updated successfully",
                    "data", updatedUser
                );
                
                System.out.println("AdminController: Successfully updated role for user " + userId);
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = Map.of(
                    "success", false,
                    "message", "User not found or invalid role"
                );
                
                return ResponseEntity.status(404).body(response);
            }
            
        } catch (Exception e) {
            System.err.println("AdminController: Error updating user role: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> response = Map.of(
                "success", false,
                "message", "Error updating user role: " + e.getMessage()
            );
            
            return ResponseEntity.status(500).body(response);
        }
    }
}
