package com.example.MealBasketSyatem.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import com.example.MealBasketSyatem.entity.Product;
import com.example.MealBasketSyatem.entity.Vendor;
import com.example.MealBasketSyatem.service.VendorService;


@Controller
@RequestMapping("/vendor")
public class VendorController {

    @Autowired
    private VendorService vendorService;

    // Show Vendor Registration Form
    @GetMapping("/register")
    public String showVendorRegisterForm(Model model) {
        model.addAttribute("vendor", new Vendor());
        return "VendorRegister"; // Create VendorRegister.html
    }

    // Save Vendor
    @PostMapping("/save")
    public String saveVendor(@ModelAttribute Vendor vendor, Model model) {
        vendorService.registerVendor(vendor);
        model.addAttribute("success", "Vendor registered successfully!");
        return "VendorRegister";
    }

    // Vendor Dashboard
    @GetMapping("/dashboard/{id}")
    public String vendorDashboard(@PathVariable Long id, Model model) {
        Vendor vendor = vendorService.getVendorById(id).orElse(null);
        model.addAttribute("vendor", vendor);
        model.addAttribute("products", vendorService.getProducts(id));
        return "VendorDashboard"; // Create VendorDashboard.html
    }

    // Show Add Product Form
    @GetMapping("/{vendorId}/product/add")
    public String showAddProductForm(@PathVariable Long vendorId, Model model) {
        model.addAttribute("product", new Product());
        model.addAttribute("vendorId", vendorId);
        return "AddProduct"; // Create AddProduct.html
    }

    // Save Product
    @PostMapping("/{vendorId}/product/save")
    public String saveProduct(@PathVariable Long vendorId, @ModelAttribute Product product, Model model) {
        Vendor vendor = vendorService.getVendorById(vendorId).orElseThrow();
        product.setVendor(vendor);
        vendorService.addProduct(product);
        return "redirect:/vendor/dashboard/" + vendorId;
    }

    // Delete Product
    @GetMapping("/product/delete/{productId}/{vendorId}")
    public String deleteProduct(@PathVariable Long productId, @PathVariable Long vendorId) {
        vendorService.deleteProduct(productId);
        return "redirect:/vendor/dashboard/" + vendorId;
    }
}