package com.example.dienlanh.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.dienlanh.dto.PostResponseDTO;
import com.example.dienlanh.dto.request.PostCreateDTO;
import com.example.dienlanh.dto.request.PostUpdateDTO;
import com.example.dienlanh.helper.json.ApiResponse;
import com.example.dienlanh.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class PostController {
    private final PostService postService;

    @PostMapping("/createPost")
    public ResponseEntity<ApiResponse<PostResponseDTO>> createPost(@Valid @RequestBody PostCreateDTO input) {
        PostResponseDTO created = this.postService.createPost(input);
        return ApiResponse.success(created, "Create post successful");
    }

    @GetMapping("/posts")
    public ResponseEntity<ApiResponse<List<PostResponseDTO>>> getAllPosts() {
        List<PostResponseDTO> posts = this.postService.getAllPosts();
        return ApiResponse.success(posts, "Get all posts successful");
    }

    @GetMapping("/getPost/{id}")
    public ResponseEntity<ApiResponse<PostResponseDTO>> getPostByID(@PathVariable Long id) {
        PostResponseDTO post = this.postService.getPostById(id);
        return ApiResponse.success(post, "Get post by id successful");
    }

    @PutMapping("/updatePost/{id}")
    public ResponseEntity<ApiResponse<PostResponseDTO>> updatePost(@PathVariable Long id, @Valid @RequestBody PostUpdateDTO input) {
        PostResponseDTO updated = this.postService.updatePost(id, input);
        return ApiResponse.success(updated, "Update post successful");
    }

    @DeleteMapping("/deletePost/{id}")
    public String deletePost(@PathVariable Long id) {
        this.postService.deletePost(id);
        return "delete post successful";
    }

    @PostMapping("/post/like/{id}")
    public ResponseEntity<ApiResponse<PostResponseDTO>> likePost(@PathVariable Long id) {
        PostResponseDTO liked = this.postService.likePost(id);
        return ApiResponse.success(liked, "Like post successful");
    }
}
