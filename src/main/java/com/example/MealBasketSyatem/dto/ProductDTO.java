package com.example.MealBasketSyatem.dto;

public class ProductDTO {
    private String name;
    private double price;
    private String description;
    private String image;
    private String category;

    public ProductDTO() {}

    public ProductDTO(String name, double price, String description, String image, String category) {
        this.name = name;
        this.price = price;
        this.description = description;
        this.image = image;
        this.category = category;
    }

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
}
