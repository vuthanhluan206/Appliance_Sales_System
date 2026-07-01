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
import com.example.dienlanh.dto.LoginHistoryResponseDTO;
import com.example.dienlanh.dto.request.UserCreateDTO;
import com.example.dienlanh.dto.request.UserUpdateDTO;
import com.example.dienlanh.helper.json.ApiResponse;
import com.example.dienlanh.service.UserService;
import com.example.dienlanh.service.LoginHistoryService;
import com.example.dienlanh.repository.UserRepository;
import com.example.dienlanh.helper.exception.ResourceNotFoundException;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final UserRepository userRepository;
    private final LoginHistoryService loginHistoryService;

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

    // Get current user's login history
    @GetMapping("/api/user/login-history")
    public ResponseEntity<ApiResponse<List<LoginHistoryResponseDTO>>> getMyLoginHistory(
            org.springframework.security.core.Authentication authentication) {
        if (authentication == null) {
            return ApiResponse.error(org.springframework.http.HttpStatus.UNAUTHORIZED, "Chưa đăng nhập.");
        }
        String email = authentication.getName();
        com.example.dienlanh.model.User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        List<LoginHistoryResponseDTO> history = loginHistoryService.getLoginHistory(user);
        return ApiResponse.success(history, "Lấy lịch sử đăng nhập thành công.");
    }

    // Get specific user's login history (Admin only)
    @GetMapping("/api/admin/user/{userId}/login-history")
    public ResponseEntity<ApiResponse<List<LoginHistoryResponseDTO>>> getUserLoginHistory(
            @PathVariable Long userId) {
        com.example.dienlanh.model.User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        List<LoginHistoryResponseDTO> history = loginHistoryService.getLoginHistory(user);
        return ApiResponse.success(history, "Lấy lịch sử đăng nhập của người dùng thành công.");
    }
}
