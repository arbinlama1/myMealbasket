package com.example.MealBasketSyatem.service;

import com.example.MealBasketSyatem.entity.Order;
import com.example.MealBasketSyatem.entity.Payment;
import com.example.MealBasketSyatem.entity.User;
import com.example.MealBasketSyatem.repo.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Optional;
import java.util.LinkedHashMap;
import org.springframework.transaction.annotation.Transactional;
// import org.springframework.util.LinkedMultiValueMap;
// import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Base64;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.time.LocalDateTime;

@Service
@Transactional
public class PaymentService {
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    @Autowired
    private OrderService orderService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private RestTemplate restTemplate;
    
    // eSewa Configuration (you should move these to application.properties)
    @Value("${esewa.merchant.code:JB0BQ6SR6K}")
    private String esewaMerchantCode;

    @Value("${esewa.product.code:EPAYTEST}")
    private String esewaProductCode;
    
    @Value("${esewa.secret.key:test_secret_key_esewa_mealbasket}")
    private String esewaSecretKey;
    
    @Value("${esewa.initiate.url:https://rc-epay.esewa.com.np/api/epay/main/v2/form}")
    private String esewaInitiateUrl;
    
    @Value("${esewa.verify.url:https://rc.esewa.com.np/epay/transrec}")
    private String esewaVerifyUrl;
    
    @Value("${esewa.return.url:http://localhost:3001/payment/return}")
    private String esewaReturnUrl;
    
    @Value("${esewa.status.url:https://rc.esewa.com.np/api/epay/transaction/status/}")
    private String esewaStatusUrl;
    
    /**
     * Initiate payment with eSewa
     */
    public Map<String, Object> initiateEsewaPayment(Long userId, Double amount, String purchaseOrderId) {
        try {
            // Validate user
            User user = userService.getUserById(userId);
            if (user == null) {
                throw new RuntimeException("User not found");
            }
            
            // Generate unique transaction ID to avoid conflicts
            String transactionUuid = "TXN-" + System.currentTimeMillis() + "-" + user.getId();
            String productCode = esewaProductCode;
            
            // Check for existing payment with same purchase order ID
            Optional<Payment> existingPaymentOpt = paymentRepository.findByPaymentRequestId(purchaseOrderId);
            if (existingPaymentOpt.isPresent()) {
                Payment existingPayment = existingPaymentOpt.get();
                if (existingPayment.getStatus() == Payment.PaymentStatus.PENDING || 
                    existingPayment.getStatus() == Payment.PaymentStatus.INITIATED) {
                    throw new RuntimeException("Payment already initiated for this order. Please complete or cancel the existing payment first.");
                }
            }
            
            // Create payment record
            Payment payment = new Payment();
            payment.setUser(user);
            payment.setPaymentGateway("ESEWA");
            payment.setTransactionId(transactionUuid);
            payment.setProductCode(productCode);
            payment.setAmount(amount);
            payment.setStatus(Payment.PaymentStatus.PENDING);
            payment.setPaymentRequestId(purchaseOrderId);
            
            payment = paymentRepository.save(payment);
            
            // Format amount to 2 decimal places
            String formattedAmount = String.format("%.2f", amount);
            
            // Prepare eSewa form data with exact field format
            Map<String, String> formData = new LinkedHashMap<>();
            formData.put("amount", formattedAmount);
            formData.put("tax_amount", "0");
            formData.put("total_amount", formattedAmount);
            formData.put("transaction_uuid", transactionUuid);
            formData.put("product_code", productCode);
            formData.put("product_service_charge", "0");
            formData.put("product_delivery_charge", "0");
            formData.put("success_url", esewaReturnUrl);
            formData.put("failure_url", esewaReturnUrl + "?status=failed&transactionId=" + transactionUuid);
            formData.put("signed_field_names", "total_amount,transaction_uuid,product_code");
            
            // Generate signature with exact field order: total_amount,transaction_uuid,product_code
            String signatureData = "total_amount=" + formattedAmount + ",transaction_uuid=" + transactionUuid + ",product_code=" + productCode;
            String signature = generateEsewaSignature(signatureData);
            formData.put("signature", signature);
            payment.setSignature(signature);
            
            // Update payment record
            payment.setGatewayResponse(formData.toString());
            payment.setStatus(Payment.PaymentStatus.INITIATED);
            paymentRepository.save(payment);
            
            // Return ONLY required eSewa fields for frontend
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("actionUrl", esewaInitiateUrl);
            result.put("formData", formData);
            
            return result;
            
        } catch (Exception e) {
            throw new RuntimeException("Payment initiation failed: " + e.getMessage(), e);
        }
    }
    
    /**
     * Verify eSewa payment using Base64 encoded response (PRODUCTION READY)
     */
    public Map<String, Object> verifyEsewaPaymentSecure(String encodedResponse) {
        try {
            // Step 1: Decode Base64 response from eSewa
            byte[] decodedBytes = Base64.getDecoder().decode(encodedResponse);
            String jsonResponse = new String(decodedBytes, StandardCharsets.UTF_8);

            // Step 2: Parse JSON response
            ObjectMapper objectMapper = new ObjectMapper();
            @SuppressWarnings("unchecked")
            Map<String, Object> esewaData = (Map<String, Object>) objectMapper.readValue(jsonResponse, Map.class);

            String transactionUuid = (String) esewaData.get("transaction_uuid");
            String totalAmount = String.valueOf(esewaData.get("total_amount"));
            String productCode = (String) esewaData.get("product_code");
            String signature = (String) esewaData.get("signature");
            String signedFieldNames = (String) esewaData.get("signed_field_names");
            String transactionCode = esewaData.get("transaction_code") != null
                    ? String.valueOf(esewaData.get("transaction_code"))
                    : null;
            String paymentStatus = (String) esewaData.get("status");

            if (transactionUuid == null || totalAmount == null || productCode == null || signature == null || signedFieldNames == null) {
                throw new RuntimeException("Invalid eSewa response: missing required fields");
            }

            // Step 3: Verify HMAC SHA256 signature using the exact eSewa returned fields and order
            String signatureData = buildSignedFieldData(esewaData, signedFieldNames);
            if (!verifyEsewaSignature(signatureData, signature)) {
                Map<String, Object> result = new HashMap<>();
                result.put("success", false);
                result.put("reason", "Signature verification failed");
                return result;
            }

            // Step 4: Callback payload is already signed by eSewa. Use it as the primary signal,
            // and treat the status API as an extra verification layer when available.
            boolean callbackComplete = "COMPLETE".equalsIgnoreCase(paymentStatus);
            Map<String, Object> statusResult = verifyPaymentWithEsewaStatusAPI(transactionUuid, totalAmount, productCode);
            boolean statusApiComplete = Boolean.TRUE.equals(statusResult.get("success"));
            String finalStatus = statusApiComplete
                    ? String.valueOf(statusResult.get("status"))
                    : (paymentStatus != null ? paymentStatus : "FAILED");

            // Step 5: Update payment in database
            Payment payment = paymentRepository.findByTransactionId(transactionUuid)
                    .orElseThrow(() -> new RuntimeException("Payment not found: " + transactionUuid));

            if (callbackComplete || "COMPLETE".equalsIgnoreCase(finalStatus)) {
                payment.setStatus(Payment.PaymentStatus.SUCCESS);
                payment.setVerifiedAt(LocalDateTime.now());
                payment.setFailureReason(null);
                payment.setGatewayResponse(transactionCode);
            } else {
                payment.setStatus(Payment.PaymentStatus.FAILED);
                payment.setFailureReason("Payment status returned: " + finalStatus);
            }

            paymentRepository.save(payment);

            Long orderId = null;
            Order order = payment.getOrder();
            if (order != null) {
                orderId = order.getId();
                if (callbackComplete || "COMPLETE".equalsIgnoreCase(finalStatus)) {
                    order.setPaymentStatus("SUCCESS");
                    order.setStatus("CONFIRMED");
                } else {
                    order.setPaymentStatus("FAILED");
                }
                orderService.updateOrder(order);
            }

            // Step 6: Return result
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("transactionId", transactionUuid);
            result.put("referenceId", transactionCode);
            result.put("orderId", orderId);
            result.put("status", finalStatus);
            result.put("amount", totalAmount);
            result.put("esewaStatus", paymentStatus);
            if (!statusApiComplete && callbackComplete) {
                result.put("statusApiWarning", statusResult.get("reason"));
            }
            result.put(
                    "message",
                    (callbackComplete || "COMPLETE".equalsIgnoreCase(finalStatus))
                            ? "Payment verified successfully"
                            : "Payment verification completed with status: " + finalStatus
            );

            return result;

        } catch (Exception e) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("reason", "Payment verification failed: " + e.getMessage());
            return result;
        }
    }

    /**
     * Verify payment with eSewa status API
     */
    private Map<String, Object> verifyPaymentWithEsewaStatusAPI(String transactionUuid, String totalAmount, String productCode) {
        try {
            String statusApiUrl = UriComponentsBuilder.fromUriString(esewaStatusUrl)
                    .queryParam("product_code", productCode)
                    .queryParam("total_amount", totalAmount)
                    .queryParam("transaction_uuid", transactionUuid)
                    .toUriString();

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    statusApiUrl,
                    HttpMethod.GET,
                    null,
                    new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {}
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                String status = responseBody.get("status") != null
                        ? String.valueOf(responseBody.get("status"))
                        : "UNKNOWN";

                Map<String, Object> result = new HashMap<>();
                result.put("success", "COMPLETE".equals(status));
                result.put("status", status);
                result.put("referenceId", responseBody.get("refId"));
                result.put("gatewayResponse", responseBody);
                if (!"COMPLETE".equals(status)) {
                    result.put("reason", "Payment not completed. Current status: " + status);
                }
                return result;
            }

            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("reason", "Failed to verify payment status");
            return result;

        } catch (Exception e) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("reason", "Status API call failed: " + e.getMessage());
            return result;
        }
    }

    /**
     * Get payment by transaction ID
     */
    public Payment getPaymentByTransactionId(String transactionId) {
        return paymentRepository.findByTransactionId(transactionId)
            .orElseThrow(() -> new RuntimeException("Payment not found: " + transactionId));
    }

    /**
     * Get user payments
     */
    public List<Payment> getUserPayments(Long userId) {
        User user = userService.getUserById(userId);
        return paymentRepository.findByUser(user);
    }

    /**
     * Generate unique product code for eSewa
     */
    private String generateEsewaSignature(String data) {
        try {
            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secret_key = new SecretKeySpec(esewaSecretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256_HMAC.init(secret_key);

            byte[] signatureBytes = sha256_HMAC.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(signatureBytes);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException("Failed to generate signature: " + e.getMessage(), e);
        }
    }

    /**
     * Verify eSewa signature
     */
    private boolean verifyEsewaSignature(String data, String signature) {
        String expectedSignature = generateEsewaSignature(data);
        return expectedSignature.equals(signature);
    }

    private String buildSignedFieldData(Map<String, Object> esewaData, String signedFieldNames) {
        String[] fields = signedFieldNames.split(",");
        StringBuilder builder = new StringBuilder();

        for (String rawField : fields) {
            String field = rawField.trim();
            if (field.isEmpty()) {
                continue;
            }

            if (builder.length() > 0) {
                builder.append(",");
            }

            Object value = esewaData.get(field);
            builder.append(field).append("=").append(value == null ? "" : String.valueOf(value));
        }

        return builder.toString();
    }

    /**
     * Clean up old pending payments
     */
    @Transactional
    public void cleanupOldPendingPayments() {
        LocalDateTime cutoffTime = LocalDateTime.now().minusHours(1);
        List<Payment> oldPayments = paymentRepository.findPendingPaymentsOlderThan(cutoffTime);

        for (Payment payment : oldPayments) {
            payment.setStatus(Payment.PaymentStatus.CANCELLED);
            payment.setFailureReason("Payment timeout - automatically cancelled");
            paymentRepository.save(payment);
        }
    }
}
