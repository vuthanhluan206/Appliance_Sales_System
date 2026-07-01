package com.example.dienlanh.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "schedules")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Schedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "technician_id", nullable = false)
    private Technician technician;

    @Column(nullable = false)
    private LocalDateTime appointmentDate; // Ngày hẹn

    @Column(nullable = false)
    private String appointmentTime; // Giờ hẹn (ví dụ: "09:00" hoặc "09:00-11:00")

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ScheduleStatus status; // SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, RESCHEDULED

    @Column(columnDefinition = "TEXT")
    private String notes;

    private LocalDateTime completedAt; // Thời gian hoàn thành thực tế

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum ScheduleStatus {
        SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, RESCHEDULED
    }
}
