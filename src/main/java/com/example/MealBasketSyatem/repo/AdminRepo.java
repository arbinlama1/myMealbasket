package com.example.MealBasketSyatem.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.MealBasketSyatem.entity.Admin;


@Repository

public interface AdminRepo extends JpaRepository<Admin, Long>{
	Admin findByEmail(String email);
}