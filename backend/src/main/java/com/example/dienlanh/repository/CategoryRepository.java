package com.example.dienlanh.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.dienlanh.model.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    boolean existsByName(String name);
}
