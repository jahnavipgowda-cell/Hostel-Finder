package com.hostelfinder.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hostel_id", nullable = false)
    @ToString.Exclude
    private Hostel hostel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @ToString.Exclude
    private User user;

    @Column(name = "reviewer_name")
    private String reviewerName;

    @Column(name = "reviewer_avatar")
    private String reviewerAvatar;

    // Ratings (1-5 scale)
    @Column(name = "overall_rating", nullable = false)
    private Integer overallRating;

    @Column(name = "cleanliness_rating")
    private Integer cleanlinessRating;

    @Column(name = "food_rating")
    private Integer foodRating;

    @Column(name = "security_rating")
    private Integer securityRating;

    @Column(name = "wifi_rating")
    private Integer wifiRating;

    @Column(name = "staff_rating")
    private Integer staffRating;

    @Column(name = "value_for_money_rating")
    private Integer valueForMoneyRating;

    @Column(name = "comment", length = 2000)
    private String comment;

    @Column(name = "pros", length = 500)
    private String pros;

    @Column(name = "cons", length = 500)
    private String cons;

    @Column(name = "stay_duration_months")
    private Integer stayDurationMonths;

    @Column(name = "stay_purpose")
    private String stayPurpose;

    @Column(name = "verified_stay")
    private Boolean verifiedStay;

    @Column(name = "helpful_count")
    @Builder.Default
    private Integer helpfulCount = 0;

    // ✅ FIXED: removed precision & scale
    @Column(name = "sentiment_score")
    private Double sentimentScore;

    @Column(name = "ai_summary", length = 500)
    private String aiSummary;

    @Column(name = "owner_reply", length = 1000)
    private String ownerReply;

    @Column(name = "owner_reply_date")
    private LocalDateTime ownerReplyDate;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;
}