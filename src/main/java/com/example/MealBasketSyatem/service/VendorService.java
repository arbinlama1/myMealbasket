package com.example.MealBasketSyatem.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.MealBasketSyatem.entity.Product;
import com.example.MealBasketSyatem.entity.Vendor;
import com.example.MealBasketSyatem.repo.ProductRepo;
import com.example.MealBasketSyatem.repo.VendorRepo;


@Service
public class VendorService {

    private final VendorRepo vendorRepo;
    private final ProductRepo productRepo;

    public VendorService(VendorRepo vendorRepo, ProductRepo productRepo) {
        this.vendorRepo = vendorRepo;
        this.productRepo = productRepo;
    }

    public Vendor registerVendor(Vendor vendor) {
        return vendorRepo.save(vendor);
    }

    public Optional<Vendor> getVendorById(Long id) {
        return vendorRepo.findById(id);
    }

    public List<Product> getProducts(Long vendorId) {
        return productRepo.findByVendorId(vendorId);
    }

    public Product addProduct(Product product) {
        return productRepo.save(product);
    }

    public void deleteProduct(Long productId) {
        productRepo.deleteById(productId);
    }
}
