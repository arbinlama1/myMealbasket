package com.example.MealBasketSyatem.service;

import com.example.MealBasketSyatem.entity.*;
import com.example.MealBasketSyatem.repository.OrderRepository;
import com.example.MealBasketSyatem.repository.OrderItemRepository;
import com.example.MealBasketSyatem.repo.OrderRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class OrderService {
	@Autowired
	private OrderRepository orderRepository;
	
	@Autowired
	private OrderItemRepository orderItemRepository;
	
	@Autowired
	private OrderRepo orderRepo; // Legacy repository
	
	@Autowired
	private UserService userService;
	
	@Autowired
	private ProductService productService;

	// Legacy methods
	public List<Order> getAllOrder(){
		return orderRepo.findAll();
	}

	public Order getAdminById(long id) {
		return orderRepo.findById(id).orElseThrow(()->new RuntimeException("User with id"+id+"Not found"));
	}

	public void createOrder(Order order) {
		orderRepo.save(order);
	}

	public void updateOrder(Order order) {
		orderRepo.findById(order.getId())
				.orElseThrow(() -> new RuntimeException("Order with id " + order.getId() + " not found"));
		orderRepo.save(order);
	}

	public void deleteUser(long id) {
		orderRepo.findById(id).orElseThrow(()->new RuntimeException("user with id"+id+"Not found"));
		orderRepo.deleteById(id);
	}

	public List<Order> findOrdersByUser(User user){
		return orderRepo.findByUser(user);
	}

	// New methods for proper order management
	@Transactional
	public Order createOrder(Long userId, Map<String, Object> orderData) {
		try {
			User user = userService.getUserById(userId);
			if (user == null) {
				throw new RuntimeException("User not found");
			}

			// Create order
			Order order = new Order();
			order.setUser(user);
			order.setTotalAmount(((Number) orderData.get("totalAmount")).doubleValue());
			order.setStatus("PENDING");
			order.setCreatedAt(LocalDateTime.now());
			order.setUpdatedAt(LocalDateTime.now());

			// Set delivery info if provided
			if (orderData.containsKey("deliveryAddress")) {
				order.setDeliveryAddress((String) orderData.get("deliveryAddress"));
			}
			if (orderData.containsKey("phone")) {
				order.setPhone((String) orderData.get("phone"));
			}
			if (orderData.containsKey("notes")) {
				order.setNotes((String) orderData.get("notes"));
			}

			// Save order first
			Order savedOrder = orderRepository.save(order);

			// Process order items
			@SuppressWarnings("unchecked")
			List<Map<String, Object>> items = (List<Map<String, Object>>) orderData.get("items");
			List<OrderItem> orderItems = new ArrayList<>();

			for (Map<String, Object> itemData : items) {
				Long productId = ((Number) itemData.get("productId")).longValue();
				Integer quantity = (Integer) itemData.get("quantity");
				Double price = ((Number) itemData.get("price")).doubleValue();

				Product product = productService.getProductById(productId);
				if (product != null) {
					// Set vendor from first product (assuming all items from same vendor)
					if (order.getVendor() == null) {
						order.setVendor(product.getVendor());
					}

					OrderItem orderItem = new OrderItem();
					orderItem.setOrder(savedOrder);
					orderItem.setProduct(product);
					orderItem.setQuantity(quantity);
					orderItem.setPrice(price);

					orderItems.add(orderItemRepository.save(orderItem));
				}
			}

			// Update order with items and vendor
			savedOrder.setOrderItems(orderItems);
			return orderRepository.save(savedOrder);

		} catch (Exception e) {
			throw new RuntimeException("Failed to create order: " + e.getMessage(), e);
		}
	}

	public List<Order> getOrdersByVendor(Long vendorId) {
		return orderRepository.findOrdersByVendorIdWithLatest(vendorId);
	}

	public List<Order> getOrdersByUser(Long userId) {
		return orderRepository.findByUserId(userId);
	}

	public Order updateOrderStatus(Long orderId, String newStatus) {
		Order order = orderRepository.findById(orderId).orElse(null);
		if (order != null) {
			order.setStatus(newStatus);
			order.setUpdatedAt(LocalDateTime.now());
			return orderRepository.save(order);
		}
		return null;
	}

	public Order getOrderById(Long orderId) {
		return orderRepository.findById(orderId).orElse(null);
	}
}

