package com.example.dienlanh.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponseDTO {

    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private Long categoryId;
    private String categoryName;
    private String image;
    private String status; // AVAILABLE, OUT_OF_STOCK
    private String brand;
    private Integer yearManufactured;
    private Integer warrantyMonths;
    private Double rating;
    private Integer totalSold;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
