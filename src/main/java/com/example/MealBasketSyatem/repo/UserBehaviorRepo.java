package com.example.MealBasketSyatem.repo;

import com.example.MealBasketSyatem.entity.UserBehavior;
import com.example.MealBasketSyatem.entity.User;
import com.example.MealBasketSyatem.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface UserBehaviorRepo extends JpaRepository<UserBehavior, Long> {

    List<UserBehavior> findByUser(User user);

    List<UserBehavior> findByUserAndActionType(User user, UserBehavior.ActionType actionType);

    List<UserBehavior> findByProduct(Product product);

    List<UserBehavior> findByUserAndTimestampAfter(User user, LocalDateTime timestamp);

    @Query("SELECT ub.product, COUNT(ub) as viewCount FROM UserBehavior ub WHERE ub.user = :user AND ub.actionType = 'VIEW' GROUP BY ub.product ORDER BY viewCount DESC")
    List<Object[]> findMostViewedProductsByUser(@Param("user") User user);

    @Query("SELECT ub.category, COUNT(ub) as browseCount FROM UserBehavior ub WHERE ub.user = :user AND ub.actionType = 'CATEGORY_BROWSE' GROUP BY ub.category ORDER BY browseCount DESC")
    List<Object[]> findMostBrowsedCategoriesByUser(@Param("user") User user);

    @Query("SELECT DISTINCT ub.product FROM UserBehavior ub WHERE ub.user.id IN :userIds AND ub.actionType = 'VIEW'")
    List<Product> findProductsViewedBySimilarUsers(@Param("userIds") List<Long> userIds);

    @Query("SELECT ub.product, COUNT(ub) as viewCount FROM UserBehavior ub WHERE ub.actionType = 'VIEW' AND ub.timestamp >= :since GROUP BY ub.product ORDER BY viewCount DESC")
    List<Object[]> findTrendingProducts(@Param("since") LocalDateTime since);

    @Query("SELECT ub FROM UserBehavior ub WHERE ub.user = :user AND ub.actionType IN ('VIEW', 'CLICK', 'ADD_TO_CART') ORDER BY ub.timestamp DESC")
    List<UserBehavior> findRecentBrowsingHistory(@Param("user") User user);

    @Query("SELECT ub.category, AVG(ub.durationSeconds) as avgDuration FROM UserBehavior ub WHERE ub.user = :user AND ub.category IS NOT NULL GROUP BY ub.category ORDER BY avgDuration DESC")
    List<Object[]> findCategoriesByTimeSpent(@Param("user") User user);

    @Query("SELECT ub.product, COUNT(ub) as addToCartCount FROM UserBehavior ub WHERE ub.actionType = 'ADD_TO_CART' GROUP BY ub.product ORDER BY addToCartCount DESC")
    List<Object[]> findMostAddedToCartProducts();

    @Query("SELECT ub.searchQuery, COUNT(ub) as searchCount FROM UserBehavior ub WHERE ub.actionType = 'SEARCH' AND ub.searchQuery IS NOT NULL GROUP BY ub.searchQuery ORDER BY searchCount DESC")
    List<Object[]> findPopularSearchQueries();
}
