package com.example.dienlanh.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.dienlanh.dto.ProductResponseDTO;
import com.example.dienlanh.dto.request.ProductCreateDTO;
import com.example.dienlanh.dto.request.ProductUpdateDTO;
import com.example.dienlanh.helper.exception.ResourceNotFoundException;
import com.example.dienlanh.model.Category;
import com.example.dienlanh.model.Product;
import com.example.dienlanh.repository.CategoryRepository;
import com.example.dienlanh.repository.ProductRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductResponseDTO convertToDTO(Product product) {
        return ProductResponseDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .image(product.getImage())
                .status(product.getStatus() != null ? product.getStatus().name() : null)
                .brand(product.getBrand())
                .yearManufactured(product.getYearManufactured())
                .warrantyMonths(product.getWarrantyMonths())
                .rating(product.getRating())
                .totalSold(product.getTotalSold())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }

    public List<ProductResponseDTO> getAllProducts() {
        return this.productRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ProductResponseDTO createProduct(ProductCreateDTO input) {
        Category category = this.categoryRepository.findById(input.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + input.getCategoryId()));

        Product product = new Product();
        product.setName(input.getName());
        product.setDescription(input.getDescription());
        product.setPrice(input.getPrice());
        product.setCategory(category);
        product.setImage(input.getImage());
        
        if (input.getStatus() != null) {
            product.setStatus(Product.ProductStatus.valueOf(input.getStatus()));
        } else {
            product.setStatus(Product.ProductStatus.AVAILABLE);
        }
        
        product.setBrand(input.getBrand());
        product.setYearManufactured(input.getYearManufactured());
        product.setWarrantyMonths(input.getWarrantyMonths());
        product.setRating(0.0);
        product.setTotalSold(0);

        this.productRepository.save(product);
        return convertToDTO(product);
    }

    public ProductResponseDTO getProductById(Long id) {
        Product product = this.productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return convertToDTO(product);
    }

    public ProductResponseDTO updateProduct(Long id, ProductUpdateDTO input) {
        Product product = this.productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        Category category = this.categoryRepository.findById(input.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + input.getCategoryId()));

        product.setName(input.getName());
        product.setDescription(input.getDescription());
        product.setPrice(input.getPrice());
        product.setCategory(category);
        product.setImage(input.getImage());
        
        if (input.getStatus() != null) {
            product.setStatus(Product.ProductStatus.valueOf(input.getStatus()));
        }
        
        product.setBrand(input.getBrand());
        product.setYearManufactured(input.getYearManufactured());
        product.setWarrantyMonths(input.getWarrantyMonths());

        this.productRepository.save(product);
        return convertToDTO(product);
    }

    public void deleteProduct(Long id) {
        this.productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        this.productRepository.deleteById(id);
    }
}
