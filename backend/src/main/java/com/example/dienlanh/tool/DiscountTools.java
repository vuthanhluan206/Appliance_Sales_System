package com.example.dienlanh.tool;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.example.dienlanh.model.Discount;
import com.example.dienlanh.repository.DiscountRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class DiscountTools {

    private final DiscountRepository discountRepository;

    public static record DiscountDto(
        Long id,
        String code,
        BigDecimal discountValue,
        BigDecimal minOrderValue,
        String discountType,
        String applicableConditions,
        String endDate,
        String status
    ) {}

    public static record DiscountCheckResult(
        boolean isValid,
        String message,
        DiscountDto details
    ) {}

    @Tool(description = "Lấy danh sách tất cả các chương trình khuyến mãi, mã giảm giá (voucher) hiện đang hoạt động và có hiệu lực.")
    @Transactional(readOnly = true)
    public List<DiscountDto> getActiveDiscounts() {
        log.info("Tool getActiveDiscounts called");
        List<Discount> discounts = discountRepository.findAll();
        LocalDateTime now = LocalDateTime.now();

        return discounts.stream()
            .filter(d -> d.getStatus() == Discount.DiscountStatus.ACTIVE 
                && d.getStartDate().isBefore(now) 
                && d.getEndDate().isAfter(now)
                && (d.getMaxUsages() == null || d.getUsedCount() < d.getMaxUsages()))
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    @Tool(description = "Kiểm tra tính hợp lệ và thông tin chi tiết của một mã giảm giá (voucher) cụ thể.")
    @Transactional(readOnly = true)
    public DiscountCheckResult checkDiscountCode(
        @ToolParam(description = "Mã giảm giá cần kiểm tra (ví dụ: GIAM20K, MUAHE2026...)") String code
    ) {
        log.info("Tool checkDiscountCode called with code='{}'", code);
        if (code == null || code.trim().isEmpty()) {
            return new DiscountCheckResult(false, "Mã giảm giá không được để trống.", null);
        }

        Optional<Discount> discountOpt = discountRepository.findByCode(code.trim().toUpperCase());
        if (discountOpt.isEmpty()) {
            return new DiscountCheckResult(false, "Mã giảm giá '" + code + "' không tồn tại trong hệ thống.", null);
        }

        Discount discount = discountOpt.get();
        LocalDateTime now = LocalDateTime.now();

        if (discount.getStatus() != Discount.DiscountStatus.ACTIVE) {
            return new DiscountCheckResult(false, "Mã giảm giá này hiện không hoạt động (Trạng thái: " + discount.getStatus() + ").", mapToDto(discount));
        }

        if (discount.getStartDate().isAfter(now)) {
            return new DiscountCheckResult(false, "Chương trình khuyến mãi chưa bắt đầu. Thời gian hiệu lực từ: " + discount.getStartDate(), mapToDto(discount));
        }

        if (discount.getEndDate().isBefore(now)) {
            return new DiscountCheckResult(false, "Mã giảm giá đã hết hạn sử dụng (Ngày hết hạn: " + discount.getEndDate() + ").", mapToDto(discount));
        }

        if (discount.getMaxUsages() != null && discount.getUsedCount() >= discount.getMaxUsages()) {
            return new DiscountCheckResult(false, "Mã giảm giá đã đạt số lần sử dụng tối đa.", mapToDto(discount));
        }

        String typeStr = discount.getDiscountType() == Discount.DiscountType.PERCENTAGE ? "Giảm %" : "Giảm số tiền cố định";
        String valStr = discount.getDiscountType() == Discount.DiscountType.PERCENTAGE 
            ? discount.getDiscountValue() + "%" 
            : discount.getDiscountValue() + "đ";

        return new DiscountCheckResult(
            true, 
            "Mã giảm giá hợp lệ. " + typeStr + ": " + valStr + ". Đơn hàng tối thiểu: " + discount.getMinOrderValue() + "đ.", 
            mapToDto(discount)
        );
    }

    private DiscountDto mapToDto(Discount d) {
        return new DiscountDto(
            d.getId(),
            d.getCode(),
            d.getDiscountValue(),
            d.getMinOrderValue(),
            d.getDiscountType() != null ? d.getDiscountType().name() : null,
            d.getApplicableConditions(),
            d.getEndDate().toString(),
            d.getStatus() != null ? d.getStatus().name() : null
        );
    }
}
