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
public class OrderServiceResponseDTO {

    private Long id;
    private Long orderId;
    private Long serviceId;
    private String serviceName;
    private BigDecimal servicePrice;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
