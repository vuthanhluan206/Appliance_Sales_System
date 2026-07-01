package com.example.dienlanh.dto.request;

import java.math.BigDecimal;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceUpdateDTO {

    @NotBlank(message = "Tên dịch vụ không được để trống")
    private String name;

    private String description;

    @NotNull(message = "Giá dịch vụ không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Giá dịch vụ phải lớn hơn 0")
    private BigDecimal basePrice;

    @NotNull(message = "Thời gian ước tính không được để trống")
    @Min(value = 1, message = "Thời gian ước tính phải lớn hơn hoặc bằng 1 giờ")
    private Integer estimatedHours;

    private String status; // ACTIVE, INACTIVE
}
