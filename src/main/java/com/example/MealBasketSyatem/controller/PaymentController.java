package com.example.MealBasketSyatem.controller;

import com.example.MealBasketSyatem.dto.ApiResponse;
import com.example.MealBasketSyatem.entity.Payment;
import com.example.MealBasketSyatem.entity.User;
import com.example.MealBasketSyatem.service.PaymentService;
import com.example.MealBasketSyatem.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003"})
public class PaymentController {

    @Autowired
    private PaymentService paymentService;
    
    @Autowired
    private UserService userService;

    /**
     * Initiate payment with eSewa
     */
    @PostMapping("/esewa/initiate")
    public ResponseEntity<Map<String, Object>> initiateEsewaPayment(
            @RequestBody Map<String, Object> paymentRequest,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            // Extract payment details
            Object amountObj = paymentRequest.get("amount");
            Double amount;
            if (amountObj instanceof Integer) {
                amount = ((Integer) amountObj).doubleValue();
            } else if (amountObj instanceof Double) {
                amount = (Double) amountObj;
            } else if (amountObj instanceof String) {
                amount = Double.valueOf((String) amountObj);
            } else {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Invalid amount format");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
            String purchaseOrderId = (String) paymentRequest.get("purchaseOrderId");
            
            if (amount == null || amount <= 0) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Invalid amount");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
            
            if (purchaseOrderId == null || purchaseOrderId.trim().isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Purchase order ID is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
            
            // Get current user ID from JWT token
            Long userId = getUserIdFromUserDetails(userDetails);
            
            // Initiate payment
            Map<String, Object> result = paymentService.initiateEsewaPayment(userId, amount, purchaseOrderId);
            
            // Return form data directly for simple eSewa integration
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to initiate payment: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Verify eSewa payment using Base64 encoded response (PRODUCTION READY)
     */
    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifyEsewaPayment(
            @RequestBody Map<String, String> verificationRequest) {
        try {
            String encodedResponse = verificationRequest.get("encodedResponse");

            if (encodedResponse == null || encodedResponse.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Encoded response is required"));
            }

            // Verify payment using the new secure method
            Map<String, Object> result = paymentService.verifyEsewaPaymentSecure(encodedResponse);

            if ((Boolean) result.get("success")) {
                return ResponseEntity.ok(ApiResponse.success("Payment verified successfully", result));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Payment verification failed: " + result.get("reason")));
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to verify payment: " + e.getMessage()));
        }
    }

    /**
     * Get payment details by transaction ID
     */
    @GetMapping("/transaction/{transactionId}")
    public ResponseEntity<ApiResponse<Payment>> getPaymentByTransactionId(
            @PathVariable String transactionId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Payment payment = paymentService.getPaymentByTransactionId(transactionId);
            
            // Verify that the payment belongs to the current user
            Long userId = getUserIdFromUserDetails(userDetails);
            if (!Long.valueOf(payment.getUser().getId()).equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Access denied: Payment does not belong to current user"));
            }
            
            return ResponseEntity.ok(ApiResponse.success("Payment retrieved successfully", payment));
            
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Payment not found: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve payment: " + e.getMessage()));
        }
    }

    /**
     * Get all payments for current user
     */
    @GetMapping("/my-payments")
    public ResponseEntity<ApiResponse<java.util.List<Payment>>> getUserPayments(
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Long userId = getUserIdFromUserDetails(userDetails);
            java.util.List<Payment> payments = paymentService.getUserPayments(userId);
            
            return ResponseEntity.ok(ApiResponse.success("User payments retrieved successfully", payments));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve user payments: " + e.getMessage()));
        }
    }

    /**
     * Get payment status
     */
    @GetMapping("/status/{transactionId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPaymentStatus(
            @PathVariable String transactionId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            Payment payment = paymentService.getPaymentByTransactionId(transactionId);
            
            // Verify that the payment belongs to the current user
            Long userId = getUserIdFromUserDetails(userDetails);
            if (!Long.valueOf(payment.getUser().getId()).equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Access denied: Payment does not belong to current user"));
            }
            
            Map<String, Object> statusInfo = new HashMap<>();
            statusInfo.put("transactionId", payment.getTransactionId());
            statusInfo.put("status", payment.getStatus().toString());
            statusInfo.put("amount", payment.getAmount());
            statusInfo.put("paymentGateway", payment.getPaymentGateway());
            statusInfo.put("createdAt", payment.getCreatedAt());
            statusInfo.put("verifiedAt", payment.getVerifiedAt());
            statusInfo.put("failureReason", payment.getFailureReason());
            
            if (payment.getOrder() != null) {
                statusInfo.put("orderId", payment.getOrder().getId());
                statusInfo.put("orderStatus", payment.getOrder().getStatus());
            }
            
            return ResponseEntity.ok(ApiResponse.success("Payment status retrieved successfully", statusInfo));
            
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Payment not found: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve payment status: " + e.getMessage()));
        }
    }

    /**
     * Cleanup old pending payments (admin only)
     */
    @PostMapping("/cleanup-pending")
    public ResponseEntity<ApiResponse<String>> cleanupPendingPayments() {
        try {
            paymentService.cleanupOldPendingPayments();
            return ResponseEntity.ok(ApiResponse.success("Pending payments cleanup completed", "Cleanup successful"));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to cleanup pending payments: " + e.getMessage()));
        }
    }

    /**
     * Helper method to extract user ID from UserDetails
     */
    private Long getUserIdFromUserDetails(UserDetails userDetails) {
        try {
            // Extract email from JWT token
            String email = userDetails.getUsername();
            
            // Find user by email
            User user = userService.findUserByEmail(email);
            
            if (user == null) {
                throw new RuntimeException("User not found with email: " + email);
            }
            
            return user.getId();
        } catch (Exception e) {
            throw new RuntimeException("Failed to extract user ID from JWT token: " + e.getMessage(), e);
        }
    }
}
