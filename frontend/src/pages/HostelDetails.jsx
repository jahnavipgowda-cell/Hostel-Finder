import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import ReviewCard from "../components/ReviewCard";

import { getHostelById } from "../services/hostelService";
import { isLoggedIn } from "../services/authService";
import { useAuthModal } from "../context/AuthModalContext";

import "../styles/hosteldetails.css";

const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80&auto=format&fit=crop";

const HostelDetails = () => {
    const { id } = useParams();
    const { openAuthModal } = useAuthModal();

    const [hostel, setHostel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    // Bumped after a successful login so the owner-details section
    // re-renders immediately without a full page reload.
    const [loggedInTick, setLoggedInTick] = useState(0);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError("");
        getHostelById(id)
            .then((data) => active && setHostel(data))
            .catch((err) => active && setError(err.message || "Hostel not found."))
            .finally(() => active && setLoading(false));
        return () => {
            active = false;
        };
    }, [id]);

    const scrollToOwner = () =>
        document.getElementById("owner-details")?.scrollIntoView({ behavior: "smooth" });

    // The whole point here: the login prompt opens right on this page, in a
    // modal, at the moment the user clicks Enquire — not by sending them to
    // a separate /login route and losing their place.
    const handleEnquire = () => {
        if (isLoggedIn()) {
            scrollToOwner();
            return;
        }
        openAuthModal(() => {
            setLoggedInTick((t) => t + 1);
            setTimeout(scrollToOwner, 50);
        }, `Log in to enquire about ${hostel?.name || "this property"}`);
    };

    const handleOwnerLoginClick = () => {
        openAuthModal(() => setLoggedInTick((t) => t + 1), "Log in to view the owner's contact details");
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="details-loading">
                    <Loader />
                </div>
            </>
        );
    }

    if (error || !hostel) {
        return (
            <>
                <Navbar />
                <div className="details-error">
                    <h2>😕 {error || "Hostel not found"}</h2>
                    <Link to="/hostels" className="details-back">← Back to listings</Link>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="details-page">
                <Link to="/hostels" className="details-back">← Back to listings</Link>

                <div className="details-gallery">
                    {(hostel.imageUrls?.length ? hostel.imageUrls : [FALLBACK_IMAGE]).map(
                        (url, i) => (
                            <img
                                key={i}
                                className={i === 0 ? "details-hero-img" : "details-thumb-img"}
                                src={url}
                                alt={`${hostel.name} photo ${i + 1}`}
                                loading="lazy"
                                onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = FALLBACK_IMAGE;
                                }}
                            />
                        )
                    )}
                </div>

                <div className="details-header">
                    <div>
                        <h1>{hostel.name}</h1>
                        <p className="details-location">
                            📍 {hostel.address ? `${hostel.address}, ` : ""}
                            {hostel.locality}, {hostel.city} — {hostel.pincode}
                        </p>
                        <div className="details-badges">
                            {hostel.verified && <span>✔ Verified</span>}
                            {hostel.aiRecommended && <span>🤖 AI Recommended</span>}
                            <span>⭐ {hostel.rating} ({hostel.totalReviews} reviews)</span>
                            <span>{hostel.type?.replaceAll("_", " ")}</span>
                            <span>{hostel.genderType}</span>
                            {hostel.foodIncluded && <span>🍽 Food Included</span>}
                            {hostel.metroNearby && <span>🚇 Metro Nearby</span>}
                            {hostel.coWorkingSpace && <span>💻 Co-working</span>}
                        </div>
                    </div>

                    <div className="details-price-box">
                        <div className="amount">₹{hostel.pricePerMonth}</div>
                        <div className="period">per month · {hostel.availableRooms} rooms left</div>
                        {hostel.securityDeposit != null && (
                            <div className="deposit-line">
                                + ₹{hostel.securityDeposit} refundable deposit
                            </div>
                        )}
                        <button onClick={handleEnquire}>Enquire Now</button>
                        {hostel.virtualTourUrl && (
                            <a
                                className="virtual-tour-link"
                                href={hostel.virtualTourUrl}
                                target="_blank"
                                rel="noreferrer"
                            >
                                🧭 Take a virtual tour
                            </a>
                        )}
                    </div>
                </div>

                <div className="details-section">
                    <h3>About this stay</h3>
                    <p>{hostel.description}</p>
                </div>

                <div className="details-grid-2">
                    <div className="details-section">
                        <h3>Facilities</h3>
                        <div className="facility-chips">
                            {(hostel.facilities || []).map((f) => (
                                <span key={f}>{f}</span>
                            ))}
                        </div>
                    </div>

                    <div className="details-section">
                        <h3>House Rules</h3>
                        <ul>
                            {(hostel.rules || []).map((r) => (
                                <li key={r}>{r}</li>
                            ))}
                            {(!hostel.rules || hostel.rules.length === 0) && (
                                <li>No specific rules listed.</li>
                            )}
                        </ul>
                    </div>
                </div>

                {hostel.roomTypes?.length > 0 && (
                    <div className="details-section">
                        <h3>Room Options</h3>
                        {hostel.roomTypes.map((rt, i) => (
                            <div className="room-type-card" key={i}>
                                <div>
                                    <strong>{rt.name}</strong> ({rt.category?.replaceAll("_", " ")})
                                    <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                                        {rt.hasAc ? "AC" : "Non-AC"} ·{" "}
                                        {rt.hasAttachedBathroom ? "Attached bathroom" : "Shared bathroom"}
                                        {rt.areaSqft ? ` · ${rt.areaSqft} sqft` : ""}
                                    </div>
                                </div>
                                <div>
                                    <strong>₹{rt.pricePerMonth}/mo</strong>
                                    <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                                        {rt.availableCount} of {rt.totalCount} available
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {hostel.nearbyPlaces?.length > 0 && (
                    <div className="details-section">
                        <h3>What's Nearby</h3>
                        {hostel.nearbyPlaces.map((np, i) => (
                            <div className="nearby-place-row" key={i}>
                                <span>{np.icon} {np.name}</span>
                                <span>{Math.round(np.distanceMeters)} m · {np.walkTimeMinutes} min walk</span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="details-section" id="owner-details">
                    <h3>Owner Details</h3>
                    {isLoggedIn() ? (
                        <div className="owner-card">
                            <div className="owner-avatar">
                                {(hostel.ownerName || "?").charAt(0).toUpperCase()}
                            </div>
                            <div className="owner-info">
                                <strong>{hostel.ownerName || "Property Owner"}</strong>
                                <a href={`tel:${hostel.contactNumber}`}>📞 {hostel.contactNumber}</a>
                                {hostel.contactEmail && (
                                    <a href={`mailto:${hostel.contactEmail}`}>✉ {hostel.contactEmail}</a>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="owner-card owner-card-locked">
                            <div className="owner-lock-icon">🔒</div>
                            <div className="owner-info">
                                <strong>Login to view owner contact details</strong>
                                <p>
                                    Create a free account to see the owner's phone number and
                                    email, and to enquire directly about this property.
                                </p>
                                <button
                                    className="owner-login-btn"
                                    onClick={handleOwnerLoginClick}
                                >
                                    Login / Sign Up
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {hostel.ratingBreakdown && hostel.recentReviews?.length > 0 && (
                    <div className="details-section">
                        <h3>Rating Breakdown</h3>
                        <div className="rating-breakdown">
                            <div className="rating-breakdown-stars">
                                {[5, 4, 3, 2, 1].map((star) => {
                                    const key = { 5: "fiveStar", 4: "fourStar", 3: "threeStar", 2: "twoStar", 1: "oneStar" }[star];
                                    const count = hostel.ratingBreakdown[key] || 0;
                                    const total = hostel.totalReviews || 1;
                                    const pct = Math.round((count / total) * 100);
                                    return (
                                        <div className="rating-bar-row" key={star}>
                                            <span className="rating-bar-label">{star}★</span>
                                            <div className="rating-bar-track">
                                                <div className="rating-bar-fill" style={{ width: `${pct}%` }} />
                                            </div>
                                            <span className="rating-bar-count">{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="rating-breakdown-categories">
                                {[
                                    ["Cleanliness", hostel.ratingBreakdown.avgCleanliness],
                                    ["Food", hostel.ratingBreakdown.avgFood],
                                    ["Security", hostel.ratingBreakdown.avgSecurity],
                                    ["Wi-Fi", hostel.ratingBreakdown.avgWifi],
                                    ["Staff", hostel.ratingBreakdown.avgStaff],
                                    ["Value for Money", hostel.ratingBreakdown.avgValueForMoney],
                                ].map(([label, val]) => (
                                    <div className="rating-category-row" key={label}>
                                        <span>{label}</span>
                                        <strong>{val ? val.toFixed(1) : "—"}</strong>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {hostel.recentReviews?.length > 0 && (
                    <div className="details-section">
                        <h3>Recent Reviews</h3>
                        {hostel.recentReviews.map((rev) => (
                            <ReviewCard key={rev.id} review={rev} />
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
};

export default HostelDetails;
