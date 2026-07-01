package com.example.dienlanh.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.dienlanh.dto.ServiceResponseDTO;
import com.example.dienlanh.dto.request.ServiceCreateDTO;
import com.example.dienlanh.dto.request.ServiceUpdateDTO;
import com.example.dienlanh.helper.exception.ResourceNotFoundException;
import com.example.dienlanh.model.Service.ServiceStatus;
import com.example.dienlanh.repository.ServiceRepository;

import lombok.RequiredArgsConstructor;

@Service("appServiceService")
@RequiredArgsConstructor
public class ServiceService {
    private final ServiceRepository serviceRepository;

    public ServiceResponseDTO convertToDTO(com.example.dienlanh.model.Service service) {
        return ServiceResponseDTO.builder()
                .id(service.getId())
                .name(service.getName())
                .description(service.getDescription())
                .basePrice(service.getBasePrice())
                .estimatedHours(service.getEstimatedHours())
                .status(service.getStatus() != null ? service.getStatus().name() : null)
                .createdAt(service.getCreatedAt())
                .updatedAt(service.getUpdatedAt())
                .build();
    }

    public List<ServiceResponseDTO> getAllServices() {
        return this.serviceRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ServiceResponseDTO getServiceById(Long id) {
        com.example.dienlanh.model.Service service = this.serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + id));
        return convertToDTO(service);
    }

    public ServiceResponseDTO createService(ServiceCreateDTO input) {
        com.example.dienlanh.model.Service service = new com.example.dienlanh.model.Service();
        service.setName(input.getName());
        service.setDescription(input.getDescription());
        service.setBasePrice(input.getBasePrice());
        service.setEstimatedHours(input.getEstimatedHours());
        
        if (input.getStatus() != null) {
            service.setStatus(ServiceStatus.valueOf(input.getStatus()));
        } else {
            service.setStatus(ServiceStatus.ACTIVE);
        }

        this.serviceRepository.save(service);
        return convertToDTO(service);
    }

    public ServiceResponseDTO updateService(Long id, ServiceUpdateDTO input) {
        com.example.dienlanh.model.Service service = this.serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + id));

        service.setName(input.getName());
        service.setDescription(input.getDescription());
        service.setBasePrice(input.getBasePrice());
        service.setEstimatedHours(input.getEstimatedHours());
        
        if (input.getStatus() != null) {
            service.setStatus(ServiceStatus.valueOf(input.getStatus()));
        }

        this.serviceRepository.save(service);
        return convertToDTO(service);
    }

    public void deleteService(Long id) {
        com.example.dienlanh.model.Service service = this.serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + id));
        this.serviceRepository.delete(service);
    }
}
