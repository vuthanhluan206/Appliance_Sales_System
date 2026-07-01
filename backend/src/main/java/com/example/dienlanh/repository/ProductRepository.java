package com.example.dienlanh.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.dienlanh.model.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {
}
