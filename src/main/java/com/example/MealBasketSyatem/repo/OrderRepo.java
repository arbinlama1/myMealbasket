package com.example.MealBasketSyatem.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.MealBasketSyatem.entity.User;
import com.example.MealBasketSyatem.entity.Order;




@Repository

public interface OrderRepo extends JpaRepository<Order, Long> {
    List<Order> findByUser(User user);

}