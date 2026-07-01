package com.example.dienlanh.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.dienlanh.model.Order;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(Long userId);
}
