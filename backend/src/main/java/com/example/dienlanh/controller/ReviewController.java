package com.example.dienlanh.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.dienlanh.dto.ReviewResponseDTO;
import com.example.dienlanh.dto.request.ReviewCreateDTO;
import com.example.dienlanh.dto.request.ReviewUpdateDTO;
import com.example.dienlanh.helper.json.ApiResponse;
import com.example.dienlanh.service.ReviewService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService reviewService;

    // Create Review
    @PostMapping("/createReview")
    public ResponseEntity<ApiResponse<ReviewResponseDTO>> createReview(@Valid @RequestBody ReviewCreateDTO input) {
        ReviewResponseDTO created = this.reviewService.createReview(input);
        return ApiResponse.success(created, "create review successful");
    }

    // Get all reviews
    @GetMapping("/reviews")
    public ResponseEntity<ApiResponse<List<ReviewResponseDTO>>> getAllReviews() {
        List<ReviewResponseDTO> list = this.reviewService.getAllReviews();
        return ApiResponse.success(list, "get all reviews successful");
    }

    // Get review by id
    @GetMapping("/getReview/{id}")
    public ResponseEntity<ApiResponse<ReviewResponseDTO>> getReviewByID(@PathVariable Long id) {
        ReviewResponseDTO review = this.reviewService.getReviewById(id);
        return ApiResponse.success(review, "get review by id successful");
    }

    // Get reviews by product id
    @GetMapping("/reviews/product/{productId}")
    public ResponseEntity<ApiResponse<List<ReviewResponseDTO>>> getReviewsByProductID(@PathVariable Long productId) {
        List<ReviewResponseDTO> list = this.reviewService.getReviewsByProductId(productId);
        return ApiResponse.success(list, "get reviews by product id successful");
    }

    // Update review by id
    @PutMapping("/updateReview/{id}")
    public ResponseEntity<ApiResponse<ReviewResponseDTO>> updateReview(@PathVariable Long id,
            @Valid @RequestBody ReviewUpdateDTO input) {
        ReviewResponseDTO updated = this.reviewService.updateReview(id, input);
        return ApiResponse.success(updated, "update review successful");
    }

    // Delete review by id
    @DeleteMapping("/deleteReview/{id}")
    public String deleteReview(@PathVariable Long id) {
        this.reviewService.deleteReview(id);
        return "delete review successful";
    }
}
