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

import com.example.dienlanh.dto.CategoryResponseDTO;
import com.example.dienlanh.dto.request.CategoryCreateDTO;
import com.example.dienlanh.dto.request.CategoryUpdateDTO;
import com.example.dienlanh.helper.json.ApiResponse;
import com.example.dienlanh.service.CategoryService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryService categoryService;

    // create Category
    @PostMapping("/createCategory")
    public ResponseEntity<ApiResponse<CategoryResponseDTO>> createCategory(@Valid @RequestBody CategoryCreateDTO input) {
        CategoryResponseDTO createdCategory = this.categoryService.createCategory(input);
        return ApiResponse.success(createdCategory, "create category successful");
    }

    // get all categories
    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<CategoryResponseDTO>>> getAllCategories() {
        List<CategoryResponseDTO> categories = this.categoryService.getAllCategories();
        return ApiResponse.success(categories, "get all categories successful");
    }

    // get category by id
    @GetMapping("/getCategory/{id}")
    public ResponseEntity<ApiResponse<CategoryResponseDTO>> getCategoryByID(@PathVariable Long id) {
        CategoryResponseDTO category = this.categoryService.getCategoryById(id);
        return ApiResponse.success(category, "get category by id successful");
    }

    // update category by id
    @PutMapping("/updateCategory/{id}")
    public ResponseEntity<ApiResponse<CategoryResponseDTO>> updateCategory(@PathVariable Long id,
            @Valid @RequestBody CategoryUpdateDTO input) {
        CategoryResponseDTO updatedCategory = this.categoryService.updateCategory(id, input);
        return ApiResponse.success(updatedCategory, "update category successful");
    }

    // delete category by id
    @DeleteMapping("/deleteCategory/{id}")
    public String deleteCategory(@PathVariable Long id) {
        this.categoryService.deleteCategory(id);
        return "delete category successful";
    }
}
