package com.example.MealBasketSyatem.controller;

import com.example.MealBasketSyatem.dto.ApiResponse;
import com.example.MealBasketSyatem.entity.Message;
import com.example.MealBasketSyatem.service.ContactService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class ContactApiController {

    @Autowired
    private ContactService contactService;

    @PostMapping("/message")
    public ResponseEntity<ApiResponse<Message>> sendMessage(@RequestBody Map<String, Object> messageData) {
        try {
            Message message = new Message();
            message.setName((String) messageData.getOrDefault("name", "Anonymous"));
            message.setEmail((String) messageData.getOrDefault("email", ""));
            // Frontend sends 'message' field, entity uses 'content'
            message.setContent((String) messageData.getOrDefault("message", messageData.getOrDefault("content", "")));
            
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

    @PutMapping("/messages/{id}/read")
    public ResponseEntity<ApiResponse<Message>> markMessageAsRead(@PathVariable Long id) {
        try {
            Message message = contactService.getMessageById(id);
            if (message == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Message not found"));
            }
            
            // Only send email if message wasn't already read
            boolean wasAlreadyRead = message.isRead();
            
            message.setRead(true);
            contactService.saveMessage(message);
            
            // Send email notification to user
            if (!wasAlreadyRead && message.getEmail() != null && !message.getEmail().isEmpty()) {
                //emailService.sendVendorReadNotification(
                //    message.getEmail(),
                //    message.getName(),
                //    message.getContent()
                //);
            }
            
            return ResponseEntity.ok(ApiResponse.success("Message marked as read", message));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to mark message as read: " + e.getMessage()));
        }
    }

    @DeleteMapping("/messages/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMessage(@PathVariable Long id) {
        try {
            Message message = contactService.getMessageById(id);
            if (message == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Message not found"));
            }
            contactService.deleteMessage(id);
            return ResponseEntity.ok(ApiResponse.success("Message deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete message: " + e.getMessage()));
        }
    }
}
