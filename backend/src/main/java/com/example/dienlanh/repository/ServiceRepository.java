package com.example.dienlanh.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.dienlanh.model.Service;

public interface ServiceRepository extends JpaRepository<Service, Long> {
}
