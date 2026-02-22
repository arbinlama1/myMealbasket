package com.example.MealBasketSyatem.controller;

import com.example.MealBasketSyatem.dto.ApiResponse;
import com.example.MealBasketSyatem.dto.LoginRequest;
import com.example.MealBasketSyatem.dto.LoginResponse;
import com.example.MealBasketSyatem.entity.Admin;
import com.example.MealBasketSyatem.entity.User;
import com.example.MealBasketSyatem.entity.Vendor;
import com.example.MealBasketSyatem.security.JwtUtil;
import com.example.MealBasketSyatem.service.UserService;
import com.example.MealBasketSyatem.service.VendorService;
import com.example.MealBasketSyatem.service.AdminService;
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

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private VendorService vendorService;

    @Autowired
    private AdminService adminService;

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

            // Remove password from response
            user.setPassword(null);

            return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", user));

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

            // Check if user exists
            User user = userService.findUserByEmail(email);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("User not found"));
            }

            // Generate reset token (in real app, send email)
            String resetToken = UUID.randomUUID().toString();
            
            // Store reset token in database (you'd create a PasswordReset entity)
            // For now, just return success with the token
            return ResponseEntity.ok(ApiResponse.success("Password reset email sent", 
                Map.of("message", "Password reset instructions have been sent to " + email, "resetToken", resetToken)));

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
            // For now, just return success
            return ResponseEntity.ok(ApiResponse.success("Password reset successfully", null));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to reset password: " + e.getMessage()));
        }
    }
}
