package com.hostelfinder.repository;

import com.hostelfinder.model.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    Page<Review> findByHostelIdAndIsActiveTrueOrderByCreatedAtDesc(Long hostelId, Pageable pageable);

    List<Review> findByHostelIdAndIsActiveTrueOrderByHelpfulCountDesc(Long hostelId);

    @Query("SELECT AVG(r.overallRating) FROM Review r WHERE r.hostel.id = :hostelId AND r.isActive = true")
    Optional<Double> findAverageRatingByHostelId(@Param("hostelId") Long hostelId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.hostel.id = :hostelId AND r.isActive = true")
    Long countByHostelId(@Param("hostelId") Long hostelId);

    List<Review> findByUserIdAndIsActiveTrue(Long userId);

    boolean existsByHostelIdAndUserId(Long hostelId, Long userId);

    // Verified stay reviews only
    Page<Review> findByHostelIdAndVerifiedStayTrueAndIsActiveTrueOrderByCreatedAtDesc(
            Long hostelId, Pageable pageable);

    // Rating breakdown
    @Query("SELECT r.overallRating, COUNT(r) FROM Review r " +
           "WHERE r.hostel.id = :hostelId AND r.isActive = true " +
           "GROUP BY r.overallRating ORDER BY r.overallRating DESC")
    List<Object[]> getRatingBreakdown(@Param("hostelId") Long hostelId);
}
