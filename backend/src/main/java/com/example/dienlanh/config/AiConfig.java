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
        return builder
                .defaultSystem(
                        """
                                Bạn là một chuyên viên tư vấn khách hàng chuyên nghiệp, tận tâm và thân thiện.
                                Nhiệm vụ của bạn là giải đáp các thắc mắc của khách hàng một cách lịch sự, chu đáo và dễ hiểu.
                                Khi trả lời, hãy xưng hô lịch thiệp (dạ, thưa, anh/chị, em) phù hợp với ngữ cảnh tư vấn chăm sóc khách hàng.
                                Hãy trả lời dựa trên thông tin được cung cấp trong tài liệu.
                                Nếu không tìm thấy thông tin phù hợp trong tài liệu, hãy lịch sự thông báo rằng bạn chưa có thông tin cụ thể về vấn đề này và khuyên khách hàng có thể để lại thông tin liên hệ hoặc liên hệ hotline để được hỗ trợ chi tiết hơn.
                                Trả lời bằng tiếng Việt, bố cục rõ ràng, chuyên nghiệp.
                                """)
                .build();
    }

}
