package com.example.MealBasketSyatem.controller;

import com.example.MealBasketSyatem.dto.ApiResponse;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class TestController {

    @GetMapping("/health")
    public ApiResponse<Map<String, String>> healthCheck() {
        Map<String, String> status = new HashMap<>();
        status.put("status", "UP");
        status.put("message", "MealBasket API is running");
        status.put("timestamp", String.valueOf(System.currentTimeMillis()));
        return ApiResponse.success("API Health Check", status);
    }

    @GetMapping("/public")
    public ApiResponse<String> publicEndpoint() {
        return ApiResponse.success("Public endpoint accessible", "This is a public endpoint");
    }

    @GetMapping("/protected")
    public ApiResponse<String> protectedEndpoint() {
        return ApiResponse.success("Protected endpoint accessible", "This endpoint requires authentication");
    }
}
