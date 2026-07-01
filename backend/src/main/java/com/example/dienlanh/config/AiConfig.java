package com.example.dienlanh.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.google.genai.embedding.GoogleGenAiEmbeddingConnectionDetails;
import org.springframework.ai.google.genai.text.GoogleGenAiTextEmbeddingModel;
import org.springframework.ai.google.genai.text.GoogleGenAiTextEmbeddingOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AiConfig {
    @Value("${spring.ai.google.genai.api-key}")
    private String ApiKey;

    @Value("${spring.ai.google.genai.embedding.options.model:text-embedding-004}")
    private String embeddingModelName;

    @Value("${spring.ai.vectorstore.pgvector.dimensions:768}")
    private int dimensions;

    @Bean
    // truyền api key vào GoogleGenAiEmbeddingConnectionDetails để kết nối với
    // Google GenAI
    public GoogleGenAiEmbeddingConnectionDetails googleGenAiEmbeddingConnectionDetails() {
        return GoogleGenAiEmbeddingConnectionDetails.builder()
                .apiKey(ApiKey)
                .build();
    }

    @Bean
    // tạo một bean GoogleGenAiTextEmbedingModel để sử dụng cho việc nhúng văn bản
    public GoogleGenAiTextEmbeddingModel googleGenAiTextEmbeddingModel(
            GoogleGenAiEmbeddingConnectionDetails connectionDetails) {

        GoogleGenAiTextEmbeddingOptions Options = GoogleGenAiTextEmbeddingOptions.builder()
                .model(embeddingModelName)
                .dimensions(dimensions)
                .build();
        return new GoogleGenAiTextEmbeddingModel(connectionDetails, Options);
    }

    @Bean
    public ChatClient chatClient(ChatClient.Builder builder) {
        return builder.build();
    }
}

