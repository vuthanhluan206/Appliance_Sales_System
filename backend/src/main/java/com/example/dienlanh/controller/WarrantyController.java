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

import com.example.dienlanh.dto.WarrantyResponseDTO;
import com.example.dienlanh.dto.request.WarrantyCreateDTO;
import com.example.dienlanh.dto.request.WarrantyUpdateDTO;
import com.example.dienlanh.helper.json.ApiResponse;
import com.example.dienlanh.service.WarrantyService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class WarrantyController {
    private final WarrantyService warrantyService;

    // Create Warranty record
    @PostMapping("/createWarranty")
    public ResponseEntity<ApiResponse<WarrantyResponseDTO>> createWarranty(@Valid @RequestBody WarrantyCreateDTO input) {
        WarrantyResponseDTO created = this.warrantyService.createWarranty(input);
        return ApiResponse.success(created, "create warranty successful");
    }

    // Get all warranties
    @GetMapping("/warranties")
    public ResponseEntity<ApiResponse<List<WarrantyResponseDTO>>> getAllWarranties() {
        List<WarrantyResponseDTO> list = this.warrantyService.getAllWarranties();
        return ApiResponse.success(list, "get all warranties successful");
    }

    // Get warranty by id
    @GetMapping("/getWarranty/{id}")
    public ResponseEntity<ApiResponse<WarrantyResponseDTO>> getWarrantyByID(@PathVariable Long id) {
        WarrantyResponseDTO warranty = this.warrantyService.getWarrantyById(id);
        return ApiResponse.success(warranty, "get warranty by id successful");
    }

    // Get warranties by order id
    @GetMapping("/warranties/order/{orderId}")
    public ResponseEntity<ApiResponse<List<WarrantyResponseDTO>>> getWarrantiesByOrderID(@PathVariable Long orderId) {
        List<WarrantyResponseDTO> list = this.warrantyService.getWarrantiesByOrderId(orderId);
        return ApiResponse.success(list, "get warranties by order id successful");
    }

    // Update warranty by id
    @PutMapping("/updateWarranty/{id}")
    public ResponseEntity<ApiResponse<WarrantyResponseDTO>> updateWarranty(@PathVariable Long id,
            @Valid @RequestBody WarrantyUpdateDTO input) {
        WarrantyResponseDTO updated = this.warrantyService.updateWarranty(id, input);
        return ApiResponse.success(updated, "update warranty successful");
    }

    // Delete warranty by id
    @DeleteMapping("/deleteWarranty/{id}")
    public String deleteWarranty(@PathVariable Long id) {
        this.warrantyService.deleteWarranty(id);
        return "delete warranty successful";
    }
}
