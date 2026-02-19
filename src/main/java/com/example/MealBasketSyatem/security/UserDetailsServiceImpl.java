package com.example.MealBasketSyatem.security;

import com.example.MealBasketSyatem.entity.Admin;
import com.example.MealBasketSyatem.entity.User;
import com.example.MealBasketSyatem.entity.Vendor;
import com.example.MealBasketSyatem.repo.AdminRepo;
import com.example.MealBasketSyatem.repo.UserRepo;
import com.example.MealBasketSyatem.repo.VendorRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private AdminRepo adminRepo;

    @Autowired
    private VendorRepo vendorRepo;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // First try to find as regular user
        User user = userRepo.findByEmail(email);
        if (user != null) {
            return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
            );
        }

        // Then try to find as admin
        List<Admin> admins = adminRepo.findAllByEmail(email);
        if (admins != null && !admins.isEmpty()) {
            Admin admin = admins.get(0);
            return new org.springframework.security.core.userdetails.User(
                admin.getEmail(),
                admin.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN"))
            );
        }

        // Finally try to find as vendor
        Vendor vendor = vendorRepo.findByEmail(email);
        if (vendor != null) {
            return new org.springframework.security.core.userdetails.User(
                vendor.getEmail(),
                vendor.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_VENDOR"))
            );
        }

        throw new UsernameNotFoundException("User not found with email: " + email);
    }
}
