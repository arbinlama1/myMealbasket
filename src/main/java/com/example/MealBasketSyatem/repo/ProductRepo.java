package com.example.MealBasketSyatem.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.MealBasketSyatem.entity.Product;
import com.example.MealBasketSyatem.entity.Vendor;


@Repository
public interface ProductRepo extends JpaRepository<Product, Long> {
    List<Product> findByVendor(Vendor vendor);

    List<Product> findByVendorId(Long vendorId);

    List<Product> findByVendor_Name(String vendorName);

    List<Product> findByName(String name);
    
    List<Product> findByCategory(String category);
}

