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
public class PaymentResponseDTO {

    private Long id;
    private Long orderId;
    private BigDecimal amount;
    private String paymentMethod; // CASH, BANK_TRANSFER, QR_CODE
    private String status; // PENDING, COMPLETED, FAILED
    private LocalDateTime paymentDate;
    private String collectedBy;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
