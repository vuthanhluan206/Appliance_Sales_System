package com.example.dienlanh.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.dienlanh.dto.LoginHistoryResponseDTO;
import com.example.dienlanh.model.LoginHistory;
import com.example.dienlanh.model.User;
import com.example.dienlanh.repository.LoginHistoryRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LoginHistoryService {
    private final LoginHistoryRepository loginHistoryRepository;

    @Transactional
    public void recordLogin(User user, String ipAddress, String userAgent) {
        LoginHistory history = new LoginHistory();
        history.setUser(user);
        history.setLoginTime(LocalDateTime.now());
        if ("0:0:0:0:0:0:0:1".equals(ipAddress)) {
            ipAddress = "127.0.0.1";
        }
        history.setIpAddress(ipAddress);
        history.setUserAgent(userAgent);
        loginHistoryRepository.save(history);
    }

    public List<LoginHistoryResponseDTO> getLoginHistory(User user) {
        return loginHistoryRepository.findByUserOrderByLoginTimeDesc(user).stream()
                .map(history -> LoginHistoryResponseDTO.builder()
                        .id(history.getId())
                        .loginTime(history.getLoginTime())
                        .ipAddress(history.getIpAddress())
                        .userAgent(history.getUserAgent())
                        .build())
                .collect(Collectors.toList());
    }
}
