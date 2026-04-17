package com.example.MealBasketSyatem.controller;

import com.example.MealBasketSyatem.dto.ApiResponse;
import com.example.MealBasketSyatem.entity.Promotion;
import com.example.MealBasketSyatem.entity.Vendor;
import com.example.MealBasketSyatem.service.PromotionService;
import com.example.MealBasketSyatem.service.VendorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/promotions")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003"})
public class PromotionController {

    @Autowired
    private PromotionService promotionService;

    @Autowired
    private VendorService vendorService;

    @GetMapping("/vendor/{vendorId}")
    public ResponseEntity<ApiResponse<List<Promotion>>> getVendorPromotions(@PathVariable Long vendorId) {
        try {
            List<Promotion> promotions = promotionService.getPromotionsByVendor(vendorId);
            return ResponseEntity.ok(ApiResponse.success("Vendor promotions retrieved successfully", promotions));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve promotions: " + e.getMessage()));
        }
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<Promotion>>> getActivePromotions() {
        try {
            List<Promotion> promotions = promotionService.getActivePromotions();
            return ResponseEntity.ok(ApiResponse.success("Active promotions retrieved successfully", promotions));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve active promotions: " + e.getMessage()));
        }
    }

    @GetMapping("/admin/all")
    public ResponseEntity<ApiResponse<List<Promotion>>> getAllPromotions() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("User not authenticated"));
            }
            if (auth.getAuthorities().stream().noneMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()))) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Access denied. Admin role required."));
            }

            List<Promotion> promotions = promotionService.getAllPromotions();
            return ResponseEntity.ok(ApiResponse.success("All promotions retrieved successfully", promotions));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve promotions: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Promotion>> getPromotionById(@PathVariable Long id) {
        return promotionService.getPromotionById(id)
                .map(promotion -> ResponseEntity.ok(ApiResponse.success("Promotion retrieved successfully", promotion)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Promotion not found")));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Promotion>> createPromotion(@RequestBody Promotion promotionData) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("User not authenticated"));
            }
            if (auth.getAuthorities().stream().noneMatch(a -> "ROLE_VENDOR".equals(a.getAuthority()))) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Access denied. Vendor role required."));
            }

            String email = auth.getName();
            Vendor vendor = vendorService.findVendorByEmail(email);
            if (vendor == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Vendor account not found"));
            }

            if (promotionData.getCouponCode() == null || promotionData.getCouponCode().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Coupon code is required"));
            }

            promotionData.setCouponCode(promotionData.getCouponCode().trim().toUpperCase());
            promotionData.setVendor(vendor);
            Promotion saved = promotionService.createPromotion(promotionData);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Promotion created successfully", saved));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create promotion: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Promotion>> updatePromotion(@PathVariable Long id,
                                                                 @RequestBody Promotion promotionData) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("User not authenticated"));
            }
            if (auth.getAuthorities().stream().noneMatch(a -> "ROLE_VENDOR".equals(a.getAuthority()))) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Access denied. Vendor role required."));
            }

            Promotion existing = promotionService.getPromotionById(id)
                    .orElseThrow(() -> new RuntimeException("Promotion not found"));

            if (!existing.getVendor().getEmail().equals(auth.getName())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("You can only update your own promotions"));
            }

            existing.setTitle(promotionData.getTitle());
            existing.setDescription(promotionData.getDescription());
            existing.setCouponCode(promotionData.getCouponCode() != null
                    ? promotionData.getCouponCode().trim().toUpperCase()
                    : existing.getCouponCode());
            existing.setDiscountType(promotionData.getDiscountType());
            existing.setDiscountValue(promotionData.getDiscountValue());
            existing.setMinOrderAmount(promotionData.getMinOrderAmount());
            existing.setStartDate(promotionData.getStartDate());
            existing.setExpiryDate(promotionData.getExpiryDate());
            existing.setIsActive(promotionData.getIsActive());

            Promotion updated = promotionService.updatePromotion(existing);
            return ResponseEntity.ok(ApiResponse.success("Promotion updated successfully", updated));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update promotion: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> deletePromotion(@PathVariable Long id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("User not authenticated"));
            }
            if (auth.getAuthorities().stream().noneMatch(a -> "ROLE_VENDOR".equals(a.getAuthority()))) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Access denied. Vendor role required."));
            }

            Promotion existing = promotionService.getPromotionById(id)
                    .orElseThrow(() -> new RuntimeException("Promotion not found"));

            if (!existing.getVendor().getEmail().equals(auth.getName())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("You can only delete your own promotions"));
            }

            promotionService.deletePromotion(id);
            return ResponseEntity.ok(ApiResponse.success("Promotion deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete promotion: " + e.getMessage()));
        }
    }

    @DeleteMapping("/admin/{id}")
    public ResponseEntity<ApiResponse<?>> deletePromotionByAdmin(@PathVariable Long id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("User not authenticated"));
            }
            if (auth.getAuthorities().stream().noneMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()))) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Access denied. Admin role required."));
            }

            promotionService.getPromotionById(id)
                    .orElseThrow(() -> new RuntimeException("Promotion not found"));

            promotionService.deletePromotion(id);
            return ResponseEntity.ok(ApiResponse.success("Promotion deleted successfully by admin", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete promotion: " + e.getMessage()));
        }
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse<Promotion>> togglePromotionStatus(@PathVariable Long id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("User not authenticated"));
            }
            if (auth.getAuthorities().stream().noneMatch(a -> "ROLE_VENDOR".equals(a.getAuthority()))) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Access denied. Vendor role required."));
            }

            Promotion existing = promotionService.getPromotionById(id)
                    .orElseThrow(() -> new RuntimeException("Promotion not found"));

            if (!existing.getVendor().getEmail().equals(auth.getName())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("You can only toggle your own promotions"));
            }

            existing.setIsActive(!existing.getIsActive());
            Promotion updated = promotionService.updatePromotion(existing);
            return ResponseEntity.ok(ApiResponse.success("Promotion status updated successfully", updated));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to toggle promotion status: " + e.getMessage()));
        }
    }

    @PostMapping("/apply")
    public ResponseEntity<ApiResponse<Map<String, Object>>> applyPromotion(@RequestBody Map<String, Object> body) {
        try {
            String couponCode = body.getOrDefault("couponCode", "").toString().trim().toUpperCase();
            Double cartTotal = body.get("cartTotal") instanceof Number
                    ? ((Number) body.get("cartTotal")).doubleValue()
                    : Double.valueOf(body.getOrDefault("cartTotal", "0").toString());

            if (couponCode.isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Coupon code is required"));
            }

            Promotion promotion = promotionService.findByCouponCode(couponCode)
                    .orElseThrow(() -> new RuntimeException("Promotion code not found"));

            LocalDate today = LocalDate.now();
            if (!promotion.getIsActive() || promotion.getStartDate().isAfter(today) || !promotion.getExpiryDate().isAfter(today)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Promotion is not active"));
            }

            if (cartTotal < promotion.getMinOrderAmount()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Cart total must be at least " + promotion.getMinOrderAmount() + " to apply this promotion."));
            }

            double discount;
            if ("PERCENT".equalsIgnoreCase(promotion.getDiscountType())) {
                discount = Math.min(cartTotal * promotion.getDiscountValue() / 100.0, promotion.getDiscountValue() * 1000); // preserve amount
            } else {
                discount = promotion.getDiscountValue();
            }

            discount = Math.max(0, discount);
            double finalAmount = Math.max(0, cartTotal - discount);

            Map<String, Object> response = new HashMap<>();
            response.put("couponCode", promotion.getCouponCode());
            response.put("discount", discount);
            response.put("finalAmount", finalAmount);
            response.put("promotion", promotion);

            return ResponseEntity.ok(ApiResponse.success("Promotion applied successfully", response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Failed to apply promotion: " + e.getMessage()));
        }
    }

    @GetMapping("/expiring-soon")
    public ResponseEntity<ApiResponse<List<Promotion>>> getPromotionsExpiringSoon() {
        try {
            List<Promotion> promotions = promotionService.getExpiringSoonPromotions(7);
            return ResponseEntity.ok(ApiResponse.success("Promotions expiring soon retrieved successfully", promotions));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve promotions expiring soon: " + e.getMessage()));
        }
    }

    @GetMapping("/vendor/{vendorId}/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getVendorPromotionStats(@PathVariable Long vendorId) {
        try {
            long activeCount = promotionService.countActivePromotionsByVendor(vendorId);
            List<Promotion> allPromotions = promotionService.getPromotionsByVendor(vendorId);
            long expiringSoon = allPromotions.stream()
                    .filter(p -> p.getIsActive() && !p.getExpiryDate().isBefore(LocalDate.now()) && !p.getExpiryDate().isAfter(LocalDate.now().plusDays(7)))
                    .count();

            Map<String, Object> stats = new HashMap<>();
            stats.put("activePromotions", activeCount);
            stats.put("totalPromotions", allPromotions.size());
            stats.put("expiringSoon", expiringSoon);

            return ResponseEntity.ok(ApiResponse.success("Promotion stats retrieved successfully", stats));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve promotion stats: " + e.getMessage()));
        }
    }

    @PostMapping("/admin/deactivate-expired")
    public ResponseEntity<ApiResponse<Map<String, Object>>> deactivateExpiredPromotions() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("User not authenticated"));
            }
            if (auth.getAuthorities().stream().noneMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()))) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Access denied. Admin role required."));
            }

            promotionService.deactivateExpiredPromotions();
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Expired promotions deactivated successfully");
            response.put("timestamp", LocalDate.now());
            
            return ResponseEntity.ok(ApiResponse.success("Expired promotions deactivated successfully", response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to deactivate expired promotions: " + e.getMessage()));
        }
    }
}
