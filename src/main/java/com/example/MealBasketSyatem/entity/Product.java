package com.example.MealBasketSyatem.entity;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
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

	@Column(name="name", nullable=false)
	private String name;

	@Column(name="price", nullable=false)
	private double price;

	@Column(name="description", columnDefinition="TEXT")
	private String description;

	@Column(name="image", columnDefinition = "TEXT")
	private String image;

	@Column(name="category", length=100)
	private String category;

	@Column(name="stock", nullable=false)
	private int stock = 0;

	@Column(name="in_stock", nullable=false)
	private boolean inStock = true;

	@ManyToOne
	@JoinColumn(name = "vendor_id", nullable=false)
	private Vendor vendor;
	
	@OneToMany(mappedBy = "product")
	@JsonIgnore
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

	public String getImage() { return image; }
	public void setImage(String image) { this.image = image; }

	public String getCategory() { return category; }
	public void setCategory(String category) { this.category = category; }

	public int getStock() { return stock; }
	public void setStock(int stock) { this.stock = stock; }

	public boolean isInStock() { return inStock; }
	public void setInStock(boolean inStock) { this.inStock = inStock; }

	public Vendor getVendor() { return vendor; }
	public void setVendor(Vendor vendor) { this.vendor = vendor; }
	
	public List<Order> getOrders() { return orders; }
	public void setOrders(List<Order> orders) { this.orders = orders; }
}
