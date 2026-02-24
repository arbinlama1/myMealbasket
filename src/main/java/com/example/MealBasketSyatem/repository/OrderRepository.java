package com.example.MealBasketSyatem.repository;

import com.example.MealBasketSyatem.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    List<Order> findByUserId(Long userId);
    
    List<Order> findByVendorId(Long vendorId);
    
    List<Order> findByVendorIdOrderByCreatedAtDesc(Long vendorId);
    
    List<Order> findByStatus(String status);
    
    List<Order> findByVendorIdAndStatus(Long vendorId, String status);
    
    @Query("SELECT o FROM Order o WHERE o.vendor.id = ?1 ORDER BY o.createdAt DESC")
    List<Order> findOrdersByVendorIdWithLatest(Long vendorId);
}
