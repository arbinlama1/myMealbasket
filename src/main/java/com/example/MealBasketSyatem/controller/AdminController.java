package com.example.MealBasketSyatem.controller;

import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import com.example.MealBasketSyatem.entity.Admin;
import com.example.MealBasketSyatem.entity.Order;
import com.example.MealBasketSyatem.entity.Product;
import com.example.MealBasketSyatem.entity.User;
import com.example.MealBasketSyatem.service.AdminService;
import com.example.MealBasketSyatem.service.OrderService;
import com.example.MealBasketSyatem.service.ProductService;
import com.example.MealBasketSyatem.service.UserService;

import jakarta.servlet.http.HttpSession;

@Controller
@RequestMapping("/admin")
public class AdminController {

	@Autowired
	private AdminService adminService;

	@Autowired
	private UserService userService;

	@Autowired
	private OrderService orderService;

	@Autowired
	private ProductService productService;

	/* ================= ADMIN LOGIN ================= */

	@GetMapping("/login")
	public String showAdminLogin(Model model) {
		model.addAttribute("admin", new Admin());
		return "adminLogin";  // your admin login page template
	}

	@PostMapping("/verify/credentials")
	public String verifyCredentials(
			@ModelAttribute Admin admin,
			Model model,
			HttpSession session) {

		// Use your actual service for verification or hardcoded for test
		if (adminService.verifyCredentials(admin.getUsername(), admin.getPassword())) {
			session.setAttribute("loggedAdmin", admin);
			return "redirect:/admin/home";
		}

		model.addAttribute("error", "Invalid credentials");
		return "adminLogin";
	}

	/* ================= ADMIN DASHBOARD ================= */

	@GetMapping("/home")
	public String adminHomePage(Model model) {

		model.addAttribute("adminList", adminService.getAllAdmins());
		model.addAttribute("userList", userService.getAllUser());
		model.addAttribute("orderList", orderService.getAllOrder());

		// ✅ CORRECT: getAllProduct() returns List<Product>
		model.addAttribute("productList", productService.getAllProduct());

		return "AdminHomepage";
	}


	/* ================= ADMIN CRUD ================= */

	@PostMapping("/add")
	public String createAdmin(@ModelAttribute Admin admin) {
		adminService.createUser(admin);
		return "redirect:/admin/home";
	}

	@GetMapping("/update/{id}")
	public String showUpdateAdminForm(@PathVariable long id, Model model) {
		model.addAttribute("admin", adminService.getAdminById(id));
		return "updateUser";
	}

	@PostMapping("/update")
	public String updateAdmin(@ModelAttribute Admin admin) {
		adminService.updateAdmin(admin);
		return "redirect:/admin/home";
	}

	@GetMapping("/delete/{id}")
	public String deleteAdmin(@PathVariable long id) {
		adminService.deleteAdmin(id);
		return "redirect:/admin/home";
	}

	/* ================= USER LOGIN ================= */

	@GetMapping("/user/login")
	public String showUserLogin(Model model) {
		model.addAttribute("user", new User());
		return "loginPage"; // your user login page template
	}

	@PostMapping("/user/login")
	public String loginUser(@ModelAttribute User user,
							Model model,
							HttpSession session) {

		if (userService.verifyCredentials(user.getEmail(), user.getPassword())) {

			User loggedUser = userService.findUserByEmail(user.getEmail());
			session.setAttribute("loggedUser", loggedUser);

			model.addAttribute("orderList",
					orderService.findOrdersByUser(loggedUser));
			model.addAttribute("productList",
					productService.getAllProduct());

			return "productPage"; // user product page
		}

		model.addAttribute("error", "Invalid username or password");
		return "loginPage";
	}

	/* ================= PRODUCT SEARCH ================= */

	@GetMapping("/product/search")
	public String productSearch(@RequestParam("name") String name,
								Model model,
								HttpSession session) {

		User loggedUser = (User) session.getAttribute("loggedUser");

		Product product = (Product) productService.findProductByName(name);
		if (product != null) {
			model.addAttribute("product", product);
		} else {
			model.addAttribute("error", "Sorry, product not found");
		}

		model.addAttribute("orderList",
				orderService.findOrdersByUser(loggedUser));
		return "productPage";
	}

	/* ================= PLACE ORDER ================= */

	@PostMapping("/placeOrder")
	public String placeOrder(@ModelAttribute Order order,
							 Model model,
							 HttpSession session) {

		User loggedUser = (User) session.getAttribute("loggedUser");

		if (loggedUser == null) {
			model.addAttribute("error", "Please login first");
			return "loginPage";
		}

		double totalAmount = order.getPrice() * order.getQuantity();
		order.setAmount(totalAmount);
		order.setUser(loggedUser);
		order.setDate(new Date());

		orderService.createOrder(order);

		model.addAttribute("amount", totalAmount);
		return "orderStatus";
	}

	/* ================= LOGOUT ================= */

	@GetMapping("/logout")
	public String logout(HttpSession session) {
		session.invalidate();
		return "redirect:/admin/login";
	}
}
