package com.example.dienlanh.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponseDTO {

    private Long id;
    private Long userId;
    private String userName;
    private LocalDateTime orderDate;
    private String status; // PENDING, CONFIRMED, INSTALLING_REPAIRING, COMPLETED, CANCELLED
    private BigDecimal totalPrice;
    private String deliveryAddress;
    private String notes;
    private String serviceType; // DELIVERY_AND_INSTALLATION, REPAIR
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<OrderItemResponseDTO> orderItems;
    private List<OrderServiceResponseDTO> orderServices;
}
