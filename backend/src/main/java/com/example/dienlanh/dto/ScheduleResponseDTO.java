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
public class ScheduleResponseDTO {

    private Long id;
    private Long orderId;
    private Long technicianId;
    private String technicianName;
    private LocalDateTime appointmentDate;
    private String appointmentTime;
    private String status; // SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, RESCHEDULED
    private String notes;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
