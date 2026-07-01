package com.example.dienlanh.dto.request;

import java.time.LocalDateTime;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WarrantyCreateDTO {

    @NotNull(message = "ID đơn hàng không được để trống")
    private Long orderId;

    @NotNull(message = "ID sản phẩm không được để trống")
    private Long productId;

    @NotNull(message = "Ngày bắt đầu bảo hành không được để trống")
    private LocalDateTime startDate;

    @NotNull(message = "Ngày kết thúc bảo hành không được để trống")
    private LocalDateTime endDate;

    @NotBlank(message = "Loại bảo hành không được để trống")
    private String warrantyType; // MANUFACTURER, EXTENDED

    private String conditions;
}
