package com.example.dienlanh.service;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.example.dienlanh.model.RefreshToken;
import com.example.dienlanh.repository.RefreshTokenRepository;

import jakarta.transaction.Transactional;
import lombok.Data;

@Service
@Data
public class RefreshTokenService {
    private final RefreshTokenRepository refreshTokenRepository;
    private final long refreshTokenDurationMs = 1000L * 60 * 60 * 24 * 7;

    @Transactional
    public RefreshToken createRefreshToken(String username) {
        refreshTokenRepository.deleteByUsername(username); // Xóa token cũ để tránh rác DB

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUsername(username);
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setExpiryDate(Instant.now().plusMillis(refreshTokenDurationMs));

        return refreshTokenRepository.save(refreshToken);
    }

    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    public boolean verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
            refreshTokenRepository.delete(token);
            return false;
        }
        return true;
    }

    @Transactional
    public void deleteByToken(String token) {
        refreshTokenRepository.findByToken(token).ifPresent(refreshTokenRepository::delete);
    }
}
