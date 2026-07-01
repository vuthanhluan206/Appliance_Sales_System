package com.example.dienlanh.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TechnicianResponseDTO {

    private Long id;
    private Long userId;
    private String userName;
    private String name;
    private String phone;
    private String address;
    private String specialty; // INSTALLATION, REPAIR, BOTH
    private String status; // ACTIVE, ON_LEAVE, INACTIVE
    private Double rating;
    private Integer totalJobs;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
