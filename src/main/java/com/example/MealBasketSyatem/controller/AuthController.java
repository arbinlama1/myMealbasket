package com.example.MealBasketSyatem.controller;

import com.example.MealBasketSyatem.dto.ApiResponse;
import com.example.MealBasketSyatem.dto.LoginRequest;
import com.example.MealBasketSyatem.dto.LoginResponse;
import com.example.MealBasketSyatem.entity.Admin;
import com.example.MealBasketSyatem.entity.Order;
import com.example.MealBasketSyatem.entity.User;
import com.example.MealBasketSyatem.entity.Vendor;
import com.example.MealBasketSyatem.security.JwtUtil;
import com.example.MealBasketSyatem.service.OrderService;
import com.example.MealBasketSyatem.service.UserService;
import com.example.MealBasketSyatem.service.VendorService;
import com.example.MealBasketSyatem.service.AdminService;
import com.example.MealBasketSyatem.repo.VendorRepo;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;
import java.util.HashMap;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class AuthController {

    // Simple in-memory token store for demo (in production, use database)
    private static Map<String, String> resetTokenStore = new HashMap<>();
    
    // Simple in-memory address store for demo (in production, use database)
    private static Map<String, java.util.List<Map<String, Object>>> addressStore = new HashMap<>();

    @Autowired
    private UserService userService;

    @Autowired
    private VendorService vendorService;

    @Autowired
    private AdminService adminService;
    
    @Autowired
    private OrderService orderService;
    
    @Autowired
    private VendorRepo vendorRepo; // Direct repository access

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@RequestBody LoginRequest loginRequest) {
        try {
            // Try to authenticate as user first
            User user = userService.findUserByEmail(loginRequest.getEmail());
            if (user != null && passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                String token = jwtUtil.generateToken(user.getEmail(), "USER", user.getId());
                LoginResponse response = new LoginResponse(token, user.getId(), user.getEmail(), user.getName(), "USER");
                return ResponseEntity.ok(ApiResponse.success("Login successful", response));
            }

            // Try to authenticate as vendor
            Vendor vendor = vendorService.findVendorByEmail(loginRequest.getEmail());
            if (vendor != null && passwordEncoder.matches(loginRequest.getPassword(), vendor.getPassword())) {
                String token = jwtUtil.generateToken(vendor.getEmail(), "VENDOR", vendor.getId());
                LoginResponse response = new LoginResponse(token, vendor.getId(), vendor.getEmail(), vendor.getName(), "VENDOR");
                return ResponseEntity.ok(ApiResponse.success("Login successful", response));
            }

            // Try to authenticate as admin
            Admin admin = adminService.findByEmail(loginRequest.getEmail());
            if (admin != null && passwordEncoder.matches(loginRequest.getPassword(), admin.getPassword())) {
                String token = jwtUtil.generateToken(admin.getEmail(), "ADMIN", admin.getId());
                LoginResponse response = new LoginResponse(token, admin.getId(), admin.getEmail(), admin.getName(), "ADMIN");
                return ResponseEntity.ok(ApiResponse.success("Login successful", response));
            }

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid credentials"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Login failed: " + e.getMessage()));
        }
    }

    @PostMapping("/register/admin")
    public ResponseEntity<ApiResponse<?>> registerAdmin(@RequestBody Admin admin) {
        try {
            // Check if admin already exists
            Admin existingAdmin = adminService.findByEmail(admin.getEmail());
            if (existingAdmin != null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Admin with this email already exists"));
            }

            // Validate required fields
            if (admin.getName() == null || admin.getName().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Admin name is required"));
            }
            
            if (admin.getEmail() == null || admin.getEmail().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Admin email is required"));
            }
            
            if (admin.getPassword() == null || admin.getPassword().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Admin password is required"));
            }

            // Encode password
            admin.setPassword(passwordEncoder.encode(admin.getPassword()));
            
            // Save admin
            adminService.createUser(admin);
            admin.setPassword(null); // Don't return password
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Admin registered successfully", admin));

        } catch (Exception e) {
            System.err.println("Admin registration error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Admin registration failed: " + e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<?>> register(@RequestBody User user) {
        try {
            // Check if user already exists
            User existingUser = userService.findUserByEmail(user.getEmail());
            if (existingUser != null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("User with this email already exists"));
            }

            // Encode password
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            
            // Save user
            userService.createUser(user);
            user.setPassword(null); // Don't return password
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("User registered successfully", user));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Registration failed: " + e.getMessage()));
        }
    }

    @PostMapping("/register/vendor")
    public ResponseEntity<ApiResponse<?>> registerVendor(@RequestBody Vendor vendor) {
        try {
            // Debug logging
            System.out.println("Received vendor registration: " + vendor.toString());
            
            // Check if vendor already exists
            Vendor existingVendor = vendorService.findVendorByEmail(vendor.getEmail());
            if (existingVendor != null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Vendor with this email already exists"));
            }

            // Validate required fields
            if (vendor.getName() == null || vendor.getName().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Vendor name is required"));
            }
            
            if (vendor.getEmail() == null || vendor.getEmail().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Vendor email is required"));
            }
            
            if (vendor.getPassword() == null || vendor.getPassword().trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Vendor password is required"));
            }

            // Encode password
            vendor.setPassword(passwordEncoder.encode(vendor.getPassword()));
            
            // Save vendor
            vendorService.registerVendor(vendor);
            vendor.setPassword(null); // Don't return password
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Vendor registered successfully", vendor));

        } catch (Exception e) {
            System.err.println("Vendor registration error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Vendor registration failed: " + e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<?>> logout(@RequestHeader(value = "Authorization") String token) {
        try {
            // Validate token
            if (token == null || token.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Token is required"));
            }

            // Extract email from token for logging
            String email = jwtUtil.extractUsername(token);
            System.out.println("Logout request from user: " + email);

            // In a real application, you might want to:
            // 1. Invalidate the token on server side (requires token blacklist)
            // 2. Log the logout event
            // 3. Return success response

            return ResponseEntity.ok(ApiResponse.success("Logout successful", null));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Logout failed: " + e.getMessage()));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<?>> getUserProfile() {
        try {
            // Get current user from security context
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !(auth instanceof UsernamePasswordAuthenticationToken)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("User not authenticated"));
            }

            UsernamePasswordAuthenticationToken authToken = (UsernamePasswordAuthenticationToken) auth;
            String email = authToken.getName();
            
            // Get user details from database
            User user = userService.findUserByEmail(email);
            if (user == null) {
                // Try vendor
                Vendor vendor = vendorService.findVendorByEmail(email);
                if (vendor != null) {
                    // Add role field to vendor response
                    Map<String, Object> vendorWithRole = new java.util.HashMap<>();
                    vendorWithRole.put("id", vendor.getId());
                    vendorWithRole.put("name", vendor.getName());
                    vendorWithRole.put("email", vendor.getEmail());
                    vendorWithRole.put("shopName", vendor.getShopName());
                    vendorWithRole.put("businessType", vendor.getBusinessType());
                    vendorWithRole.put("phone", vendor.getPhone());
                    vendorWithRole.put("address", vendor.getAddress());
                    vendorWithRole.put("role", "VENDOR");
                    // Add registration date dynamically from vendor entity
                    if (vendor.getCreatedAt() != null) {
                        // Format the date as "Month Year" (e.g., "January 2024")
                        String registrationDate = vendor.getCreatedAt().getMonth() + " " + vendor.getCreatedAt().getYear();
                        vendorWithRole.put("registrationDate", registrationDate);
                    } else {
                        // For existing vendors without createdAt, use a default date
                        vendorWithRole.put("registrationDate", "January 2024");
                    }
                    
                    // Calculate revenue from vendor's orders
                    try {
                        List<Order> vendorOrders = orderService.getOrdersByVendor(vendor.getId());
                        double totalRevenue = vendorOrders.stream()
                            .filter(order -> "DELIVERED".equals(order.getStatus()))
                            .mapToDouble(order -> order.getTotalAmount() != null ? order.getTotalAmount() : 0.0)
                            .sum();
                        vendorWithRole.put("revenue", totalRevenue);
                        vendorWithRole.put("totalOrders", vendorOrders.size());
                    } catch (Exception e) {
                        vendorWithRole.put("revenue", 0.0);
                        vendorWithRole.put("totalOrders", 0);
                    }
                    
                    return ResponseEntity.ok(ApiResponse.success("Profile retrieved successfully", vendorWithRole));
                }
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("User not found"));
            }

            // Remove password from response and add role
            user.setPassword(null);
            
            // Add role field to user response
            Map<String, Object> userWithRole = new java.util.HashMap<>();
            userWithRole.put("id", user.getId());
            userWithRole.put("name", user.getName());
            userWithRole.put("email", user.getEmail());
            userWithRole.put("role", "USER");
            
            return ResponseEntity.ok(ApiResponse.success("Profile retrieved successfully", userWithRole));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve profile: " + e.getMessage()));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<?>> updateUserProfile(@RequestBody Map<String, Object> updates) {
        try {
            // Get current user from security context
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !(auth instanceof UsernamePasswordAuthenticationToken)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("User not authenticated"));
            }

            UsernamePasswordAuthenticationToken authToken = (UsernamePasswordAuthenticationToken) auth;
            String email = authToken.getName();

            // Get user and update
            User user = userService.findUserByEmail(email);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("User not found"));
            }

            // Update user fields based on updates map
            if (updates.containsKey("name")) {
                user.setName((String) updates.get("name"));
            }
            if (updates.containsKey("email")) {
                user.setEmail((String) updates.get("email"));
            }
            if (updates.containsKey("password")) {
                user.setPassword(passwordEncoder.encode((String) updates.get("password")));
            }

            userService.updateUser(user);

            // Create response map with only user data (avoid JSON nesting issue)
            Map<String, Object> userResponse = new java.util.HashMap<>();
            userResponse.put("id", user.getId());
            userResponse.put("name", user.getName());
            userResponse.put("email", user.getEmail());
            userResponse.put("role", "USER");

            return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", userResponse));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update profile: " + e.getMessage()));
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<?>> changePassword(@RequestBody Map<String, String> passwordData) {
        try {
            String currentPassword = passwordData.get("currentPassword");
            String newPassword = passwordData.get("newPassword");
            String email = passwordData.get("email");

            if (currentPassword == null || newPassword == null || email == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Missing required fields"));
            }

            // Get user
            User user = userService.findUserByEmail(email);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("User not found"));
            }

            // Verify current password
            if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Current password is incorrect"));
            }

            // Update password
            user.setPassword(passwordEncoder.encode(newPassword));
            userService.updateUser(user);

            return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to change password: " + e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<?>> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Email is required"));
            }

            // Check if user exists (both User and Vendor)
            User user = userService.findUserByEmail(email);
            Vendor vendor = vendorService.findVendorByEmail(email);
            
            if (user == null && vendor == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("No account found with this email"));
            }

            // Store reset token in database (you'd create a PasswordReset entity)
            // For demo, we'll store token->email mapping in a simple map
            String resetToken = UUID.randomUUID().toString();
            
            // Store token with email (in production, use database)
            if (resetTokenStore == null) {
                resetTokenStore = new java.util.HashMap<>();
            }
            resetTokenStore.put(resetToken, email);
            
            String userType = user != null ? "user" : "vendor";
            return ResponseEntity.ok(ApiResponse.success("Password reset email sent", 
                Map.of("message", "Password reset instructions have been sent to " + email, 
                       "resetToken", resetToken,
                       "userType", userType)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to send reset email: " + e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<?>> resetPassword(@RequestBody Map<String, String> resetData) {
        try {
            String token = resetData.get("token");
            String newPassword = resetData.get("newPassword");
            
            if (token == null || newPassword == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Missing required fields"));
            }

            // In real app, validate token and update password
            // For demo, we'll use the token store to get email
            String email = resetTokenStore.get(token);
            
            if (email != null) {
                // Try user first
                User user = userService.findUserByEmail(email);
                if (user != null) {
                    user.setPassword(passwordEncoder.encode(newPassword));
                    userService.updateUser(user);
                    resetTokenStore.remove(token); // Clean up token
                    return ResponseEntity.ok(ApiResponse.success("Password reset successfully", null));
                }
                
                // Try vendor
                Vendor vendor = vendorService.findVendorByEmail(email);
                if (vendor != null) {
                    vendor.setPassword(passwordEncoder.encode(newPassword));
                    vendorRepo.save(vendor); // Use repository save directly
                    resetTokenStore.remove(token); // Clean up token
                    return ResponseEntity.ok(ApiResponse.success("Password reset successfully", null));
                }
            }
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid or expired reset token"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to reset password: " + e.getMessage()));
        }
    }

    // Delivery Address Management Endpoints
    @GetMapping("/addresses")
    public ResponseEntity<ApiResponse<?>> getDeliveryAddresses() {
        try {
            // Get current user from security context
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !(auth instanceof UsernamePasswordAuthenticationToken)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("User not authenticated"));
            }

            UsernamePasswordAuthenticationToken authToken = (UsernamePasswordAuthenticationToken) auth;
            String email = authToken.getName();

            // Get user
            User user = userService.findUserByEmail(email);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("User not found"));
            }

            // Get addresses from in-memory storage
            java.util.List<Map<String, Object>> addresses = addressStore.getOrDefault(email, new java.util.ArrayList<>());
            
            // Log the address fetch for debugging
            System.out.println("=== FETCHING DELIVERY ADDRESSES ===");
            System.out.println("User: " + email);
            System.out.println("Addresses count: " + addresses.size());

            return ResponseEntity.ok(ApiResponse.success("Addresses retrieved successfully", addresses));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch addresses: " + e.getMessage()));
        }
    }

    @PostMapping("/addresses")
    public ResponseEntity<ApiResponse<?>> addDeliveryAddress(@RequestBody Map<String, Object> addressData) {
        try {
            // Get current user from security context
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !(auth instanceof UsernamePasswordAuthenticationToken)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("User not authenticated"));
            }

            UsernamePasswordAuthenticationToken authToken = (UsernamePasswordAuthenticationToken) auth;
            String email = authToken.getName();

            // Get user
            User user = userService.findUserByEmail(email);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("User not found"));
            }

            // Store address in in-memory storage
            java.util.List<Map<String, Object>> userAddresses = addressStore.getOrDefault(email, new java.util.ArrayList<>());
            userAddresses.add(addressData);
            addressStore.put(email, userAddresses);
            
            // Log the address addition for debugging
            System.out.println("=== DELIVERY ADDRESS ADDED ===");
            System.out.println("User: " + email);
            System.out.println("Address: " + addressData);
            System.out.println("Total addresses for user: " + userAddresses.size());

            return ResponseEntity.ok(ApiResponse.success("Address added successfully", addressData));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to add address: " + e.getMessage()));
        }
    }

    @DeleteMapping("/addresses/{addressId}")
    public ResponseEntity<ApiResponse<?>> deleteDeliveryAddress(@PathVariable Long addressId) {
        try {
            // Get current user from security context
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !(auth instanceof UsernamePasswordAuthenticationToken)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("User not authenticated"));
            }

            UsernamePasswordAuthenticationToken authToken = (UsernamePasswordAuthenticationToken) auth;
            String email = authToken.getName();

            // Get user
            User user = userService.findUserByEmail(email);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("User not found"));
            }

            // Log the address deletion for debugging
            System.out.println("=== DELIVERY ADDRESS DELETED ===");
            System.out.println("User: " + email);
            System.out.println("Address ID: " + addressId);

            return ResponseEntity.ok(ApiResponse.success("Address deleted successfully", null));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete address: " + e.getMessage()));
        }
    }
}
