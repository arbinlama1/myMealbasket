package com.example.MealBasketSyatem.service;

import com.example.MealBasketSyatem.entity.Cart;
import com.example.MealBasketSyatem.entity.Product;
import com.example.MealBasketSyatem.entity.User;
import com.example.MealBasketSyatem.repository.CartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private ProductService productService;

    public List<Cart> getCartByUser(Long userId) {
        return cartRepository.findByUserId(userId);
    }

    public Cart addToCart(Long userId, Long productId, Integer quantity) {
        // Check if item already exists in cart
        Optional<Cart> existingItem = cartRepository.findByUserIdAndProductId(userId, productId);
        
        if (existingItem.isPresent()) {
            Cart cartItem = existingItem.get();
            cartItem.setQuantity(cartItem.getQuantity() + quantity);
            return cartRepository.save(cartItem);
        } else {
            User user = userService.getUserById(userId);
            Product product = productService.getProductById(productId);
            
            if (user != null && product != null) {
                Cart newCartItem = new Cart(user, product, quantity);
                return cartRepository.save(newCartItem);
            }
            return null;
        }
    }

    public Cart updateCartItem(Long itemId, Integer quantity, Long userId) {
        Optional<Cart> cartItem = cartRepository.findById(itemId);
        if (cartItem.isPresent() && cartItem.get().getUser().getId() == userId) {
            Cart item = cartItem.get();
            item.setQuantity(quantity);
            return cartRepository.save(item);
        }
        return null;
    }

    public boolean removeFromCart(Long itemId, Long userId) {
        Optional<Cart> cartItem = cartRepository.findById(itemId);
        if (cartItem.isPresent() && cartItem.get().getUser().getId() == userId) {
            cartRepository.delete(cartItem.get());
            return true;
        }
        return false;
    }

    public void clearCart(Long userId) {
        List<Cart> cartItems = cartRepository.findByUserId(userId);
        cartRepository.deleteAll(cartItems);
    }
}
