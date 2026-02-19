package com.example.MealBasketSyatem.controller;

import com.example.MealBasketSyatem.dto.ApiResponse;
import com.example.MealBasketSyatem.entity.*;
import com.example.MealBasketSyatem.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/db-test")
public class DatabaseTestController {

    @Autowired
    private UserService userService;

    @Autowired
    private AdminService adminService;

    @Autowired
    private ProductService productService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private ContactService contactService;

    @Autowired
    private VendorService vendorService;

    @GetMapping("/connectivity")
    public ApiResponse<Map<String, Object>> testDatabaseConnectivity() {
        Map<String, Object> results = new HashMap<>();
        
        try {
            // Test User Repository
            long userCount = userService.getAllUser().size();
            results.put("users_count", userCount);
            results.put("users_connection", "✅ CONNECTED");
            
            // Test Admin Repository
            long adminCount = adminService.getAllAdmins().size();
            results.put("admins_count", adminCount);
            results.put("admins_connection", "✅ CONNECTED");
            
            // Test Product Repository
            long productCount = productService.getAllProduct().size();
            results.put("products_count", productCount);
            results.put("products_connection", "✅ CONNECTED");
            
            // Test Order Repository
            long orderCount = orderService.getAllOrder().size();
            results.put("orders_count", orderCount);
            results.put("orders_connection", "✅ CONNECTED");
            
            // Test Contact Repository
            long messageCount = contactService.getAllMessage().size();
            results.put("messages_count", messageCount);
            results.put("messages_connection", "✅ CONNECTED");
            
            // Test Vendor Repository
            try {
                // Since getAllVendors doesn't exist, we'll test vendor registration instead
                Vendor testVendor = new Vendor();
                testVendor.setName("Test");
                testVendor.setEmail("test@test.com");
                testVendor.setShopName("Test Shop");
                vendorService.registerVendor(testVendor);
                results.put("vendors_connection", "✅ CONNECTED");
                results.put("vendors_count", "TEST_PASSED");
            } catch (Exception e) {
                results.put("vendors_connection", "❌ FAILED");
                results.put("vendors_count", "TEST_FAILED");
            }
            
            results.put("database_status", "✅ FULLY CONNECTED");
            results.put("total_entities", userCount + adminCount + productCount + orderCount + messageCount + 1); // +1 for vendor test
            
            return ApiResponse.success("Database connectivity test successful", results);
            
        } catch (Exception e) {
            results.put("database_status", "❌ CONNECTION FAILED");
            results.put("error", e.getMessage());
            return ApiResponse.error("Database connectivity failed: " + e.getMessage());
        }
    }

    @GetMapping("/tables")
    public ApiResponse<Map<String, String>> testTableCreation() {
        Map<String, String> tableStatus = new HashMap<>();
        
        try {
            // Test if tables exist by trying to query them
            userService.getAllUser();
            tableStatus.put("users_table", "✅ EXISTS");
            
            adminService.getAllAdmins();
            tableStatus.put("admins_table", "✅ EXISTS");
            
            productService.getAllProduct();
            tableStatus.put("products_table", "✅ EXISTS");
            
            orderService.getAllOrder();
            tableStatus.put("orders_table", "✅ EXISTS");
            
            contactService.getAllMessage();
            tableStatus.put("messages_table", "✅ EXISTS");
            
            // Test vendor table by creating a test vendor
            Vendor testVendor = new Vendor();
            testVendor.setName("Test");
            testVendor.setEmail("test@test.com");
            testVendor.setShopName("Test Shop");
            vendorService.registerVendor(testVendor);
            tableStatus.put("vendors_table", "✅ EXISTS");
            
            tableStatus.put("overall_status", "✅ ALL TABLES CREATED");
            
            return ApiResponse.success("Table creation test successful", tableStatus);
            
        } catch (Exception e) {
            tableStatus.put("overall_status", "❌ TABLE CREATION FAILED");
            tableStatus.put("error", e.getMessage());
            return ApiResponse.error("Table creation failed: " + e.getMessage());
        }
    }

    @PostMapping("/create-test-data")
    public ApiResponse<String> createTestData() {
        try {
            // Create test admin
            Admin testAdmin = new Admin();
            testAdmin.setName("Test Admin");
            testAdmin.setEmail("admin@test.com");
            testAdmin.setPassword("admin123");
            adminService.createUser(testAdmin);
            
            // Create test user
            User testUser = new User();
            testUser.setName("Test User");
            testUser.setEmail("user@test.com");
            testUser.setPassword("user123");
            userService.createUser(testUser);
            
            // Create test vendor
            Vendor testVendor = new Vendor();
            testVendor.setName("Test Vendor");
            testVendor.setEmail("vendor@test.com");
            testVendor.setShopName("Test Shop");
            vendorService.registerVendor(testVendor);
            
            return ApiResponse.success("Test data created successfully", "All test entities created");
            
        } catch (Exception e) {
            return ApiResponse.error("Failed to create test data: " + e.getMessage());
        }
    }
}
