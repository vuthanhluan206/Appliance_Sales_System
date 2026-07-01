 package com.example.dienlanh.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.dienlanh.dto.TechnicianResponseDTO;
import com.example.dienlanh.dto.request.TechnicianCreateDTO;
import com.example.dienlanh.dto.request.TechnicianUpdateDTO;
import com.example.dienlanh.helper.exception.ResourceNotFoundException;
import com.example.dienlanh.model.Technician;
import com.example.dienlanh.model.Technician.TechnicianSpecialty;
import com.example.dienlanh.model.Technician.TechnicianStatus;
import com.example.dienlanh.model.User;
import com.example.dienlanh.repository.TechnicianRepository;
import com.example.dienlanh.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TechnicianService {
    private final TechnicianRepository technicianRepository;
    private final UserRepository userRepository;

    public TechnicianResponseDTO convertToDTO(Technician tech) {
        return TechnicianResponseDTO.builder()
                .id(tech.getId())
                .userId(tech.getUser() != null ? tech.getUser().getId() : null)
                .userName(tech.getUser() != null ? tech.getUser().getName() : null)
                .name(tech.getName())
                .phone(tech.getPhone())
                .address(tech.getAddress())
                .specialty(tech.getSpecialty() != null ? tech.getSpecialty().name() : null)
                .status(tech.getStatus() != null ? tech.getStatus().name() : null)
                .rating(tech.getRating())
                .totalJobs(tech.getTotalJobs())
                .createdAt(tech.getCreatedAt())
                .updatedAt(tech.getUpdatedAt())
                .build();
    }

    public List<TechnicianResponseDTO> getAllTechnicians() {
        return this.technicianRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public TechnicianResponseDTO getTechnicianById(Long id) {
        Technician tech = this.technicianRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found with id: " + id));
        return convertToDTO(tech);
    }

    public TechnicianResponseDTO createTechnician(TechnicianCreateDTO input) {
        User user = this.userRepository.findById(input.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + input.getUserId()));

        if (this.technicianRepository.findByUserId(input.getUserId()).isPresent()) {
            throw new ResourceNotFoundException("Kỹ thuật viên cho người dùng này đã tồn tại.");
        }

        Technician tech = new Technician();
        tech.setUser(user);
        tech.setName(input.getName());
        tech.setPhone(input.getPhone());
        tech.setAddress(input.getAddress());
        tech.setSpecialty(TechnicianSpecialty.valueOf(input.getSpecialty()));
        
        if (input.getStatus() != null) {
            tech.setStatus(TechnicianStatus.valueOf(input.getStatus()));
        } else {
            tech.setStatus(TechnicianStatus.ACTIVE);
        }
        
        tech.setRating(0.0);
        tech.setTotalJobs(0);

        this.technicianRepository.save(tech);
        return convertToDTO(tech);
    }

    public TechnicianResponseDTO updateTechnician(Long id, TechnicianUpdateDTO input) {
        Technician tech = this.technicianRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found with id: " + id));

        tech.setName(input.getName());
        tech.setPhone(input.getPhone());
        tech.setAddress(input.getAddress());
        tech.setSpecialty(TechnicianSpecialty.valueOf(input.getSpecialty()));
        
        if (input.getStatus() != null) {
            tech.setStatus(TechnicianStatus.valueOf(input.getStatus()));
        }

        this.technicianRepository.save(tech);
        return convertToDTO(tech);
    }

    public void deleteTechnician(Long id) {
        Technician tech = this.technicianRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found with id: " + id));
        this.technicianRepository.delete(tech);
    }
}
