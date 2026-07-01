package com.example.dienlanh.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.dienlanh.model.Discount;

public interface DiscountRepository extends JpaRepository<Discount, Long> {
    Optional<Discount> findByCode(String code);
}
