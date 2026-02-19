package com.example.MealBasketSyatem.controller;

import com.example.MealBasketSyatem.dto.ApiResponse;
import com.example.MealBasketSyatem.entity.User;
import com.example.MealBasketSyatem.entity.Vendor;
import com.example.MealBasketSyatem.entity.Admin;
import com.example.MealBasketSyatem.service.UserService;
import com.example.MealBasketSyatem.service.VendorService;
import com.example.MealBasketSyatem.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/setup")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class SetupController {

    @Autowired
    private UserService userService;

    @Autowired
    private VendorService vendorService;

    @Autowired
    private AdminService adminService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/create-test-users")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createTestUsers() {
        try {
            Map<String, Object> results = new HashMap<>();

            // Create test user
            try {
                User testUser = new User();
                testUser.setName("Test User");
                testUser.setEmail("user@test.com");
                testUser.setPassword(passwordEncoder.encode("password123"));
                
                User existingUser = userService.findUserByEmail(testUser.getEmail());
                if (existingUser == null) {
                    userService.createUser(testUser);
                    results.put("user", "Test user created: user@test.com / password123");
                } else {
                    results.put("user", "Test user already exists: user@test.com / password123");
                }
            } catch (Exception e) {
                results.put("user", "Failed to create test user: " + e.getMessage());
            }

            // Create test vendor
            try {
                Vendor testVendor = new Vendor();
                testVendor.setName("Test Vendor");
                testVendor.setEmail("vendor@test.com");
                testVendor.setPassword(passwordEncoder.encode("vendor123"));
                testVendor.setShopName("Test Shop");
                testVendor.setBusinessType("Food");
                testVendor.setPhone("1234567890");
                testVendor.setAddress("Test Address");
                
                Vendor existingVendor = vendorService.findVendorByEmail(testVendor.getEmail());
                if (existingVendor == null) {
                    vendorService.registerVendor(testVendor);
                    results.put("vendor", "Test vendor created: vendor@test.com / vendor123");
                } else {
                    results.put("vendor", "Test vendor already exists: vendor@test.com / vendor123");
                }
            } catch (Exception e) {
                results.put("vendor", "Failed to create test vendor: " + e.getMessage());
            }

            // Create test admin
            try {
                Admin testAdmin = new Admin();
                testAdmin.setName("Test Admin");
                testAdmin.setEmail("admin@test.com");
                testAdmin.setPassword(passwordEncoder.encode("admin123"));
                
                Admin existingAdmin = adminService.findByEmail(testAdmin.getEmail());
                if (existingAdmin == null) {
                    adminService.createUser(testAdmin);
                    results.put("admin", "Test admin created: admin@test.com / admin123");
                } else {
                    results.put("admin", "Test admin already exists: admin@test.com / admin123");
                }
            } catch (Exception e) {
                results.put("admin", "Failed to create test admin: " + e.getMessage());
            }

            return ResponseEntity.ok(ApiResponse.success("Test users setup completed", results));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Setup failed: " + e.getMessage()));
        }
    }

    @GetMapping("/test-credentials")
    public ResponseEntity<ApiResponse<Map<String, String>>> getTestCredentials() {
        Map<String, String> credentials = new HashMap<>();
        credentials.put("user_email", "user@test.com");
        credentials.put("user_password", "password123");
        credentials.put("vendor_email", "vendor@test.com");
        credentials.put("vendor_password", "vendor123");
        credentials.put("admin_email", "admin@test.com");
        credentials.put("admin_password", "admin123");
        
        return ResponseEntity.ok(ApiResponse.success("Test credentials", credentials));
    }
}
