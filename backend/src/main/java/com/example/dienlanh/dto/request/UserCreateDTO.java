package com.example.dienlanh.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserCreateDTO {
    private String name;
    private String email;
    private String phone;
    private String password;
    private String address;
    private String role;
    private String status;
}
