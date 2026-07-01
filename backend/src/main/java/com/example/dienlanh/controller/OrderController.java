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

import com.example.dienlanh.dto.OrderResponseDTO;
import com.example.dienlanh.dto.request.OrderCreateDTO;
import com.example.dienlanh.dto.request.OrderUpdateDTO;
import com.example.dienlanh.helper.json.ApiResponse;
import com.example.dienlanh.service.OrderInfoService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class OrderController {
    private final OrderInfoService orderInfoService;

    // Create Order
    @PostMapping("/createOrder")
    public ResponseEntity<ApiResponse<OrderResponseDTO>> createOrder(@Valid @RequestBody OrderCreateDTO input) {
        OrderResponseDTO createdOrder = this.orderInfoService.createOrder(input);
        return ApiResponse.success(createdOrder, "create order successful");
    }

    // Get all orders
    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<OrderResponseDTO>>> getAllOrders() {
        List<OrderResponseDTO> orders = this.orderInfoService.getAllOrders();
        return ApiResponse.success(orders, "get all orders successful");
    }

    // Get order by id
    @GetMapping("/getOrder/{id}")
    public ResponseEntity<ApiResponse<OrderResponseDTO>> getOrderByID(@PathVariable Long id) {
        OrderResponseDTO order = this.orderInfoService.getOrderById(id);
        return ApiResponse.success(order, "get order by id successful");
    }

    // Get orders by user id
    @GetMapping("/orders/user/{userId}")
    public ResponseEntity<ApiResponse<List<OrderResponseDTO>>> getOrdersByUserId(@PathVariable Long userId) {
        List<OrderResponseDTO> orders = this.orderInfoService.getOrdersByUserId(userId);
        return ApiResponse.success(orders, "get orders by user id successful");
    }

    // Update order by id
    @PutMapping("/updateOrder/{id}")
    public ResponseEntity<ApiResponse<OrderResponseDTO>> updateOrder(@PathVariable Long id,
            @Valid @RequestBody OrderUpdateDTO input) {
        OrderResponseDTO updatedOrder = this.orderInfoService.updateOrder(id, input);
        return ApiResponse.success(updatedOrder, "update order successful");
    }

    // Delete order by id
    @DeleteMapping("/deleteOrder/{id}")
    public String deleteOrder(@PathVariable Long id) {
        this.orderInfoService.deleteOrder(id);
        return "delete order successful";
    }
}
