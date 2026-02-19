package com.example.MealBasketSyatem;

import com.example.MealBasketSyatem.entity.Admin;
import com.example.MealBasketSyatem.service.AdminService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DefaultAdminInitializer implements CommandLineRunner {

    private final AdminService adminService;
    private final PasswordEncoder passwordEncoder;

    public DefaultAdminInitializer(AdminService adminService, PasswordEncoder passwordEncoder) {
        this.adminService = adminService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        String email = "admin@gmail.com";
        String password = "qwerty1";

        Admin existing = adminService.findByEmail(email);
        if (existing != null) {
            return;
        }

        Admin admin = new Admin();
        admin.setName("Administrator");
        admin.setEmail(email);
        admin.setPassword(passwordEncoder.encode(password));
        adminService.createUser(admin);
    }
}
