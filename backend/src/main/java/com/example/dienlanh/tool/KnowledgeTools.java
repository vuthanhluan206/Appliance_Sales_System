package com.example.dienlanh.tool;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.ai.document.Document;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class KnowledgeTools {

    private final VectorStore vectorStore;

    @Tool(description = "Tra cứu cơ sở dữ liệu chính sách, bảo hành, giờ làm việc, địa chỉ liên hệ, quy trình sửa chữa hoặc các câu hỏi thường gặp của Điện Lạnh Đông Triều 24H.")
    public List<String> searchGeneralKnowledge(
        @ToolParam(description = "Câu hỏi hoặc từ khóa cần tìm kiếm về chính sách, địa điểm, liên hệ hoặc bảo hành (ví dụ: Địa chỉ cửa hàng ở đâu, Chính sách bảo hành bao lâu, thời gian làm việc...)") String query
    ) {
        log.info("Tool searchGeneralKnowledge called with query='{}'", query);
        if (query == null || query.trim().isEmpty()) {
            return List.of();
        }

        List<Document> docs = vectorStore.similaritySearch(
            SearchRequest.builder()
                .query(query)
                .topK(3)
                .build()
        );

        return docs.stream()
            .map(Document::getText)
            .collect(Collectors.toList());
    }
}
