package com.example.MealBasketSyatem.controller;

import com.example.MealBasketSyatem.dto.ApiResponse;
import com.example.MealBasketSyatem.dto.LoginRequest;
import com.example.MealBasketSyatem.dto.LoginResponse;
import com.example.MealBasketSyatem.entity.Admin;
import com.example.MealBasketSyatem.entity.User;
import com.example.MealBasketSyatem.security.JwtUtil;
import com.example.MealBasketSyatem.service.AdminService;
import com.example.MealBasketSyatem.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserService userService;

    @Autowired
    private AdminService adminService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@RequestBody LoginRequest loginRequest) {
        try {
            // Try to authenticate as user first
            User user = userService.findUserByEmail(loginRequest.getEmail());
            if (user != null && passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                String token = jwtUtil.generateToken(user.getEmail(), "USER", user.getId());
                LoginResponse response = new LoginResponse(token, user.getId(), user.getEmail(), user.getName(), "USER");
                return ResponseEntity.ok(ApiResponse.success("Login successful", response));
            }

            // Try to authenticate as admin
            Admin admin = adminRepo.findByEmail(loginRequest.getEmail());
            if (admin != null && passwordEncoder.matches(loginRequest.getPassword(), admin.getPassword())) {
                String token = jwtUtil.generateToken(admin.getEmail(), "ADMIN", admin.getId());
                LoginResponse response = new LoginResponse(token, admin.getId(), admin.getEmail(), admin.getName(), "ADMIN");
                return ResponseEntity.ok(ApiResponse.success("Login successful", response));
            }

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid credentials"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Login failed: " + e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<User>> register(@RequestBody User user) {
        try {
            // Check if user already exists
            User existingUser = userService.findUserByEmail(user.getEmail());
            if (existingUser != null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("User with this email already exists"));
            }

            // Encode password
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            
            // Save user
            userService.createUser(user);
            user.setPassword(null); // Don't return password
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("User registered successfully", user));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Registration failed: " + e.getMessage()));
        }
    }

    @Autowired
    private com.example.MealBasketSyatem.repo.AdminRepo adminRepo;
}
