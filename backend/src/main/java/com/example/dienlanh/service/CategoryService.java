package com.example.dienlanh.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.dienlanh.dto.CategoryResponseDTO;
import com.example.dienlanh.dto.request.CategoryCreateDTO;
import com.example.dienlanh.dto.request.CategoryUpdateDTO;
import com.example.dienlanh.helper.exception.ResourceNotFoundException;
import com.example.dienlanh.model.Category;
import com.example.dienlanh.repository.CategoryRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;

    public CategoryResponseDTO convertToDTO(Category category) {
        return CategoryResponseDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .image(category.getImage())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }

    public List<CategoryResponseDTO> getAllCategories() {
        return this.categoryRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public CategoryResponseDTO createCategory(CategoryCreateDTO input) {
        if (this.categoryRepository.existsByName(input.getName())) {
            throw new ResourceNotFoundException("Tên danh mục: " + input.getName() + " đã tồn tại.");
        }

        Category category = new Category();
        category.setName(input.getName());
        category.setDescription(input.getDescription());
        category.setImage(input.getImage());

        this.categoryRepository.save(category);
        return convertToDTO(category);
    }

    public CategoryResponseDTO getCategoryById(Long id) {
        Category category = this.categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return convertToDTO(category);
    }

    public CategoryResponseDTO updateCategory(Long id, CategoryUpdateDTO input) {
        Category category = this.categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        // Nếu thay đổi tên và tên mới trùng với danh mục khác
        if (!category.getName().equals(input.getName()) && this.categoryRepository.existsByName(input.getName())) {
            throw new ResourceNotFoundException("Tên danh mục: " + input.getName() + " đã tồn tại.");
        }

        category.setName(input.getName());
        category.setDescription(input.getDescription());
        category.setImage(input.getImage());

        this.categoryRepository.save(category);
        return convertToDTO(category);
    }

    public void deleteCategory(Long id) {
        this.categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        this.categoryRepository.deleteById(id);
    }
}
