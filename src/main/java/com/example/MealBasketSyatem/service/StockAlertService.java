package com.example.MealBasketSyatem.service;

import com.example.MealBasketSyatem.entity.StockAlert;
import com.example.MealBasketSyatem.entity.Vendor;
import com.example.MealBasketSyatem.entity.Product;
import com.example.MealBasketSyatem.repo.StockAlertRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
public class StockAlertService {

    @Autowired
    private StockAlertRepo stockAlertRepo;

    public List<StockAlert> getAllStockAlerts() {
        return stockAlertRepo.findAll();
    }

    public List<StockAlert> getStockAlertsByVendor(Vendor vendor) {
        return stockAlertRepo.findByVendor(vendor);
    }

    public List<StockAlert> getStockAlertsByProduct(Product product) {
        return stockAlertRepo.findByProduct(product);
    }

    public List<StockAlert> getActiveStockAlerts() {
        return stockAlertRepo.findByIsActiveTrue();
    }

    public List<StockAlert> getCriticalAlerts() {
        return stockAlertRepo.findByAlertTypeAndIsActiveTrue("OUT_OF_STOCK");
    }

    public StockAlert createStockAlert(StockAlert stockAlert) {
        return stockAlertRepo.save(stockAlert);
    }

    public StockAlert updateStockAlert(StockAlert stockAlert) {
        return stockAlertRepo.save(stockAlert);
    }

    public void deleteStockAlert(Long id) {
        stockAlertRepo.deleteById(id);
    }

    // Stock Monitoring Methods
    public void monitorStockLevels(Vendor vendor, Product product, Integer currentStock) {
        // Get existing alert for this vendor-product combination
        List<StockAlert> existingAlerts = stockAlertRepo.findByVendorAndProduct(vendor, product);
        
        StockAlert alert;
        if (existingAlerts.isEmpty()) {
            // Create new alert
            alert = new StockAlert(vendor, product, currentStock, 10); // Default threshold of 10
        } else {
            // Update existing alert
            alert = existingAlerts.get(0);
            alert.setCurrentStock(currentStock);
            alert.setAlertTime(LocalDateTime.now());
            // Update alert type based on new stock level
            if (currentStock <= 0) {
                alert.setAlertType("OUT_OF_STOCK");
                alert.setAlertMessage("Product is completely out of stock");
            } else if (currentStock <= 10) {
                alert.setAlertType("LOW_STOCK");
                alert.setAlertMessage("Product stock is below minimum threshold");
            } else {
                alert.setAlertType("NORMAL");
                alert.setAlertMessage("Stock level is normal");
            }
        }

        stockAlertRepo.save(alert);
    }

    // Stock Prediction Methods
    public StockAlert generateStockPrediction(Vendor vendor, Product product, Integer currentStock) {
        StockAlert predictionAlert = new StockAlert();
        predictionAlert.setVendor(vendor);
        predictionAlert.setProduct(product);
        predictionAlert.setCurrentStock(currentStock);
        predictionAlert.setAlertType("PREDICTION_ALERT");
        predictionAlert.setPredictionDate(LocalDateTime.now().plusDays(7).toLocalDate()); // Predict 7 days ahead
        
        // Simple prediction logic (can be enhanced with ML algorithms)
        Random random = new Random();
        Integer predictedStock = currentStock - (random.nextInt(5) + 1); // Predict 1-5 units decrease
        predictionAlert.setPredictedStock(predictedStock);
        
        // Calculate confidence based on stock stability
        Double confidence = calculatePredictionConfidence(currentStock, predictedStock);
        predictionAlert.setPredictionConfidence(confidence);
        
        if (predictedStock <= 5) {
            predictionAlert.setAlertMessage("⚠️ Stock Prediction: Product may run out of stock within 7 days");
        } else {
            predictionAlert.setAlertMessage("📊 Stock Prediction: Product stock levels are stable for next 7 days");
        }
        
        predictionAlert.setIsActive(true);
        predictionAlert.setAlertTime(LocalDateTime.now());
        
        return stockAlertRepo.save(predictionAlert);
    }

    private Double calculatePredictionConfidence(Integer currentStock, Integer predictedStock) {
        Integer difference = Math.abs(currentStock - predictedStock);
        if (difference <= 2) {
            return 0.85; // High confidence
        } else if (difference <= 5) {
            return 0.70; // Medium confidence
        } else {
            return 0.50; // Low confidence
        }
    }

    // Alert Management
    public void deactivateAlert(Long alertId) {
        StockAlert alert = stockAlertRepo.findById(alertId).orElse(null);
        if (alert != null) {
            alert.setIsActive(false);
            stockAlertRepo.save(alert);
        }
    }

    public List<StockAlert> getRecentAlerts(int hours) {
        LocalDateTime cutoffTime = LocalDateTime.now().minusHours(hours);
        return stockAlertRepo.findByAlertTimeAfter(cutoffTime);
    }
}
