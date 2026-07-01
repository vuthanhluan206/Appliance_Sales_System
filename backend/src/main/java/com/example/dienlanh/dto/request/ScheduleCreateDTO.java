package com.example.dienlanh.dto.request;

import java.time.LocalDateTime;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleCreateDTO {

    @NotNull(message = "ID đơn hàng không được để trống")
    private Long orderId;

    @NotNull(message = "ID kỹ thuật viên không được để trống")
    private Long technicianId;

    @NotNull(message = "Ngày hẹn không được để trống")
    private LocalDateTime appointmentDate;

    @NotBlank(message = "Giờ hẹn không được để trống")
    private String appointmentTime;

    private String notes;
}
