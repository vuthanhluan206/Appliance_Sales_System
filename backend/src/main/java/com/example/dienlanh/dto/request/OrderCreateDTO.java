package com.example.dienlanh.dto.request;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderCreateDTO {

    @NotNull(message = "ID người dùng không được để trống")
    private Long userId;

    private String deliveryAddress;

    private String notes;

    @NotNull(message = "Loại dịch vụ không được để trống")
    private String serviceType; // DELIVERY_AND_INSTALLATION, REPAIR

    private java.math.BigDecimal totalPrice;

    @Valid
    private List<OrderItemCreateDTO> orderItems;
}
