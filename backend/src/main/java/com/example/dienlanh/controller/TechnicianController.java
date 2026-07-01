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

import com.example.dienlanh.dto.TechnicianResponseDTO;
import com.example.dienlanh.dto.request.TechnicianCreateDTO;
import com.example.dienlanh.dto.request.TechnicianUpdateDTO;
import com.example.dienlanh.helper.json.ApiResponse;
import com.example.dienlanh.service.TechnicianService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class TechnicianController {
    private final TechnicianService technicianService;

    // Create Technician
    @PostMapping("/createTechnician")
    public ResponseEntity<ApiResponse<TechnicianResponseDTO>> createTechnician(@Valid @RequestBody TechnicianCreateDTO input) {
        TechnicianResponseDTO created = this.technicianService.createTechnician(input);
        return ApiResponse.success(created, "create technician successful");
    }

    // Get all technicians
    @GetMapping("/technicians")
    public ResponseEntity<ApiResponse<List<TechnicianResponseDTO>>> getAllTechnicians() {
        List<TechnicianResponseDTO> list = this.technicianService.getAllTechnicians();
        return ApiResponse.success(list, "get all technicians successful");
    }

    // Get technician by id
    @GetMapping("/getTechnician/{id}")
    public ResponseEntity<ApiResponse<TechnicianResponseDTO>> getTechnicianByID(@PathVariable Long id) {
        TechnicianResponseDTO technician = this.technicianService.getTechnicianById(id);
        return ApiResponse.success(technician, "get technician by id successful");
    }

    // Update technician by id
    @PutMapping("/updateTechnician/{id}")
    public ResponseEntity<ApiResponse<TechnicianResponseDTO>> updateTechnician(@PathVariable Long id,
            @Valid @RequestBody TechnicianUpdateDTO input) {
        TechnicianResponseDTO updated = this.technicianService.updateTechnician(id, input);
        return ApiResponse.success(updated, "update technician successful");
    }

    // Delete technician by id
    @DeleteMapping("/deleteTechnician/{id}")
    public String deleteTechnician(@PathVariable Long id) {
        this.technicianService.deleteTechnician(id);
        return "delete technician successful";
    }
}
