package com.example.dienlanh.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.SimpleVectorStore;
import org.springframework.ai.vectorstore.pgvector.PgVectorStore;
import org.springframework.ai.vectorstore.pgvector.PgVectorStore.PgDistanceType;
import org.springframework.ai.vectorstore.pgvector.PgVectorStore.PgIndexType;

import javax.sql.DataSource;

@Configuration
public class VectorStoreConfig {

    @Value("${spring.ai.vectorstore.type:pgvector}")
    private String vectorStoreType;

    @Value("${spring.ai.vectorstore.pgvector.initialize-schema:true}")
    private boolean initializeSchema;

    @Value("${spring.ai.vectorstore.pgvector.dimensions:768}")
    private int dimensions;

    @Value("${spring.ai.vectorstore.pgvector.distance-type:COSINE_DISTANCE}")
    private String distanceType;

    @Value("${spring.ai.vectorstore.pgvector.index-type:NONE}")
    private String indexType;

    @Bean
    public VectorStore vectorStore(
            DataSource dataSource,
            EmbeddingModel embeddingModel) {
        
        if ("simple".equalsIgnoreCase(vectorStoreType)) {
            return SimpleVectorStore.builder(embeddingModel).build();
        }
        
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        
        return PgVectorStore.builder(jdbcTemplate, embeddingModel)
                .dimensions(dimensions)
                .distanceType(PgDistanceType.valueOf(distanceType))
                .indexType(PgIndexType.valueOf(indexType))
                .initializeSchema(initializeSchema)
                .build();
    }
}
