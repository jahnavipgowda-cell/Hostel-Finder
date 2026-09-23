package com.hostelfinder.controller;

import com.hostelfinder.model.*;
import com.hostelfinder.repository.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Admin operations: manage hostels, users, and reviews")
@CrossOrigin(origins = "*")
public class AdminController {

    private final HostelRepository hostelRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;

    // ─── Dashboard Stats ───────────────────────────────────────────────────────

    @GetMapping("/dashboard")
    @Operation(summary = "Get admin dashboard statistics")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        long totalHostels = hostelRepository.count();
        long totalUsers   = userRepository.count();
        long totalReviews = reviewRepository.count();
        long totalBookings = bookingRepository.count();
        List<String> cities = hostelRepository.findAllActiveCities();

        return ResponseEntity.ok(Map.of(
                "totalHostels",  totalHostels,
                "totalUsers",    totalUsers,
                "totalReviews",  totalReviews,
                "totalBookings", totalBookings,
                "activeCities",  cities.size(),
                "cityList",      cities,
                "message",       "NestIQ Admin Dashboard — 2026"
        ));
    }

    // ─── Hostel Management ─────────────────────────────────────────────────────

    @PostMapping("/hostels")
    @Operation(summary = "Create a new hostel listing")
    public ResponseEntity<Hostel> createHostel(@RequestBody Hostel hostel) {
        hostel.setIsActive(true);
        if (hostel.getRating() == null) hostel.setRating(BigDecimal.ZERO);
        if (hostel.getTotalReviews() == null) hostel.setTotalReviews(0);
        return ResponseEntity.ok(hostelRepository.save(hostel));
    }

    @PutMapping("/hostels/{id}")
    @Operation(summary = "Update an existing hostel listing")
    public ResponseEntity<Hostel> updateHostel(@PathVariable Long id, @RequestBody Hostel updated) {
        return hostelRepository.findById(id).map(existing -> {
            updated.setId(id);
            updated.setCreatedAt(existing.getCreatedAt());
            return ResponseEntity.ok(hostelRepository.save(updated));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/hostels/{id}/verify")
    @Operation(summary = "Toggle hostel verification status")
    public ResponseEntity<Map<String, Object>> verifyHostel(
            @PathVariable Long id,
            @RequestParam boolean verified) {
        return hostelRepository.findById(id).map(h -> {
            h.setVerified(verified);
            hostelRepository.save(h);
            return ResponseEntity.ok(Map.<String, Object>of(
                    "hostelId", id,
                    "verified", verified,
                    "message", verified ? "Hostel verified ✅" : "Verification removed"
            ));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/hostels/{id}/ai-recommend")
    @Operation(summary = "Toggle AI recommendation badge")
    public ResponseEntity<Map<String, Object>> setAiRecommended(
            @PathVariable Long id,
            @RequestParam boolean recommended) {
        return hostelRepository.findById(id).map(h -> {
            h.setAiRecommended(recommended);
            hostelRepository.save(h);
            return ResponseEntity.ok(Map.<String, Object>of(
                    "hostelId", id,
                    "aiRecommended", recommended
            ));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/hostels/{id}")
    @Operation(summary = "Soft-delete (deactivate) a hostel listing")
    public ResponseEntity<Map<String, Object>> deactivateHostel(@PathVariable Long id) {
        return hostelRepository.findById(id).map(h -> {
            h.setIsActive(false);
            hostelRepository.save(h);
            return ResponseEntity.ok(Map.<String, Object>of(
                    "message", "Hostel deactivated successfully",
                    "hostelId", id
            ));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ─── Review Moderation ────────────────────────────────────────────────────

    @DeleteMapping("/reviews/{id}")
    @Operation(summary = "Soft-delete a review (moderation)")
    public ResponseEntity<Map<String, Object>> deleteReview(@PathVariable Long id) {
        return reviewRepository.findById(id).map(r -> {
            r.setIsActive(false);
            reviewRepository.save(r);
            return ResponseEntity.ok(Map.<String, Object>of(
                    "message", "Review removed",
                    "reviewId", id
            ));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ─── User Management ──────────────────────────────────────────────────────

    @GetMapping("/users")
    @Operation(summary = "List all registered users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PatchMapping("/users/{id}/role")
    @Operation(summary = "Change a user's role (USER / OWNER / ADMIN)")
    public ResponseEntity<Map<String, Object>> changeUserRole(
            @PathVariable Long id,
            @RequestParam String role) {
        return userRepository.findById(id).map(user -> {
            try {
                user.setRole(User.Role.valueOf(role.toUpperCase()));
                userRepository.save(user);
                return ResponseEntity.ok(Map.<String, Object>of(
                        "userId", id, "newRole", role.toUpperCase()
                ));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.<String, Object>of(
                        "error", "Invalid role: " + role
                ));
            }
        }).orElse(ResponseEntity.notFound().build());
    }
}
