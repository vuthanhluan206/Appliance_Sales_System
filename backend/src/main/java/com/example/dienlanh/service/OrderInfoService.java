package com.example.dienlanh.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.dienlanh.dto.OrderItemResponseDTO;
import com.example.dienlanh.dto.OrderResponseDTO;
import com.example.dienlanh.dto.request.OrderCreateDTO;
import com.example.dienlanh.dto.request.OrderItemCreateDTO;
import com.example.dienlanh.dto.request.OrderUpdateDTO;
import com.example.dienlanh.helper.exception.ResourceNotFoundException;
import com.example.dienlanh.model.Order;
import com.example.dienlanh.model.OrderItem;
import com.example.dienlanh.model.Product;
import com.example.dienlanh.model.User;
import com.example.dienlanh.repository.OrderItemRepository;
import com.example.dienlanh.repository.OrderRepository;
import com.example.dienlanh.repository.ProductRepository;
import com.example.dienlanh.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderInfoService {
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public OrderItemResponseDTO convertItemToDTO(OrderItem item) {
        return OrderItemResponseDTO.builder()
                .id(item.getId())
                .orderId(item.getOrder() != null ? item.getOrder().getId() : null)
                .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                .productName(item.getProduct() != null ? item.getProduct().getName() : null)
                .productPrice(item.getProduct() != null ? item.getProduct().getPrice() : null)
                .quantity(item.getQuantity())
                .price(item.getPrice())
                .subtotal(item.getSubtotal())
                .createdAt(item.getCreatedAt())
                .build();
    }

    public OrderResponseDTO convertToDTO(Order order) {
        List<OrderItemResponseDTO> items = order.getOrderItems() != null ? order.getOrderItems().stream()
                .map(this::convertItemToDTO)
                .collect(Collectors.toList()) : new ArrayList<>();

        return OrderResponseDTO.builder()
                .id(order.getId())
                .userId(order.getUser() != null ? order.getUser().getId() : null)
                .userName(order.getUser() != null ? order.getUser().getName() : null)
                .orderDate(order.getOrderDate())
                .status(order.getStatus() != null ? order.getStatus().name() : null)
                .totalPrice(order.getTotalPrice())
                .deliveryAddress(order.getDeliveryAddress())
                .notes(order.getNotes())
                .serviceType(order.getServiceType() != null ? order.getServiceType().name() : null)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .orderItems(items)
                .build();
    }

    public List<OrderResponseDTO> getAllOrders() {
        return this.orderRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<OrderResponseDTO> getOrdersByUserId(Long userId) {
        return this.orderRepository.findByUserId(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public OrderResponseDTO getOrderById(Long id) {
        Order order = this.orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        return convertToDTO(order);
    }

    @Transactional
    public OrderResponseDTO createOrder(OrderCreateDTO input) {
        User user = this.userRepository.findById(input.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + input.getUserId()));

        Order order = new Order();
        order.setUser(user);
        order.setDeliveryAddress(input.getDeliveryAddress());
        order.setNotes(input.getNotes());
        order.setServiceType(Order.ServiceType.valueOf(input.getServiceType()));
        order.setStatus(Order.OrderStatus.PENDING);

        BigDecimal totalPrice = input.getTotalPrice() != null ? input.getTotalPrice() : BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        // Save order first to get ID for items
        Order savedOrder = this.orderRepository.save(order);

        if (input.getOrderItems() != null) {
            for (OrderItemCreateDTO itemDTO : input.getOrderItems()) {
                Product product = this.productRepository.findById(itemDTO.getProductId())
                        .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemDTO.getProductId()));

                OrderItem item = new OrderItem();
                item.setOrder(savedOrder);
                item.setProduct(product);
                item.setQuantity(itemDTO.getQuantity());
                item.setPrice(product.getPrice());
                
                BigDecimal subtotal = product.getPrice().multiply(new BigDecimal(itemDTO.getQuantity()));
                item.setSubtotal(subtotal);
                
                if (input.getTotalPrice() == null) {
                    totalPrice = totalPrice.add(subtotal);
                }
                orderItems.add(item);
            }
        }

        this.orderItemRepository.saveAll(orderItems);
        savedOrder.setOrderItems(orderItems);
        savedOrder.setTotalPrice(totalPrice);

        this.orderRepository.save(savedOrder);
        return convertToDTO(savedOrder);
    }

    @Transactional
    public OrderResponseDTO updateOrder(Long id, OrderUpdateDTO input) {
        Order order = this.orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        if (input.getStatus() != null) {
            order.setStatus(Order.OrderStatus.valueOf(input.getStatus()));
        }
        if (input.getDeliveryAddress() != null) {
            order.setDeliveryAddress(input.getDeliveryAddress());
        }
        if (input.getNotes() != null) {
            order.setNotes(input.getNotes());
        }

        this.orderRepository.save(order);
        return convertToDTO(order);
    }

    @Transactional
    public void deleteOrder(Long id) {
        Order order = this.orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        this.orderRepository.delete(order);
    }
}
