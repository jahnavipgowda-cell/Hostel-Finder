package com.hostelfinder.repository;

import com.hostelfinder.model.Hostel;
import com.hostelfinder.model.RoomType;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Dynamic filter builder for hostel search.
 * <p>
 * Facilities are stored as free-text strings (see hostel_facilities table),
 * e.g. "High-Speed WiFi", "24x7 Security", "Bike/Cycle Parking" — so amenity
 * filters match by keyword rather than exact value. AC and attached-bathroom
 * filters instead use the structured boolean columns on room_types, since
 * that data is reliable, and sharing-type filters use the room_types.category
 * enum directly.
 */
public final class HostelSpecifications {

    private HostelSpecifications() {}

    // Canonical amenity key -> facility-text keywords that count as a match (OR'd together)
    private static final Map<String, List<String>> AMENITY_KEYWORDS = Map.of(
            "WIFI", List.of("wifi"),
            "LAUNDRY", List.of("laundry"),
            "PARKING", List.of("parking"),
            "SECURITY", List.of("security", "guard", "biometric"),
            "CCTV", List.of("cctv"),
            "POWER_BACKUP", List.of("power backup", "generator", "inverter"),
            "FURNISHED", List.of("furnish"),
            "HOUSEKEEPING", List.of("housekeeping"),
            "STUDY_AREA", List.of("study area", "study room")
    );

    public static Specification<Hostel> isActive() {
        return (root, query, cb) -> cb.isTrue(root.get("isActive"));
    }

    public static Specification<Hostel> textMatches(String text) {
        if (text == null || text.isBlank()) return null;
        String like = "%" + text.toLowerCase() + "%";
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("city")), like),
                cb.like(cb.lower(root.get("locality")), like),
                cb.like(cb.lower(root.get("address")), like),
                cb.like(cb.lower(root.get("name")), like)
        );
    }

    public static Specification<Hostel> hasGender(Hostel.GenderType gender) {
        if (gender == null) return null;
        return (root, query, cb) -> cb.equal(root.get("genderType"), gender);
    }

    public static Specification<Hostel> hasType(Hostel.HostelType type) {
        if (type == null) return null;
        return (root, query, cb) -> cb.equal(root.get("type"), type);
    }

    public static Specification<Hostel> priceBetween(BigDecimal min, BigDecimal max) {
        if (min == null && max == null) return null;
        return (root, query, cb) -> {
            if (min != null && max != null) return cb.between(root.get("pricePerMonth"), min, max);
            if (min != null) return cb.greaterThanOrEqualTo(root.get("pricePerMonth"), min);
            return cb.lessThanOrEqualTo(root.get("pricePerMonth"), max);
        };
    }

    public static Specification<Hostel> isVerified(Boolean verifiedOnly) {
        if (verifiedOnly == null || !verifiedOnly) return null;
        return (root, query, cb) -> cb.isTrue(root.get("verified"));
    }

    public static Specification<Hostel> hasFood(Boolean foodIncluded) {
        if (foodIncluded == null || !foodIncluded) return null;
        return (root, query, cb) -> cb.isTrue(root.get("foodIncluded"));
    }

    public static Specification<Hostel> hasMetroNearby(Boolean metroNearby) {
        if (metroNearby == null || !metroNearby) return null;
        return (root, query, cb) -> cb.isTrue(root.get("metroNearby"));
    }

    public static Specification<Hostel> hasCoWorking(Boolean coWorking) {
        if (coWorking == null || !coWorking) return null;
        return (root, query, cb) -> cb.isTrue(root.get("coWorkingSpace"));
    }

    /** One EXISTS subquery per requested amenity, ANDed together (must have all selected). */
    public static Specification<Hostel> hasAmenities(List<String> amenityKeys) {
        if (amenityKeys == null || amenityKeys.isEmpty()) return null;
        return (root, query, cb) -> {
            Predicate combined = cb.conjunction();
            for (String rawKey : amenityKeys) {
                String key = rawKey == null ? "" : rawKey.trim().toUpperCase();
                if (key.equals("AC")) {
                    combined = cb.and(combined, existsRoomTypeWhere(root, query, cb,
                            (rt, cb2) -> cb2.isTrue(rt.get("hasAc"))));
                } else if (key.equals("ATTACHED_BATHROOM")) {
                    combined = cb.and(combined, existsRoomTypeWhere(root, query, cb,
                            (rt, cb2) -> cb2.isTrue(rt.get("hasAttachedBathroom"))));
                } else if (AMENITY_KEYWORDS.containsKey(key)) {
                    combined = cb.and(combined, existsFacilityLike(root, query, cb, AMENITY_KEYWORDS.get(key)));
                }
                // Unknown keys are ignored rather than erroring the whole search.
            }
            return combined;
        };
    }

    public static Specification<Hostel> hasSharingType(RoomType.RoomCategory category) {
        if (category == null) return null;
        return (root, query, cb) -> existsRoomTypeWhere(root, query, cb,
                (rt, cb2) -> cb2.equal(rt.get("category"), category));
    }

    private static Predicate existsFacilityLike(Root<Hostel> root, CriteriaQuery<?> query, CriteriaBuilder cb,
                                                 List<String> keywords) {
        Subquery<Long> sub = query.subquery(Long.class);
        Root<Hostel> subRoot = sub.correlate(root);
        Join<Hostel, String> facilities = subRoot.join("facilities");
        Predicate[] ors = keywords.stream()
                .map(kw -> cb.like(cb.lower(facilities), "%" + kw.toLowerCase() + "%"))
                .toArray(Predicate[]::new);
        sub.select(cb.literal(1L)).where(cb.or(ors));
        return cb.exists(sub);
    }

    private interface RoomTypeCondition {
        Predicate apply(Path<RoomType> roomType, CriteriaBuilder cb);
    }

    private static Predicate existsRoomTypeWhere(Root<Hostel> root, CriteriaQuery<?> query, CriteriaBuilder cb,
                                                  RoomTypeCondition condition) {
        Subquery<Long> sub = query.subquery(Long.class);
        Root<Hostel> subRoot = sub.correlate(root);
        Join<Hostel, RoomType> roomTypes = subRoot.join("roomTypes");
        sub.select(cb.literal(1L)).where(condition.apply(roomTypes, cb));
        return cb.exists(sub);
    }
}
