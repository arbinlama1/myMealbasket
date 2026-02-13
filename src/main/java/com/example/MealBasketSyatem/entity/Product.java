package com.example.MealBasketSyatem.entity;

import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name="products")
public class Product {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;

	private String name;
	private double price;
	private String description;

	@ManyToOne
	@JoinColumn(name = "vendor_id")  // Foreign key to Vendor
	private Vendor vendor;
	
	@OneToMany(mappedBy = "product")
	private List<Order> orders;

	// Getters and Setters
	public long getId() { return id; }
	public void setId(long id) { this.id = id; }

	public String getName() { return name; }
	public void setName(String name) { this.name = name; }

	public double getPrice() { return price; }
	public void setPrice(double price) { this.price = price; }

	public String getDescription() { return description; }
	public void setDescription(String description) { this.description = description; }

	public Vendor getVendor() { return vendor; }
	public void setVendor(Vendor vendor) { this.vendor = vendor; }
	
	public List<Order> getOrders() { return orders; }
	public void setOrders(List<Order> orders) { this.orders = orders; }
}
