package com.example.dienlanh.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryUpdateDTO {

    @NotBlank(message = "Tên danh mục không được để trống")
    private String name;

    private String description;

    private String image;
}
