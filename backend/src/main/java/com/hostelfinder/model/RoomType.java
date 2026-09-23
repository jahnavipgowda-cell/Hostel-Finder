package com.hostelfinder.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "room_types")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hostel_id", nullable = false)
    @ToString.Exclude
    private Hostel hostel;

    @Enumerated(EnumType.STRING)
    private RoomCategory category;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerMonth;

    @Column(name = "available_count")
    private Integer availableCount;

    @Column(name = "total_count")
    private Integer totalCount;

    @Column(name = "area_sqft")
    private Integer areaSqft;

    @Column(name = "has_ac")
    private Boolean hasAc;

    @Column(name = "has_attached_bathroom")
    private Boolean hasAttachedBathroom;

    @Column(name = "has_balcony")
    private Boolean hasBalcony;

    @Column(name = "floor_number")
    private String floorNumber;

    @Column(length = 500)
    private String description;

    @Column(name = "image_url")
    private String imageUrl;

    public enum RoomCategory {
        SINGLE, DOUBLE_SHARING, TRIPLE_SHARING, DORMITORY, PRIVATE_SUITE
    }
}
