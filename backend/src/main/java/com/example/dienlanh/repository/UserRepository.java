package com.example.dienlanh.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.dienlanh.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmail(String email);

    boolean existsByEmailAndIsVerifiedTrue(String email);

    Optional<User> findByEmail(String email);
}
