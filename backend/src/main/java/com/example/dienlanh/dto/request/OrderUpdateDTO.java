package com.example.dienlanh.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderUpdateDTO {

    private String status; // PENDING, CONFIRMED, INSTALLING_REPAIRING, COMPLETED, CANCELLED

    private String deliveryAddress;

    private String notes;
}
