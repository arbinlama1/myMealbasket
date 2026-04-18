package com.example.MealBasketSyatem.dto;

public class RatingRequest {
    private Long productId;
    private Integer rating;

    public RatingRequest() {}

    public RatingRequest(Long productId, Integer rating) {
        this.productId = productId;
        this.rating = rating;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    @Override
    public String toString() {
        return "RatingRequest{" +
                "productId=" + productId +
                ", rating=" + rating +
                '}';
    }
}
