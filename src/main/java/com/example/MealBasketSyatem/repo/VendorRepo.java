package com.example.MealBasketSyatem.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.MealBasketSyatem.entity.Vendor;



@Repository
public interface VendorRepo extends JpaRepository<Vendor, Long> {
    Vendor findByName(String name);
    Vendor findByEmail(String email);
}
