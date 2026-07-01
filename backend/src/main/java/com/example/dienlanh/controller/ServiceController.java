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

import com.example.dienlanh.dto.OrderServiceResponseDTO;
import com.example.dienlanh.dto.ServiceResponseDTO;
import com.example.dienlanh.dto.request.OrderServiceCreateDTO;
import com.example.dienlanh.dto.request.ServiceCreateDTO;
import com.example.dienlanh.dto.request.ServiceUpdateDTO;
import com.example.dienlanh.helper.json.ApiResponse;
import com.example.dienlanh.service.OrderServiceService;
import com.example.dienlanh.service.ServiceService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class ServiceController {
    private final ServiceService serviceService;
    private final OrderServiceService orderServiceService;

    // --- Service entity endpoints ---

    @PostMapping("/createService")
    public ResponseEntity<ApiResponse<ServiceResponseDTO>> createService(@Valid @RequestBody ServiceCreateDTO input) {
        ServiceResponseDTO created = this.serviceService.createService(input);
        return ApiResponse.success(created, "create service successful");
    }

    @GetMapping("/services")
    public ResponseEntity<ApiResponse<List<ServiceResponseDTO>>> getAllServices() {
        List<ServiceResponseDTO> services = this.serviceService.getAllServices();
        return ApiResponse.success(services, "get all services successful");
    }

    @GetMapping("/getService/{id}")
    public ResponseEntity<ApiResponse<ServiceResponseDTO>> getServiceByID(@PathVariable Long id) {
        ServiceResponseDTO service = this.serviceService.getServiceById(id);
        return ApiResponse.success(service, "get service by id successful");
    }

    @PutMapping("/updateService/{id}")
    public ResponseEntity<ApiResponse<ServiceResponseDTO>> updateService(@PathVariable Long id,
            @Valid @RequestBody ServiceUpdateDTO input) {
        ServiceResponseDTO updated = this.serviceService.updateService(id, input);
        return ApiResponse.success(updated, "update service successful");
    }

    @DeleteMapping("/deleteService/{id}")
    public String deleteService(@PathVariable Long id) {
        this.serviceService.deleteService(id);
        return "delete service successful";
    }

    // --- OrderService entity endpoints ---

    @PostMapping("/order/addService")
    public ResponseEntity<ApiResponse<OrderServiceResponseDTO>> addServiceToOrder(
            @Valid @RequestBody OrderServiceCreateDTO input) {
        OrderServiceResponseDTO added = this.orderServiceService.addServiceToOrder(input);
        return ApiResponse.success(added, "add service to order successful");
    }

    @GetMapping("/order/{orderId}/services")
    public ResponseEntity<ApiResponse<List<OrderServiceResponseDTO>>> getOrderServicesByOrderId(
            @PathVariable Long orderId) {
        List<OrderServiceResponseDTO> list = this.orderServiceService.getOrderServicesByOrderId(orderId);
        return ApiResponse.success(list, "get order services successful");
    }

    @DeleteMapping("/order/removeService/{id}")
    public String removeServiceFromOrder(@PathVariable Long id) {
        this.orderServiceService.removeServiceFromOrder(id);
        return "remove service from order successful";
    }
}
