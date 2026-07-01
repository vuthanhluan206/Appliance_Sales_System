package com.example.dienlanh.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.dienlanh.model.Warranty;

public interface WarrantyRepository extends JpaRepository<Warranty, Long> {
    List<Warranty> findByOrderId(Long orderId);

    List<Warranty> findByProductId(Long productId);
}
