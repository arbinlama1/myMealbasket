package com.example.MealBasketSyatem.repo;

import com.example.MealBasketSyatem.entity.Order;
import com.example.MealBasketSyatem.entity.Payment;
import com.example.MealBasketSyatem.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    // Find payment by transaction ID
    Optional<Payment> findByTransactionId(String transactionId);
    
    // Find payments by user
    List<Payment> findByUser(User user);
    
    // Find payments by user and status
    List<Payment> findByUserAndStatus(User user, Payment.PaymentStatus status);
    
    // Find payment by order
    Optional<Payment> findByOrder(Order order);
    
    // Find pending payments older than specified time
    @Query("SELECT p FROM Payment p WHERE p.status = 'PENDING' AND p.createdAt < :cutoffTime")
    List<Payment> findPendingPaymentsOlderThan(@Param("cutoffTime") LocalDateTime cutoffTime);
    
    // Find payments by payment gateway and status
    List<Payment> findByPaymentGatewayAndStatus(String paymentGateway, Payment.PaymentStatus status);
    
    // Count payments by user and status
    @Query("SELECT COUNT(p) FROM Payment p WHERE p.user = :user AND p.status = :status")
    long countByUserAndStatus(@Param("user") User user, @Param("status") Payment.PaymentStatus status);
    
    // Find successful payments by user within date range
    @Query("SELECT p FROM Payment p WHERE p.user = :user AND p.status = 'SUCCESS' AND p.createdAt BETWEEN :startDate AND :endDate")
    List<Payment> findSuccessfulPaymentsByUserAndDateRange(
        @Param("user") User user,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
    
    // Check if transaction ID already exists
    boolean existsByTransactionId(String transactionId);
    
    // Find payment by payment request ID (for eSewa)
    Optional<Payment> findByPaymentRequestId(String paymentRequestId);
    
    // Find payments by signature (for eSewa verification)
    Optional<Payment> findBySignature(String signature);
}
