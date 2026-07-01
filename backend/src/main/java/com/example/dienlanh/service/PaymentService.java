package com.example.dienlanh.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.dienlanh.dto.PaymentResponseDTO;
import com.example.dienlanh.dto.request.PaymentCreateDTO;
import com.example.dienlanh.dto.request.PaymentStatusUpdateDTO;
import com.example.dienlanh.helper.exception.ResourceNotFoundException;
import com.example.dienlanh.model.Order;
import com.example.dienlanh.model.Payment;
import com.example.dienlanh.model.Payment.PaymentMethod;
import com.example.dienlanh.model.Payment.PaymentStatus;
import com.example.dienlanh.repository.OrderRepository;
import com.example.dienlanh.repository.PaymentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    public PaymentResponseDTO convertToDTO(Payment payment) {
        return PaymentResponseDTO.builder()
                .id(payment.getId())
                .orderId(payment.getOrder() != null ? payment.getOrder().getId() : null)
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod() != null ? payment.getPaymentMethod().name() : null)
                .status(payment.getStatus() != null ? payment.getStatus().name() : null)
                .paymentDate(payment.getPaymentDate())
                .collectedBy(payment.getCollectedBy())
                .notes(payment.getNotes())
                .createdAt(payment.getCreatedAt())
                .updatedAt(payment.getUpdatedAt())
                .build();
    }

    public List<PaymentResponseDTO> getAllPayments() {
        return this.paymentRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public PaymentResponseDTO getPaymentById(Long id) {
        Payment payment = this.paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + id));
        return convertToDTO(payment);
    }

    public PaymentResponseDTO getPaymentByOrderId(Long orderId) {
        Payment payment = this.paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for order id: " + orderId));
        return convertToDTO(payment);
    }

    @Transactional
    public PaymentResponseDTO createPayment(PaymentCreateDTO input) {
        Order order = this.orderRepository.findById(input.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + input.getOrderId()));

        if (this.paymentRepository.findByOrderId(input.getOrderId()).isPresent()) {
            throw new ResourceNotFoundException("Thanh toán cho đơn hàng này đã tồn tại.");
        }

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setAmount(input.getAmount());
        payment.setPaymentMethod(PaymentMethod.valueOf(input.getPaymentMethod()));
        payment.setStatus(PaymentStatus.PENDING);
        payment.setCollectedBy(input.getCollectedBy());
        payment.setNotes(input.getNotes());

        this.paymentRepository.save(payment);
        return convertToDTO(payment);
    }

    @Transactional
    public PaymentResponseDTO updatePaymentStatus(Long id, PaymentStatusUpdateDTO input) {
        Payment payment = this.paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + id));

        PaymentStatus newStatus = PaymentStatus.valueOf(input.getStatus());
        payment.setStatus(newStatus);
        
        if (newStatus == PaymentStatus.COMPLETED) {
            payment.setPaymentDate(LocalDateTime.now());
        }

        this.paymentRepository.save(payment);
        return convertToDTO(payment);
    }

    @Transactional
    public void deletePayment(Long id) {
        Payment payment = this.paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + id));
        this.paymentRepository.delete(payment);
    }
}
