package com.example.dienlanh.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "technicians")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Technician {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String phone;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TechnicianSpecialty specialty; // INSTALLATION, REPAIR, BOTH

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TechnicianStatus status; // ACTIVE, ON_LEAVE, INACTIVE

    @Column(nullable = false)
    private Double rating; // 1-5 stars

    @Column(nullable = false)
    private Integer totalJobs; // Tổng số công việc đã thực hiện

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // Relationships
    @OneToMany(mappedBy = "technician", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Schedule> schedules;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (rating == null) {
            rating = 0.0;
        }
        if (totalJobs == null) {
            totalJobs = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum TechnicianSpecialty {
        INSTALLATION, REPAIR, BOTH
    }

    public enum TechnicianStatus {
        ACTIVE, ON_LEAVE, INACTIVE
    }
}
