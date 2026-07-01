package com.example.dienlanh.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewCreateDTO {

    @NotNull(message = "ID người dùng không được để trống")
    private Long userId;

    @NotNull(message = "ID đơn hàng không được để trống")
    private Long orderId;

    private Long productId;

    private Long serviceId;

    @Min(value = 1, message = "Điểm đánh giá tối thiểu là 1 sao")
    @Max(value = 5, message = "Điểm đánh giá tối đa là 5 sao")
    private Integer productRating;

    @NotNull(message = "Điểm đánh giá dịch vụ không được để trống")
    @Min(value = 1, message = "Điểm đánh giá tối thiểu là 1 sao")
    @Max(value = 5, message = "Điểm đánh giá tối đa là 5 sao")
    private Integer serviceRating;

    private String content;

    private String images;
}
