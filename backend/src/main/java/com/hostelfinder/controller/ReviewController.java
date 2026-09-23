package com.hostelfinder.controller;

import com.hostelfinder.dto.HostelDTOs.*;
import com.hostelfinder.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
@Tag(name = "Reviews", description = "Hostel review management")
@CrossOrigin(origins = "*")
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/hostel/{hostelId}")
    @Operation(summary = "Get paginated reviews for a hostel")
    public ResponseEntity<Page<ReviewDTO>> getReviews(
            @PathVariable Long hostelId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(reviewService.getReviewsByHostel(hostelId, page, size));
    }

    @PostMapping
    @Operation(summary = "Submit a review (authenticated)")
    public ResponseEntity<ReviewDTO> addReview(
            @RequestBody ReviewCreateRequest request,
            Authentication authentication
    ) {
        // In a real app, resolve userId from JWT principal
        Long userId = 1L; // placeholder – replace with real user lookup
        return ResponseEntity.ok(reviewService.addReview(request, userId));
    }

    @PostMapping("/{id}/helpful")
    @Operation(summary = "Mark a review as helpful")
    public ResponseEntity<Void> markHelpful(@PathVariable Long id) {
        reviewService.markHelpful(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/owner-reply")
    @Operation(summary = "Owner replies to a review")
    public ResponseEntity<Void> ownerReply(
            @PathVariable Long id,
            @RequestParam String reply,
            Authentication authentication
    ) {
        reviewService.addOwnerReply(id, reply, 1L);
        return ResponseEntity.ok().build();
    }
}
