package com.example.MealBasketSyatem.service;

import com.example.MealBasketSyatem.entity.Promotion;
import com.example.MealBasketSyatem.repo.PromotionRepo;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class PromotionService {

    private final PromotionRepo promotionRepo;

    public PromotionService(PromotionRepo promotionRepo) {
        this.promotionRepo = promotionRepo;
    }

    public Promotion createPromotion(Promotion promotion) {
        return promotionRepo.save(promotion);
    }

    public Optional<Promotion> getPromotionById(Long id) {
        return promotionRepo.findById(id);
    }

    public List<Promotion> getPromotionsByVendor(Long vendorId) {
        return promotionRepo.findByVendorId(vendorId);
    }

    public List<Promotion> getActivePromotions() {
        LocalDate today = LocalDate.now();
        return promotionRepo.findByIsActiveTrueAndStartDateLessThanEqualAndExpiryDateGreaterThanEqual(today, today);
    }

    public Promotion updatePromotion(Promotion promotion) {
        return promotionRepo.save(promotion);
    }

    public void deletePromotion(Long id) {
        promotionRepo.deleteById(id);
    }

    public List<Promotion> getExpiringSoonPromotions(int daysAhead) {
        LocalDate today = LocalDate.now();
        return promotionRepo.findByIsActiveTrueAndExpiryDateBetween(today, today.plusDays(daysAhead));
    }

    public Optional<Promotion> findByCouponCode(String couponCode) {
        return promotionRepo.findByCouponCode(couponCode);
    }

    public long countActivePromotionsByVendor(Long vendorId) {
        return promotionRepo.countByVendorIdAndIsActiveTrue(vendorId);
    }
}
