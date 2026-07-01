package com.example.dienlanh.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.dienlanh.dto.CartResponseDTO;
import com.example.dienlanh.dto.request.CartCreateDTO;
import com.example.dienlanh.dto.request.CartUpdateDTO;
import com.example.dienlanh.helper.exception.ResourceNotFoundException;
import com.example.dienlanh.model.Cart;
import com.example.dienlanh.model.Product;
import com.example.dienlanh.model.User;
import com.example.dienlanh.repository.CartRepository;
import com.example.dienlanh.repository.ProductRepository;
import com.example.dienlanh.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CartService {
    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public CartResponseDTO convertToDTO(Cart cart) {
        return CartResponseDTO.builder()
                .id(cart.getId())
                .userId(cart.getUser() != null ? cart.getUser().getId() : null)
                .userName(cart.getUser() != null ? cart.getUser().getName() : null)
                .productId(cart.getProduct() != null ? cart.getProduct().getId() : null)
                .productName(cart.getProduct() != null ? cart.getProduct().getName() : null)
                .quantity(cart.getQuantity())
                .createdAt(cart.getCreatedAt())
                .updatedAt(cart.getUpdatedAt())
                .build();
    }

    public List<CartResponseDTO> getCartByUserId(Long userId) {
        List<CartResponseDTO> cartItems = this.cartRepository.findByUserId(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return cartItems;
    }

    @Transactional
    public CartResponseDTO addToCart(CartCreateDTO input) {
        User user = this.userRepository.findById(input.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + input.getUserId()));

        Product product = this.productRepository.findById(input.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + input.getProductId()));

        Optional<Cart> existingCartItem = this.cartRepository.findByUserIdAndProductId(input.getUserId(), input.getProductId());

        Cart cart;
        if (existingCartItem.isPresent()) {
            cart = existingCartItem.get();
            cart.setQuantity(cart.getQuantity() + input.getQuantity());
        } else {
            cart = new Cart();
            cart.setUser(user);
            cart.setProduct(product);
            cart.setQuantity(input.getQuantity());
        }

        this.cartRepository.save(cart);
        return convertToDTO(cart);
    }

    @Transactional
    public CartResponseDTO updateCartItem(Long id, CartUpdateDTO input) {
        Cart cart = this.cartRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + id));

        cart.setQuantity(input.getQuantity());
        this.cartRepository.save(cart);
        return convertToDTO(cart);
    }

    @Transactional
    public void deleteCartItem(Long id) {
        Cart cart = this.cartRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + id));
        this.cartRepository.delete(cart);
    }

    @Transactional
    public void clearCart(Long userId) {
        this.cartRepository.deleteByUserId(userId);
    }
}
