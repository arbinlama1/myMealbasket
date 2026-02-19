package com.example.MealBasketSyatem.service;

import com.example.MealBasketSyatem.entity.SystemPerformance;
import com.example.MealBasketSyatem.repo.SystemPerformanceRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
public class SystemPerformanceService {

    @Autowired
    private SystemPerformanceRepo performanceRepo;

    public List<SystemPerformance> getAllPerformanceMetrics() {
        return performanceRepo.findAll();
    }

    public List<SystemPerformance> getMetricsByType(String metricType) {
        return performanceRepo.findByMetricType(metricType);
    }

    public List<SystemPerformance> getCriticalMetrics() {
        return performanceRepo.findByStatus("CRITICAL");
    }

    public SystemPerformance recordMetric(String metricType, Double metricValue, String metricUnit) {
        SystemPerformance metric = new SystemPerformance(metricType, metricValue, metricUnit);
        return performanceRepo.save(metric);
    }

    public SystemPerformance recordMetricWithEntity(String metricType, Double metricValue, String metricUnit, 
                                               String entityType, Long entityId, String description) {
        SystemPerformance metric = new SystemPerformance(metricType, metricValue, metricUnit);
        metric.setEntityType(entityType);
        metric.setEntityId(entityId);
        metric.setDescription(description);
        return performanceRepo.save(metric);
    }

    // Performance Monitoring Methods
    public void monitorResponseTime(Long responseTimeMs) {
        recordMetricWithEntity("RESPONSE_TIME", responseTimeMs.doubleValue(), "ms", 
                              "API", null, "API response time monitoring");
    }

    public void monitorErrorRate(Double errorPercentage) {
        recordMetricWithEntity("ERROR_RATE", errorPercentage, "%", 
                              "SYSTEM", null, "System error rate monitoring");
    }

    public void monitorOrderVolume(Integer orderCount) {
        recordMetric("ORDER_VOLUME", orderCount.doubleValue(), "count");
    }

    public void monitorUserActivity(Long userId, String activity) {
        recordMetricWithEntity("USER_ACTIVITY", 1.0, "count", 
                              "USER", userId, "User activity: " + activity);
    }

    public void monitorSystemLoad(Double cpuUsage) {
        recordMetric("SYSTEM_LOAD", cpuUsage, "%");
    }

    // Analytics Methods
    public List<SystemPerformance> getMetricsInTimeRange(LocalDateTime startTime, LocalDateTime endTime) {
        return performanceRepo.findByRecordedTimeBetween(startTime, endTime);
    }

    public List<SystemPerformance> getRecentMetrics(int hours) {
        LocalDateTime cutoffTime = LocalDateTime.now().minusHours(hours);
        return performanceRepo.findByRecordedTimeBetween(cutoffTime, LocalDateTime.now());
    }

    // Report Generation
    public SystemPerformance generateDailyReport() {
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfDay = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59);
        
        List<SystemPerformance> dayMetrics = getMetricsInTimeRange(startOfDay, endOfDay);
        
        // Calculate averages
        double avgResponseTime = dayMetrics.stream()
            .filter(m -> "RESPONSE_TIME".equals(m.getMetricType()))
            .mapToDouble(SystemPerformance::getMetricValue)
            .average()
            .orElse(0.0);
            
        double avgErrorRate = dayMetrics.stream()
            .filter(m -> "ERROR_RATE".equals(m.getMetricType()))
            .mapToDouble(SystemPerformance::getMetricValue)
            .average()
            .orElse(0.0);
        
        SystemPerformance report = new SystemPerformance();
        report.setMetricType("DAILY_REPORT");
        report.setMetricValue(avgResponseTime);
        report.setMetricUnit("ms");
        report.setDescription(String.format("Daily Report - Avg Response Time: %.2f ms, Error Rate: %.2f%%", 
                                       avgResponseTime, avgErrorRate));
        
        return performanceRepo.save(report);
    }

    // Automated Monitoring
    public void performHealthCheck() {
        Random random = new Random();
        
        // Simulate response time check
        long responseTime = 100 + random.nextInt(400); // 100-500ms
        monitorResponseTime(responseTime);
        
        // Simulate error rate check
        double errorRate = random.nextDouble() * 2.0; // 0-2%
        monitorErrorRate(errorRate);
        
        // Simulate system load check
        double systemLoad = 20.0 + random.nextDouble() * 60.0; // 20-80%
        monitorSystemLoad(systemLoad);
        
        // Record overall health metric
        String healthStatus = (responseTime < 300 && errorRate < 1.0 && systemLoad < 80.0) ? "HEALTHY" : "DEGRADED";
        recordMetric("SYSTEM_HEALTH", healthStatus.equals("HEALTHY") ? 1.0 : 0.0, "status");
    }
}
