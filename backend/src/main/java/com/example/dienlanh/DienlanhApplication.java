package com.example.dienlanh;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.ai.vectorstore.pgvector.autoconfigure.PgVectorStoreAutoConfiguration;

@SpringBootApplication(exclude = { PgVectorStoreAutoConfiguration.class })
public class DienlanhApplication {

	public static void main(String[] args) {
		SpringApplication.run(DienlanhApplication.class, args);
	}

}
