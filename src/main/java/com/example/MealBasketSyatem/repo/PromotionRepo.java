package com.example.MealBasketSyatem.repo;

import com.example.MealBasketSyatem.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PromotionRepo extends JpaRepository<Promotion, Long> {

    List<Promotion> findByVendorId(Long vendorId);

    Optional<Promotion> findByCouponCode(String couponCode);

    List<Promotion> findByIsActiveTrueAndStartDateLessThanEqualAndExpiryDateGreaterThanEqual(LocalDate now, LocalDate now2);

    List<Promotion> findByIsActiveTrueAndExpiryDateBetween(LocalDate from, LocalDate to);

    long countByVendorIdAndIsActiveTrue(Long vendorId);

    List<Promotion> findByIsActiveTrueAndExpiryDateLessThanEqual(LocalDate date);
}
