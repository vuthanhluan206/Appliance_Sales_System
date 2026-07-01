package com.example.dienlanh.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.dienlanh.model.Technician;

public interface TechnicianRepository extends JpaRepository<Technician, Long> {
    Optional<Technician> findByUserId(Long userId);
}
