package com.example.MealBasketSyatem.repo;

import com.example.MealBasketSyatem.entity.OrderItem;
import com.example.MealBasketSyatem.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepo extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByProduct(Product product);

    @Query("SELECT SUM(oi.quantity) FROM OrderItem oi WHERE oi.product.id = :productId")
    Integer countTotalQuantityByProductId(@Param("productId") Long productId);

    @Query("SELECT COUNT(oi) FROM OrderItem oi WHERE oi.product.id = :productId")
    Long countOrderItemsByProductId(@Param("productId") Long productId);

    @Query("SELECT COUNT(DISTINCT oi.order.id) FROM OrderItem oi WHERE oi.product.id = :productId")
    Long countOrdersByProductId(@Param("productId") Long productId);
}
