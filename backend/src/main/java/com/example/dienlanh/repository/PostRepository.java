package com.example.dienlanh.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.dienlanh.model.Post;

public interface PostRepository extends JpaRepository<Post, Long> {
}
