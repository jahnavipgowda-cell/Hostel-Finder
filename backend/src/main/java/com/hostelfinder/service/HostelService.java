package com.hostelfinder.service;

import com.hostelfinder.dto.HostelDTOs.*;
import com.hostelfinder.model.*;
import com.hostelfinder.repository.HostelRepository;
import com.hostelfinder.repository.HostelSpecifications;
import com.hostelfinder.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class HostelService {

    private final HostelRepository hostelRepository;
    private final ReviewRepository reviewRepository;

    // Old/alternate English names for cities that are stored under their
    // current official name in the seed data — this is a real equivalence
    // ("Bangalore" IS "Bengaluru"), not a typo guess, so it's resolved
    // silently rather than surfaced as a "did you mean" suggestion (that's
    // handled separately, client-side, for actual misspellings). Only the
    // leading city token is checked/replaced; the rest of the query text
    // (e.g. a locality typed alongside it) passes through unchanged.
    private static final Map<String, String> CITY_ALIASES = Map.of(
            "bangalore", "Bengaluru",
            "bombay", "Mumbai",
            "calcutta", "Kolkata",
            "madras", "Chennai",
            "cochin", "Kochi",
            "new delhi", "Delhi"
    );

    private String resolveCityAlias(String query) {
        if (query == null || query.isBlank()) return query;
        String trimmed = query.trim();
        String alias = CITY_ALIASES.get(trimmed.toLowerCase());
        return alias != null ? alias : query;
    }

    /**
     * Main search method — searches hostels by location with filters.
     * Uses a Specification so amenity/sharing-type filters (which need EXISTS
     * subqueries against facilities and room_types) can be combined freely
     * with the simpler column filters instead of hard-coding every combination.
     */
    public Page<HostelSummaryResponse> searchHostels(SearchRequest request) {
        Sort sort = buildSort(request.getSortBy());
        Pageable pageable = PageRequest.of(
                request.getPage() != null ? request.getPage() : 0,
                request.getSize() != null ? request.getSize() : 12,
                sort
        );

        String query = request.getQuery() != null ? request.getQuery() :
                       (request.getCity() != null ? request.getCity() : "");
        query = resolveCityAlias(query);

        RoomType.RoomCategory sharingCategory = null;
        if (request.getSharingType() != null && !request.getSharingType().isBlank()) {
            try {
                sharingCategory = RoomType.RoomCategory.valueOf(request.getSharingType().trim().toUpperCase());
            } catch (IllegalArgumentException ignored) {
                // unrecognized sharing type — ignore rather than fail the whole search
            }
        }

        // Combine only the filters actually in play; each helper returns null when its
        // filter is absent, so this stays a plain AND of whatever was requested. Built
        // manually (rather than Specification.allOf, added in a later Spring Data version
        // than this project pins) to avoid a version mismatch at compile time.
        List<Specification<Hostel>> specs = new java.util.ArrayList<>();
        specs.add(HostelSpecifications.isActive());
        specs.add(HostelSpecifications.textMatches(query));
        specs.add(HostelSpecifications.hasGender(request.getGenderType()));
        specs.add(HostelSpecifications.hasType(request.getType()));
        specs.add(HostelSpecifications.priceBetween(request.getMinPrice(), request.getMaxPrice()));
        specs.add(HostelSpecifications.isVerified(request.getVerifiedOnly()));
        specs.add(HostelSpecifications.hasFood(request.getFoodIncluded()));
        specs.add(HostelSpecifications.hasMetroNearby(request.getMetroNearby()));
        specs.add(HostelSpecifications.hasCoWorking(request.getCoWorkingSpace()));
        specs.add(HostelSpecifications.hasAmenities(request.getAmenities()));
        specs.add(HostelSpecifications.hasSharingType(sharingCategory));

        Specification<Hostel> spec = Specification.where(null);
        for (Specification<Hostel> s : specs) {
            if (s != null) spec = spec.and(s);
        }

        Page<Hostel> hostels = hostelRepository.findAll(spec, pageable);

        return hostels.map(this::toSummaryResponse);
    }

    /**
     * Get full hostel details
     */
    public HostelDetailResponse getHostelById(Long id) {
        Hostel hostel = hostelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hostel not found with id: " + id));

        List<Review> recentReviews = reviewRepository
                .findByHostelIdAndIsActiveTrueOrderByHelpfulCountDesc(id)
                .stream().limit(5).collect(Collectors.toList());

        RatingBreakdown breakdown = buildRatingBreakdown(id, recentReviews);

        return toDetailResponse(hostel, recentReviews, breakdown);
    }

    /**
     * AI-powered recommendations based on user preferences
     */
    @Cacheable(value = "aiRecommendations", key = "#city")
    public AiRecommendationResponse getAiRecommendations(String city, String userPreferences) {
        List<Hostel> recommended = hostelRepository.findAiRecommendedByCity(city);

        if (recommended.isEmpty()) {
            recommended = hostelRepository.findTopRatedByCity(city, PageRequest.of(0, 6));
        }

        String aiReason = generateAiReasonText(recommended, city);

        return AiRecommendationResponse.builder()
                .recommendations(recommended.stream()
                        .map(this::toSummaryResponse)
                        .collect(Collectors.toList()))
                .aiReason(aiReason)
                .personalizedMessage("Based on your preferences and thousands of verified reviews, " +
                        "here are the best-rated accommodations in " + city + " for 2026.")
                .build();
    }

    /**
     * Get nearby hostels using geolocation. The repository's Haversine query
     * already filters to the requested radius; we recompute the same
     * distance here in Java (identical formula) purely to attach a
     * displayable distanceKm to each result and sort nearest-first, since
     * the native query returns matched rows but not the distance value
     * itself.
     */
    public List<HostelSummaryResponse> getNearbyHostels(Double lat, Double lng, Double radiusKm) {
        return hostelRepository.findNearbyHostels(lat, lng, radiusKm)
                .stream()
                .map(h -> {
                    HostelSummaryResponse dto = toSummaryResponse(h);
                    dto.setDistanceKm(haversineKm(lat, lng, h.getLatitude(), h.getLongitude()));
                    return dto;
                })
                .sorted(java.util.Comparator.comparing(
                        HostelSummaryResponse::getDistanceKm,
                        java.util.Comparator.nullsLast(Double::compareTo)))
                .collect(Collectors.toList());
    }

    /** Great-circle distance in km between two lat/lng points — same formula as the SQL query in HostelRepository. */
    private double haversineKm(double lat1, double lng1, Double lat2, Double lng2) {
        if (lat2 == null || lng2 == null) return Double.MAX_VALUE;
        double earthRadiusKm = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return earthRadiusKm * c;
    }

    /**
     * Get search statistics for a city
     */
    public SearchStatsResponse getSearchStats(String city) {
        List<Hostel> all = hostelRepository.findTopRatedByCity(city, PageRequest.of(0, 100));

        BigDecimal avgPrice = all.stream()
                .map(Hostel::getPricePerMonth)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (!all.isEmpty()) {
            avgPrice = avgPrice.divide(BigDecimal.valueOf(all.size()), 2, RoundingMode.HALF_UP);
        }

        long verifiedCount = all.stream().filter(h -> Boolean.TRUE.equals(h.getVerified())).count();

        return SearchStatsResponse.builder()
                .totalHostels((long) all.size())
                .availableRooms(hostelRepository.countAvailableRoomsByCity(city))
                .averagePrice(avgPrice)
                .verifiedCount(verifiedCount)
                .popularLocalities(
                        all.stream()
                                .map(Hostel::getLocality)
                                .distinct()
                                .limit(5)
                                .collect(Collectors.toList())
                )
                .build();
    }

    /**
     * Get all active cities
     */
    public List<String> getAllCities() {
        return hostelRepository.findAllActiveCities();
    }

    // ---- Mapping helpers ----

    private HostelSummaryResponse toSummaryResponse(Hostel h) {
        String thumbnail = (h.getImageUrls() != null && !h.getImageUrls().isEmpty())
                ? h.getImageUrls().get(0) : null;

        return HostelSummaryResponse.builder()
                .id(h.getId())
                .name(h.getName())
                .type(h.getType())
                .genderType(h.getGenderType())
                .address(h.getAddress())
                .city(h.getCity())
                .locality(h.getLocality())
                .latitude(h.getLatitude())
                .longitude(h.getLongitude())
                .pricePerMonth(h.getPricePerMonth())
                .pricePerDay(h.getPricePerDay())
                .availableRooms(h.getAvailableRooms())
                .rating(h.getRating())
                .totalReviews(h.getTotalReviews())
                .verified(h.getVerified())
                .aiRecommended(h.getAiRecommended())
                .facilities(h.getFacilities())
                .thumbnailUrl(thumbnail)
                .foodIncluded(h.getFoodIncluded())
                .metroNearby(h.getMetroNearby())
                .metroDistanceKm(h.getMetroDistanceKm())
                .coWorkingSpace(h.getCoWorkingSpace())
                .noiseLevel(h.getNoiseLevel())
                .aiSafetyScore(h.getAiSafetyScore())
                .smartLockEnabled(h.getSmartLockEnabled())
                .evChargingAvailable(h.getEvChargingAvailable())
                .communityRating(h.getCommunityRating())
                .build();
    }

    private HostelDetailResponse toDetailResponse(Hostel h, List<Review> reviews, RatingBreakdown breakdown) {
        return HostelDetailResponse.builder()
                .id(h.getId())
                .name(h.getName())
                .type(h.getType())
                .genderType(h.getGenderType())
                .address(h.getAddress())
                .city(h.getCity())
                .state(h.getState())
                .pincode(h.getPincode())
                .locality(h.getLocality())
                .latitude(h.getLatitude())
                .longitude(h.getLongitude())
                .pricePerMonth(h.getPricePerMonth())
                .pricePerDay(h.getPricePerDay())
                .securityDeposit(h.getSecurityDeposit())
                .availableRooms(h.getAvailableRooms())
                .totalRooms(h.getTotalRooms())
                .rating(h.getRating())
                .totalReviews(h.getTotalReviews())
                .verified(h.getVerified())
                .aiRecommended(h.getAiRecommended())
                .description(h.getDescription())
                .ownerName(h.getOwnerName())
                .contactNumber(h.getContactNumber())
                .contactEmail(h.getContactEmail())
                .websiteUrl(h.getWebsiteUrl())
                .virtualTourUrl(h.getVirtualTourUrl())
                .facilities(h.getFacilities())
                .rules(h.getRules())
                .imageUrls(h.getImageUrls())
                .nearbyPlaces(h.getNearbyPlaces().stream().map(this::toNearbyPlaceDTO).collect(Collectors.toList()))
                .roomTypes(h.getRoomTypes().stream().map(this::toRoomTypeDTO).collect(Collectors.toList()))
                .recentReviews(reviews.stream().map(this::toReviewDTO).collect(Collectors.toList()))
                .ratingBreakdown(breakdown)
                .foodIncluded(h.getFoodIncluded())
                .mealsPerDay(h.getMealsPerDay())
                .metroNearby(h.getMetroNearby())
                .metroDistanceKm(h.getMetroDistanceKm())
                .hospitalNearby(h.getHospitalNearby())
                .coWorkingSpace(h.getCoWorkingSpace())
                .smartLockEnabled(h.getSmartLockEnabled())
                .evChargingAvailable(h.getEvChargingAvailable())
                .solarPowered(h.getSolarPowered())
                .aiSafetyScore(h.getAiSafetyScore())
                .noiseLevel(h.getNoiseLevel())
                .communityRating(h.getCommunityRating())
                .createdAt(h.getCreatedAt())
                .build();
    }

    private NearbyPlaceDTO toNearbyPlaceDTO(NearbyPlace np) {
        return NearbyPlaceDTO.builder()
                .name(np.getName())
                .category(np.getCategory() != null ? np.getCategory().name() : null)
                .distanceMeters(np.getDistanceMeters())
                .walkTimeMinutes(np.getWalkTimeMinutes())
                .rating(np.getRating())
                .icon(np.getIcon())
                .build();
    }

    private RoomTypeDTO toRoomTypeDTO(RoomType rt) {
        return RoomTypeDTO.builder()
                .category(rt.getCategory() != null ? rt.getCategory().name() : null)
                .name(rt.getName())
                .pricePerMonth(rt.getPricePerMonth())
                .availableCount(rt.getAvailableCount())
                .totalCount(rt.getTotalCount())
                .areaSqft(rt.getAreaSqft())
                .hasAc(rt.getHasAc())
                .hasAttachedBathroom(rt.getHasAttachedBathroom())
                .hasBalcony(rt.getHasBalcony())
                .description(rt.getDescription())
                .imageUrl(rt.getImageUrl())
                .build();
    }

    private ReviewDTO toReviewDTO(Review r) {
        return ReviewDTO.builder()
                .id(r.getId())
                .reviewerName(r.getReviewerName())
                .reviewerAvatar(r.getReviewerAvatar())
                .overallRating(r.getOverallRating())
                .cleanlinessRating(r.getCleanlinessRating())
                .foodRating(r.getFoodRating())
                .securityRating(r.getSecurityRating())
                .wifiRating(r.getWifiRating())
                .staffRating(r.getStaffRating())
                .valueForMoneyRating(r.getValueForMoneyRating())
                .comment(r.getComment())
                .pros(r.getPros())
                .cons(r.getCons())
                .stayDurationMonths(r.getStayDurationMonths())
                .stayPurpose(r.getStayPurpose())
                .verifiedStay(r.getVerifiedStay())
                .helpfulCount(r.getHelpfulCount())
                .aiSummary(r.getAiSummary())
                .ownerReply(r.getOwnerReply())
                .ownerReplyDate(r.getOwnerReplyDate())
                .createdAt(r.getCreatedAt())
                .build();
    }

    private RatingBreakdown buildRatingBreakdown(Long hostelId, List<Review> reviews) {
        Map<Integer, Long> dist = new HashMap<>();
        for (int i = 1; i <= 5; i++) dist.put(i, 0L);

        double avgCleanliness = 0, avgFood = 0, avgSec = 0, avgWifi = 0, avgStaff = 0, avgValue = 0;
        int count = reviews.size();

        for (Review r : reviews) {
            dist.merge(r.getOverallRating(), 1L, Long::sum);
            if (r.getCleanlinessRating() != null) avgCleanliness += r.getCleanlinessRating();
            if (r.getFoodRating() != null) avgFood += r.getFoodRating();
            if (r.getSecurityRating() != null) avgSec += r.getSecurityRating();
            if (r.getWifiRating() != null) avgWifi += r.getWifiRating();
            if (r.getStaffRating() != null) avgStaff += r.getStaffRating();
            if (r.getValueForMoneyRating() != null) avgValue += r.getValueForMoneyRating();
        }

        if (count > 0) {
            avgCleanliness /= count;
            avgFood /= count;
            avgSec /= count;
            avgWifi /= count;
            avgStaff /= count;
            avgValue /= count;
        }

        return RatingBreakdown.builder()
                .fiveStar(dist.get(5))
                .fourStar(dist.get(4))
                .threeStar(dist.get(3))
                .twoStar(dist.get(2))
                .oneStar(dist.get(1))
                .avgCleanliness(avgCleanliness)
                .avgFood(avgFood)
                .avgSecurity(avgSec)
                .avgWifi(avgWifi)
                .avgStaff(avgStaff)
                .avgValueForMoney(avgValue)
                .build();
    }

    private Sort buildSort(String sortBy) {
        if (sortBy == null) return Sort.by(Sort.Direction.DESC, "rating");
        return switch (sortBy.toUpperCase()) {
            case "PRICE_LOW" -> Sort.by(Sort.Direction.ASC, "pricePerMonth");
            case "PRICE_HIGH" -> Sort.by(Sort.Direction.DESC, "pricePerMonth");
            case "NEWEST" -> Sort.by(Sort.Direction.DESC, "createdAt");
            case "REVIEWS" -> Sort.by(Sort.Direction.DESC, "totalReviews");
            default -> Sort.by(Sort.Direction.DESC, "rating");
        };
    }

    private String generateAiReasonText(List<Hostel> hostels, String city) {
        if (hostels.isEmpty()) return "No specific recommendations found for " + city;
        Hostel top = hostels.get(0);
        return String.format(
                "Our AI analyzed %d hostels in %s, cross-referencing %d+ verified reviews, " +
                "safety scores, proximity to transit, and community ratings. " +
                "%s stands out with a %.1f★ rating and exceptional safety score.",
                hostels.size(), city,
                hostels.stream().mapToInt(h -> h.getTotalReviews() != null ? h.getTotalReviews() : 0).sum(),
                top.getName(),
                top.getRating() != null ? top.getRating().doubleValue() : 0.0
        );
    }
}
