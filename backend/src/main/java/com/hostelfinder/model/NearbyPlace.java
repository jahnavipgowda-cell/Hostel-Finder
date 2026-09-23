package com.hostelfinder.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "nearby_places")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NearbyPlace {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hostel_id", nullable = false)
    @ToString.Exclude
    private Hostel hostel;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    private PlaceCategory category;

    @Column(name = "distance_meters")
    private Double distanceMeters;

    @Column(name = "walk_time_minutes")
    private Integer walkTimeMinutes;

    @Column(name = "google_place_id")
    private String googlePlaceId;

    // ✅ FIXED
    @Column(name = "rating")
    private Double rating;

    private String icon;

    public enum PlaceCategory {
        METRO_STATION, BUS_STOP, HOSPITAL, PHARMACY, GROCERY, RESTAURANT,
        COLLEGE, UNIVERSITY, PARK, GYM, ATM, BANK, CAFE, MALL, SUPERMARKET,
        POLICE_STATION, TEMPLE, MOSQUE, CHURCH, LIBRARY
    }
}