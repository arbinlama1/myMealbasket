package com.example.MealBasketSyatem.service;

import com.example.MealBasketSyatem.dto.AccountDTO;
import com.example.MealBasketSyatem.dto.OrderDTO;
import com.example.MealBasketSyatem.dto.RatingDTO;
import com.example.MealBasketSyatem.entity.Admin;
import com.example.MealBasketSyatem.entity.Order;
import com.example.MealBasketSyatem.entity.Rating;
import com.example.MealBasketSyatem.entity.User;
import com.example.MealBasketSyatem.entity.Vendor;
import com.example.MealBasketSyatem.repo.AdminRepo;
import com.example.MealBasketSyatem.repo.OrderRepo;
import com.example.MealBasketSyatem.repo.RatingRepo;
import com.example.MealBasketSyatem.repo.UserRepo;
import com.example.MealBasketSyatem.repo.VendorRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class AdminApiService {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private VendorRepo vendorRepo;

    @Autowired
    private AdminRepo adminRepo;

    @Autowired
    private OrderRepo orderRepo;

    @Autowired
    private RatingRepo ratingRepo;

    public List<AccountDTO> getAllAccounts() {
        List<AccountDTO> results = new ArrayList<>();

        List<User> users = userRepo.findAll();
        for (User u : users) {
            AccountDTO dto = new AccountDTO(u.getId(), u.getName(), u.getEmail(), "USER");
            results.add(dto);
        }

        List<Vendor> vendors = vendorRepo.findAll();
        for (Vendor v : vendors) {
            AccountDTO dto = new AccountDTO(v.getId(), v.getName(), v.getEmail(), "VENDOR");
            dto.setShopName(v.getShopName());
            dto.setBusinessType(v.getBusinessType());
            dto.setPhone(v.getPhone());
            dto.setAddress(v.getAddress());
            results.add(dto);
        }

        List<Admin> admins = adminRepo.findAll();
        for (Admin a : admins) {
            AccountDTO dto = new AccountDTO(a.getId(), a.getName(), a.getEmail(), "ADMIN");
            results.add(dto);
        }

        return results;
    }

    public List<AccountDTO> getAllVendors() {
        List<AccountDTO> results = new ArrayList<>();
        List<Vendor> vendors = vendorRepo.findAll();
        for (Vendor v : vendors) {
            AccountDTO dto = new AccountDTO(v.getId(), v.getName(), v.getEmail(), "VENDOR");
            dto.setShopName(v.getShopName());
            dto.setBusinessType(v.getBusinessType());
            dto.setPhone(v.getPhone());
            dto.setAddress(v.getAddress());
            results.add(dto);
        }
        return results;
    }

    public List<AccountDTO> getAllUsersOnly() {
        List<AccountDTO> results = new ArrayList<>();
        List<User> users = userRepo.findAll();
        for (User u : users) {
            results.add(new AccountDTO(u.getId(), u.getName(), u.getEmail(), "USER"));
        }
        return results;
    }

    // Get all orders for admin dashboard
    public List<OrderDTO> getAllOrders() {
        List<Order> orders = orderRepo.findAll();
        return orders.stream().map(OrderDTO::new).toList();
    }

    // Get all ratings for admin dashboard
    public List<RatingDTO> getAllRatings() {
        List<Rating> ratings = ratingRepo.findAll();
        return ratings.stream().map(RatingDTO::new).toList();
    }
}
