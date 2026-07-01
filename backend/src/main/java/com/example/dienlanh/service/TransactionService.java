package com.example.dienlanh.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.dienlanh.dto.TransactionResponseDTO;
import com.example.dienlanh.dto.request.TransactionCreateDTO;
import com.example.dienlanh.helper.exception.ResourceNotFoundException;
import com.example.dienlanh.model.Order;
import com.example.dienlanh.model.Transaction;
import com.example.dienlanh.model.Transaction.TransactionStatus;
import com.example.dienlanh.model.Transaction.TransactionType;
import com.example.dienlanh.model.User;
import com.example.dienlanh.repository.OrderRepository;
import com.example.dienlanh.repository.TransactionRepository;
import com.example.dienlanh.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TransactionService {
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    public TransactionResponseDTO convertToDTO(Transaction trans) {
        return TransactionResponseDTO.builder()
                .id(trans.getId())
                .userId(trans.getUser() != null ? trans.getUser().getId() : null)
                .userName(trans.getUser() != null ? trans.getUser().getName() : null)
                .orderId(trans.getOrder() != null ? trans.getOrder().getId() : null)
                .type(trans.getType() != null ? trans.getType().name() : null)
                .amount(trans.getAmount())
                .status(trans.getStatus() != null ? trans.getStatus().name() : null)
                .description(trans.getDescription())
                .createdAt(trans.getCreatedAt())
                .updatedAt(trans.getUpdatedAt())
                .build();
    }

    public List<TransactionResponseDTO> getAllTransactions() {
        return this.transactionRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public TransactionResponseDTO getTransactionById(Long id) {
        Transaction trans = this.transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));
        return convertToDTO(trans);
    }

    public List<TransactionResponseDTO> getTransactionsByUserId(Long userId) {
        return this.transactionRepository.findByUserId(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public TransactionResponseDTO createTransaction(TransactionCreateDTO input) {
        User user = this.userRepository.findById(input.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + input.getUserId()));

        Order order = null;
        if (input.getOrderId() != null) {
            order = this.orderRepository.findById(input.getOrderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + input.getOrderId()));
        }

        Transaction trans = new Transaction();
        trans.setUser(user);
        trans.setOrder(order);
        trans.setType(TransactionType.valueOf(input.getType()));
        trans.setAmount(input.getAmount());
        trans.setStatus(TransactionStatus.COMPLETED); // Defaulting to COMPLETED for simple ledger transactions
        trans.setDescription(input.getDescription());

        this.transactionRepository.save(trans);
        return convertToDTO(trans);
    }
}
