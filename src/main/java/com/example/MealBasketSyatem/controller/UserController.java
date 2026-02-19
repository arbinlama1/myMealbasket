package com.example.MealBasketSyatem.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import com.example.MealBasketSyatem.entity.User;
import com.example.MealBasketSyatem.service.UserService;


@Controller
@RequestMapping("/user")
public class UserController {
	
	@Autowired
	private UserService userServer;
	
	
	@GetMapping("/add/user")
	public String  addUser() {
		return "AddUser";
		
	}
	@PostMapping("/add/user")
public String addUser(User user) {
		userServer.createUser(user);
		return "Login";
	}
	@GetMapping("/update/user/{id}")
	public String updateUser(@PathVariable long id, Model model) {
		model.addAttribute("user", userServer.getUserById(id));
		
		return "updateUser";
		
	}
	@PostMapping("/update/user")	
	public String updateUser(User user) {
		userServer.updateUser(user);
		
		return "/admin/Home";
		
	}
	@DeleteMapping("/delete/user/{id}")
	public String deleteUser(@PathVariable long id) {
		userServer.deleteUser(id);
		return "/admin/Home";
		
	}
	
	
	
	
}