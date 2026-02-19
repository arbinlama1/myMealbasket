package com.example.MealBasketSyatem.controller;

import com.example.MealBasketSyatem.dto.ApiResponse;
import com.example.MealBasketSyatem.entity.StockAlert;
import com.example.MealBasketSyatem.entity.Vendor;
import com.example.MealBasketSyatem.service.StockAlertService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock-alerts")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class StockAlertController {

    @Autowired
    private StockAlertService stockAlertService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDOR')")
    public ResponseEntity<ApiResponse<List<StockAlert>>> getAllStockAlerts() {
        try {
            List<StockAlert> alerts = stockAlertService.getAllStockAlerts();
            return ResponseEntity.ok(ApiResponse.success("Stock alerts retrieved successfully", alerts));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve stock alerts: " + e.getMessage()));
        }
    }

    @GetMapping("/vendor/{vendorId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDOR')")
    public ResponseEntity<ApiResponse<List<StockAlert>>> getVendorStockAlerts(@PathVariable Long vendorId) {
        try {
            // You'll need to implement getVendorById in VendorService
            Vendor vendor = new Vendor();
            vendor.setId(vendorId);
            List<StockAlert> alerts = stockAlertService.getStockAlertsByVendor(vendor);
            return ResponseEntity.ok(ApiResponse.success("Vendor stock alerts retrieved", alerts));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve vendor stock alerts: " + e.getMessage()));
        }
    }

    @GetMapping("/product/{productId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDOR')")
    public ResponseEntity<ApiResponse<List<StockAlert>>> getProductStockAlerts(@PathVariable Long productId) {
        try {
            // You'll need to implement getProductById in ProductService
            StockAlert dummyAlert = new StockAlert();
            return ResponseEntity.ok(ApiResponse.success("Product stock alerts retrieved", List.of(dummyAlert)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve product stock alerts: " + e.getMessage()));
        }
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDOR')")
    public ResponseEntity<ApiResponse<List<StockAlert>>> getActiveStockAlerts() {
        try {
            List<StockAlert> activeAlerts = stockAlertService.getActiveStockAlerts();
            return ResponseEntity.ok(ApiResponse.success("Active stock alerts retrieved", activeAlerts));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve active stock alerts: " + e.getMessage()));
        }
    }

    @GetMapping("/critical")
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDOR')")
    public ResponseEntity<ApiResponse<List<StockAlert>>> getCriticalStockAlerts() {
        try {
            List<StockAlert> criticalAlerts = stockAlertService.getCriticalAlerts();
            return ResponseEntity.ok(ApiResponse.success("Critical stock alerts retrieved", criticalAlerts));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve critical stock alerts: " + e.getMessage()));
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDOR')")
    public ResponseEntity<ApiResponse<StockAlert>> createStockAlert(@RequestBody StockAlert stockAlert) {
        try {
            StockAlert createdAlert = stockAlertService.createStockAlert(stockAlert);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Stock alert created successfully", createdAlert));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create stock alert: " + e.getMessage()));
        }
    }

    @PostMapping("/monitor/{vendorId}/{productId}/{currentStock}")
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDOR')")
    public ResponseEntity<ApiResponse<StockAlert>> monitorStock(
            @PathVariable Long vendorId, @PathVariable Long productId, 
            @PathVariable Integer currentStock) {
        try {
            // Create dummy vendor and product for monitoring
            Vendor vendor = new Vendor();
            vendor.setId(vendorId);
            
            StockAlert alert = new StockAlert();
            alert.setProduct(new com.example.MealBasketSyatem.entity.Product());
            alert.getProduct().setId(productId);
            
            stockAlertService.monitorStockLevels(vendor, alert.getProduct(), currentStock);
            
            return ResponseEntity.ok(ApiResponse.success("Stock monitoring completed", alert));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to monitor stock: " + e.getMessage()));
        }
    }

    @PostMapping("/predict/{vendorId}/{productId}/{currentStock}")
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDOR')")
    public ResponseEntity<ApiResponse<StockAlert>> predictStock(
            @PathVariable Long vendorId, @PathVariable Long productId, 
            @PathVariable Integer currentStock) {
        try {
            Vendor vendor = new Vendor();
            vendor.setId(vendorId);
            
            StockAlert prediction = new StockAlert();
            prediction.setProduct(new com.example.MealBasketSyatem.entity.Product());
            prediction.getProduct().setId(productId);
            
            StockAlert predictionAlert = stockAlertService.generateStockPrediction(vendor, prediction.getProduct(), currentStock);
            return ResponseEntity.ok(ApiResponse.success("Stock prediction generated", predictionAlert));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to generate stock prediction: " + e.getMessage()));
        }
    }

    @PutMapping("/deactivate/{alertId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDOR')")
    public ResponseEntity<ApiResponse<Void>> deactivateAlert(@PathVariable Long alertId) {
        try {
            stockAlertService.deactivateAlert(alertId);
            return ResponseEntity.ok(ApiResponse.success("Alert deactivated successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to deactivate alert: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{alertId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteStockAlert(@PathVariable Long alertId) {
        try {
            stockAlertService.deleteStockAlert(alertId);
            return ResponseEntity.ok(ApiResponse.success("Stock alert deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete stock alert: " + e.getMessage()));
        }
    }
}
