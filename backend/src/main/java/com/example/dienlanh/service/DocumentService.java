package com.example.dienlanh.service;

import java.util.List;

import org.springframework.ai.document.Document;
import org.springframework.ai.reader.tika.TikaDocumentReader;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.core.io.FileSystemResource;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DocumentService {
    private final VectorStore vectorStore;

    public String ingest(String filePath) {

        TikaDocumentReader reader = new TikaDocumentReader(
                new FileSystemResource(filePath));

        List<Document> documents = reader.get();

        TokenTextSplitter splitter = TokenTextSplitter.builder()
                .withChunkSize(500) // Kích thước tối đa của mỗi chunk là 500 tokens (khoảng 350-400 từ)
                .withMinChunkSizeChars(100) // Số ký tự tối thiểu để tạo thành một chunk (tránh các chunk rác quá ngắn)
                .withMinChunkLengthToEmbed(5) // Độ dài tối thiểu để gửi đi nhúng vector
                .withMaxNumChunks(10000) // Giới hạn số lượng chunk tối đa được sinh ra để tránh tràn bộ nhớ
                .withKeepSeparator(true) // Giữ lại các ký tự phân cách (như dấu câu, dấu xuống dòng) để giữ ngữ cảnh tự
                                         // nhiên
                .build();

        List<Document> chunks = splitter.apply(documents);

        vectorStore.add(chunks);

        return "Đã nạp " + chunks.size() + " chunks thành công!";
    }
}
