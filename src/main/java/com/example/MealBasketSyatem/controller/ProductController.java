package com.example.MealBasketSyatem.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import com.example.MealBasketSyatem.entity.Product;
import com.example.MealBasketSyatem.service.ProductService;


@Controller
@RequestMapping("/product")
public class ProductController {

	@Autowired
	private ProductService productService;

	// Show Add Product form
	@GetMapping("/add/product")
	public String addProduct() {
		return "AddProduct";
	}

	// Save new product
	@PostMapping("/add/product")
	public String addProduct(Product product) {
		productService.createProduct(product);
		return "/admin/Home/";
	}

	// Show update form
	@GetMapping("/update/product/{id}")
	public String updateProduct(@PathVariable Long id, Model model) {
		model.addAttribute("product", productService.getProductById(id));
		return "updateProduct";
	}

	// Save updated product
	@PostMapping("/update/product")
	public String updateProduct(Product product) {
		productService.createProduct(product);
		return "/admin/Home/";
	}

	// Delete product
	@DeleteMapping("/delete/product/{id}")
	public String deleteProduct(@PathVariable Long id) {
		productService.deleteProduct(id);
		return "/admin/Home/";
	}

	// ✅ New: Get products by vendor name and show them in a view
	@GetMapping("/vendor/{vendorName}")
	public String getProductsByVendor(@PathVariable String vendorName, Model model) {
		List<Product> products = productService.getProductsByVendorName(vendorName);
		model.addAttribute("samsung", products);
		model.addAttribute("kaliman", vendorName);
		return "vendorProducts";  // <-- you need to create vendorProducts.html
	}
}