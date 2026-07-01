package com.example.dienlanh.service;

import java.time.Instant;

import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import com.example.dienlanh.model.RefreshToken;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class JwtService {
    private final JwtEncoder jwtEncoder;
    private final RefreshTokenService refreshTokenService;

    // Định nghĩa Record làm cấu trúc trả về ngay trong Service
    public record TokenResponse(String accessToken, String refreshToken, String tokenType) {
    }

    // Chuyển hàm tạo Token về đúng vị trí của nó
    public TokenResponse createTokens(String username, String role, String lastLoginToken) {
        Instant now = Instant.now();

        // 1. Tạo Access Token (JWT) sống 15 phút
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("self")
                .issuedAt(now)
                .expiresAt(now.plusSeconds(900))
                .subject(username)
                .claim("scope", role)
                .claim("lastLoginToken", lastLoginToken)
                .build();

        JwtEncoderParameters parameters = JwtEncoderParameters.from(
                JwsHeader.with(MacAlgorithm.HS256).build(), claims);

        String accessToken = this.jwtEncoder.encode(parameters).getTokenValue();

        // 2. Tạo Refresh Token lưu xuống MySQL
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(username);

        // 3. Trả về Object đóng gói sạch sẽ
        return new TokenResponse(accessToken, refreshToken.getToken(), "Bearer");
    }
}
