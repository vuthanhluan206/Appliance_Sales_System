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
public class DiscountResponseDTO {

    private Long id;
    private String code;
    private BigDecimal discountValue;
    private BigDecimal minOrderValue;

    private String discountType; // PERCENTAGE, FIXED_AMOUNT
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer maxUsages;
    private Integer usedCount;
    private String applicableConditions;
    private String status; // ACTIVE, EXPIRED, DEACTIVATED
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
