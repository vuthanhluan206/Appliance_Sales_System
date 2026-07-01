package com.example.dienlanh.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentStatusUpdateDTO {

    @NotBlank(message = "Trạng thái thanh toán không được để trống")
    private String status; // PENDING, COMPLETED, FAILED
}
