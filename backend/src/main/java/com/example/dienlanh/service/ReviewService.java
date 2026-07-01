package com.example.dienlanh.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.dienlanh.dto.ReviewResponseDTO;
import com.example.dienlanh.dto.request.ReviewCreateDTO;
import com.example.dienlanh.dto.request.ReviewUpdateDTO;
import com.example.dienlanh.helper.exception.ResourceNotFoundException;
import com.example.dienlanh.model.Order;
import com.example.dienlanh.model.Product;
import com.example.dienlanh.model.Review;
import com.example.dienlanh.model.User;
import com.example.dienlanh.repository.OrderRepository;
import com.example.dienlanh.repository.ProductRepository;
import com.example.dienlanh.repository.ReviewRepository;
import com.example.dienlanh.repository.UserRepository;
import com.example.dienlanh.repository.ServiceRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final ServiceRepository serviceRepository;

    public ReviewResponseDTO convertToDTO(Review review) {
        return ReviewResponseDTO.builder()
                .id(review.getId())
                .userId(review.getUser() != null ? review.getUser().getId() : null)
                .userName(review.getUser() != null ? review.getUser().getName() : null)
                .orderId(review.getOrder() != null ? review.getOrder().getId() : null)
                .productId(review.getProduct() != null ? review.getProduct().getId() : null)
                .productName(review.getProduct() != null ? review.getProduct().getName() : null)
                .serviceId(review.getService() != null ? review.getService().getId() : null)
                .serviceName(review.getService() != null ? review.getService().getName() : null)
                .productRating(review.getProductRating())
                .serviceRating(review.getServiceRating())
                .content(review.getContent())
                .images(review.getImages())
                .likes(review.getLikes())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }

    public List<ReviewResponseDTO> getAllReviews() {
        return this.reviewRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ReviewResponseDTO getReviewById(Long id) {
        Review review = this.reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + id));
        return convertToDTO(review);
    }

    public List<ReviewResponseDTO> getReviewsByProductId(Long productId) {
        return this.reviewRepository.findByProductId(productId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReviewResponseDTO createReview(ReviewCreateDTO input) {
        User user = this.userRepository.findById(input.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + input.getUserId()));

        Order order = this.orderRepository.findById(input.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + input.getOrderId()));

        Product product = null;
        if (input.getProductId() != null) {
            product = this.productRepository.findById(input.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + input.getProductId()));
        }

        com.example.dienlanh.model.Service service = null;
        if (input.getServiceId() != null) {
            service = this.serviceRepository.findById(input.getServiceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + input.getServiceId()));
        }

        Review review = new Review();
        review.setUser(user);
        review.setOrder(order);
        review.setProduct(product);
        review.setService(service);
        review.setProductRating(input.getProductRating() != null ? input.getProductRating() : 5);
        review.setServiceRating(input.getServiceRating());
        review.setContent(input.getContent());
        review.setImages(input.getImages());
        review.setLikes(0);

        this.reviewRepository.save(review);
        return convertToDTO(review);
    }

    @Transactional
    public ReviewResponseDTO updateReview(Long id, ReviewUpdateDTO input) {
        Review review = this.reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + id));

        review.setProductRating(input.getProductRating());
        review.setServiceRating(input.getServiceRating());
        review.setContent(input.getContent());
        review.setImages(input.getImages());

        this.reviewRepository.save(review);
        return convertToDTO(review);
    }

    @Transactional
    public void deleteReview(Long id) {
        Review review = this.reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + id));
        this.reviewRepository.delete(review);
    }
}
