package com.example.dienlanh.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.dienlanh.dto.TransactionResponseDTO;
import com.example.dienlanh.dto.request.TransactionCreateDTO;
import com.example.dienlanh.helper.json.ApiResponse;
import com.example.dienlanh.service.TransactionService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class TransactionController {
    private final TransactionService transactionService;

    // Create Transaction
    @PostMapping("/createTransaction")
    public ResponseEntity<ApiResponse<TransactionResponseDTO>> createTransaction(
            @Valid @RequestBody TransactionCreateDTO input) {
        TransactionResponseDTO created = this.transactionService.createTransaction(input);
        return ApiResponse.success(created, "create transaction successful");
    }

    // Get all transactions
    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<List<TransactionResponseDTO>>> getAllTransactions() {
        List<TransactionResponseDTO> list = this.transactionService.getAllTransactions();
        return ApiResponse.success(list, "get all transactions successful");
    }

    // Get transaction by id
    @GetMapping("/getTransaction/{id}")
    public ResponseEntity<ApiResponse<TransactionResponseDTO>> getTransactionByID(@PathVariable Long id) {
        TransactionResponseDTO transaction = this.transactionService.getTransactionById(id);
        return ApiResponse.success(transaction, "get transaction by id successful");
    }

    // Get transactions by user id
    @GetMapping("/transactions/user/{userId}")
    public ResponseEntity<ApiResponse<List<TransactionResponseDTO>>> getTransactionsByUserID(
            @PathVariable Long userId) {
        List<TransactionResponseDTO> list = this.transactionService.getTransactionsByUserId(userId);
        return ApiResponse.success(list, "get transactions by user id successful");
    }
}
