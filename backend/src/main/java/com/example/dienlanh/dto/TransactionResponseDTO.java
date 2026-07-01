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
public class TransactionResponseDTO {

    private Long id;
    private Long userId;
    private String userName;
    private Long orderId;
    private String type; // PAYMENT, REFUND, DEPOSIT
    private BigDecimal amount;
    private String status; // PENDING, COMPLETED, FAILED, CANCELLED
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
