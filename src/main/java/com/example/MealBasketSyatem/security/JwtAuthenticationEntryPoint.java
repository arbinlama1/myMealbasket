package com.example.MealBasketSyatem.security;

import com.example.MealBasketSyatem.dto.ApiResponse;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.PrintWriter;

@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {
        
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        
        ApiResponse<String> errorResponse = new ApiResponse<>(false, "Unauthorized - " + authException.getMessage(), null);
        
        PrintWriter out = response.getWriter();
        out.print("{\"success\":false,\"message\":\"Unauthorized - " + authException.getMessage() + "\",\"data\":null}");
        out.flush();
    }
}
