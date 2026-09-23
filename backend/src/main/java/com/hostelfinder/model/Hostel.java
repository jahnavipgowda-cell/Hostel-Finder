package com.hostelfinder.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "hostels")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Hostel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private HostelType type; // HOSTEL, PG, CO_LIVING, STUDENT_RESIDENCE

    @Enumerated(EnumType.STRING)
    private GenderType genderType; // MALE, FEMALE, MIXED

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String state;

    @Column(nullable = false)
    private String pincode;

    @Column(nullable = false)
    private String locality; // neighborhood/area

    // Geo coordinates for map display
    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "price_per_month", nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerMonth;

    @Column(name = "price_per_day", precision = 10, scale = 2)
    private BigDecimal pricePerDay;

    @Column(name = "security_deposit", precision = 10, scale = 2)
    private BigDecimal securityDeposit;

    @Column(name = "available_rooms")
    private Integer availableRooms;

    @Column(name = "total_rooms")
    private Integer totalRooms;

    @Column(name = "rating", precision = 3, scale = 2)
    private BigDecimal rating;

    @Column(name = "total_reviews")
    private Integer totalReviews;

    @Column(name = "verified")
    private Boolean verified;

    @Column(name = "ai_recommended")
    private Boolean aiRecommended;

    @Column(name = "description", length = 2000)
    private String description;

    @Column(name = "owner_name")
    private String ownerName;

    @Column(name = "contact_number")
    private String contactNumber;

    @Column(name = "contact_email")
    private String contactEmail;

    @Column(name = "website_url")
    private String websiteUrl;

    @Column(name = "virtual_tour_url")
    private String virtualTourUrl; // 2026: VR/360 tour link

    // Facilities (stored as comma-separated, or use @ElementCollection)
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "hostel_facilities", joinColumns = @JoinColumn(name = "hostel_id"))
    @Column(name = "facility")
    @Builder.Default
    private List<String> facilities = new ArrayList<>();

    // House Rules
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "hostel_rules", joinColumns = @JoinColumn(name = "hostel_id"))
    @Column(name = "rule")
    @Builder.Default
    private List<String> rules = new ArrayList<>();

    // Photos/Images (URLs)
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "hostel_images", joinColumns = @JoinColumn(name = "hostel_id"))
    @Column(name = "image_url")
    @Builder.Default
    private List<String> imageUrls = new ArrayList<>();

    // Nearby Places (JSON-like structure stored separately)
    @OneToMany(mappedBy = "hostel", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<NearbyPlace> nearbyPlaces = new ArrayList<>();

    // Reviews
    @OneToMany(mappedBy = "hostel", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Review> reviews = new ArrayList<>();

    // Room types offered
    @OneToMany(mappedBy = "hostel", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<RoomType> roomTypes = new ArrayList<>();

    @Column(name = "metro_nearby")
    private Boolean metroNearby;

    @Column(name = "metro_distance_km")
    private Double metroDistanceKm;

    @Column(name = "hospital_nearby")
    private Boolean hospitalNearby;

    @Column(name = "food_included")
    private Boolean foodIncluded;

    @Column(name = "meals_per_day")
    private Integer mealsPerDay;

    // 2026 Innovations
    @Column(name = "smart_lock_enabled")
    private Boolean smartLockEnabled;

    @Column(name = "ev_charging_available")
    private Boolean evChargingAvailable;

    @Column(name = "solar_powered")
    private Boolean solarPowered;

    @Column(name = "co_working_space")
    private Boolean coWorkingSpace;

    @Column(name = "ai_safety_score", precision = 3, scale = 2)
    private BigDecimal aiSafetyScore; // AI-computed safety rating

    @Column(name = "noise_level")
    private String noiseLevel; // QUIET, MODERATE, LIVELY

    @Column(name = "community_rating", precision = 3, scale = 2)
    private BigDecimal communityRating;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    public enum HostelType {
        HOSTEL, PG, CO_LIVING, STUDENT_RESIDENCE, WORKING_PROFESSIONAL
    }

    public enum GenderType {
        MALE, FEMALE, MIXED
    }
}
