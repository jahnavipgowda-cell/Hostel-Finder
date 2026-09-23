package com.hostelfinder.dto;

import com.hostelfinder.model.Hostel;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * All DTOs for the Hostel Finder application
 */
public class HostelDTOs {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HostelSummaryResponse {
        private Long id;
        private String name;
        private Hostel.HostelType type;
        private Hostel.GenderType genderType;
        private String address;
        private String city;
        private String locality;
        private Double latitude;
        private Double longitude;
        private BigDecimal pricePerMonth;
        private BigDecimal pricePerDay;
        private Integer availableRooms;
        private BigDecimal rating;
        private Integer totalReviews;
        private Boolean verified;
        private Boolean aiRecommended;
        private List<String> facilities;
        private String thumbnailUrl;
        private Boolean foodIncluded;
        private Boolean metroNearby;
        private Double metroDistanceKm;
        private Boolean coWorkingSpace;
        private String noiseLevel;
        private BigDecimal aiSafetyScore;
        private Boolean smartLockEnabled;
        private Boolean evChargingAvailable;
        private BigDecimal communityRating;
        private Double distanceKm; // only populated by the /nearby endpoint
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HostelDetailResponse {
        private Long id;
        private String name;
        private Hostel.HostelType type;
        private Hostel.GenderType genderType;
        private String address;
        private String city;
        private String state;
        private String pincode;
        private String locality;
        private Double latitude;
        private Double longitude;
        private BigDecimal pricePerMonth;
        private BigDecimal pricePerDay;
        private BigDecimal securityDeposit;
        private Integer availableRooms;
        private Integer totalRooms;
        private BigDecimal rating;
        private Integer totalReviews;
        private Boolean verified;
        private Boolean aiRecommended;
        private String description;
        private String ownerName;
        private String contactNumber;
        private String contactEmail;
        private String websiteUrl;
        private String virtualTourUrl;
        private List<String> facilities;
        private List<String> rules;
        private List<String> imageUrls;
        private List<NearbyPlaceDTO> nearbyPlaces;
        private List<RoomTypeDTO> roomTypes;
        private List<ReviewDTO> recentReviews;
        private RatingBreakdown ratingBreakdown;
        private Boolean foodIncluded;
        private Integer mealsPerDay;
        private Boolean metroNearby;
        private Double metroDistanceKm;
        private Boolean hospitalNearby;
        private Boolean coWorkingSpace;
        private Boolean smartLockEnabled;
        private Boolean evChargingAvailable;
        private Boolean solarPowered;
        private BigDecimal aiSafetyScore;
        private String noiseLevel;
        private BigDecimal communityRating;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NearbyPlaceDTO {
        private String name;
        private String category;
        private Double distanceMeters;
        private Integer walkTimeMinutes;
        private Double rating;
        private String icon;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoomTypeDTO {
        private String category;
        private String name;
        private BigDecimal pricePerMonth;
        private Integer availableCount;
        private Integer totalCount;
        private Integer areaSqft;
        private Boolean hasAc;
        private Boolean hasAttachedBathroom;
        private Boolean hasBalcony;
        private String description;
        private String imageUrl;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReviewDTO {
        private Long id;
        private String reviewerName;
        private String reviewerAvatar;
        private Integer overallRating;
        private Integer cleanlinessRating;
        private Integer foodRating;
        private Integer securityRating;
        private Integer wifiRating;
        private Integer staffRating;
        private Integer valueForMoneyRating;
        private String comment;
        private String pros;
        private String cons;
        private Integer stayDurationMonths;
        private String stayPurpose;
        private Boolean verifiedStay;
        private Integer helpfulCount;
        private String aiSummary;
        private String ownerReply;
        private LocalDateTime ownerReplyDate;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RatingBreakdown {
        private Long fiveStar;
        private Long fourStar;
        private Long threeStar;
        private Long twoStar;
        private Long oneStar;
        private Double avgCleanliness;
        private Double avgFood;
        private Double avgSecurity;
        private Double avgWifi;
        private Double avgStaff;
        private Double avgValueForMoney;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SearchRequest {
        private String query;
        private String city;
        private String locality;
        private Hostel.HostelType type;
        private Hostel.GenderType genderType;
        private BigDecimal minPrice;
        private BigDecimal maxPrice;
        private Boolean verifiedOnly;
        private Boolean foodIncluded;
        private Boolean metroNearby;
        private Boolean coWorkingSpace;
        private List<String> amenities; // WIFI, AC, LAUNDRY, PARKING, SECURITY, POWER_BACKUP, ATTACHED_BATHROOM, FURNISHED
        private String sharingType; // matches RoomType.RoomCategory: SINGLE, DOUBLE_SHARING, TRIPLE_SHARING, DORMITORY, PRIVATE_SUITE
        private String sortBy; // RATING, PRICE_LOW, PRICE_HIGH, NEWEST
        private Integer page = 0;
        private Integer size = 12;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReviewCreateRequest {
        private Long hostelId;
        private Integer overallRating;
        private Integer cleanlinessRating;
        private Integer foodRating;
        private Integer securityRating;
        private Integer wifiRating;
        private Integer staffRating;
        private Integer valueForMoneyRating;
        private String comment;
        private String pros;
        private String cons;
        private Integer stayDurationMonths;
        private String stayPurpose;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AiRecommendationResponse {
        private List<HostelSummaryResponse> recommendations;
        private String aiReason;
        private String personalizedMessage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SearchStatsResponse {
        private Long totalHostels;
        private Long availableRooms;
        private BigDecimal averagePrice;
        private Long verifiedCount;
        private List<String> popularLocalities;
    }
}
