package com.example.dienlanh.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateDTO {
    private String name;
    private String email;
    private String phone;
    private String address;
    private String role;
    private String status;
}
