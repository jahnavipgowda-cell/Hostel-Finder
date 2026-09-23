package com.hostelfinder.service;

import com.hostelfinder.dto.BookingDTOs.*;
import com.hostelfinder.model.*;
import com.hostelfinder.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepository;
    private final HostelRepository hostelRepository;
    private final UserRepository userRepository;

    @Transactional
    public BookingResponse createBooking(BookingCreateRequest req, Long userId) {
        Hostel hostel = hostelRepository.findById(req.getHostelId())
                .orElseThrow(() -> new RuntimeException("Hostel not found: " + req.getHostelId()));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        if (hostel.getAvailableRooms() == null || hostel.getAvailableRooms() <= 0) {
            throw new RuntimeException("No rooms available at this hostel.");
        }

        // Compute total amount
        int months = req.getDurationMonths() != null ? req.getDurationMonths() : 1;
        BigDecimal total = hostel.getPricePerMonth().multiply(BigDecimal.valueOf(months));
        BigDecimal deposit = hostel.getSecurityDeposit() != null ? hostel.getSecurityDeposit() : BigDecimal.ZERO;

        Booking booking = Booking.builder()
                .user(user)
                .hostel(hostel)
                .roomType(req.getRoomType())
                .checkInDate(req.getCheckInDate())
                .checkOutDate(req.getCheckOutDate())
                .durationMonths(months)
                .status(Booking.BookingStatus.PENDING)
                .totalAmount(total)
                .securityDepositPaid(deposit)
                .specialRequests(req.getSpecialRequests())
                .bookingReference("NQ-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .build();

        Booking saved = bookingRepository.save(booking);

        // Decrement available rooms
        hostel.setAvailableRooms(hostel.getAvailableRooms() - 1);
        hostelRepository.save(hostel);

        log.info("Booking created: {} for hostel: {}", saved.getBookingReference(), hostel.getName());
        return toResponse(saved);
    }

    public Page<BookingResponse> getUserBookings(Long userId, int page, int size) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size))
                .map(this::toResponse);
    }

    public Page<BookingResponse> getHostelBookings(Long hostelId, int page, int size) {
        return bookingRepository.findByHostelIdOrderByCreatedAtDesc(hostelId, PageRequest.of(page, size))
                .map(this::toResponse);
    }

    public BookingResponse getBookingByReference(String reference) {
        return bookingRepository.findByBookingReference(reference)
                .map(this::toResponse)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + reference));
    }

    @Transactional
    public BookingResponse updateBookingStatus(Long bookingId, BookingStatusUpdateRequest req) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));

        Booking.BookingStatus prev = booking.getStatus();
        booking.setStatus(req.getStatus());

        if (req.getStatus() == Booking.BookingStatus.CONFIRMED) {
            booking.setConfirmedAt(LocalDateTime.now());
        } else if (req.getStatus() == Booking.BookingStatus.CANCELLED) {
            booking.setCancelledAt(LocalDateTime.now());
            booking.setCancellationReason(req.getReason());
            // Restore available room if cancelling a confirmed booking
            if (prev == Booking.BookingStatus.CONFIRMED || prev == Booking.BookingStatus.PENDING) {
                Hostel hostel = booking.getHostel();
                hostel.setAvailableRooms((hostel.getAvailableRooms() != null ? hostel.getAvailableRooms() : 0) + 1);
                hostelRepository.save(hostel);
            }
        }

        return toResponse(bookingRepository.save(booking));
    }

    @Transactional
    public BookingResponse cancelBooking(Long bookingId, Long userId, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        if (!booking.getUser().getId().equals(userId)) {
            throw new RuntimeException("Not authorised to cancel this booking");
        }
        if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            throw new RuntimeException("Booking is already cancelled");
        }
        BookingStatusUpdateRequest req = new BookingStatusUpdateRequest(Booking.BookingStatus.CANCELLED, reason);
        return updateBookingStatus(bookingId, req);
    }

    // ---- Mapper ----
    private BookingResponse toResponse(Booking b) {
        return BookingResponse.builder()
                .id(b.getId())
                .bookingReference(b.getBookingReference())
                .hostelId(b.getHostel().getId())
                .hostelName(b.getHostel().getName())
                .hostelCity(b.getHostel().getCity())
                .roomType(b.getRoomType())
                .checkInDate(b.getCheckInDate())
                .checkOutDate(b.getCheckOutDate())
                .durationMonths(b.getDurationMonths())
                .status(b.getStatus())
                .totalAmount(b.getTotalAmount())
                .securityDepositPaid(b.getSecurityDepositPaid())
                .specialRequests(b.getSpecialRequests())
                .createdAt(b.getCreatedAt())
                .confirmedAt(b.getConfirmedAt())
                .build();
    }
}
