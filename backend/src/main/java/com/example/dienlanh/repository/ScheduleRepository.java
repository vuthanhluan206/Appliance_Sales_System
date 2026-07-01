package com.example.dienlanh.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.dienlanh.model.Schedule;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    List<Schedule> findByTechnicianId(Long technicianId);

    List<Schedule> findByOrderId(Long orderId);
}
