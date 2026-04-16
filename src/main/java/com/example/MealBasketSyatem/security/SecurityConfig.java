package com.example.MealBasketSyatem.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.http.HttpMethod;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.jwtAuthenticationEntryPoint = jwtAuthenticationEntryPoint;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:3001", "http://localhost:3002"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Allow CORS preflight OPTIONS requests for all API endpoints
                .requestMatchers(HttpMethod.OPTIONS).permitAll()
                // Static resources
                .requestMatchers("/favicon.ico", "/manifest.json", "/static/**", "/css/**", "/js/**", "/images/**").permitAll()
                // Public endpoints
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/products/**").permitAll()
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/api/contact/**").permitAll()
                .requestMatchers("/api/payments/verify").permitAll()
                .requestMatchers("/api/user/**").permitAll() // Temporarily public for testing
                .requestMatchers("/api/orders/**").permitAll() // Temporarily public for testing
                .requestMatchers("/api/meal-plans/**").permitAll() // Temporarily public for testing
                .requestMatchers("/api/stock-alerts/**").permitAll() // Temporarily public for testing
                .requestMatchers("/api/system-performance/**").permitAll() // Temporarily public for testing
                .requestMatchers("/api/vendor/**").permitAll() // Vendor endpoints - temporarily public for testing
                .requestMatchers("/api/promotions/active").permitAll()
                .requestMatchers("/api/promotions/apply").permitAll()
                .requestMatchers("/api/promotions/expiring-soon").permitAll()
                .requestMatchers("/api/promotions/**").permitAll() // Allow all promotion endpoints for CORS preflight
                .requestMatchers("/api/db-test/**").permitAll() // Database test endpoints
                .requestMatchers("/api/test/**").permitAll() // Test endpoints
                .requestMatchers("/api/setup/**").permitAll() // Setup endpoints
                // Admin endpoints
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                // All other requests need authentication
                .anyRequest().authenticated()
            )
            .exceptionHandling(ex -> ex.authenticationEntryPoint(jwtAuthenticationEntryPoint))
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
