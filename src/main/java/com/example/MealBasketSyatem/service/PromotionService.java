package com.example.MealBasketSyatem.service;

import com.example.MealBasketSyatem.entity.Promotion;
import com.example.MealBasketSyatem.repo.PromotionRepo;
import org.springframework.scheduling.annotation.Scheduled;
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



    public List<Promotion> getAllPromotions() {
        return promotionRepo.findAll();
    }

    public Promotion updatePromotion(Promotion promotion) {
        // Auto-deactivate if expiry date has reached or passed
        if (promotion.getIsActive() && !promotion.getExpiryDate().isAfter(LocalDate.now())) {
            promotion.setIsActive(false);
        }
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

    /**
     * Automatically deactivate expired promotions
     * Runs every hour to check for expired promotions
     * When promotion expiry date is reached or passed, it becomes inactive
     */
    @Scheduled(fixedDelay = 3600000)
    public void deactivateExpiredPromotions() {
        LocalDate today = LocalDate.now();
        // Find all active promotions where expiry date is today or before
        List<Promotion> expiredPromotions = promotionRepo.findByIsActiveTrueAndExpiryDateLessThanEqual(today);
        
        for (Promotion promotion : expiredPromotions) {
            promotion.setIsActive(false);
            promotionRepo.save(promotion);
        }
        
        if (!expiredPromotions.isEmpty()) {
            System.out.println("[PromotionService] " + java.time.LocalDateTime.now() + " - Deactivated " + expiredPromotions.size() + " expired promotions");
        }
    }

    /**
     * Get active promotions with automatic expiry check
     * Ensures promotions are deactivated immediately when expiry is reached
     */
    public List<Promotion> getActivePromotions() {
        // First, deactivate any expired ones
        deactivateExpiredPromotions();
        
        // Then return only active promotions within date range
        LocalDate today = LocalDate.now();
        return promotionRepo.findByIsActiveTrueAndStartDateLessThanEqualAndExpiryDateGreaterThanEqual(today, today);
    }
}
