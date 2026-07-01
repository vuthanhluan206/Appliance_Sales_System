package com.example.dienlanh.dto;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginHistoryResponseDTO {
    private Long id;
    private LocalDateTime loginTime;
    private String ipAddress;
    private String userAgent;
}
