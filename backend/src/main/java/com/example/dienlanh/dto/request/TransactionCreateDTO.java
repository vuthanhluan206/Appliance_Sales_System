package com.example.dienlanh.dto.request;

import java.math.BigDecimal;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionCreateDTO {

    @NotNull(message = "ID người dùng không được để trống")
    private Long userId;

    private Long orderId;

    @NotBlank(message = "Loại giao dịch không được để trống")
    private String type; // PAYMENT, REFUND, DEPOSIT

    @NotNull(message = "Số tiền giao dịch không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Số tiền giao dịch phải lớn hơn 0")
    private BigDecimal amount;

    private String description;
}
