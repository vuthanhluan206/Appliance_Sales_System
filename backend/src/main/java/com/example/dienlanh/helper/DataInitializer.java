package com.example.dienlanh.helper;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import com.example.dienlanh.model.User;
import com.example.dienlanh.model.User.UserRole;
import com.example.dienlanh.model.User.UserStatus;
import com.example.dienlanh.model.Category;
import com.example.dienlanh.model.Product;
import com.example.dienlanh.model.Product.ProductStatus;
import com.example.dienlanh.model.Service;
import com.example.dienlanh.model.Service.ServiceStatus;
import com.example.dienlanh.model.Discount;
import com.example.dienlanh.model.Discount.DiscountType;
import com.example.dienlanh.model.Discount.DiscountStatus;
import com.example.dienlanh.repository.UserRepository;
import com.example.dienlanh.repository.CategoryRepository;
import com.example.dienlanh.repository.ProductRepository;
import com.example.dienlanh.repository.ServiceRepository;
import com.example.dienlanh.repository.DiscountRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.jdbc.core.JdbcTemplate;
import com.example.dienlanh.service.DocumentService;
import java.io.File;
import java.math.BigDecimal;
import java.time.LocalDateTime;
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
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ServiceRepository serviceRepository;
    private final DiscountRepository discountRepository;

    @Override
    public void run(String... args) throws Exception {
        initializeAdminUser();
        initializeCategoriesAndProducts();
        initializeServices();
        initializeDiscounts();
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

    private void initializeCategoriesAndProducts() {
        if (categoryRepository.count() > 0) {
            log.info("Database already has categories. Skipping categories & products initialization.");
            return;
        }

        log.info("Initializing categories & products seed data...");

        Category dieuHoa = new Category();
        dieuHoa.setName("Điều hòa");
        dieuHoa.setDescription("Máy lạnh, điều hòa không khí chính hãng");
        dieuHoa = categoryRepository.save(dieuHoa);

        Category tuLanh = new Category();
        tuLanh.setName("Tủ lạnh");
        tuLanh.setDescription("Tủ lạnh Inverter tiết kiệm điện");
        tuLanh = categoryRepository.save(tuLanh);

        Category mayGiat = new Category();
        mayGiat.setName("Máy giặt");
        mayGiat.setDescription("Máy giặt lồng đứng và lồng ngang");
        mayGiat = categoryRepository.save(mayGiat);

        // Seeding Điều hòa
        Product p1 = new Product();
        p1.setName("Điều hòa Panasonic Inverter 1 HP CU/CS-PU9AKH-8");
        p1.setDescription("Điều hòa Panasonic Inverter 1 HP tiết kiệm điện, làm lạnh nhanh, lọc bụi mịn Nanoe-G.");
        p1.setPrice(new BigDecimal("9500000"));
        p1.setCategory(dieuHoa);
        p1.setStatus(ProductStatus.AVAILABLE);
        p1.setBrand("Panasonic");
        p1.setYearManufactured(2024);
        p1.setWarrantyMonths(12);
        p1.setRating(4.8);
        p1.setTotalSold(15);
        productRepository.save(p1);

        Product p2 = new Product();
        p2.setName("Điều hòa Daikin Inverter 1.5 HP FTKF35XVMV");
        p2.setDescription("Điều hòa Daikin Inverter 1.5 HP luồng gió Coanda thoải mái, phin lọc Enzyme Blue diệt khuẩn.");
        p2.setPrice(new BigDecimal("12500000"));
        p2.setCategory(dieuHoa);
        p2.setStatus(ProductStatus.AVAILABLE);
        p2.setBrand("Daikin");
        p2.setYearManufactured(2024);
        p2.setWarrantyMonths(12);
        p2.setRating(4.9);
        p2.setTotalSold(24);
        productRepository.save(p2);

        Product p3 = new Product();
        p3.setName("Điều hòa Toshiba Inverter 1 HP RAS-H10Z1SGTG-V");
        p3.setDescription("Điều hòa Toshiba Inverter 1 HP công nghệ độc quyền Magic Coil chống bám bẩn dàn lạnh.");
        p3.setPrice(new BigDecimal("8900000"));
        p3.setCategory(dieuHoa);
        p3.setStatus(ProductStatus.AVAILABLE);
        p3.setBrand("Toshiba");
        p3.setYearManufactured(2023);
        p3.setWarrantyMonths(24);
        p3.setRating(4.7);
        p3.setTotalSold(8);
        productRepository.save(p3);

        // Seeding Tủ lạnh
        Product p4 = new Product();
        p4.setName("Tủ lạnh Panasonic Inverter 322 lít NR-BC360QKVN");
        p4.setDescription("Tủ lạnh Panasonic Inverter 322 lít ngăn đông dưới tiện lợi, ngăn cấp đông mềm thế hệ mới Prime Fresh+.");
        p4.setPrice(new BigDecimal("14200000"));
        p4.setCategory(tuLanh);
        p4.setStatus(ProductStatus.AVAILABLE);
        p4.setBrand("Panasonic");
        p4.setYearManufactured(2024);
        p4.setWarrantyMonths(24);
        p4.setRating(4.8);
        p4.setTotalSold(12);
        productRepository.save(p4);

        // Seeding Máy giặt
        Product p5 = new Product();
        p5.setName("Máy giặt LG AI DD 9 kg FV1409S4W");
        p5.setDescription("Máy giặt lồng ngang LG AI DD 9 kg trí tuệ nhân tạo bảo vệ sợi vải, giặt hơi nước diệt khuẩn Steam.");
        p5.setPrice(new BigDecimal("9800000"));
        p5.setCategory(mayGiat);
        p5.setStatus(ProductStatus.AVAILABLE);
        p5.setBrand("LG");
        p5.setYearManufactured(2024);
        p5.setWarrantyMonths(24);
        p5.setRating(4.7);
        p5.setTotalSold(32);
        productRepository.save(p5);

        log.info("Successfully seeded categories & products.");
    }

    private void initializeServices() {
        if (serviceRepository.count() > 0) {
            log.info("Database already has services. Skipping services initialization.");
            return;
        }

        log.info("Initializing services seed data...");

        Service s1 = new Service();
        s1.setName("Vệ sinh điều hòa treo tường (1.0 - 1.5HP)");
        s1.setDescription("Bao gồm: vệ sinh dàn lạnh, dàn nóng, lưới lọc, kiểm tra gas cơ bản.");
        s1.setBasePrice(new BigDecimal("150000"));
        s1.setEstimatedHours(1);
        s1.setStatus(ServiceStatus.ACTIVE);
        serviceRepository.save(s1);

        Service s2 = new Service();
        s2.setName("Vệ sinh điều hòa treo tường (2.0 - 2.5HP)");
        s2.setDescription("Bao gồm: vệ sinh dàn lạnh, dàn nóng, lưới lọc, kiểm tra gas cơ bản.");
        s2.setBasePrice(new BigDecimal("200000"));
        s2.setEstimatedHours(1);
        s2.setStatus(ServiceStatus.ACTIVE);
        serviceRepository.save(s2);

        Service s3 = new Service();
        s3.setName("Sửa lỗi điều hòa rò rỉ nước, chảy nước");
        s3.setDescription("Thông tắc đường ống thoát nước, vệ sinh máng nước và sửa các lỗi rò rỉ nước.");
        s3.setBasePrice(new BigDecimal("150000"));
        s3.setEstimatedHours(2);
        s3.setStatus(ServiceStatus.ACTIVE);
        serviceRepository.save(s3);

        Service s4 = new Service();
        s4.setName("Lắp đặt điều hòa treo tường mới (1.0 - 1.5HP)");
        s4.setDescription("Công lắp đặt máy lạnh treo tường công suất nhỏ (chưa bao gồm vật tư ống đồng, giá đỡ...)");
        s4.setBasePrice(new BigDecimal("400000"));
        s4.setEstimatedHours(2);
        s4.setStatus(ServiceStatus.ACTIVE);
        serviceRepository.save(s4);

        Service s5 = new Service();
        s5.setName("Bơm gas điều hòa (Gas R32/R410A)");
        s5.setDescription("Bơm gas bổ sung cho máy lạnh dùng loại gas mới tiết kiệm điện, làm lạnh sâu.");
        s5.setBasePrice(new BigDecimal("450000"));
        s5.setEstimatedHours(1);
        s5.setStatus(ServiceStatus.ACTIVE);
        serviceRepository.save(s5);

        Service s6 = new Service();
        s6.setName("Vệ sinh máy giặt cửa trên (lồng đứng)");
        s6.setDescription("Tháo lồng giặt, vệ sinh sạch sẽ các cặn bẩn bám lâu ngày.");
        s6.setBasePrice(new BigDecimal("250000"));
        s6.setEstimatedHours(1);
        s6.setStatus(ServiceStatus.ACTIVE);
        serviceRepository.save(s6);

        Service s7 = new Service();
        s7.setName("Vệ sinh máy giặt cửa trước (lồng ngang)");
        s7.setDescription("Tháo lồng giặt lồng ngang, vệ sinh lồng giặt, gioăng cao su sạch sẽ triệt để.");
        s7.setBasePrice(new BigDecimal("350000"));
        s7.setEstimatedHours(2);
        s7.setStatus(ServiceStatus.ACTIVE);
        serviceRepository.save(s7);

        log.info("Successfully seeded services.");
    }

    private void initializeDiscounts() {
        if (discountRepository.count() > 0) {
            log.info("Database already has discounts. Skipping discounts initialization.");
            return;
        }

        log.info("Initializing discounts seed data...");

        Discount d1 = new Discount();
        d1.setCode("MUAHE2026");
        d1.setDiscountValue(new BigDecimal("20000"));
        d1.setMinOrderValue(new BigDecimal("200000"));
        d1.setDiscountType(DiscountType.FIXED_AMOUNT);
        d1.setStartDate(LocalDateTime.now().minusDays(1));
        d1.setEndDate(LocalDateTime.now().plusMonths(3));
        d1.setMaxUsages(100);
        d1.setUsedCount(0);
        d1.setApplicableConditions("Áp dụng cho mọi đơn hàng dịch vụ/sản phẩm từ 200.000đ.");
        d1.setStatus(DiscountStatus.ACTIVE);
        discountRepository.save(d1);

        Discount d2 = new Discount();
        d2.setCode("GIAM5%");
        d2.setDiscountValue(new BigDecimal("5"));
        d2.setMinOrderValue(new BigDecimal("5000000"));
        d2.setDiscountType(DiscountType.PERCENTAGE);
        d2.setStartDate(LocalDateTime.now().minusDays(1));
        d2.setEndDate(LocalDateTime.now().plusMonths(3));
        d2.setMaxUsages(50);
        d2.setUsedCount(0);
        d2.setApplicableConditions("Giảm 5% cho đơn mua máy lạnh từ 5.000.000đ trở lên.");
        d2.setStatus(DiscountStatus.ACTIVE);
        discountRepository.save(d2);

        log.info("Successfully seeded discounts.");
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
