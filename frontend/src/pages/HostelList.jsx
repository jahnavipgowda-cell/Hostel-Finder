import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import Filter from "../components/Filter";
import HostelCard from "../components/HostelCard";
import Loader from "../components/Loader";
import Pagination from "../components/Pagination";
import Footer from "../components/Footer";

import { getHostels, getAllCities, getNearbyHostels, getRecommendations } from "../services/hostelService";

import "../styles/home.css";

const DEFAULT_FILTERS = {
    city: "",
    query: "",
    type: "",
    genderType: "",
    minPrice: "",
    maxPrice: "",
    sharingType: "",
    amenities: [],
    foodIncluded: false,
    page: 0,
    size: 12,
};

/**
 * Dedicated "browse all hostels" page (reached via the Navbar's "Hostels"
 * link). It supports the same filters as the Home page's grid, plus
 * reading an initial ?query= from the URL so links like /hostels?query=Koramangala
 * work from anywhere in the app.
 *
 * It also doubles as the "Find Hostels Near Me" results page: when the URL
 * carries ?nearby=true&lat=..&lng=.. (set by the geolocation button on
 * Home), it calls the distance-based /hostels/nearby endpoint instead of
 * the regular filtered search, and renders a flat, unpaginated list sorted
 * by distance.
 */
const HostelList = () => {
    const [searchParams] = useSearchParams();
    const initialQuery = searchParams.get("query") || "";
    const initialType = searchParams.get("type") || "";
    const isNearby = searchParams.get("nearby") === "true";
    const nearbyLat = searchParams.get("lat");
    const nearbyLng = searchParams.get("lng");

    const [filters, setFilters] = useState({
        ...DEFAULT_FILTERS,
        query: initialQuery,
        type: initialType,
    });
    const [hostels, setHostels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [totalPages, setTotalPages] = useState(0);
    const [totalResults, setTotalResults] = useState(0);
    const [cities, setCities] = useState([]);

    useEffect(() => {
        getAllCities().then((data) => setCities(Array.isArray(data) ? data : [])).catch(() => setCities([]));
    }, []);

    // "Recommended in {city}" — only fetched when the search actually
    // resolves to one of the backend's known cities (recommendations are
    // matched by an exact city column, so passing a locality like
    // "Koramangala" would silently return nothing useful). No recommendation
    // block is shown at all for locality/name searches rather than faking one.
    const [recommended, setRecommended] = useState([]);
    const [recommendedCity, setRecommendedCity] = useState(null);
    const matchedCity = cities.find(
        (c) => c.toLowerCase() === (filters.city || filters.query || "").trim().toLowerCase()
    );

    useEffect(() => {
        if (!matchedCity || isNearby) {
            setRecommended([]);
            setRecommendedCity(null);
            return;
        }
        getRecommendations(matchedCity)
            .then((data) => {
                setRecommended(data.recommendations || []);
                setRecommendedCity(matchedCity);
            })
            .catch(() => {
                setRecommended([]);
                setRecommendedCity(null);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [matchedCity, isNearby]);

    const loadHostels = async (searchFilters) => {
        try {
            setLoading(true);
            setError("");
            const data = await getHostels(searchFilters);
            setHostels(data.content || []);
            setTotalPages(data.totalPages ?? 0);
            setTotalResults(data.totalElements ?? (data.content || []).length);
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to load hostels.");
            setHostels([]);
        } finally {
            setLoading(false);
        }
    };

    const loadNearby = async (lat, lng) => {
        try {
            setLoading(true);
            setError("");
            const data = await getNearbyHostels(lat, lng, 10);
            const list = Array.isArray(data) ? data : [];
            setHostels(list);
            setTotalPages(0);
            setTotalResults(list.length);
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to load nearby hostels.");
            setHostels([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isNearby && nearbyLat && nearbyLng) {
            loadNearby(nearbyLat, nearbyLng);
        } else {
            loadHostels({ ...DEFAULT_FILTERS, query: initialQuery, type: initialType });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSearch = (partial) => {
        const updated = { ...filters, ...partial, page: 0 };
        setFilters(updated);
        loadHostels(updated);
    };

    const hasActiveFilters = () =>
        (filters.amenities && filters.amenities.length > 0) ||
        filters.foodIncluded ||
        filters.minPrice ||
        filters.maxPrice ||
        filters.genderType ||
        filters.sharingType;

    const searchLabel = filters.query || filters.city;

    // Levenshtein edit distance — used only to suggest a likely-intended
    // city for a probable typo ("Banglore" -> "Bangalore"). Deliberately
    // conservative (distance <= 2, and only checked against the real
    // getAllCities() list) so it never turns into "show unrelated results"
    // — it only ever offers a clickable suggestion, never substitutes the
    // search silently.
    const editDistance = (a, b) => {
        const m = a.length, n = b.length;
        const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
        for (let j = 0; j <= n; j++) dp[0][j] = j;
        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                dp[i][j] = a[i - 1] === b[j - 1]
                    ? dp[i - 1][j - 1]
                    : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
            }
        }
        return dp[m][n];
    };

    const didYouMeanCity = (() => {
        if (!searchLabel || cities.length === 0) return null;
        const term = searchLabel.trim().toLowerCase();
        if (term.length < 4) return null;
        if (cities.some((c) => c.toLowerCase() === term)) return null; // already an exact match
        // Candidates include both the real city names AND their common
        // alternate names (Bangalore/Bombay/Calcutta/Madras/Cochin) — a typo
        // of the alternate name (e.g. "Banglore") is far closer to
        // "Bangalore" than to the DB's canonical "Bengaluru", so checking
        // only the canonical names misses the single most common case.
        const ALIAS_TO_CANONICAL = { Bangalore: "Bengaluru", Bombay: "Mumbai", Calcutta: "Kolkata", Madras: "Chennai", Cochin: "Kochi" };
        const candidates = [
            ...cities.map((c) => [c, c]),
            ...Object.entries(ALIAS_TO_CANONICAL).filter(([, canon]) => cities.includes(canon)),
        ];
        let bestLabel = null, bestCanonical = null, bestDist = Infinity;
        for (const [label, canonical] of candidates) {
            const dist = editDistance(term, label.toLowerCase());
            if (dist < bestDist) {
                bestDist = dist;
                bestLabel = label;
                bestCanonical = canonical;
            }
        }
        // Allow slightly more slack on longer names.
        const threshold = bestLabel && bestLabel.length >= 8 ? 3 : 2;
        return bestDist > 0 && bestDist <= threshold ? bestCanonical : null;
    })();

    return (
        <>
            <Navbar />

            <section className="hero" style={{ padding: "48px 20px" }}>
                <div className="hero-content">
                    <h1>
                        {isNearby
                            ? "Hostels Near You"
                            : searchLabel
                            ? `PGs in ${searchLabel}`
                            : "Browse Hostels & PGs"}
                    </h1>
                    <p>
                        {isNearby
                            ? `${totalResults} stays found within 10km, closest first`
                            : `${totalResults} ${totalResults === 1 ? "property" : "properties"} found`}
                    </p>
                </div>
            </section>

            {!isNearby && (
                <>
                    <SearchBar onSearch={handleSearch} />
                    <Filter
                        filters={filters}
                        setFilters={setFilters}
                        cities={cities}
                        onApply={() => loadHostels({ ...filters, page: 0 })}
                        onReset={() => {
                            // "Clear All" resets the amenity/budget/room/gender
                            // filters — it must NOT wipe out the city/search the
                            // user already entered (that's a separate "clear
                            // search" action the person hasn't asked for here).
                            const resetButKeepSearch = {
                                ...DEFAULT_FILTERS,
                                city: filters.city,
                                query: filters.query,
                                type: filters.type,
                            };
                            setFilters(resetButKeepSearch);
                            loadHostels(resetButKeepSearch);
                        }}
                    />
                </>
            )}

            {error && <div className="hostel-error-banner">⚠️ {error}</div>}

            {loading ? (
                <Loader />
            ) : (
                <div className="hostel-grid">
                    {hostels.length === 0 ? (
                        <div className="no-hostels-state">
                            <h2 className="no-hostels">
                                {isNearby
                                    ? "No hostels found within 10km of your location."
                                    : hasActiveFilters()
                                    ? "No PGs match your selected filters."
                                    : searchLabel
                                    ? `No PGs found in ${searchLabel}.`
                                    : "No Hostels Found"}
                            </h2>
                            {!isNearby && !hasActiveFilters() && didYouMeanCity && (
                                <p className="did-you-mean">
                                    Did you mean{" "}
                                    <button
                                        className="did-you-mean-link"
                                        onClick={() => {
                                            const updated = { ...filters, query: didYouMeanCity, city: "", page: 0 };
                                            setFilters(updated);
                                            loadHostels(updated);
                                        }}
                                    >
                                        {didYouMeanCity}
                                    </button>?
                                </p>
                            )}
                            {!isNearby && hasActiveFilters() && (
                                <button
                                    className="clear-filters-btn"
                                    onClick={() => {
                                        const resetButKeepSearch = {
                                            ...DEFAULT_FILTERS,
                                            city: filters.city,
                                            query: filters.query,
                                            type: filters.type,
                                        };
                                        setFilters(resetButKeepSearch);
                                        loadHostels(resetButKeepSearch);
                                    }}
                                >
                                    Clear Filters
                                </button>
                            )}
                            {!isNearby && !hasActiveFilters() && searchLabel && (
                                <ul className="no-hostels-tips">
                                    <li>Try another city or locality</li>
                                    <li>Increase your budget range</li>
                                    <li>Check the spelling of the location</li>
                                </ul>
                            )}
                        </div>
                    ) : (
                        hostels.map((hostel) => (
                            <HostelCard key={hostel.id} hostel={hostel} />
                        ))
                    )}
                </div>
            )}

            {!isNearby && totalPages > 1 && (
                <Pagination
                    page={filters.page}
                    totalPages={totalPages}
                    onChange={(newPage) => {
                        const updated = { ...filters, page: newPage };
                        setFilters(updated);
                        loadHostels(updated);
                    }}
                />
            )}

            {recommendedCity && recommended.length > 0 && (
                <section className="landing-section">
                    <h2 className="landing-heading">Recommended in {recommendedCity}</h2>
                    <div className="hostel-grid recommended-grid">
                        {recommended.map((h) => (
                            <div className="recommended-card-wrap" key={h.id}>
                                <span className="recommended-label">Recommended</span>
                                <HostelCard hostel={h} />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <Footer />
        </>
    );
};

export default HostelList;
