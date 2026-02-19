package com.example.MealBasketSyatem.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import com.example.MealBasketSyatem.service.OrderService;


@Controller
@RequestMapping("/order")
public class OrderController {
	@Autowired
	private OrderService orderService;

	/**
	 * 
	 * 
	 * @return
	 */
	@GetMapping("/list")
	public String listOrders() {
		// Simple method to use orderService
		orderService.getAllOrder();
		return "orderList";
	}
}
