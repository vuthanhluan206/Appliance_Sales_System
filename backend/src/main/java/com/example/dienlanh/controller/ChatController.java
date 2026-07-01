package com.example.dienlanh.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import com.example.dienlanh.dto.ChatRequestDTO;
import com.example.dienlanh.service.ChatService;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    public String chat(@RequestBody ChatRequestDTO request) {
        return chatService.chat(request.getQuestion());
    }
}
