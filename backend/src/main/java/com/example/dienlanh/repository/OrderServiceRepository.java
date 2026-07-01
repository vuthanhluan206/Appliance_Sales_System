package com.example.dienlanh.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.dienlanh.model.OrderService;

public interface OrderServiceRepository extends JpaRepository<OrderService, Long> {
    List<OrderService> findByOrderId(Long orderId);
}
