package com.hostelfinder.controller;

import com.hostelfinder.dto.BookingDTOs.*;
import com.hostelfinder.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
@Tag(name = "Bookings", description = "Enquiry and booking management")
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @Operation(summary = "Create a new booking / enquiry")
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody BookingCreateRequest request
    ) {
        // In production, resolve userId from JWT SecurityContext
        Long userId = 1L;
        return ResponseEntity.ok(bookingService.createBooking(request, userId));
    }

    @GetMapping("/my")
    @Operation(summary = "Get all bookings for the authenticated user")
    public ResponseEntity<Page<BookingResponse>> getMyBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Long userId = 1L;
        return ResponseEntity.ok(bookingService.getUserBookings(userId, page, size));
    }

    @GetMapping("/hostel/{hostelId}")
    @Operation(summary = "Get all bookings for a hostel (owner/admin)")
    public ResponseEntity<Page<BookingResponse>> getHostelBookings(
            @PathVariable Long hostelId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(bookingService.getHostelBookings(hostelId, page, size));
    }

    @GetMapping("/ref/{reference}")
    @Operation(summary = "Look up booking by reference number")
    public ResponseEntity<BookingResponse> getByReference(@PathVariable String reference) {
        return ResponseEntity.ok(bookingService.getBookingByReference(reference));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update booking status (confirm / cancel / complete)")
    public ResponseEntity<BookingResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody BookingStatusUpdateRequest request
    ) {
        return ResponseEntity.ok(bookingService.updateBookingStatus(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Cancel a booking (user)")
    public ResponseEntity<BookingResponse> cancelBooking(
            @PathVariable Long id,
            @RequestParam(required = false) String reason
    ) {
        Long userId = 1L;
        return ResponseEntity.ok(bookingService.cancelBooking(id, userId, reason));
    }
}
