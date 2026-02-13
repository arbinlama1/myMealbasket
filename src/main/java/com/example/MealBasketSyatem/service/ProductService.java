package com.example.MealBasketSyatem.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.MealBasketSyatem.entity.Product;
import com.example.MealBasketSyatem.repo.ProductRepo;


@Service
public class ProductService {

	@Autowired
	private ProductRepo productRepo;

	public List<Product> getAllProduct() {
		return productRepo.findAll();
	}

	public Product getProductById(long id) {
		return productRepo.findById(id)
				.orElseThrow(() -> new RuntimeException("Product with id " + id + " not found"));
	}

	public void createProduct(Product product) {
		productRepo.save(product);
	}

	public void updateProduct(Product product) {
		productRepo.findById(product.getId())
				.orElseThrow(() -> new RuntimeException("Product with id " + product.getId() + " not found"));
		productRepo.save(product);
	}

	public void deleteProduct(long id) {
		productRepo.findById(id)
				.orElseThrow(() -> new RuntimeException("Product with id " + id + " not found"));
		productRepo.deleteById(id);
	}

	// ✅ Get products by vendor name
	public List<Product> getProductsByVendorName(String vendorName) {
		return productRepo.findByVendor_Name(vendorName);
	}

	// ✅ Get products by product name (optional)
	public List<Product> getProductsByName(String name) {
		return productRepo.findByName(name);
	}

	public List<Product> findProductByName(String name) {
		return productRepo.findByName(name);
	}

}
