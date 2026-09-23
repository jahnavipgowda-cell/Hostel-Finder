package com.hostelfinder.dto;

import com.hostelfinder.model.Booking;
import lombok.*;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class BookingDTOs {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookingCreateRequest {
        @NotNull
        private Long hostelId;

        private String roomType;

        @NotNull
        private LocalDate checkInDate;

        private LocalDate checkOutDate;

        @Min(1)
        private Integer durationMonths;

        @Size(max = 500)
        private String specialRequests;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookingResponse {
        private Long id;
        private String bookingReference;
        private Long hostelId;
        private String hostelName;
        private String hostelCity;
        private String roomType;
        private LocalDate checkInDate;
        private LocalDate checkOutDate;
        private Integer durationMonths;
        private Booking.BookingStatus status;
        private BigDecimal totalAmount;
        private BigDecimal securityDepositPaid;
        private String specialRequests;
        private LocalDateTime createdAt;
        private LocalDateTime confirmedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookingStatusUpdateRequest {
        @NotNull
        private Booking.BookingStatus status;
        private String reason;
    }
}
