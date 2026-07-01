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
public class PaymentCreateDTO {

    @NotNull(message = "ID đơn hàng không được để trống")
    private Long orderId;

    @NotNull(message = "Số tiền thanh toán không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Số tiền thanh toán phải lớn hơn 0")
    private BigDecimal amount;

    @NotBlank(message = "Phương thức thanh toán không được để trống")
    private String paymentMethod; // CASH, BANK_TRANSFER, QR_CODE

    private String collectedBy;

    private String notes;
}
