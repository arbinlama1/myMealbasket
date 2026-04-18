package com.example.MealBasketSyatem.repository;

import com.example.MealBasketSyatem.entity.ProductRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRatingRepository extends JpaRepository<ProductRating, Long> {

    Optional<ProductRating> findByUserIdAndProductId(Long userId, Long productId);

    List<ProductRating> findByProductId(Long productId);

    void deleteByUserIdAndProductId(Long userId, Long productId);
}
