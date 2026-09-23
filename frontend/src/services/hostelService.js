import { apiRequest } from "./api";

/**
 * Search hostels with filters. Accepts the same filter shape used by the
 * Home page's Filter/SearchBar components:
 * { query, city, type, genderType, minPrice, maxPrice, sortBy, page, size }
 *
 * Returns a Spring Page<HostelSummaryResponse>: { content, totalPages, ... }
 */
export async function getHostels(filters = {}) {
    const {
        query = "",
        city = "",
        type = "",
        genderType = "",
        minPrice = "",
        maxPrice = "",
        verifiedOnly = false,
        foodIncluded = false,
        metroNearby = false,
        coWorkingSpace = false,
        amenities = [],
        sharingType = "",
        sortBy = "RATING",
        page = 0,
        size = 12,
    } = filters;

    const params = new URLSearchParams();
    if (query) params.set("query", query);
    if (city) params.set("city", city);
    if (type) params.set("type", type);
    if (genderType) params.set("genderType", genderType);
    if (minPrice !== "" && minPrice != null) params.set("minPrice", minPrice);
    if (maxPrice !== "" && maxPrice != null) params.set("maxPrice", maxPrice);
    if (verifiedOnly) params.set("verifiedOnly", "true");
    if (foodIncluded) params.set("foodIncluded", "true");
    if (metroNearby) params.set("metroNearby", "true");
    if (coWorkingSpace) params.set("coWorkingSpace", "true");
    if (sharingType) params.set("sharingType", sharingType);
    amenities.forEach((a) => params.append("amenities", a));
    params.set("sortBy", sortBy);
    params.set("page", page);
    params.set("size", size);

    return apiRequest(`/hostels/search?${params.toString()}`);
}

export async function getHostelById(id) {
    return apiRequest(`/hostels/${id}`);
}

export async function getRecommendations(city, preferences) {
    const params = new URLSearchParams({ city });
    if (preferences) params.set("preferences", preferences);
    return apiRequest(`/hostels/recommendations?${params.toString()}`);
}

export async function getAllCities() {
    return apiRequest(`/hostels/cities`);
}

export async function getSearchStats(city) {
    return apiRequest(`/hostels/stats?${new URLSearchParams({ city })}`);
}

/**
 * Hostels near a GPS coordinate, sorted by distance. Returns a flat array
 * (not a paginated Page) since it's a "find near me" style result set.
 */
export async function getNearbyHostels(lat, lng, radiusKm = 5) {
    const params = new URLSearchParams({ lat, lng, radiusKm });
    return apiRequest(`/hostels/nearby?${params.toString()}`);
}
