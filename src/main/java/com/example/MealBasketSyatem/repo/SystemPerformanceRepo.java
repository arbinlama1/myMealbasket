package com.example.MealBasketSyatem.repo;

import com.example.MealBasketSyatem.entity.SystemPerformance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SystemPerformanceRepo extends JpaRepository<SystemPerformance, Long> {
    
    List<SystemPerformance> findByMetricType(String metricType);
    
    List<SystemPerformance> findByStatus(String status);
    
    List<SystemPerformance> findByRecordedTimeBetween(LocalDateTime startTime, LocalDateTime endTime);
    
    List<SystemPerformance> findByEntityType(String entityType);
    
    List<SystemPerformance> findByMetricTypeAndRecordedTimeAfterOrderByRecordedTimeDesc(String metricType, LocalDateTime time);
    
    List<SystemPerformance> findTop10ByOrderByRecordedTimeDesc();
}
