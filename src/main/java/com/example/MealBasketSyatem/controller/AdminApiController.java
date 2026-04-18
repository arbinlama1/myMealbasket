package com.example.MealBasketSyatem.controller;

import com.example.MealBasketSyatem.dto.AccountDTO;
import com.example.MealBasketSyatem.dto.ApiResponse;
import com.example.MealBasketSyatem.dto.OrderDTO;
import com.example.MealBasketSyatem.dto.RatingDTO;
import com.example.MealBasketSyatem.service.AdminApiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class AdminApiController {

    @Autowired
    private AdminApiService adminApiService;

    // Returns ALL accounts from DB with roles: USER/VENDOR/ADMIN
    @GetMapping("/accounts")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<AccountDTO>>> getAllAccounts() {
        List<AccountDTO> accounts = adminApiService.getAllAccounts();
        return ResponseEntity.ok(ApiResponse.success("Accounts retrieved successfully", accounts));
    }

    // Convenience alias for frontend compatibility
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<AccountDTO>>> getAllUsersAndVendors() {
        List<AccountDTO> accounts = adminApiService.getAllAccounts();
        return ResponseEntity.ok(ApiResponse.success("Accounts retrieved successfully", accounts));
    }

    // Vendors only
    @GetMapping("/vendors")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<AccountDTO>>> getAllVendors() {
        List<AccountDTO> vendors = adminApiService.getAllVendors();
        return ResponseEntity.ok(ApiResponse.success("Vendors retrieved successfully", vendors));
    }

    // Get all orders from database
    @GetMapping("/orders")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<OrderDTO>>> getAllOrders() {
        List<OrderDTO> orders = adminApiService.getAllOrders();
        return ResponseEntity.ok(ApiResponse.success("Orders retrieved successfully", orders));
    }

    // Get all ratings from database
    @GetMapping("/ratings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<RatingDTO>>> getAllRatings() {
        List<RatingDTO> ratings = adminApiService.getAllRatings();
        return ResponseEntity.ok(ApiResponse.success("Ratings retrieved successfully", ratings));
    }
}
