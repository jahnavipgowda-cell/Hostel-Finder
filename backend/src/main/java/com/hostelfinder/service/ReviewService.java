package com.hostelfinder.service;

import com.hostelfinder.dto.HostelDTOs.*;
import com.hostelfinder.model.*;
import com.hostelfinder.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final HostelRepository hostelRepository;
    private final UserRepository userRepository;

    @Transactional
    public ReviewDTO addReview(ReviewCreateRequest request, Long userId) {
        Hostel hostel = hostelRepository.findById(request.getHostelId())
                .orElseThrow(() -> new RuntimeException("Hostel not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Review review = Review.builder()
                .hostel(hostel)
                .user(user)
                .reviewerName(user.getFullName())
                .overallRating(request.getOverallRating())
                .cleanlinessRating(request.getCleanlinessRating())
                .foodRating(request.getFoodRating())
                .securityRating(request.getSecurityRating())
                .wifiRating(request.getWifiRating())
                .staffRating(request.getStaffRating())
                .valueForMoneyRating(request.getValueForMoneyRating())
                .comment(request.getComment())
                .pros(request.getPros())
                .cons(request.getCons())
                .stayDurationMonths(request.getStayDurationMonths())
                .stayPurpose(request.getStayPurpose())
                .verifiedStay(false)
                .isActive(true)
                .build();

        // Simple AI sentiment analysis (in production, call an NLP service)
        review.setSentimentScore(computeSentiment(request.getComment()));
        review.setAiSummary(generateAiSummary(request));

        Review saved = reviewRepository.save(review);

        // Update hostel aggregate rating
        updateHostelRating(hostel);

        return toReviewDTO(saved);
    }

    @Transactional
    public void markHelpful(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        review.setHelpfulCount(review.getHelpfulCount() + 1);
        reviewRepository.save(review);
    }

    @Transactional
    public void addOwnerReply(Long reviewId, String reply, Long ownerId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        review.setOwnerReply(reply);
        review.setOwnerReplyDate(LocalDateTime.now());
        reviewRepository.save(review);
    }

    public Page<ReviewDTO> getReviewsByHostel(Long hostelId, int page, int size) {
        return reviewRepository
                .findByHostelIdAndIsActiveTrueOrderByCreatedAtDesc(hostelId, PageRequest.of(page, size))
                .map(this::toReviewDTO);
    }

    private void updateHostelRating(Hostel hostel) {
        Double avg = reviewRepository.findAverageRatingByHostelId(hostel.getId()).orElse(0.0);
        Long count = reviewRepository.countByHostelId(hostel.getId());
        hostel.setRating(BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP));
        hostel.setTotalReviews(count.intValue());
        hostelRepository.save(hostel);
    }

    private double computeSentiment(String text) {
        if (text == null || text.isBlank()) return 0.5;
        String lower = text.toLowerCase();
        long pos = List.of("great", "excellent", "good", "amazing", "clean", "safe", "friendly", "nice", "recommend")
                .stream().filter(lower::contains).count();
        long neg = List.of("bad", "dirty", "unsafe", "noisy", "rude", "expensive", "worst", "avoid", "terrible")
                .stream().filter(lower::contains).count();
        double score = 0.5 + (pos - neg) * 0.1;
        return Math.max(0.0, Math.min(1.0, score));
    }

    private String generateAiSummary(ReviewCreateRequest req) {
        StringBuilder sb = new StringBuilder();
        if (req.getOverallRating() >= 4) sb.append("Highly positive experience. ");
        else if (req.getOverallRating() == 3) sb.append("Mixed but generally acceptable stay. ");
        else sb.append("Below expectations. ");
        if (req.getPros() != null && !req.getPros().isBlank())
            sb.append("Highlights: ").append(req.getPros().substring(0, Math.min(80, req.getPros().length()))).append(". ");
        if (req.getCons() != null && !req.getCons().isBlank())
            sb.append("Concerns: ").append(req.getCons().substring(0, Math.min(80, req.getCons().length()))).append(".");
        return sb.toString();
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
}
