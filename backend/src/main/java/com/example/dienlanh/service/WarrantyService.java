package com.example.dienlanh.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.dienlanh.dto.WarrantyResponseDTO;
import com.example.dienlanh.dto.request.WarrantyCreateDTO;
import com.example.dienlanh.dto.request.WarrantyUpdateDTO;
import com.example.dienlanh.helper.exception.ResourceNotFoundException;
import com.example.dienlanh.model.Order;
import com.example.dienlanh.model.Product;
import com.example.dienlanh.model.Warranty;
import com.example.dienlanh.model.Warranty.WarrantyStatus;
import com.example.dienlanh.model.Warranty.WarrantyType;
import com.example.dienlanh.repository.OrderRepository;
import com.example.dienlanh.repository.ProductRepository;
import com.example.dienlanh.repository.WarrantyRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WarrantyService {
    private final WarrantyRepository warrantyRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public WarrantyResponseDTO convertToDTO(Warranty warranty) {
        return WarrantyResponseDTO.builder()
                .id(warranty.getId())
                .orderId(warranty.getOrder() != null ? warranty.getOrder().getId() : null)
                .productId(warranty.getProduct() != null ? warranty.getProduct().getId() : null)
                .productName(warranty.getProduct() != null ? warranty.getProduct().getName() : null)
                .startDate(warranty.getStartDate())
                .endDate(warranty.getEndDate())
                .warrantyType(warranty.getWarrantyType() != null ? warranty.getWarrantyType().name() : null)
                .status(warranty.getStatus() != null ? warranty.getStatus().name() : null)
                .conditions(warranty.getConditions())
                .createdAt(warranty.getCreatedAt())
                .updatedAt(warranty.getUpdatedAt())
                .build();
    }

    public List<WarrantyResponseDTO> getAllWarranties() {
        return this.warrantyRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public WarrantyResponseDTO getWarrantyById(Long id) {
        Warranty warranty = this.warrantyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warranty not found with id: " + id));
        return convertToDTO(warranty);
    }

    public List<WarrantyResponseDTO> getWarrantiesByOrderId(Long orderId) {
        return this.warrantyRepository.findByOrderId(orderId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public WarrantyResponseDTO createWarranty(WarrantyCreateDTO input) {
        Order order = this.orderRepository.findById(input.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + input.getOrderId()));

        Product product = this.productRepository.findById(input.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + input.getProductId()));

        Warranty warranty = new Warranty();
        warranty.setOrder(order);
        warranty.setProduct(product);
        warranty.setStartDate(input.getStartDate());
        warranty.setEndDate(input.getEndDate());
        warranty.setWarrantyType(WarrantyType.valueOf(input.getWarrantyType()));
        warranty.setStatus(WarrantyStatus.ACTIVE);
        warranty.setConditions(input.getConditions());

        this.warrantyRepository.save(warranty);
        return convertToDTO(warranty);
    }

    @Transactional
    public WarrantyResponseDTO updateWarranty(Long id, WarrantyUpdateDTO input) {
        Warranty warranty = this.warrantyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warranty not found with id: " + id));

        if (input.getStartDate() != null) {
            warranty.setStartDate(input.getStartDate());
        }
        if (input.getEndDate() != null) {
            warranty.setEndDate(input.getEndDate());
        }
        if (input.getWarrantyType() != null) {
            warranty.setWarrantyType(WarrantyType.valueOf(input.getWarrantyType()));
        }
        if (input.getStatus() != null) {
            warranty.setStatus(WarrantyStatus.valueOf(input.getStatus()));
        }
        if (input.getConditions() != null) {
            warranty.setConditions(input.getConditions());
        }

        this.warrantyRepository.save(warranty);
        return convertToDTO(warranty);
    }

    @Transactional
    public void deleteWarranty(Long id) {
        Warranty warranty = this.warrantyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warranty not found with id: " + id));
        this.warrantyRepository.delete(warranty);
    }
}
