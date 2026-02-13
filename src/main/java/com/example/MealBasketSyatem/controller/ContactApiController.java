package com.example.MealBasketSyatem.controller;

import com.example.MealBasketSyatem.dto.ApiResponse;
import com.example.MealBasketSyatem.entity.Message;
import com.example.MealBasketSyatem.service.ContactService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class ContactApiController {

    @Autowired
    private ContactService contactService;

    @PostMapping("/message")
    public ResponseEntity<ApiResponse<Message>> sendMessage(@RequestBody Message message) {
        try {
            contactService.saveMessage(message);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Message sent successfully", message));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to send message: " + e.getMessage()));
        }
    }

    @GetMapping("/messages")
    public ResponseEntity<ApiResponse<java.util.List<Message>>> getAllMessages() {
        try {
            java.util.List<Message> messages = contactService.getAllMessage();
            return ResponseEntity.ok(ApiResponse.success("Messages retrieved successfully", messages));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve messages: " + e.getMessage()));
        }
    }
}
