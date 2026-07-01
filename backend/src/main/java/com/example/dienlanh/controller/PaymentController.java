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

import com.example.dienlanh.dto.PaymentResponseDTO;
import com.example.dienlanh.dto.request.PaymentCreateDTO;
import com.example.dienlanh.dto.request.PaymentStatusUpdateDTO;
import com.example.dienlanh.helper.json.ApiResponse;
import com.example.dienlanh.service.PaymentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService paymentService;

    // Create Payment
    @PostMapping("/createPayment")
    public ResponseEntity<ApiResponse<PaymentResponseDTO>> createPayment(@Valid @RequestBody PaymentCreateDTO input) {
        PaymentResponseDTO created = this.paymentService.createPayment(input);
        return ApiResponse.success(created, "create payment successful");
    }

    // Get all payments
    @GetMapping("/payments")
    public ResponseEntity<ApiResponse<List<PaymentResponseDTO>>> getAllPayments() {
        List<PaymentResponseDTO> list = this.paymentService.getAllPayments();
        return ApiResponse.success(list, "get all payments successful");
    }

    // Get payment by id
    @GetMapping("/getPayment/{id}")
    public ResponseEntity<ApiResponse<PaymentResponseDTO>> getPaymentByID(@PathVariable Long id) {
        PaymentResponseDTO payment = this.paymentService.getPaymentById(id);
        return ApiResponse.success(payment, "get payment by id successful");
    }

    // Get payment by order id
    @GetMapping("/payment/order/{orderId}")
    public ResponseEntity<ApiResponse<PaymentResponseDTO>> getPaymentByOrderID(@PathVariable Long orderId) {
        PaymentResponseDTO payment = this.paymentService.getPaymentByOrderId(orderId);
        return ApiResponse.success(payment, "get payment by order id successful");
    }

    // Update payment status by id
    @PutMapping("/updatePaymentStatus/{id}")
    public ResponseEntity<ApiResponse<PaymentResponseDTO>> updatePaymentStatus(@PathVariable Long id,
            @Valid @RequestBody PaymentStatusUpdateDTO input) {
        PaymentResponseDTO updated = this.paymentService.updatePaymentStatus(id, input);
        return ApiResponse.success(updated, "update payment status successful");
    }

    // Delete payment by id
    @DeleteMapping("/deletePayment/{id}")
    public String deletePayment(@PathVariable Long id) {
        this.paymentService.deletePayment(id);
        return "delete payment successful";
    }
}
