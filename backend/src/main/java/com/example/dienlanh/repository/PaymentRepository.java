package com.example.dienlanh.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.dienlanh.model.Payment;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByOrderId(Long orderId);
}
