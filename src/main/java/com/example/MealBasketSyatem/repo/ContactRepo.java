package com.example.MealBasketSyatem.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.MealBasketSyatem.entity.Message;


public interface ContactRepo extends JpaRepository<Message,Long> {
}
