package com.example.dienlanh.service;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.ai.document.Document;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import com.example.dienlanh.model.Product;
import com.example.dienlanh.repository.ProductRepository;
import com.example.dienlanh.repository.ServiceRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatService {
        private final ChatClient chatClient;
        private final VectorStore vectorStore;
        private final ProductRepository productRepository;
        private final ServiceRepository serviceRepository;

        public String chat(String question) {

                List<Product> products = productRepository.findAll();
                List<com.example.dienlanh.model.Service> services = serviceRepository.findAll();

                String productContext = products.stream()
                                .map(p -> "- " + p.getName() + ": " + p.getPrice() + "đ - " + p.getDescription())
                                .collect(Collectors.joining("\n"));

                String serviceContext = services.stream()
                                .map(s -> "- " + s.getName() + ": " + s.getDescription())
                                .collect(Collectors.joining("\n"));

                // 2. Tìm thông tin tư vấn liên quan từ PGVector (file txt)
                List<Document> ragDocs = vectorStore.similaritySearch(
                                SearchRequest.builder()
                                                .query(question)
                                                .topK(3)
                                                .build());

                String ragContext = ragDocs.stream()
                                .map(Document::getText)
                                .collect(Collectors.joining("\n"));

                // 3. Gộp context và gửi cho Gemini
                return chatClient.prompt()
                                .system("""
                                                Bạn là tư vấn viên của Điện Lạnh Đông Triều 24H.

                                                DANH SÁCH SẢN PHẨM:
                                                """ + productContext + """

                                                DỊCH VỤ:
                                                """ + serviceContext + """

                                                THÔNG TIN TƯ VẤN THÊM:
                                                """ + ragContext)
                                .user(question)
                                .call()
                                .content();
        }
}
