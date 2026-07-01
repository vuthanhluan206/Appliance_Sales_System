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

import com.example.dienlanh.dto.DiscountResponseDTO;
import com.example.dienlanh.dto.request.DiscountCreateDTO;
import com.example.dienlanh.dto.request.DiscountUpdateDTO;
import com.example.dienlanh.helper.json.ApiResponse;
import com.example.dienlanh.service.DiscountService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class DiscountController {
    private final DiscountService discountService;

    // Create Discount Coupon
    @PostMapping("/createDiscount")
    public ResponseEntity<ApiResponse<DiscountResponseDTO>> createDiscount(@Valid @RequestBody DiscountCreateDTO input) {
        DiscountResponseDTO created = this.discountService.createDiscount(input);
        return ApiResponse.success(created, "create discount successful");
    }

    // Get all discounts
    @GetMapping("/discounts")
    public ResponseEntity<ApiResponse<List<DiscountResponseDTO>>> getAllDiscounts() {
        List<DiscountResponseDTO> list = this.discountService.getAllDiscounts();
        return ApiResponse.success(list, "get all discounts successful");
    }

    // Get discount by id
    @GetMapping("/getDiscount/{id}")
    public ResponseEntity<ApiResponse<DiscountResponseDTO>> getDiscountByID(@PathVariable Long id) {
        DiscountResponseDTO discount = this.discountService.getDiscountById(id);
        return ApiResponse.success(discount, "get discount by id successful");
    }

    // Get discount by code
    @GetMapping("/discount/code/{code}")
    public ResponseEntity<ApiResponse<DiscountResponseDTO>> getDiscountByCode(@PathVariable String code) {
        DiscountResponseDTO discount = this.discountService.getDiscountByCode(code);
        return ApiResponse.success(discount, "get discount by code successful");
    }

    // Update discount by id
    @PutMapping("/updateDiscount/{id}")
    public ResponseEntity<ApiResponse<DiscountResponseDTO>> updateDiscount(@PathVariable Long id,
            @Valid @RequestBody DiscountUpdateDTO input) {
        DiscountResponseDTO updated = this.discountService.updateDiscount(id, input);
        return ApiResponse.success(updated, "update discount successful");
    }

    // Delete discount by id
    @DeleteMapping("/deleteDiscount/{id}")
    public String deleteDiscount(@PathVariable Long id) {
        this.discountService.deleteDiscount(id);
        return "delete discount successful";
    }
}
