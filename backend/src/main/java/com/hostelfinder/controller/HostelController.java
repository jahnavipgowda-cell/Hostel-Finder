package com.hostelfinder.controller;

import com.hostelfinder.dto.HostelDTOs.*;
import com.hostelfinder.service.HostelService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/hostels")
@RequiredArgsConstructor
@Tag(name = "Hostels", description = "Hostel & PG search and discovery APIs")
@CrossOrigin(origins = "*")
public class HostelController {

    private final HostelService hostelService;

    /**
     * Main location-based search
     * GET /api/hostels/search?query=Koramangala&type=PG&minPrice=5000&maxPrice=15000
     */
    @GetMapping("/search")
    @Operation(summary = "Search hostels by location with filters")
    public ResponseEntity<Page<HostelSummaryResponse>> searchHostels(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String genderType,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Boolean verifiedOnly,
            @RequestParam(required = false) Boolean foodIncluded,
            @RequestParam(required = false) Boolean metroNearby,
            @RequestParam(required = false) Boolean coWorkingSpace,
            @RequestParam(required = false) List<String> amenities,
            @RequestParam(required = false) String sharingType,
            @RequestParam(required = false, defaultValue = "RATING") String sortBy,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "12") Integer size
    ) {
        SearchRequest request = new SearchRequest();
        request.setQuery(query);
        request.setCity(city);
        request.setSortBy(sortBy);
        request.setPage(page);
        request.setSize(size);
        request.setVerifiedOnly(verifiedOnly);
        request.setFoodIncluded(foodIncluded);
        request.setMetroNearby(metroNearby);
        request.setCoWorkingSpace(coWorkingSpace);
        request.setAmenities(amenities);
        request.setSharingType(sharingType);

        if (type != null) {
            try { request.setType(com.hostelfinder.model.Hostel.HostelType.valueOf(type.toUpperCase())); }
            catch (Exception ignored) {}
        }
        if (genderType != null) {
            try { request.setGenderType(com.hostelfinder.model.Hostel.GenderType.valueOf(genderType.toUpperCase())); }
            catch (Exception ignored) {}
        }
        if (minPrice != null) request.setMinPrice(java.math.BigDecimal.valueOf(minPrice));
        if (maxPrice != null) request.setMaxPrice(java.math.BigDecimal.valueOf(maxPrice));

        return ResponseEntity.ok(hostelService.searchHostels(request));
    }

    /**
     * Get hostel details by ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get full hostel details including reviews and nearby places")
    public ResponseEntity<HostelDetailResponse> getHostelById(@PathVariable Long id) {
        return ResponseEntity.ok(hostelService.getHostelById(id));
    }

    /**
     * AI-powered recommendations
     */
    @GetMapping("/recommendations")
    @Operation(summary = "Get AI-recommended hostels for a city")
    public ResponseEntity<AiRecommendationResponse> getRecommendations(
            @RequestParam String city,
            @RequestParam(required = false) String preferences
    ) {
        return ResponseEntity.ok(hostelService.getAiRecommendations(city, preferences));
    }

    /**
     * Nearby hostels by GPS coordinates
     */
    @GetMapping("/nearby")
    @Operation(summary = "Get hostels near a GPS location")
    public ResponseEntity<List<HostelSummaryResponse>> getNearbyHostels(
            @RequestParam Double lat,
            @RequestParam Double lng,
            @RequestParam(defaultValue = "5.0") Double radiusKm
    ) {
        return ResponseEntity.ok(hostelService.getNearbyHostels(lat, lng, radiusKm));
    }

    /**
     * Search statistics for a location
     */
    @GetMapping("/stats")
    @Operation(summary = "Get search statistics for a city")
    public ResponseEntity<SearchStatsResponse> getSearchStats(@RequestParam String city) {
        return ResponseEntity.ok(hostelService.getSearchStats(city));
    }

    /**
     * Get all cities with active listings
     */
    @GetMapping("/cities")
    @Operation(summary = "Get all cities with available hostels")
    public ResponseEntity<List<String>> getAllCities() {
        return ResponseEntity.ok(hostelService.getAllCities());
    }

    /**
     * Quick availability check
     */
    @GetMapping("/{id}/availability")
    @Operation(summary = "Check room availability for a hostel")
    public ResponseEntity<Map<String, Object>> checkAvailability(@PathVariable Long id) {
        HostelDetailResponse hostel = hostelService.getHostelById(id);
        return ResponseEntity.ok(Map.of(
                "hostelId", id,
                "hostelName", hostel.getName(),
                "availableRooms", hostel.getAvailableRooms() != null ? hostel.getAvailableRooms() : 0,
                "totalRooms", hostel.getTotalRooms() != null ? hostel.getTotalRooms() : 0,
                "isAvailable", hostel.getAvailableRooms() != null && hostel.getAvailableRooms() > 0,
                "roomTypes", hostel.getRoomTypes()
        ));
    }
}
