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
public class WarrantyResponseDTO {

    private Long id;
    private Long orderId;
    private Long productId;
    private String productName;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String warrantyType; // MANUFACTURER, EXTENDED
    private String status; // ACTIVE, EXPIRED
    private String conditions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
