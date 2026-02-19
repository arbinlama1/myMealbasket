package com.example.MealBasketSyatem.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "stock_alerts")
public class StockAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "vendor_id")
    private Vendor vendor;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    private Integer currentStock;
    private Integer minimumThreshold;
    private Integer maximumThreshold;
    private String alertType; // LOW_STOCK, OUT_OF_STOCK, HIGH_STOCK, PREDICTION_ALERT
    private String alertMessage;
    private Boolean isActive;
    private java.time.LocalDateTime alertTime;

    // Prediction fields
    private Integer predictedStock;
    private java.time.LocalDate predictionDate;
    private Double predictionConfidence;

    // Constructors
    public StockAlert() {}

    public StockAlert(Vendor vendor, Product product, Integer currentStock, Integer minimumThreshold) {
        this.vendor = vendor;
        this.product = product;
        this.currentStock = currentStock;
        this.minimumThreshold = minimumThreshold;
        this.isActive = true;
        this.alertTime = java.time.LocalDateTime.now();
        
        // Auto-determine alert type
        if (currentStock <= 0) {
            this.alertType = "OUT_OF_STOCK";
            this.alertMessage = "Product is completely out of stock";
        } else if (currentStock <= minimumThreshold) {
            this.alertType = "LOW_STOCK";
            this.alertMessage = "Product stock is below minimum threshold";
        } else {
            this.alertType = "NORMAL";
            this.alertMessage = "Stock level is normal";
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Vendor getVendor() { return vendor; }
    public void setVendor(Vendor vendor) { this.vendor = vendor; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public Integer getCurrentStock() { return currentStock; }
    public void setCurrentStock(Integer currentStock) { this.currentStock = currentStock; }

    public Integer getMinimumThreshold() { return minimumThreshold; }
    public void setMinimumThreshold(Integer minimumThreshold) { this.minimumThreshold = minimumThreshold; }

    public Integer getMaximumThreshold() { return maximumThreshold; }
    public void setMaximumThreshold(Integer maximumThreshold) { this.maximumThreshold = maximumThreshold; }

    public String getAlertType() { return alertType; }
    public void setAlertType(String alertType) { this.alertType = alertType; }

    public String getAlertMessage() { return alertMessage; }
    public void setAlertMessage(String alertMessage) { this.alertMessage = alertMessage; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean active) { isActive = active; }

    public java.time.LocalDateTime getAlertTime() { return alertTime; }
    public void setAlertTime(java.time.LocalDateTime alertTime) { this.alertTime = alertTime; }

    public Integer getPredictedStock() { return predictedStock; }
    public void setPredictedStock(Integer predictedStock) { this.predictedStock = predictedStock; }

    public java.time.LocalDate getPredictionDate() { return predictionDate; }
    public void setPredictionDate(java.time.LocalDate predictionDate) { this.predictionDate = predictionDate; }

    public Double getPredictionConfidence() { return predictionConfidence; }
    public void setPredictionConfidence(Double predictionConfidence) { this.predictionConfidence = predictionConfidence; }
}
