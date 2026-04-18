package com.example.MealBasketSyatem.repository;

import com.example.MealBasketSyatem.entity.ProductReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {

    Optional<ProductReview> findByUserIdAndProductId(Long userId, Long productId);

    List<ProductReview> findByProductIdOrderByCreatedAtDesc(Long productId);

    List<ProductReview> findByUserIdOrderByCreatedAtDesc(Long userId);

    void deleteByUserIdAndProductId(Long userId, Long productId);
}
