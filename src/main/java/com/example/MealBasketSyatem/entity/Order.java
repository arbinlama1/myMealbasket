package com.example.MealBasketSyatem.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Entity
@Table(name="Orders")
public class Order {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;
	
	// Legacy fields for backward compatibility
	private int quantity;
	private Date date;
	private double amount;
	
	// New fields for proper order management
	@ManyToOne
	@JoinColumn(name="UserId")
	private User user;
	
	@ManyToOne
	@JoinColumn(name="VendorId")
	private Vendor vendor;
	
	@Column(name="total_amount")
	private Double totalAmount;
	
	@Column(name="status")
	private String status; // PENDING, CONFIRMED, PREPARING, READY, DELIVERED, CANCELLED
	
	@Column(name="delivery_address")
	private String deliveryAddress;
	
	@Column(name="phone")
	private String phone;
	
	@Column(name="notes")
	private String notes;
	
	@Column(name="created_at")
	private LocalDateTime createdAt;
	
	@Column(name="updated_at")
	private LocalDateTime updatedAt;
	
	@ManyToOne
	@JoinColumn(name="ProductId")
	private Product product;
	
	@OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
	@JsonIgnore
	private List<OrderItem> orderItems;

	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public int getQuantity() {
		return quantity;
	}

	public void setQuantity(int quantity) {
		this.quantity = quantity;
	}

	public Date getDate() {
		return date;
	}

	public void setDate(Date date) {
		this.date = date;
	}

	public double getAmount() {
		return amount;
	}

	public void setAmount(double amount) {
		this.amount = amount;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public Vendor getVendor() {
		return vendor;
	}

	public void setVendor(Vendor vendor) {
		this.vendor = vendor;
	}

	public Double getTotalAmount() {
		return totalAmount != null ? totalAmount : amount;
	}

	public void setTotalAmount(Double totalAmount) {
		this.totalAmount = totalAmount;
	}

	public String getStatus() {
		return status != null ? status : "PENDING";
	}

	public void setStatus(String status) {
		this.status = status;
		this.updatedAt = LocalDateTime.now();
	}

	public String getDeliveryAddress() {
		return deliveryAddress;
	}

	public void setDeliveryAddress(String deliveryAddress) {
		this.deliveryAddress = deliveryAddress;
	}

	public String getPhone() {
		return phone;
	}

	public void setPhone(String phone) {
		this.phone = phone;
	}

	public String getNotes() {
		return notes;
	}

	public void setNotes(String notes) {
		this.notes = notes;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}

	public Product getProduct() {
		return product;
	}

	public void setProduct(Product product) {
		this.product = product;
	}

	public List<OrderItem> getOrderItems() {
		return orderItems;
	}

	public void setOrderItems(List<OrderItem> orderItems) {
		this.orderItems = orderItems;
	}

	// Convenience method to get price from product
	public double getPrice() {
		return product != null ? product.getPrice() : 0.0;
	}
}
