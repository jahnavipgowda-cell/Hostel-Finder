package com.hostelfinder.repository;

import com.hostelfinder.model.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    Page<Booking> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Page<Booking> findByHostelIdOrderByCreatedAtDesc(Long hostelId, Pageable pageable);

    Optional<Booking> findByBookingReference(String reference);

    List<Booking> findByHostelIdAndStatus(Long hostelId, Booking.BookingStatus status);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.hostel.id = :hostelId AND b.status = 'CONFIRMED'")
    Long countActiveBookingsByHostel(@Param("hostelId") Long hostelId);

    boolean existsByUserIdAndHostelIdAndStatus(Long userId, Long hostelId, Booking.BookingStatus status);
}
