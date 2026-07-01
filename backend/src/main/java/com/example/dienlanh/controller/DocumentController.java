package com.example.dienlanh.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import com.example.dienlanh.service.DocumentService;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping("/ingest")
    public String ingest(@RequestParam String filePath) {
        return documentService.ingest(filePath);
    }
}
