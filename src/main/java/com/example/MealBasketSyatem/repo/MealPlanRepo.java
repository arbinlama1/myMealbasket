package com.example.MealBasketSyatem.repo;

import com.example.MealBasketSyatem.entity.MealPlan;
import com.example.MealBasketSyatem.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MealPlanRepo extends JpaRepository<MealPlan, Long> {
    
    List<MealPlan> findByUser(User user);
    
    List<MealPlan> findByUserAndPlanDate(User user, LocalDate planDate);
    
    List<MealPlan> findByUserAndMealType(User user, String mealType);
    
    List<MealPlan> findByUserOrderByPlanDateDesc(User user);
    
    List<MealPlan> findByIsRecommendedTrue();
    
    List<MealPlan> findByPlanDateBetween(LocalDate startDate, LocalDate endDate);
}
