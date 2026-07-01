package com.example.dienlanh.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponseDTO {

    private Long id;
    private Long userId;
    private String userName;
    private Long orderId;
    private Long productId;
    private String productName;
    private Long serviceId;
    private String serviceName;
    private Integer productRating;
    private Integer serviceRating;
    private String content;
    private String images;
    private Integer likes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
