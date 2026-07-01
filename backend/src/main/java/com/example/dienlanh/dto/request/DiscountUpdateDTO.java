package com.example.dienlanh.dto.request;

import java.math.BigDecimal;
import java.time.LocalDateTime;
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
public class DiscountUpdateDTO {

    @NotBlank(message = "Mã giảm giá không được để trống")
    private String code;

    @NotNull(message = "Giá trị giảm giá không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Giá trị giảm giá phải lớn hơn 0")
    private BigDecimal discountValue;

    private BigDecimal minOrderValue;


    @NotBlank(message = "Loại giảm giá không được để trống")
    private String discountType; // PERCENTAGE, FIXED_AMOUNT

    @NotNull(message = "Ngày bắt đầu không được để trống")
    private LocalDateTime startDate;

    @NotNull(message = "Ngày kết thúc không được để trống")
    private LocalDateTime endDate;

    @NotNull(message = "Số lần sử dụng tối đa không được để trống")
    @Min(value = 1, message = "Số lần sử dụng tối đa phải ít nhất là 1")
    private Integer maxUsages;

    private String applicableConditions;

    private String status; // ACTIVE, EXPIRED, DEACTIVATED
}
