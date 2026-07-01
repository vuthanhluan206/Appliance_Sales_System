package com.example.dienlanh.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.dienlanh.dto.OrderServiceResponseDTO;
import com.example.dienlanh.dto.request.OrderServiceCreateDTO;
import com.example.dienlanh.helper.exception.ResourceNotFoundException;
import com.example.dienlanh.model.Order;
import com.example.dienlanh.model.OrderService;
import com.example.dienlanh.repository.OrderRepository;
import com.example.dienlanh.repository.OrderServiceRepository;
import com.example.dienlanh.repository.ServiceRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderServiceService {
    private final OrderServiceRepository orderServiceRepository;
    private final OrderRepository orderRepository;
    private final ServiceRepository serviceRepository;

    public OrderServiceResponseDTO convertToDTO(OrderService orderService) {
        return OrderServiceResponseDTO.builder()
                .id(orderService.getId())
                .orderId(orderService.getOrder() != null ? orderService.getOrder().getId() : null)
                .serviceId(orderService.getService() != null ? orderService.getService().getId() : null)
                .serviceName(orderService.getService() != null ? orderService.getService().getName() : null)
                .servicePrice(orderService.getServicePrice())
                .notes(orderService.getNotes())
                .createdAt(orderService.getCreatedAt())
                .updatedAt(orderService.getUpdatedAt())
                .build();
    }

    public List<OrderServiceResponseDTO> getOrderServicesByOrderId(Long orderId) {
        return this.orderServiceRepository.findByOrderId(orderId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderServiceResponseDTO addServiceToOrder(OrderServiceCreateDTO input) {
        Order order = this.orderRepository.findById(input.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + input.getOrderId()));

        com.example.dienlanh.model.Service service = this.serviceRepository.findById(input.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + input.getServiceId()));

        OrderService orderService = new OrderService();
        orderService.setOrder(order);
        orderService.setService(service);
        orderService.setServicePrice(service.getBasePrice());
        orderService.setNotes(input.getNotes());

        this.orderServiceRepository.save(orderService);
        return convertToDTO(orderService);
    }

    @Transactional
    public void removeServiceFromOrder(Long id) {
        OrderService orderService = this.orderServiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order service link not found with id: " + id));
        this.orderServiceRepository.delete(orderService);
    }
}
