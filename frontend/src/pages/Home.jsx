import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import { getAllCities, getHostels } from "../services/hostelService";

import "../styles/home.css";

const POPULAR_BENGALURU_AREAS = [
    "Koramangala", "Indiranagar", "HSR Layout", "Whitefield", "BTM Layout",
    "Marathahalli", "Electronic City", "Jayanagar", "Malleshwaram",
    "JP Nagar", "Bellandur", "Banashankari", "Yelahanka", "Hebbal",
    "Rajajinagar", "Vijayanagar", "RT Nagar", "Sarjapur Road",
    "Basavanagudi", "KR Puram", "Domlur", "Frazer Town", "Kammanahalli",
    "Peenya", "HBR Layout", "Yeshwantpur", "Brookefield", "Nagarbhavi",
    "Ulsoor", "Banaswadi", "Kalyan Nagar", "Vidyaranyapura", "Kengeri",
    "Uttarahalli", "Horamavu", "Jalahalli", "Wilson Garden", "Cox Town",
    "Bommanahalli", "Koramangala 1st Block", "Malleswaram West", "RR Nagar",
    "Sanjay Nagar", "Sahakar Nagar", "Vijayanagar 2nd Stage", "Rajarajeshwari Nagar",
    "Padmanabhanagar", "Mathikere", "Girinagar", "Chamrajpet", "Shivajinagar",
    "Seshadripuram", "Koramangala 4th Block", "CV Raman Nagar", "Munnekollal",
    "Devanahalli", "Attibele",
];

const CITY_EMOJI = {
    Bengaluru: "🌆", Mumbai: "🌊", Delhi: "🏛️", Chennai: "🏖️",
    Hyderabad: "🕌", Kolkata: "🌉", Pune: "🏞️", Jaipur: "🏰",
    Ahmedabad: "🕍", Lucknow: "🌇", Chandigarh: "🌳", Kochi: "🚤",
};

const INITIAL_AREAS_SHOWN = 12;

// One verified real locality per major city (spot-checked against
// data.sql, not guessed) — NestIQ has by far its deepest coverage in
// Bengaluru (~228 listings vs ~12-20 in each other city), so a
// Bengaluru-only "Popular Locations" row was quietly making the whole site
// feel Bengaluru-first. This deliberately pulls one from each city instead.
const FEATURED_LOCATIONS = ["Koramangala", "Andheri", "Hauz Khas", "Hinjewadi", "Gachibowli", "Velachery"];

const ACCOMMODATION_TYPES = [
    { value: "PG", label: "PG", icon: "🏠" },
    { value: "HOSTEL", label: "Hostel", icon: "🛏️" },
    { value: "CO_LIVING", label: "Co-Living", icon: "🏢" },
    { value: "STUDENT_RESIDENCE", label: "Student Residence", icon: "🎓" },
    { value: "WORKING_PROFESSIONAL", label: "Working Professionals", icon: "💼" },
];

const BUDGET_OPTIONS = [
    { label: "Any Budget", min: "", max: "" },
    { label: "Under ₹8,000", min: "", max: "8000" },
    { label: "₹8,000 – ₹12,000", min: "8000", max: "12000" },
    { label: "₹12,000 – ₹18,000", min: "12000", max: "18000" },
    { label: "Above ₹18,000", min: "18000", max: "" },
];

const WHY_CHOOSE = [
    { icon: "✔️", title: "Verified Listings", text: "Every PG is checked before it's marked verified, so what you see is what's actually there." },
    { icon: "🔍", title: "Smart Search", text: "Filter by location, budget, sharing type and amenities to find a match that actually fits." },
    { icon: "🔒", title: "Secure", text: "Your account and contact details stay protected — owner info only unlocks when you're signed in." },
    { icon: "🤝", title: "Easy Booking", text: "Enquire directly with verified owners and skip the back-and-forth of broker calls." },
];

const HOW_IT_WORKS = [
    { step: "1", title: "Search your city or locality", text: "Type a city, area, or PG name — or let us find stays near your current location." },
    { step: "2", title: "Filter to what actually matters", text: "Narrow down by budget, sharing type, gender preference and amenities like Wi-Fi or AC." },
    { step: "3", title: "Enquire directly", text: "Contact the verified owner, check availability, and request a visit — no broker in between." },
];

/**
 * Home is now a pure landing/search page — it deliberately does NOT load or
 * show any hostel listings on its own. The person picks a city or area (or
 * types a search) and gets taken to /hostels, where results actually load.
 * This avoids showing an arbitrary, unfiltered wall of PGs/hostels the
 * moment the site opens — including a "Recommended For You" grid, which
 * used to be here but necessarily needed a city argument (was hardcoded to
 * Bengaluru) to call the recommendations endpoint. That's now shown on the
 * results page instead, tied to whatever the person actually searched.
 */
const Home = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [budget, setBudget] = useState(BUDGET_OPTIONS[0]);
    const [cities, setCities] = useState([]);
    const [loadingCities, setLoadingCities] = useState(true);
    const [totalListings, setTotalListings] = useState(null);

    const [locations, setLocations] = useState([]);
    const [locationsLoading, setLocationsLoading] = useState(true);

    useEffect(() => {
        getAllCities()
            .then((data) => setCities(Array.isArray(data) ? data : []))
            .catch(() => setCities([]))
            .finally(() => setLoadingCities(false));
    }, []);

    // Real, unfiltered total count for the trust strip — fetched rather
    // than hardcoded, so it can't drift from what's actually in the database.
    useEffect(() => {
        getHostels({ size: 1 })
            .then((data) => setTotalListings(data.totalElements ?? null))
            .catch(() => setTotalListings(null));
    }, []);

    // Real counts + a real photo per featured locality, pulled from the
    // same search endpoint the listing page uses — not invented numbers or
    // stock images unrelated to what's actually in the database.
    useEffect(() => {
        Promise.all(
            FEATURED_LOCATIONS.map((area) =>
                getHostels({ query: area, size: 1 })
                    .then((data) => ({
                        area,
                        count: data.totalElements ?? 0,
                        image: data.content?.[0]?.thumbnailUrl || null,
                    }))
                    .catch(() => ({ area, count: 0, image: null }))
            )
        )
            .then((results) => setLocations(results.filter((r) => r.count > 0)))
            .finally(() => setLocationsLoading(false));
    }, []);

    const goSearch = (text) => {
        const q = (text ?? query).trim();
        const params = new URLSearchParams();
        if (q) params.set("query", q);
        if (budget.min) params.set("minPrice", budget.min);
        if (budget.max) params.set("maxPrice", budget.max);
        const qs = params.toString();
        navigate(qs ? `/hostels?${qs}` : "/hostels");
    };

    const goType = (type) => navigate(`/hostels?type=${type}`);

    const handleSubmit = (e) => {
        e.preventDefault();
        goSearch();
    };

    const [locating, setLocating] = useState(false);
    const [locationError, setLocationError] = useState("");
    const [showAllAreas, setShowAllAreas] = useState(false);

    const findNearMe = () => {
        if (!navigator.geolocation) {
            setLocationError("Your browser doesn't support location search.");
            return;
        }
        setLocating(true);
        setLocationError("");
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLocating(false);
                const { latitude, longitude } = pos.coords;
                navigate(`/hostels?nearby=true&lat=${latitude}&lng=${longitude}`);
            },
            (err) => {
                setLocating(false);
                setLocationError(
                    err.code === err.PERMISSION_DENIED
                        ? "Location access was denied. Allow location access in your browser to use this feature."
                        : "Couldn't get your location. Please try again."
                );
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    return (
        <>
            <Navbar />

            <section className="hero">
                <div className="hero-content">
                    <h1>Find Your Perfect PG, Anywhere in India.</h1>
                    <p>
                        Discover verified PGs and hostels near your college,
                        workplace, or preferred location — from Bengaluru to
                        Hyderabad, Pune, Mumbai, Chennai and beyond.
                    </p>

                    <form className="hero-search" onSubmit={handleSubmit}>
                        <input
                            type="text"
                            placeholder="📍 Search by city, locality or PG name"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <select
                            className="hero-budget-select"
                            value={budget.label}
                            onChange={(e) =>
                                setBudget(BUDGET_OPTIONS.find((b) => b.label === e.target.value) || BUDGET_OPTIONS[0])
                            }
                        >
                            {BUDGET_OPTIONS.map((b) => (
                                <option key={b.label} value={b.label}>₹ {b.label}</option>
                            ))}
                        </select>
                        <button type="submit">🔍 Search PGs</button>
                    </form>

                    <button
                        type="button"
                        className="near-me-btn"
                        onClick={findNearMe}
                        disabled={locating}
                    >
                        {locating ? "📡 Locating you..." : "📍 Find Hostels Near Me"}
                    </button>
                    {locationError && (
                        <p className="near-me-error">{locationError}</p>
                    )}
                </div>
            </section>

            <section className="trust-strip">
                <div className="trust-item">
                    <strong>{totalListings != null ? `${totalListings}+` : "…"}</strong>
                    <span>Verified stays</span>
                </div>
                <div className="trust-divider" />
                <div className="trust-item">
                    <strong>{cities.length || 12}</strong>
                    <span>Cities covered</span>
                </div>
                <div className="trust-divider" />
                <div className="trust-item">
                    <strong>🤖</strong>
                    <span>AI-ranked results</span>
                </div>
            </section>

            <section className="landing-section">
                <h2 className="landing-heading">Explore Popular Cities</h2>
                {loadingCities ? (
                    <p className="landing-hint">Loading cities…</p>
                ) : (
                    <div className="chip-grid">
                        {cities.map((city) => (
                            <button
                                key={city}
                                className="city-chip"
                                onClick={() => goSearch(city)}
                            >
                                <span className="city-chip-emoji">
                                    {CITY_EMOJI[city] || "📍"}
                                </span>
                                {city}
                            </button>
                        ))}
                    </div>
                )}
            </section>

            <section className="landing-section">
                <h2 className="landing-heading">Popular Locations</h2>
                {locationsLoading ? (
                    <p className="landing-hint">Loading locations…</p>
                ) : (
                    <div className="location-card-grid">
                        {locations.map(({ area, count, image }) => (
                            <button
                                key={area}
                                className="location-card"
                                onClick={() => goSearch(area)}
                            >
                                <img
                                    src={image || "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=500&q=80&auto=format&fit=crop"}
                                    alt={area}
                                    loading="lazy"
                                />
                                <div className="location-card-overlay">
                                    <strong>{area}</strong>
                                    <span>{count} {count === 1 ? "PG" : "PGs"} available</span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </section>

            <section className="landing-section">
                <h2 className="landing-heading">Browse by Accommodation Type</h2>
                <div className="chip-grid">
                    {ACCOMMODATION_TYPES.map((t) => (
                        <button
                            key={t.value}
                            className="city-chip"
                            onClick={() => goType(t.value)}
                        >
                            <span className="city-chip-emoji">{t.icon}</span>
                            {t.label}
                        </button>
                    ))}
                </div>
            </section>

            <section className="landing-section">
                <h2 className="landing-heading">More Areas in Bengaluru</h2>
                <p className="landing-hint">
                    NestIQ's deepest coverage is currently in Bengaluru — browse specific areas below.
                </p>
                <div className="chip-grid">
                    {(showAllAreas
                        ? POPULAR_BENGALURU_AREAS
                        : POPULAR_BENGALURU_AREAS.slice(0, INITIAL_AREAS_SHOWN)
                    ).map((area) => (
                        <button
                            key={area}
                            className="area-chip"
                            onClick={() => goSearch(area)}
                        >
                            {area}
                        </button>
                    ))}
                </div>
                {POPULAR_BENGALURU_AREAS.length > INITIAL_AREAS_SHOWN && (
                    <button
                        type="button"
                        className="show-more-areas-btn"
                        onClick={() => setShowAllAreas((v) => !v)}
                    >
                        {showAllAreas
                            ? "Show fewer areas ↑"
                            : `Show all ${POPULAR_BENGALURU_AREAS.length} areas ↓`}
                    </button>
                )}
            </section>

            <section className="landing-section why-choose-section">
                <h2 className="landing-heading">Why Choose NestIQ?</h2>
                <div className="why-choose-grid">
                    {WHY_CHOOSE.map((f) => (
                        <div className="why-choose-card" key={f.title}>
                            <span className="why-choose-icon">{f.icon}</span>
                            <h3>{f.title}</h3>
                            <p>{f.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="landing-section how-it-works-section">
                <h2 className="landing-heading">How NestIQ Works</h2>
                <div className="how-it-works-grid">
                    {HOW_IT_WORKS.map((s) => (
                        <div className="how-it-works-card" key={s.step}>
                            <span className="how-it-works-step">{s.step}</span>
                            <h3>{s.title}</h3>
                            <p>{s.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            <Footer />
        </>
    );
};

export default Home;
