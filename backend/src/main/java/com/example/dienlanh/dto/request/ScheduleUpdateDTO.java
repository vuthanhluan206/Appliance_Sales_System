package com.example.dienlanh.dto.request;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleUpdateDTO {

    private Long technicianId;

    private LocalDateTime appointmentDate;

    private String appointmentTime;

    private String status; // SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, RESCHEDULED

    private String notes;

    private LocalDateTime completedAt;
}
