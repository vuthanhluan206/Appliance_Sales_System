package com.example.dienlanh.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.dienlanh.model.Transaction;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUserId(Long userId);

    List<Transaction> findByOrderId(Long orderId);
}
