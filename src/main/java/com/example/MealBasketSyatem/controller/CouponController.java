package com.example.MealBasketSyatem.controller;

import com.example.MealBasketSyatem.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/coupons")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003"})
public class CouponController {

    /**
     * Get active coupons
     */
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<Object>> getActiveCoupons() {
        try {
            // For demo purposes, return some sample coupons
            Map<String, Object> sampleCoupon1 = new HashMap<>();
            sampleCoupon1.put("id", 1);
            sampleCoupon1.put("code", "WELCOME10");
            sampleCoupon1.put("description", "Get 10% off on your first order");
            sampleCoupon1.put("discountType", "PERCENTAGE");
            sampleCoupon1.put("discountAmount", 10.0);
            sampleCoupon1.put("minOrderAmount", 500.0);
            sampleCoupon1.put("isActive", true);

            Map<String, Object> sampleCoupon2 = new HashMap<>();
            sampleCoupon2.put("id", 2);
            sampleCoupon2.put("code", "SAVE20");
            sampleCoupon2.put("description", "Save 20% on orders above 1000");
            sampleCoupon2.put("discountType", "PERCENTAGE");
            sampleCoupon2.put("discountAmount", 20.0);
            sampleCoupon2.put("minOrderAmount", 1000.0);
            sampleCoupon2.put("isActive", true);

            Map<String, Object> sampleCoupon3 = new HashMap<>();
            sampleCoupon3.put("id", 3);
            sampleCoupon3.put("code", "FLAT100");
            sampleCoupon3.put("description", "Flat 100 NPR off on minimum order of 800");
            sampleCoupon3.put("discountType", "FIXED");
            sampleCoupon3.put("discountAmount", 100.0);
            sampleCoupon3.put("minOrderAmount", 800.0);
            sampleCoupon3.put("isActive", true);

            Object[] coupons = {sampleCoupon1, sampleCoupon2, sampleCoupon3};
            
            return ResponseEntity.ok(ApiResponse.success("Active coupons retrieved successfully", coupons));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve active coupons: " + e.getMessage()));
        }
    }

    /**
     * Apply coupon
     */
    @PostMapping("/apply")
    public ResponseEntity<ApiResponse<Object>> applyCoupon(@RequestBody Map<String, Object> request) {
        try {
            String couponCode = (String) request.get("couponCode");
            Double cartTotal = request.get("cartTotal") != null ? 
                Double.valueOf(request.get("cartTotal").toString()) : 0.0;

            // Sample coupon logic
            Map<String, Object> result = new HashMap<>();
            
            switch (couponCode.toUpperCase()) {
                case "WELCOME10":
                    if (cartTotal >= 500) {
                        result.put("discountAmount", cartTotal * 0.10);
                        result.put("finalTotal", cartTotal - (cartTotal * 0.10));
                        result.put("message", "WELCOME10 coupon applied successfully!");
                        result.put("success", true);
                    } else {
                        result.put("message", "Minimum order amount should be 500 for this coupon");
                        result.put("success", false);
                    }
                    break;
                    
                case "SAVE20":
                    if (cartTotal >= 1000) {
                        result.put("discountAmount", cartTotal * 0.20);
                        result.put("finalTotal", cartTotal - (cartTotal * 0.20));
                        result.put("message", "SAVE20 coupon applied successfully!");
                        result.put("success", true);
                    } else {
                        result.put("message", "Minimum order amount should be 1000 for this coupon");
                        result.put("success", false);
                    }
                    break;
                    
                case "FLAT100":
                    if (cartTotal >= 800) {
                        result.put("discountAmount", 100.0);
                        result.put("finalTotal", cartTotal - 100.0);
                        result.put("message", "FLAT100 coupon applied successfully!");
                        result.put("success", true);
                    } else {
                        result.put("message", "Minimum order amount should be 800 for this coupon");
                        result.put("success", false);
                    }
                    break;
                    
                default:
                    result.put("message", "Invalid coupon code");
                    result.put("success", false);
                    break;
            }

            if (result.get("success").equals(true)) {
                return ResponseEntity.ok(ApiResponse.success("Coupon applied successfully", result));
            } else {
                return ResponseEntity.badRequest().body(ApiResponse.error((String) result.get("message")));
            }
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to apply coupon: " + e.getMessage()));
        }
    }
}
