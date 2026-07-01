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

import com.example.dienlanh.dto.ProductResponseDTO;
import com.example.dienlanh.dto.request.ProductCreateDTO;
import com.example.dienlanh.dto.request.ProductUpdateDTO;
import com.example.dienlanh.helper.json.ApiResponse;
import com.example.dienlanh.service.ProductService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;

    // create Product
    @PostMapping("/createProduct")
    public ResponseEntity<ApiResponse<ProductResponseDTO>> createProduct(@Valid @RequestBody ProductCreateDTO input) {
        ProductResponseDTO createdProduct = this.productService.createProduct(input);
        return ApiResponse.success(createdProduct, "create product successful");
    }

    // get all products
    @GetMapping("/products")
    public ResponseEntity<ApiResponse<List<ProductResponseDTO>>> getAllProducts() {
        List<ProductResponseDTO> products = this.productService.getAllProducts();
        return ApiResponse.success(products, "get all products successful");
    }

    // get product by id
    @GetMapping("/getProduct/{id}")
    public ResponseEntity<ApiResponse<ProductResponseDTO>> getProductByID(@PathVariable Long id) {
        ProductResponseDTO product = this.productService.getProductById(id);
        return ApiResponse.success(product, "get product by id successful");
    }

    // update product by id
    @PutMapping("/updateProduct/{id}")
    public ResponseEntity<ApiResponse<ProductResponseDTO>> updateProduct(@PathVariable Long id,
            @Valid @RequestBody ProductUpdateDTO input) {
        ProductResponseDTO updatedProduct = this.productService.updateProduct(id, input);
        return ApiResponse.success(updatedProduct, "update product successful");
    }

    // delete product by id
    @DeleteMapping("/deleteProduct/{id}")
    public String deleteProduct(@PathVariable Long id) {
        this.productService.deleteProduct(id);
        return "delete product successful";
    }
}
