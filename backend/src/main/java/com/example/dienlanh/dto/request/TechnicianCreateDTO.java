package com.example.dienlanh.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TechnicianCreateDTO {

    @NotNull(message = "ID người dùng không được để trống")
    private Long userId;

    @NotBlank(message = "Tên kỹ thuật viên không được để trống")
    private String name;

    @NotBlank(message = "Số điện thoại không được để trống")
    private String phone;

    private String address;

    @NotBlank(message = "Chuyên môn không được để trống")
    private String specialty; // INSTALLATION, REPAIR, BOTH

    private String status; // ACTIVE, ON_LEAVE, INACTIVE
}
