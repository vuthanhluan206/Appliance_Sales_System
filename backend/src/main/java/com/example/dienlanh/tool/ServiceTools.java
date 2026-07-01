package com.example.dienlanh.tool;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.example.dienlanh.model.Service;
import com.example.dienlanh.repository.ServiceRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class ServiceTools {

    private final ServiceRepository serviceRepository;

    public static record ServiceDto(
        Long id,
        String name,
        String description,
        BigDecimal basePrice,
        String unit,
        String status
    ) {}

    @Tool(description = "Tìm kiếm thông tin các dịch vụ kỹ thuật điện lạnh (lắp đặt, vệ sinh, bảo trì, sửa chữa điều hòa, máy giặt, tủ lạnh...) theo từ khóa.")
    @Transactional(readOnly = true)
    public List<ServiceDto> searchServices(
        @ToolParam(description = "Từ khóa tìm kiếm theo tên dịch vụ hoặc mô tả dịch vụ (ví dụ: vệ sinh máy lạnh, sửa tủ lạnh, lắp máy giặt...)") String keyword
    ) {
        log.info("Tool searchServices called with keyword='{}'", keyword);
        List<Service> services = serviceRepository.findAll();

        return services.stream()
            .filter(s -> {
                if (keyword != null && !keyword.trim().isEmpty()) {
                    String kw = keyword.trim().toLowerCase();
                    boolean matchName = s.getName() != null && s.getName().toLowerCase().contains(kw);
                    boolean matchDesc = s.getDescription() != null && s.getDescription().toLowerCase().contains(kw);
                    return matchName || matchDesc;
                }
                return true;
            })
            .map(s -> {
                String desc = s.getDescription();
                if (desc != null && desc.length() > 100) {
                    desc = desc.substring(0, 100) + "...";
                }
                String unit = s.getEstimatedHours() != null ? "Theo giờ (" + s.getEstimatedHours() + "h)" : "Theo lần";
                return new ServiceDto(
                    s.getId(),
                    s.getName(),
                    desc,
                    s.getBasePrice(),
                    unit,
                    s.getStatus() != null ? s.getStatus().name() : "ACTIVE"
                );
            })
            .collect(Collectors.toList());
    }
}
