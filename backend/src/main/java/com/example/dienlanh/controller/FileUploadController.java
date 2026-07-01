package com.example.dienlanh.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.dienlanh.helper.json.ApiResponse;
import com.example.dienlanh.service.CloudinaryService;

@RestController
public class FileUploadController {

    private final CloudinaryService cloudinaryService;

    public FileUploadController(CloudinaryService cloudinaryService) {
        this.cloudinaryService = cloudinaryService;
    }

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<String>> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, "File is empty");
        }
        try {
            String fileUrl = cloudinaryService.uploadFile(file);
            return ApiResponse.success(fileUrl, "File uploaded successfully to Cloudinary");
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi upload Cloudinary: " + e.getMessage());
        }
    }
}
