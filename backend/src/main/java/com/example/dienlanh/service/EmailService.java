package com.example.dienlanh.service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Random;
import java.util.concurrent.CompletableFuture;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import com.example.dienlanh.helper.exception.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    private final RedisTemplate<String, String> redisTemplate;
    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Value("${otp.expiry.minutes:5}")
    private long otpExpiryMinutes;

    @Value("${resend.from-email:onboarding@resend.dev}")
    private String fromEmail;

    @Value("${resend.api-key:}")
    private String resendApiKey;

    // Gửi OTP — lưu vào Redis NGAY, gửi email qua HTTPS API bất đồng bộ
    public void sendOtpEmail(String email) {
        String otp = getOtp();
        log.info("==================================================");
        log.info("MÃ OTP ĐĂNG KÝ CHO EMAIL [ {} ] LÀ: [ {} ]", email, otp);
        log.info("==================================================");

        // Lưu OTP vào Redis đồng bộ để verifyOtp có thể đọc ngay
        redisTemplate.opsForValue().set(
                "otp:" + email,
                otp + ":" + System.currentTimeMillis(),
                Duration.ofMinutes(otpExpiryMinutes));

        // Gửi email bất đồng bộ — client không phải chờ API
        CompletableFuture.runAsync(() -> {
            try {
                sendEmailWithOtp(email, otp);
            } catch (Exception e) {
                log.error("Không thể gửi email OTP qua Resend API (lấy OTP từ console log để test): {}",
                        e.getMessage());
            }
        });
    }

    // Xác thực OTP
    public boolean verifyOtp(String email, String otp) {
        if (email == null || email.isEmpty()) {
            throw new IllegalArgumentException("Email không được để trống!");
        }
        if (otp == null || otp.isEmpty()) {
            throw new IllegalArgumentException("OTP không được để trống!");
        }

        String stored = redisTemplate.opsForValue().get("otp:" + email);
        if (stored == null) {
            throw new IllegalArgumentException("OTP hết hạn hoặc chưa được gửi!");
        }

        String[] parts = stored.split(":");
        String storedOtp = parts[0];
        long createdAt = Long.parseLong(parts[1]);

        if (System.currentTimeMillis() - createdAt > otpExpiryMinutes * 60 * 1000) {
            redisTemplate.delete("otp:" + email);
            throw new ResourceNotFoundException("OTP đã hết hạn");
        }
        if (!storedOtp.equals(otp)) {
            throw new ResourceNotFoundException("OTP không chính xác");
        }

        redisTemplate.delete("otp:" + email);
        return true;
    }

    private String getOtp() {
        return String.valueOf(100000 + new Random().nextInt(900000));
    }

    // Gửi OTP đến người đăng ký (private, dùng trong CompletableFuture)
    private void sendEmailWithOtp(String email, String otp) {
        String subject = "Mã OTP xác nhận tài khoản";
        String content = "Mã OTP của bạn: " + otp +
                "\nCó hiệu lực trong " + otpExpiryMinutes + " phút";
        sendEmailViaResendApi(email, subject, content);
    }

    // Gửi email thông báo đăng ký thành công — bất đồng bộ
    public void sendSuccessEmail(String email) {
        CompletableFuture.runAsync(() -> {
            try {
                String subject = "Đăng ký tài khoản thành công!";
                String content = "Chào mừng bạn đến với Điện Lạnh Đông Triều 24H!\nTài khoản của bạn đã được xác thực và kích hoạt thành công.";
                sendEmailViaResendApi(email, subject, content);
            } catch (Exception e) {
                log.error("Không thể gửi email thông báo thành công qua Resend API: {}", e.getMessage());
            }
        });
    }

    // Hàm gọi Resend HTTPS API gửi email
    private void sendEmailViaResendApi(String to, String subject, String textContent) {
        if (resendApiKey == null || resendApiKey.trim().isEmpty()) {
            throw new IllegalStateException("RESEND_API_KEY chưa được cấu hình!");
        }

        try {
            // Xây dựng JSON thủ công để tránh xung đột phiên bản thư viện Jackson
            String jsonBody = "{"
                    + "\"from\":\"" + escapeJson(fromEmail) + "\","
                    + "\"to\":[\"" + escapeJson(to) + "\"],"
                    + "\"subject\":\"" + escapeJson(subject) + "\","
                    + "\"text\":\"" + escapeJson(textContent) + "\""
                    + "}";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.resend.com/emails"))
                    .header("Authorization", "Bearer " + resendApiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 300) {
                log.error("Gửi email qua Resend API thất bại. Status: {}, Response: {}", response.statusCode(),
                        response.body());
                throw new RuntimeException("Resend API response error status: " + response.statusCode());
            } else {
                log.info("Gửi email qua Resend API thành công! Response: {}", response.body());
            }
        } catch (Exception e) {
            log.error("Lỗi khi gửi email qua Resend API: {}", e.getMessage(), e);
            throw new RuntimeException(e);
        }
    }

    // Gửi OTP Quên Mật Khẩu
    public void sendForgotPasswordOtpEmail(String email) {
        String otp = getOtp();
        log.info("==================================================");
        log.info("MÃ OTP QUÊN MẬT KHẨU CHO EMAIL [ {} ] LÀ: [ {} ]", email, otp);
        log.info("==================================================");

        redisTemplate.opsForValue().set(
                "forgot-password-otp:" + email,
                otp + ":" + System.currentTimeMillis(),
                Duration.ofMinutes(otpExpiryMinutes));

        CompletableFuture.runAsync(() -> {
            try {
                String subject = "Mã OTP khôi phục mật khẩu";
                String content = "Mã OTP khôi phục mật khẩu của bạn: " + otp +
                        "\nCó hiệu lực trong " + otpExpiryMinutes + " phút.";
                sendEmailViaResendApi(email, subject, content);
            } catch (Exception e) {
                log.error("Không thể gửi email OTP quên mật khẩu qua Resend API (lấy OTP từ console log để test): {}",
                        e.getMessage());
            }
        });
    }

    // Xác thực OTP Quên Mật Khẩu
    public boolean verifyForgotPasswordOtp(String email, String otp) {
        if (email == null || email.isEmpty()) {
            throw new IllegalArgumentException("Email không được để trống!");
        }
        if (otp == null || otp.isEmpty()) {
            throw new IllegalArgumentException("OTP không được để trống!");
        }

        String stored = redisTemplate.opsForValue().get("forgot-password-otp:" + email);
        if (stored == null) {
            throw new IllegalArgumentException("OTP khôi phục mật khẩu hết hạn hoặc chưa được gửi!");
        }

        String[] parts = stored.split(":");
        String storedOtp = parts[0];
        long createdAt = Long.parseLong(parts[1]);

        if (System.currentTimeMillis() - createdAt > otpExpiryMinutes * 60 * 1000) {
            redisTemplate.delete("forgot-password-otp:" + email);
            throw new ResourceNotFoundException("OTP đã hết hạn");
        }
        if (!storedOtp.equals(otp)) {
            throw new ResourceNotFoundException("OTP không chính xác");
        }

        redisTemplate.delete("forgot-password-otp:" + email);
        return true;
    }

    // Hàm escape ký tự đặc biệt cho chuỗi JSON
    private String escapeJson(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\b", "\\b")
                .replace("\f", "\\f")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }
}
