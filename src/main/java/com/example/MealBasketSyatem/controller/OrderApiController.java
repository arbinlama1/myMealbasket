package com.example.MealBasketSyatem.controller;

import com.example.MealBasketSyatem.dto.ApiResponse;
import com.example.MealBasketSyatem.dto.MyOrderDTO;
import com.example.MealBasketSyatem.dto.OrderItemDTO;
import com.example.MealBasketSyatem.entity.Order;
import com.example.MealBasketSyatem.entity.User;
import com.example.MealBasketSyatem.service.OrderService;
import com.example.MealBasketSyatem.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.security.NoSuchAlgorithmException;
import java.security.InvalidKeyException;
import java.util.Base64;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003"})
public class OrderApiController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserService userService;

    /**
     * Generate HMAC-SHA256 signature for eSewa payment
     */
    private String generateSignature(String data, String secretKey) {
        try {
            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secret_key_spec = new SecretKeySpec(secretKey.getBytes(), "HmacSHA256");
            sha256_HMAC.init(secret_key_spec);
            byte[] signatureBytes = sha256_HMAC.doFinal(data.getBytes());
            return Base64.getEncoder().encodeToString(signatureBytes);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            // For demo purposes, return a simple hash if encryption fails
            return java.util.UUID.randomUUID().toString().replace("-", "");
        }
    }

    @PostMapping("/create-from-cart")
    public ResponseEntity<ApiResponse<Order>> createOrderFromCart(@RequestBody Map<String, Object> orderRequest, 
                                                                  @AuthenticationPrincipal UserDetails userDetails) {
        try {
            // Get current user from authentication
            String email = userDetails.getUsername();
            User user = userService.findUserByEmail(email);
            
            if (user == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("User not found"));
            }
            
            // Extract order items from request
            Object itemsObj = orderRequest.get("items");
            if (itemsObj == null || !(itemsObj instanceof List)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Order items are required"));
            }
            
            // Use the proper order creation method that handles vendor relationships
            Order createdOrder = orderService.createOrder(user.getId(), orderRequest);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Order created successfully", createdOrder));
                    
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create order: " + e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Order>> createOrder(@RequestBody Map<String, Object> orderRequest, 
                                                          @AuthenticationPrincipal UserDetails userDetails) {
        try {
            // Get current user from authentication
            String email = userDetails.getUsername();
            User user = userService.findUserByEmail(email);
            
            if (user == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("User not found"));
            }
            
            // Extract order items from request
            Object itemsObj = orderRequest.get("items");
            if (itemsObj == null || !(itemsObj instanceof List)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Order items are required"));
            }
            
            // Use the proper order creation method that handles vendor relationships
            Order createdOrder = orderService.createOrder(user.getId(), orderRequest);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Order created successfully", createdOrder));
                    
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create order: " + e.getMessage()));
        }
    }

    @PostMapping("/{orderId}/initiate-payment")
    public ResponseEntity<ApiResponse<Object>> initiatePayment(@PathVariable Long orderId,
                                                              @AuthenticationPrincipal UserDetails userDetails) {
        try {
            // Get current user from authentication
            String email = userDetails.getUsername();
            User user = userService.findUserByEmail(email);
            
            if (user == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("User not found"));
            }
            
            // Get order by ID
            Order order = orderService.getOrderById(orderId);
            
            if (order == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Order not found"));
            }
            
            // Check if order belongs to current user
            if (order.getUser().getId() != user.getId()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Access denied"));
            }
            
            // Return eSewa payment data (fallback to mock for demo)
            Map<String, Object> paymentData = new HashMap<>();
            paymentData.put("orderId", orderId);
            paymentData.put("amount", order.getTotalAmount());
            
            // For college demo, use mock payment to avoid merchant key issues
            paymentData.put("actionUrl", "http://localhost:3002/mock-payment");
            paymentData.put("mockPayment", true);
            paymentData.put("message", "Using mock eSewa payment for demo purposes");
            
            // Complete form data for eSewa
            Map<String, String> formData = new HashMap<>();
            
            // Required fields with exact eSewa test credentials
            String amount = order.getTotalAmount().toString();
            String taxAmount = "0";
            String totalAmount = order.getTotalAmount().toString();
            String transactionUuid = "txn_" + System.currentTimeMillis();
            String productCode = "TEST"; // eSewa test product code
            String productServiceCharge = "0";
            String productDeliveryCharge = "0";
            String successUrl = "http://localhost:3002/payment/success";
            String failureUrl = "http://localhost:3002/payment/failure";
            
            formData.put("amount", amount);
            formData.put("tax_amount", taxAmount);
            formData.put("total_amount", totalAmount);
            formData.put("transaction_uuid", transactionUuid);
            formData.put("product_code", productCode);
            formData.put("product_service_charge", productServiceCharge);
            formData.put("product_delivery_charge", productDeliveryCharge);
            formData.put("success_url", successUrl);
            formData.put("failure_url", failureUrl);
            
            // Generate signature with exact eSewa test credentials
            String secretKey = "8gBm/:&EnhH.1/q("; // eSewa test secret key
            String signedFieldNames = "amount,tax_amount,total_amount,transaction_uuid,product_code,product_service_charge,product_delivery_charge,success_url,failure_url";
            formData.put("signed_field_names", signedFieldNames);
            
            // Create signature string (simplified for demo)
            String signatureString = amount + "," + taxAmount + "," + totalAmount + "," + 
                                   transactionUuid + "," + productCode + "," + 
                                   productServiceCharge + "," + productDeliveryCharge + "," + 
                                   successUrl + "," + failureUrl;
            
            // Generate signature (in production, use proper HMAC-SHA256)
            String signature = generateSignature(signatureString, secretKey);
            formData.put("signature", signature);
            
            paymentData.put("formData", formData);
            
            return ResponseEntity.ok(ApiResponse.success("Payment initiated successfully", paymentData));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to initiate payment: " + e.getMessage()));
        }
    }

    @GetMapping("/my-orders")
    public ResponseEntity<ApiResponse<List<MyOrderDTO>>> getMyOrders(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            String email = userDetails.getUsername();
            User user = userService.findUserByEmail(email);
            
            if (user == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("User not found"));
            }
            
            List<Order> orders = orderService.getOrdersByUser(user.getId());
            
            // Convert to MyOrderDTO with product details
            List<MyOrderDTO> myOrderDTOs = orders.stream().map(order -> {
                MyOrderDTO dto = new MyOrderDTO();
                dto.setId(order.getId());
                dto.setStatus(order.getStatus());
                dto.setTotalAmount(order.getTotalAmount());
                dto.setCreatedAt(order.getCreatedAt());
                dto.setUpdatedAt(order.getUpdatedAt());
                dto.setDeliveryAddress(order.getDeliveryAddress());
                dto.setPhone(order.getPhone());
                dto.setNotes(order.getNotes());
                
                // Convert order items to include product details
                if (order.getOrderItems() != null && !order.getOrderItems().isEmpty()) {
                    List<OrderItemDTO> itemDTOs = order.getOrderItems().stream().map(item -> {
                        OrderItemDTO itemDTO = new OrderItemDTO();
                        itemDTO.setId(item.getId());
                        itemDTO.setQuantity(item.getQuantity());
                        itemDTO.setPrice(item.getPrice());
                        itemDTO.setSubtotal(item.getSubtotal());
                        
                        // Include product details
                        if (item.getProduct() != null) {
                            itemDTO.setProductId(item.getProduct().getId());
                            itemDTO.setProductName(item.getProduct().getName());
                            itemDTO.setProductDescription(item.getProduct().getDescription());
                            itemDTO.setProductImage(item.getProduct().getImage());
                        }
                        
                        return itemDTO;
                    }).collect(java.util.stream.Collectors.toList());
                    
                    dto.setItems(itemDTOs);
                } else if (order.getProduct() != null) {
                    // Handle legacy single product orders
                    OrderItemDTO itemDTO = new OrderItemDTO();
                    itemDTO.setQuantity(order.getQuantity());
                    itemDTO.setPrice(order.getPrice());
                    itemDTO.setSubtotal(order.getAmount());
                    itemDTO.setProductId(order.getProduct().getId());
                    itemDTO.setProductName(order.getProduct().getName());
                    itemDTO.setProductDescription(order.getProduct().getDescription());
                    itemDTO.setProductImage(order.getProduct().getImage());
                    
                    dto.setItems(java.util.Arrays.asList(itemDTO));
                }
                
                return dto;
            }).collect(java.util.stream.Collectors.toList());
            
            System.out.println("=== MY ORDERS API DEBUG ===");
            System.out.println("Found " + myOrderDTOs.size() + " orders for user " + user.getId());
            for (int i = 0; i < myOrderDTOs.size(); i++) {
                MyOrderDTO order = myOrderDTOs.get(i);
                System.out.println("Order " + (i+1) + ": ID=" + order.getId() + 
                    ", Status=" + order.getStatus() + 
                    ", Items=" + (order.getItems() != null ? order.getItems().size() : 0) +
                    ", Total=" + order.getTotalAmount());
            }
            System.out.println("==============================");
            
            return ResponseEntity.ok(ApiResponse.success("My orders retrieved successfully", myOrderDTOs));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve my orders: " + e.getMessage()));
        }
    }

    @GetMapping("/user")
    public ResponseEntity<ApiResponse<List<Order>>> getOrdersByCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            String email = userDetails.getUsername();
            User user = userService.findUserByEmail(email);
            
            if (user == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("User not found"));
            }
            
            List<Order> orders = orderService.getOrdersByUser(user.getId());
            System.out.println("=== DEBUGGING ORDERS ===");
            System.out.println("Found " + orders.size() + " orders for user " + user.getId());
            for (int i = 0; i < orders.size(); i++) {
                Order order = orders.get(i);
                System.out.println("Order " + (i+1) + ": ID=" + order.getId() + 
                    ", Status=" + order.getStatus() + 
                    ", Amount=" + order.getTotalAmount() + 
                    ", Created=" + order.getCreatedAt());
            }
            System.out.println("========================");
            return ResponseEntity.ok(ApiResponse.success("Orders retrieved successfully", orders));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve orders: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Order>>> getAllOrders() {
        try {
            List<Order> orders = orderService.getAllOrder();
            return ResponseEntity.ok(ApiResponse.success("All orders retrieved successfully", orders));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve orders: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Order>> getOrderById(@PathVariable Long id) {
        try {
            Order order = orderService.getAdminById(id);
            return ResponseEntity.ok(ApiResponse.success("Order retrieved successfully", order));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Order not found: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve order: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteOrder(@PathVariable Long id) {
        try {
            orderService.deleteUser(id);
            return ResponseEntity.ok(ApiResponse.success("Order deleted successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Order not found: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete order: " + e.getMessage()));
        }
    }
}
