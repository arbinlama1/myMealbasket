package com.example.MealBasketSyatem.repo;

import com.example.MealBasketSyatem.entity.StockAlert;
import com.example.MealBasketSyatem.entity.Vendor;
import com.example.MealBasketSyatem.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StockAlertRepo extends JpaRepository<StockAlert, Long> {
    
    List<StockAlert> findByVendor(Vendor vendor);
    
    List<StockAlert> findByProduct(Product product);
    
    List<StockAlert> findByVendorAndProduct(Vendor vendor, Product product);
    
    List<StockAlert> findByAlertType(String alertType);
    
    List<StockAlert> findByIsActiveTrue();
    
    List<StockAlert> findByAlertTimeAfter(LocalDateTime time);
    
    List<StockAlert> findByAlertTypeAndIsActiveTrue(String alertType);
}
