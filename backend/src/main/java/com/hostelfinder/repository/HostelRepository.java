package com.hostelfinder.repository;

import com.hostelfinder.model.Hostel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface HostelRepository extends JpaRepository<Hostel, Long>, JpaSpecificationExecutor<Hostel> {

    // Find by city
    Page<Hostel> findByCityIgnoreCaseAndIsActiveTrue(String city, Pageable pageable);

    // Find by locality/neighborhood
    Page<Hostel> findByLocalityIgnoreCaseAndIsActiveTrue(String locality, Pageable pageable);

    // Find by city and type
    Page<Hostel> findByCityIgnoreCaseAndTypeAndIsActiveTrue(
            String city, Hostel.HostelType type, Pageable pageable);

    // Full-text search by city or locality or address
    @Query("SELECT h FROM Hostel h WHERE h.isActive = true AND " +
           "(LOWER(h.city) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(h.locality) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(h.address) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(h.name) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Hostel> searchByLocation(@Param("query") String query, Pageable pageable);

    // Filter with price range
    @Query("SELECT h FROM Hostel h WHERE h.isActive = true AND " +
           "LOWER(h.city) LIKE LOWER(CONCAT('%', :city, '%')) AND " +
           "h.pricePerMonth BETWEEN :minPrice AND :maxPrice")
    Page<Hostel> findByCityAndPriceRange(
            @Param("city") String city,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            Pageable pageable);

    // AI-recommended hostels
    @Query("SELECT h FROM Hostel h WHERE h.isActive = true AND " +
           "LOWER(h.city) LIKE LOWER(CONCAT('%', :city, '%')) AND " +
           "h.aiRecommended = true ORDER BY h.rating DESC")
    List<Hostel> findAiRecommendedByCity(@Param("city") String city);

    // Top rated hostels in a city
    @Query("SELECT h FROM Hostel h WHERE h.isActive = true AND " +
           "LOWER(h.city) LIKE LOWER(CONCAT('%', :city, '%')) " +
           "ORDER BY h.rating DESC")
    List<Hostel> findTopRatedByCity(@Param("city") String city, Pageable pageable);

    // Nearby hostels using Haversine formula (within radius in km)
    @Query(value = """
            SELECT * FROM hostels h WHERE h.is_active = true AND (
                6371 * acos(
                    cos(radians(:lat)) * cos(radians(h.latitude)) *
                    cos(radians(h.longitude) - radians(:lng)) +
                    sin(radians(:lat)) * sin(radians(h.latitude))
                )
            ) < :radiusKm ORDER BY rating DESC
            """, nativeQuery = true)
    List<Hostel> findNearbyHostels(
            @Param("lat") Double latitude,
            @Param("lng") Double longitude,
            @Param("radiusKm") Double radiusKm);

    // Verified hostels in city
    @Query("SELECT h FROM Hostel h WHERE h.isActive = true AND " +
           "LOWER(h.city) LIKE LOWER(CONCAT('%', :city, '%')) AND " +
           "h.verified = true ORDER BY h.rating DESC")
    Page<Hostel> findVerifiedByCity(@Param("city") String city, Pageable pageable);

    // Gender-specific hostels
    Page<Hostel> findByCityIgnoreCaseAndGenderTypeAndIsActiveTrue(
            String city, Hostel.GenderType genderType, Pageable pageable);

    // Count available rooms in city
    @Query("SELECT SUM(h.availableRooms) FROM Hostel h WHERE h.isActive = true AND " +
           "LOWER(h.city) LIKE LOWER(CONCAT('%', :city, '%'))")
    Long countAvailableRoomsByCity(@Param("city") String city);

    // Distinct cities
    @Query("SELECT DISTINCT h.city FROM Hostel h WHERE h.isActive = true ORDER BY h.city")
    List<String> findAllActiveCities();

    // Search with gender filter
    @Query("SELECT h FROM Hostel h WHERE h.isActive = true AND " +
           "(LOWER(h.city) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(h.locality) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:gender IS NULL OR h.genderType = :gender) AND " +
           "(:type IS NULL OR h.type = :type) AND " +
           "(:minPrice IS NULL OR h.pricePerMonth >= :minPrice) AND " +
           "(:maxPrice IS NULL OR h.pricePerMonth <= :maxPrice)")
    Page<Hostel> advancedSearch(
            @Param("query") String query,
            @Param("gender") Hostel.GenderType gender,
            @Param("type") Hostel.HostelType type,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            Pageable pageable);
}
