package com.example.dienlanh.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.dienlanh.dto.ScheduleResponseDTO;
import com.example.dienlanh.dto.request.ScheduleCreateDTO;
import com.example.dienlanh.dto.request.ScheduleUpdateDTO;
import com.example.dienlanh.helper.json.ApiResponse;
import com.example.dienlanh.service.ScheduleService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class ScheduleController {
    private final ScheduleService scheduleService;

    // Create Schedule
    @PostMapping("/createSchedule")
    public ResponseEntity<ApiResponse<ScheduleResponseDTO>> createSchedule(@Valid @RequestBody ScheduleCreateDTO input) {
        ScheduleResponseDTO created = this.scheduleService.createSchedule(input);
        return ApiResponse.success(created, "create schedule successful");
    }

    // Get all schedules
    @GetMapping("/schedules")
    public ResponseEntity<ApiResponse<List<ScheduleResponseDTO>>> getAllSchedules() {
        List<ScheduleResponseDTO> list = this.scheduleService.getAllSchedules();
        return ApiResponse.success(list, "get all schedules successful");
    }

    // Get schedule by id
    @GetMapping("/getSchedule/{id}")
    public ResponseEntity<ApiResponse<ScheduleResponseDTO>> getScheduleByID(@PathVariable Long id) {
        ScheduleResponseDTO schedule = this.scheduleService.getScheduleById(id);
        return ApiResponse.success(schedule, "get schedule by id successful");
    }

    // Get schedules by technician id
    @GetMapping("/schedules/technician/{technicianId}")
    public ResponseEntity<ApiResponse<List<ScheduleResponseDTO>>> getSchedulesByTechnicianId(
            @PathVariable Long technicianId) {
        List<ScheduleResponseDTO> list = this.scheduleService.getSchedulesByTechnicianId(technicianId);
        return ApiResponse.success(list, "get schedules by technician id successful");
    }

    // Get schedules by order id
    @GetMapping("/schedules/order/{orderId}")
    public ResponseEntity<ApiResponse<List<ScheduleResponseDTO>>> getSchedulesByOrderId(@PathVariable Long orderId) {
        List<ScheduleResponseDTO> list = this.scheduleService.getSchedulesByOrderId(orderId);
        return ApiResponse.success(list, "get schedules by order id successful");
    }

    // Update schedule by id
    @PutMapping("/updateSchedule/{id}")
    public ResponseEntity<ApiResponse<ScheduleResponseDTO>> updateSchedule(@PathVariable Long id,
            @Valid @RequestBody ScheduleUpdateDTO input) {
        ScheduleResponseDTO updated = this.scheduleService.updateSchedule(id, input);
        return ApiResponse.success(updated, "update schedule successful");
    }

    // Delete schedule by id
    @DeleteMapping("/deleteSchedule/{id}")
    public String deleteSchedule(@PathVariable Long id) {
        this.scheduleService.deleteSchedule(id);
        return "delete schedule successful";
    }
}
