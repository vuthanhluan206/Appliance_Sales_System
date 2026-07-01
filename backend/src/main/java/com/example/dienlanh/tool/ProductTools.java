package com.example.dienlanh.tool;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.example.dienlanh.model.Product;
import com.example.dienlanh.repository.ProductRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class ProductTools {

    private final ProductRepository productRepository;

    public static record ProductDto(
        Long id,
        String name,
        String categoryName,
        BigDecimal price,
        String stockStatus,
        String description
    ) {}

    @Tool(description = "Tìm kiếm thông tin các sản phẩm điện lạnh trong cửa hàng theo từ khóa tên/mô tả và/hoặc tên danh mục. Trả về danh sách sản phẩm khớp yêu cầu.")
    @Transactional(readOnly = true)
    public List<ProductDto> searchProducts(
        @ToolParam(description = "Từ khóa tìm kiếm theo tên sản phẩm hoặc mô tả sản phẩm (ví dụ: Panasonic, inverter, 12000 BTU...)") String keyword,
        @ToolParam(description = "Tên danh mục sản phẩm cần lọc (ví dụ: Điều hòa, Máy giặt, Tủ lạnh...)") String category
    ) {
        log.info("Tool searchProducts called with keyword='{}', category='{}'", keyword, category);
        List<Product> products = productRepository.findAll();

        return products.stream()
            .filter(p -> {
                if (keyword != null && !keyword.trim().isEmpty()) {
                    String kw = keyword.trim().toLowerCase();
                    boolean matchName = p.getName() != null && p.getName().toLowerCase().contains(kw);
                    boolean matchDesc = p.getDescription() != null && p.getDescription().toLowerCase().contains(kw);
                    if (!matchName && !matchDesc) {
                        return false;
                    }
                }
                if (category != null && !category.trim().isEmpty()) {
                    String cat = category.trim().toLowerCase();
                    boolean matchCat = p.getCategory() != null && p.getCategory().getName() != null 
                        && p.getCategory().getName().toLowerCase().contains(cat);
                    if (!matchCat) {
                        return false;
                    }
                }
                return true;
            })
            .limit(10) // Limit to top 10 results to keep tokens low
            .map(p -> {
                String desc = p.getDescription();
                if (desc != null && desc.length() > 100) {
                    desc = desc.substring(0, 100) + "...";
                }
                String stock = p.getStatus() == Product.ProductStatus.AVAILABLE ? "Còn hàng" : "Hết hàng";
                return new ProductDto(
                    p.getId(),
                    p.getName(),
                    p.getCategory() != null ? p.getCategory().getName() : null,
                    p.getPrice(),
                    stock,
                    desc
                );
            })
            .collect(Collectors.toList());
    }
}
