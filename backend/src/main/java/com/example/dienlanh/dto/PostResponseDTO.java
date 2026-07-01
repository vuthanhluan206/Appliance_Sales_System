package com.example.dienlanh.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostResponseDTO {
    private Long id;
    private String title;
    private String content;
    private String mediaUrl;
    private String mediaType;
    private Integer likesCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
