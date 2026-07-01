package com.example.dienlanh.helper;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import com.example.dienlanh.model.User;
import com.example.dienlanh.model.User.UserRole;
import com.example.dienlanh.model.User.UserStatus;
import com.example.dienlanh.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.jdbc.core.JdbcTemplate;
import com.example.dienlanh.service.DocumentService;
import java.io.File;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;
    private final DocumentService documentService;

    @Override
    public void run(String... args) throws Exception {
        initializeAdminUser();
        initializeVectorStoreData();
    }

    private void initializeAdminUser() {
        if (userRepository.count() > 0) {
            log.info("Database already has users. Skipping default admin initialization.");
            return;
        }

        log.info("Initializing default Admin account for production...");

        User admin = new User();
        admin.setName("Admin Đông Triều");
        admin.setEmail("admin@gmail.com");
        admin.setPhone("0923456789");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setAddress("Chi nhánh Đông Triều");
        admin.setRole(UserRole.ADMIN);
        admin.setStatus(UserStatus.ACTIVE);
        admin.setVerified(true);
        userRepository.save(admin);

        log.info("==========================================================");
        log.info("DEFAULT ADMIN CREATED: admin@gmail.com / admin123");
        log.info("==========================================================");
    }

    private void initializeVectorStoreData() {
        try {
            // Check if the vector store table contains any records
            Integer count = jdbcTemplate.queryForObject("SELECT count(*) FROM vector_store", Integer.class);
            if (count == null || count == 0) {
                log.info("Vector store is empty. Attempting to ingest dich_vu.txt...");
                File file = new File("backend/data/dich_vu.txt");
                if (!file.exists()) {
                    file = new File("data/dich_vu.txt");
                }
                
                if (file.exists()) {
                    String result = documentService.ingest(file.getAbsolutePath());
                    log.info("Vector store initialization successful: {}", result);
                } else {
                    log.warn("Could not locate dich_vu.txt at backend/data/dich_vu.txt or data/dich_vu.txt");
                }
            } else {
                log.info("Vector store already initialized with {} records.", count);
            }
        } catch (Exception e) {
            log.error("Error during vector store initialization: {}", e.getMessage(), e);
        }
    }
}
