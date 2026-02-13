package com.example.MealBasketSyatem.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.MealBasketSyatem.entity.User;
import com.example.MealBasketSyatem.repo.OrderRepo;
import com.example.MealBasketSyatem.entity.Order;





@Service
public class OrderService {
	@Autowired
	private  OrderRepo orderRepo;


	public List<Order> getAllOrder(){
	    	return   orderRepo.findAll();

	     }
	     public Order getAdminById(long id) {
	    	return   orderRepo.findById(id ).orElseThrow(()->new RuntimeException("User with id"+id+"Not found"));
	     }

	     public void createOrder(Order order) {
	    	    orderRepo.save(order);
	    	}


	public void updateOrder(Order order) {
		orderRepo.findById(order.getId())
				.orElseThrow(() -> new RuntimeException("Order with id " + order.getId() + " not found"));
		orderRepo.save(order);
	}


	public void deleteUser (long id) {
	    	 orderRepo.findById(id).orElseThrow(()->new RuntimeException("user with id"+id+"Not found"));
	    	 orderRepo.deleteById(id);

	     }
	     public List<Order>findOrdersByUser(User user){
	    	 return orderRepo.findByUser(user);

	     }



		 }

