package com.example.MealBasketSyatem.controller;

import com.example.MealBasketSyatem.dto.ApiResponse;
import com.example.MealBasketSyatem.entity.SystemPerformance;
import com.example.MealBasketSyatem.service.SystemPerformanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/system-performance")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class SystemPerformanceController {

    @Autowired
    private SystemPerformanceService performanceService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<SystemPerformance>>> getAllPerformanceMetrics() {
        try {
            List<SystemPerformance> metrics = performanceService.getAllPerformanceMetrics();
            return ResponseEntity.ok(ApiResponse.success("Performance metrics retrieved", metrics));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve performance metrics: " + e.getMessage()));
        }
    }

    @GetMapping("/type/{metricType}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<SystemPerformance>>> getMetricsByType(@PathVariable String metricType) {
        try {
            List<SystemPerformance> metrics = performanceService.getMetricsByType(metricType);
            return ResponseEntity.ok(ApiResponse.success("Metrics by type retrieved", metrics));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve metrics by type: " + e.getMessage()));
        }
    }

    @GetMapping("/critical")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<SystemPerformance>>> getCriticalMetrics() {
        try {
            List<SystemPerformance> criticalMetrics = performanceService.getCriticalMetrics();
            return ResponseEntity.ok(ApiResponse.success("Critical metrics retrieved", criticalMetrics));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve critical metrics: " + e.getMessage()));
        }
    }

    @GetMapping("/recent/{hours}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<SystemPerformance>>> getRecentMetrics(@PathVariable int hours) {
        try {
            List<SystemPerformance> recentMetrics = performanceService.getRecentMetrics(hours);
            return ResponseEntity.ok(ApiResponse.success("Recent metrics retrieved", recentMetrics));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve recent metrics: " + e.getMessage()));
        }
    }

    @PostMapping("/monitor/response-time")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SystemPerformance>> monitorResponseTime(@RequestParam Long responseTimeMs) {
        try {
            performanceService.monitorResponseTime(responseTimeMs);
            return ResponseEntity.ok(ApiResponse.success("Response time monitored", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to monitor response time: " + e.getMessage()));
        }
    }

    @PostMapping("/monitor/error-rate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SystemPerformance>> monitorErrorRate(@RequestParam Double errorPercentage) {
        try {
            performanceService.monitorErrorRate(errorPercentage);
            return ResponseEntity.ok(ApiResponse.success("Error rate monitored", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to monitor error rate: " + e.getMessage()));
        }
    }

    @PostMapping("/monitor/order-volume")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SystemPerformance>> monitorOrderVolume(@RequestParam Integer orderCount) {
        try {
            performanceService.monitorOrderVolume(orderCount);
            return ResponseEntity.ok(ApiResponse.success("Order volume monitored", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to monitor order volume: " + e.getMessage()));
        }
    }

    @PostMapping("/monitor/system-load")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SystemPerformance>> monitorSystemLoad(@RequestParam Double cpuUsage) {
        try {
            performanceService.monitorSystemLoad(cpuUsage);
            return ResponseEntity.ok(ApiResponse.success("System load monitored", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to monitor system load: " + e.getMessage()));
        }
    }

    @PostMapping("/health-check")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SystemPerformance>> performHealthCheck() {
        try {
            performanceService.performHealthCheck();
            return ResponseEntity.ok(ApiResponse.success("Health check performed", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to perform health check: " + e.getMessage()));
        }
    }

    @PostMapping("/generate-daily-report")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SystemPerformance>> generateDailyReport() {
        try {
            SystemPerformance report = performanceService.generateDailyReport();
            return ResponseEntity.ok(ApiResponse.success("Daily report generated", report));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to generate daily report: " + e.getMessage()));
        }
    }

    @GetMapping("/analytics/{startTime}/{endTime}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<SystemPerformance>>> getAnalytics(
            @PathVariable String startTime, @PathVariable String endTime) {
        try {
            LocalDateTime start = LocalDateTime.parse(startTime);
            LocalDateTime end = LocalDateTime.parse(endTime);
            List<SystemPerformance> analytics = performanceService.getMetricsInTimeRange(start, end);
            return ResponseEntity.ok(ApiResponse.success("Analytics data retrieved", analytics));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid datetime format: " + e.getMessage()));
        }
    }
}
