package com.example.MealBasketSyatem.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import com.example.MealBasketSyatem.entity.Admin;
import com.example.MealBasketSyatem.entity.Message;
import com.example.MealBasketSyatem.service.ProductService;

@Controller
public class HomeController {

	@Autowired
	private ProductService productService;

	@GetMapping({"", "/", "/home"})
	public String homePage(Model model) {
		return "homePage";  // your main home page template
	}

	@GetMapping("/products")
	public String productPage(Model model) {
		model.addAttribute("products", productService.getAllProduct());
		return "Products";  // your products page template
	}

	@GetMapping("/contactUs")
	public String contactUsPage(Model model) {
		model.addAttribute("message", new Message());
		return "ContactUs";  // your contact us page template
	}

	@PostMapping("/send/message")
	public String sendMessage(@ModelAttribute Message message, Model model) {
		System.out.println("Message received: " + message);

		model.addAttribute("confirmation", "Thank you! Your message has been sent successfully.");
		model.addAttribute("message", new Message()); // reset form

		return "ContactUs";
	}

	@GetMapping("/aboutUs")
	public String aboutUs() {
		return "AboutUs";  // your about us page template
	}

	@GetMapping("/login")
	public String login(Model model) {
		model.addAttribute("admin", new Admin());
		return "Login";  // general login page, if any
	}

	// Note: Removed conflicting POST mapping for /admin/verify/credentials from here.
}
