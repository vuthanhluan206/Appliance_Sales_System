package com.example.dienlanh.service;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import com.example.dienlanh.dto.PostResponseDTO;
import com.example.dienlanh.dto.request.PostCreateDTO;
import com.example.dienlanh.dto.request.PostUpdateDTO;
import com.example.dienlanh.helper.exception.ResourceNotFoundException;
import com.example.dienlanh.model.Post;
import com.example.dienlanh.repository.PostRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PostService {
    private final PostRepository postRepository;

    public PostResponseDTO convertToDTO(Post post) {
        return PostResponseDTO.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .mediaUrl(post.getMediaUrl())
                .mediaType(post.getMediaType())
                .likesCount(post.getLikesCount())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }

    public List<PostResponseDTO> getAllPosts() {
        return this.postRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public PostResponseDTO getPostById(Long id) {
        Post post = this.postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + id));
        return convertToDTO(post);
    }

    public PostResponseDTO createPost(PostCreateDTO input) {
        Post post = new Post();
        post.setTitle(input.getTitle());
        post.setContent(input.getContent());
        post.setMediaUrl(input.getMediaUrl());
        post.setMediaType(input.getMediaType());
        post.setLikesCount(0);
        this.postRepository.save(post);
        return convertToDTO(post);
    }

    public PostResponseDTO updatePost(Long id, PostUpdateDTO input) {
        Post post = this.postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + id));
        post.setTitle(input.getTitle());
        post.setContent(input.getContent());
        post.setMediaUrl(input.getMediaUrl());
        post.setMediaType(input.getMediaType());
        this.postRepository.save(post);
        return convertToDTO(post);
    }

    public void deletePost(Long id) {
        Post post = this.postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + id));
        this.postRepository.delete(post);
    }

    public PostResponseDTO likePost(Long id) {
        Post post = this.postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + id));
        post.setLikesCount(post.getLikesCount() + 1);
        this.postRepository.save(post);
        return convertToDTO(post);
    }
}
