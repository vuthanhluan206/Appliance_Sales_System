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

import com.example.dienlanh.dto.CartResponseDTO;
import com.example.dienlanh.dto.request.CartCreateDTO;
import com.example.dienlanh.dto.request.CartUpdateDTO;
import com.example.dienlanh.helper.json.ApiResponse;
import com.example.dienlanh.service.CartService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class CartController {
    private final CartService cartService;

    // Add item to cart
    @PostMapping("/cart/add")
    public ResponseEntity<ApiResponse<CartResponseDTO>> addToCart(@Valid @RequestBody CartCreateDTO input) {
        CartResponseDTO cartItem = this.cartService.addToCart(input);
        return ApiResponse.success(cartItem, "add item to cart successful");
    }

    // Get cart by user ID
    @GetMapping("/cart/user/{userId}")
    public ResponseEntity<ApiResponse<List<CartResponseDTO>>> getCartByUserId(@PathVariable Long userId) {
        List<CartResponseDTO> cartItems = this.cartService.getCartByUserId(userId);
        return ApiResponse.success(cartItems, "get cart items successful");
    }

    // Update cart item quantity
    @PutMapping("/cart/update/{id}")
    public ResponseEntity<ApiResponse<CartResponseDTO>> updateCartItem(@PathVariable Long id,
            @Valid @RequestBody CartUpdateDTO input) {
        CartResponseDTO cartItem = this.cartService.updateCartItem(id, input);
        return ApiResponse.success(cartItem, "update cart item successful");
    }

    // Delete item from cart
    @DeleteMapping("/cart/delete/{id}")
    public String deleteCartItem(@PathVariable Long id) {
        this.cartService.deleteCartItem(id);
        return "delete cart item successful";
    }

    // Clear cart for user
    @DeleteMapping("/cart/clear/{userId}")
    public String clearCart(@PathVariable Long userId) {
        this.cartService.clearCart(userId);
        return "clear cart successful";
    }
}
