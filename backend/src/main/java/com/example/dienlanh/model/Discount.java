package com.example.dienlanh.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "discounts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Discount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private BigDecimal discountValue; // Giá trị giảm (% hoặc số tiền)

    @Column(name = "min_order_value")
    private BigDecimal minOrderValue; // Giá trị đơn hàng tối thiểu


    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DiscountType discountType; // PERCENTAGE, FIXED_AMOUNT

    @Column(nullable = false)
    private LocalDateTime startDate;

    @Column(nullable = false)
    private LocalDateTime endDate;

    @Column(nullable = false)
    private Integer maxUsages; // Số lần sử dụng tối đa

    @Column(nullable = false)
    private Integer usedCount; // Số lần đã sử dụng

    @Column(columnDefinition = "TEXT")
    private String applicableConditions; // Điều kiện áp dụng (loại sản phẩm, giá tối thiểu...)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DiscountStatus status; // ACTIVE, EXPIRED, DEACTIVATED

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (usedCount == null) {
            usedCount = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum DiscountType {
        PERCENTAGE, FIXED_AMOUNT
    }

    public enum DiscountStatus {
        ACTIVE, EXPIRED, DEACTIVATED
    }
}
