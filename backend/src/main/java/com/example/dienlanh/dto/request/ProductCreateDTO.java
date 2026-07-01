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
public class ProductCreateDTO {

    @NotBlank(message = "Tên sản phẩm không được để trống")
    private String name;

    private String description;

    @NotNull(message = "Giá sản phẩm không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Giá sản phẩm phải lớn hơn 0")
    private BigDecimal price;

    @NotNull(message = "ID danh mục không được để trống")
    private Long categoryId;

    private String image;

    private String status; // AVAILABLE, OUT_OF_STOCK

    private String brand;

    private Integer yearManufactured;

    @NotNull(message = "Số tháng bảo hành không được để trống")
    @Min(value = 0, message = "Số tháng bảo hành phải lớn hơn hoặc bằng 0")
    private Integer warrantyMonths;
}
