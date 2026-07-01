package com.example.dienlanh.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostUpdateDTO {

    @NotBlank(message = "Tiêu đề bài viết không được để trống")
    private String title;

    private String content;

    @NotBlank(message = "Link hình ảnh/video không được để trống")
    private String mediaUrl;

    @NotBlank(message = "Loại media (IMAGE/VIDEO) không được để trống")
    private String mediaType;
}
