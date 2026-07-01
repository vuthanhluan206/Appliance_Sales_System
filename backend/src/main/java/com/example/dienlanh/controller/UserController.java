package com.example.dienlanh.controller;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.dienlanh.dto.UserResponseDTO;
import com.example.dienlanh.dto.request.UserCreateDTO;
import com.example.dienlanh.dto.request.UserUpdateDTO;
import com.example.dienlanh.helper.json.ApiResponse;
import com.example.dienlanh.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    // create User
    @PostMapping("/createUser")
    public ResponseEntity<ApiResponse<UserResponseDTO>> createUser(@Valid @RequestBody UserCreateDTO inCreateDTO) {
        UserResponseDTO CreateUser = this.userService.createUser(inCreateDTO);
        return ApiResponse.success(CreateUser, "create user successful");
    }

    // get all user
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponseDTO>>> getAllUser(Pageable pageable) {
        List<UserResponseDTO> users = this.userService.getAllUser(pageable);
        return ApiResponse.success(users, "get all user successful");
    }

    // get user by id
    @GetMapping("/getUser/{id}")
    public ResponseEntity<ApiResponse<UserResponseDTO>> getUserByID(@Valid @PathVariable Long id) {
        UserResponseDTO user = this.userService.getUserByID(id);
        return ApiResponse.success(user, "get user by id user successful");
    }

    // update User by id
    @PutMapping("/updateUser/{id}")
    public ResponseEntity<ApiResponse<UserResponseDTO>> updateUser(@Valid @PathVariable Long id,
            @RequestBody UserUpdateDTO inputUSer) {
        UserResponseDTO updateUser = this.userService.updateUserById(id, inputUSer);
        return ApiResponse.success(updateUser, "update User successful");
    }

    // delete User by id
    @DeleteMapping("/deleteUser/{id}")
    public String deleteUser(@PathVariable Long id) {
        this.userService.deleteUser(id);
        return "delete User seccessfull";
    }
}
