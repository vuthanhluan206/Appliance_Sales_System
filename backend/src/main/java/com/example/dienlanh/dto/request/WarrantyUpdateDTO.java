package com.example.dienlanh.dto.request;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WarrantyUpdateDTO {

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    private String warrantyType; // MANUFACTURER, EXTENDED

    private String status; // ACTIVE, EXPIRED

    private String conditions;
}
