package com.example.dienlanh.service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.dienlanh.dto.ScheduleResponseDTO;
import com.example.dienlanh.dto.request.ScheduleCreateDTO;
import com.example.dienlanh.dto.request.ScheduleUpdateDTO;
import com.example.dienlanh.helper.exception.ResourceNotFoundException;
import com.example.dienlanh.model.Order;
import com.example.dienlanh.model.Schedule;
import com.example.dienlanh.model.Schedule.ScheduleStatus;
import com.example.dienlanh.model.Technician;
import com.example.dienlanh.repository.OrderRepository;
import com.example.dienlanh.repository.ScheduleRepository;
import com.example.dienlanh.repository.TechnicianRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ScheduleService {
    private final ScheduleRepository scheduleRepository;
    private final OrderRepository orderRepository;
    private final TechnicianRepository technicianRepository;

    public ScheduleResponseDTO convertToDTO(Schedule schedule) {
        return ScheduleResponseDTO.builder()
                .id(schedule.getId())
                .orderId(schedule.getOrder() != null ? schedule.getOrder().getId() : null)
                .technicianId(schedule.getTechnician() != null ? schedule.getTechnician().getId() : null)
                .technicianName(schedule.getTechnician() != null ? schedule.getTechnician().getName() : null)
                .appointmentDate(schedule.getAppointmentDate())
                .appointmentTime(schedule.getAppointmentTime())
                .status(schedule.getStatus() != null ? schedule.getStatus().name() : null)
                .notes(schedule.getNotes())
                .completedAt(schedule.getCompletedAt())
                .createdAt(schedule.getCreatedAt())
                .updatedAt(schedule.getUpdatedAt())
                .build();
    }

    public List<ScheduleResponseDTO> getAllSchedules() {
        return this.scheduleRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ScheduleResponseDTO getScheduleById(Long id) {
        Schedule schedule = this.scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found with id: " + id));
        return convertToDTO(schedule);
    }

    public List<ScheduleResponseDTO> getSchedulesByTechnicianId(Long technicianId) {
        // Thử tra cứu trực tiếp theo technician_id trước
        List<Schedule> schedules = new ArrayList<>(this.scheduleRepository.findByTechnicianId(technicianId));

        // Nếu không có kết quả, kiểm tra xem technicianId có phải là user_id không
        // (Frontend truyền currentUser.id = User ID, không phải Technician ID)
        if (schedules.isEmpty()) {
            this.technicianRepository.findByUserId(technicianId).ifPresent(tech ->
                schedules.addAll(this.scheduleRepository.findByTechnicianId(tech.getId()))
            );
        }

        return schedules.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ScheduleResponseDTO> getSchedulesByOrderId(Long orderId) {
        return this.scheduleRepository.findByOrderId(orderId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ScheduleResponseDTO createSchedule(ScheduleCreateDTO input) {
        Order order = this.orderRepository.findById(input.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + input.getOrderId()));

        Technician technician = this.technicianRepository.findById(input.getTechnicianId())
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found with id: " + input.getTechnicianId()));

        Schedule schedule = new Schedule();
        schedule.setOrder(order);
        schedule.setTechnician(technician);
        schedule.setAppointmentDate(input.getAppointmentDate());
        schedule.setAppointmentTime(input.getAppointmentTime());
        schedule.setStatus(ScheduleStatus.SCHEDULED);
        schedule.setNotes(input.getNotes());

        this.scheduleRepository.save(schedule);
        return convertToDTO(schedule);
    }

    @Transactional
    public ScheduleResponseDTO updateSchedule(Long id, ScheduleUpdateDTO input) {
        Schedule schedule = this.scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found with id: " + id));

        if (input.getTechnicianId() != null) {
            Technician technician = this.technicianRepository.findById(input.getTechnicianId())
                    .orElseThrow(() -> new ResourceNotFoundException("Technician not found with id: " + input.getTechnicianId()));
            schedule.setTechnician(technician);
        }

        if (input.getAppointmentDate() != null) {
            schedule.setAppointmentDate(input.getAppointmentDate());
        }

        if (input.getAppointmentTime() != null) {
            schedule.setAppointmentTime(input.getAppointmentTime());
        }

        if (input.getStatus() != null) {
            schedule.setStatus(ScheduleStatus.valueOf(input.getStatus()));
        }

        if (input.getNotes() != null) {
            schedule.setNotes(input.getNotes());
        }

        if (input.getCompletedAt() != null) {
            schedule.setCompletedAt(input.getCompletedAt());
        }

        this.scheduleRepository.save(schedule);
        return convertToDTO(schedule);
    }

    @Transactional
    public void deleteSchedule(Long id) {
        Schedule schedule = this.scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found with id: " + id));
        this.scheduleRepository.delete(schedule);
    }
}
