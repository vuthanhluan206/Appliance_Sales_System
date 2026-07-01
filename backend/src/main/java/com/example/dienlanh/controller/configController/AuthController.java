package com.example.dienlanh.controller.ConfigController;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.example.dienlanh.helper.json.ApiResponse;
import com.example.dienlanh.model.User;
import com.example.dienlanh.repository.UserRepository;
import com.example.dienlanh.service.JwtService;
import com.example.dienlanh.service.RefreshTokenService;
import com.example.dienlanh.service.UserService;
import com.example.dienlanh.dto.request.UserCreateDTO;
import com.example.dienlanh.dto.UserResponseDTO;
import com.example.dienlanh.dto.VerifyOtpDTO;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final RefreshTokenService refreshTokenService;
    private final UserService userService;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.example.dienlanh.service.EmailService emailService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");

        if (username == null || password == null) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, "Email và mật khẩu không được để trống.",
                    "MISSING_CREDENTIALS");
        }

        User user = userRepository.findByEmail(username).orElse(null);

        if (user == null || !passwordEncoder.matches(password, user.getPassword())) {
            return ApiResponse.error(HttpStatus.UNAUTHORIZED, "Sai tài khoản hoặc mật khẩu.", "AUTH_FAILED");
        }

        // Generate a new lastLoginToken on new login to invalidate old sessions
        String lastLoginToken = java.util.UUID.randomUUID().toString();
        user.setLastLoginToken(lastLoginToken);
        userRepository.save(user);

        JwtService.TokenResponse tokens = jwtService.createTokens(username, user.getRole().name(), lastLoginToken);

        UserResponseDTO userDTO = userService.convertToDTO(user);
        Map<String, Object> responseData = Map.of(
                "accessToken", tokens.accessToken(),
                "refreshToken", tokens.refreshToken(),
                "tokenType", tokens.tokenType(),
                "user", userDTO);

        return ApiResponse.success(responseData, "Đăng nhập thành công.");
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> request) {
        String requestRefreshToken = request.get("refresh_token");

        if (requestRefreshToken == null) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, "Refresh token không được để trống.", "MISSING_TOKEN");
        }

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(token -> {
                    if (!refreshTokenService.verifyExpiration(token)) {
                        return ApiResponse.error(HttpStatus.FORBIDDEN, "Refresh token đã hết hạn!", "TOKEN_EXPIRED");
                    }
                    User user = userRepository.findByEmail(token.getUsername())
                            .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng."));
                    // Reuse the existing lastLoginToken on refresh
                    JwtService.TokenResponse newTokens = jwtService.createTokens(token.getUsername(),
                            user.getRole().name(), user.getLastLoginToken());
                    return ApiResponse.success(newTokens, "Gia hạn Token thành công.");
                })
                .orElse(ApiResponse.error(HttpStatus.FORBIDDEN, "Refresh token không hợp lệ!", "INVALID_TOKEN"));
    }

    @PostMapping("/forgot-password/send-otp")
    public ResponseEntity<?> forgotPasswordSendOtp(@RequestBody String email) {
        if (email != null) {
            email = email.trim().replaceAll("^\"|\"$", "");
        }

        if (email == null || email.isEmpty()) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, "Email không được để trống.");
        }

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, "Email không tồn tại trên hệ thống.");
        }

        emailService.sendForgotPasswordOtpEmail(email);
        return ApiResponse.success(null, "Mã OTP khôi phục mật khẩu đã được gửi!");
    }

    @PostMapping("/forgot-password/reset")
    public ResponseEntity<?> forgotPasswordReset(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        String newPassword = request.get("newPassword");

        if (email == null || otp == null || newPassword == null) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, "Thiếu thông tin yêu cầu.");
        }

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, "Email không tồn tại trên hệ thống.");
        }

        try {
            boolean isValid = emailService.verifyForgotPasswordOtp(email, otp);
            if (!isValid) {
                return ApiResponse.error(HttpStatus.BAD_REQUEST, "Mã OTP không chính xác.");
            }
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, e.getMessage());
        }

        // Reset password
        user.setPassword(passwordEncoder.encode(newPassword));
        // Reset lastLoginToken to force logout other devices as a security precaution
        user.setLastLoginToken(java.util.UUID.randomUUID().toString());
        userRepository.save(user);

        return ApiResponse.success(null, "Đặt lại mật khẩu thành công!");
    }

    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse<Void>> sendOtp(@Valid @RequestBody String email) {
        this.userService.sentOtp(email);
        return ApiResponse.success(null);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<String>> verifyOtp(@RequestBody VerifyOtpDTO request) {
        boolean isValid = this.userService.verifyEmail(request.getEmail(), request.getOtp());
        if (!isValid) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, "OTP không chính xác!");
        }
        return ApiResponse.success("Xác thực thành công!");
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponseDTO>> register(@Valid @RequestBody UserCreateDTO request) {
        try {
            UserResponseDTO savedUser = userService.register(request);
            return ApiResponse.created(savedUser);
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refresh_token");
        if (refreshToken != null) {
            refreshTokenService.deleteByToken(refreshToken);
        }
        return ApiResponse.success(null, "Đăng xuất thành công.");
    }
}
