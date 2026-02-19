package com.example.MealBasketSyatem.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "system_performance")
public class SystemPerformance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String metricType; // ORDER_VOLUME, RESPONSE_TIME, ERROR_RATE, USER_ACTIVITY, SYSTEM_LOAD
    private Double metricValue;
    private String metricUnit; // ms, %, count, requests/second
    private java.time.LocalDateTime recordedTime;
    private String description;

    // Performance thresholds
    private Double thresholdValue;
    private String status; // GOOD, WARNING, CRITICAL

    // Additional context
    private String entityType; // USER, VENDOR, PRODUCT, ORDER
    private Long entityId;

    // Constructors
    public SystemPerformance() {}

    public SystemPerformance(String metricType, Double metricValue, String metricUnit) {
        this.metricType = metricType;
        this.metricValue = metricValue;
        this.metricUnit = metricUnit;
        this.recordedTime = java.time.LocalDateTime.now();
        
        // Auto-determine status based on metric type
        determineStatus();
    }

    private void determineStatus() {
        if (thresholdValue == null) {
            setDefaultThresholds();
        }
        
        switch (metricType) {
            case "RESPONSE_TIME":
                if (metricValue <= 200) status = "GOOD";
                else if (metricValue <= 1000) status = "WARNING";
                else status = "CRITICAL";
                break;
            case "ERROR_RATE":
                if (metricValue <= 1.0) status = "GOOD";
                else if (metricValue <= 5.0) status = "WARNING";
                else status = "CRITICAL";
                break;
            case "SYSTEM_LOAD":
                if (metricValue <= 70.0) status = "GOOD";
                else if (metricValue <= 90.0) status = "WARNING";
                else status = "CRITICAL";
                break;
            default:
                status = "GOOD";
        }
    }

    private void setDefaultThresholds() {
        switch (metricType) {
            case "RESPONSE_TIME":
                thresholdValue = 200.0;
                break;
            case "ERROR_RATE":
                thresholdValue = 1.0;
                break;
            case "SYSTEM_LOAD":
                thresholdValue = 70.0;
                break;
            default:
                thresholdValue = 0.0;
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getMetricType() { return metricType; }
    public void setMetricType(String metricType) { this.metricType = metricType; }

    public Double getMetricValue() { return metricValue; }
    public void setMetricValue(Double metricValue) { 
        this.metricValue = metricValue;
        determineStatus();
    }

    public String getMetricUnit() { return metricUnit; }
    public void setMetricUnit(String metricUnit) { this.metricUnit = metricUnit; }

    public java.time.LocalDateTime getRecordedTime() { return recordedTime; }
    public void setRecordedTime(java.time.LocalDateTime recordedTime) { this.recordedTime = recordedTime; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getThresholdValue() { return thresholdValue; }
    public void setThresholdValue(Double thresholdValue) { this.thresholdValue = thresholdValue; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }

    public Long getEntityId() { return entityId; }
    public void setEntityId(Long entityId) { this.entityId = entityId; }
}
