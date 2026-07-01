package com.example.dienlanh.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.dienlanh.dto.DiscountResponseDTO;
import com.example.dienlanh.dto.request.DiscountCreateDTO;
import com.example.dienlanh.dto.request.DiscountUpdateDTO;
import com.example.dienlanh.helper.exception.ResourceNotFoundException;
import com.example.dienlanh.model.Discount;
import com.example.dienlanh.model.Discount.DiscountStatus;
import com.example.dienlanh.model.Discount.DiscountType;
import com.example.dienlanh.repository.DiscountRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DiscountService {
    private final DiscountRepository discountRepository;

    public DiscountResponseDTO convertToDTO(Discount discount) {
        return DiscountResponseDTO.builder()
                .id(discount.getId())
                .code(discount.getCode())
                .discountValue(discount.getDiscountValue())
                .minOrderValue(discount.getMinOrderValue())
                .discountType(discount.getDiscountType() != null ? discount.getDiscountType().name() : null)
                .startDate(discount.getStartDate())
                .endDate(discount.getEndDate())
                .maxUsages(discount.getMaxUsages())
                .usedCount(discount.getUsedCount())
                .applicableConditions(discount.getApplicableConditions())
                .status(discount.getStatus() != null ? discount.getStatus().name() : null)
                .createdAt(discount.getCreatedAt())
                .updatedAt(discount.getUpdatedAt())
                .build();
    }

    public List<DiscountResponseDTO> getAllDiscounts() {
        return this.discountRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public DiscountResponseDTO getDiscountById(Long id) {
        Discount discount = this.discountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Discount not found with id: " + id));
        return convertToDTO(discount);
    }

    public DiscountResponseDTO getDiscountByCode(String code) {
        Discount discount = this.discountRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Discount not found with code: " + code));
        return convertToDTO(discount);
    }

    @Transactional
    public DiscountResponseDTO createDiscount(DiscountCreateDTO input) {
        if (this.discountRepository.findByCode(input.getCode()).isPresent()) {
            throw new ResourceNotFoundException("Mã giảm giá " + input.getCode() + " đã tồn tại.");
        }

        Discount discount = new Discount();
        discount.setCode(input.getCode());
        discount.setDiscountValue(input.getDiscountValue());
        discount.setMinOrderValue(input.getMinOrderValue());
        discount.setDiscountType(DiscountType.valueOf(input.getDiscountType()));
        discount.setStartDate(input.getStartDate());
        discount.setEndDate(input.getEndDate());
        discount.setMaxUsages(input.getMaxUsages());
        discount.setUsedCount(0);
        discount.setApplicableConditions(input.getApplicableConditions());
        
        if (input.getStatus() != null) {
            discount.setStatus(DiscountStatus.valueOf(input.getStatus()));
        } else {
            discount.setStatus(DiscountStatus.ACTIVE);
        }

        this.discountRepository.save(discount);
        return convertToDTO(discount);
    }

    @Transactional
    public DiscountResponseDTO updateDiscount(Long id, DiscountUpdateDTO input) {
        Discount discount = this.discountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Discount not found with id: " + id));

        if (!discount.getCode().equals(input.getCode()) && this.discountRepository.findByCode(input.getCode()).isPresent()) {
            throw new ResourceNotFoundException("Mã giảm giá " + input.getCode() + " đã tồn tại.");
        }

        discount.setCode(input.getCode());
        discount.setDiscountValue(input.getDiscountValue());
        discount.setMinOrderValue(input.getMinOrderValue());
        discount.setDiscountType(DiscountType.valueOf(input.getDiscountType()));
        discount.setStartDate(input.getStartDate());
        discount.setEndDate(input.getEndDate());
        discount.setMaxUsages(input.getMaxUsages());
        discount.setApplicableConditions(input.getApplicableConditions());
        
        if (input.getStatus() != null) {
            discount.setStatus(DiscountStatus.valueOf(input.getStatus()));
        }

        this.discountRepository.save(discount);
        return convertToDTO(discount);
    }

    @Transactional
    public void deleteDiscount(Long id) {
        Discount discount = this.discountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Discount not found with id: " + id));
        this.discountRepository.delete(discount);
    }
}
