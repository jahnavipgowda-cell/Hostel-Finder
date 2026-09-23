import { Link } from "react-router-dom";
import "../styles/hostelcard.css";
import { useCompare } from "../context/CompareContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuthModal } from "../context/AuthModalContext";
import { isLoggedIn } from "../services/authService";

const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80&auto=format&fit=crop";

const TYPE_LABELS = {
    PG: "PG",
    HOSTEL: "Hostel",
    CO_LIVING: "Co-Living",
    WORKING_PROFESSIONAL: "Working Professional",
    STUDENT_RESIDENCE: "Student Residence",
};

const HostelCard = ({ hostel }) => {
    const { isComparing, toggleCompare, canAddMore } = useCompare();
    const { isSaved, toggleSaved } = useWishlist();
    const { openAuthModal } = useAuthModal();
    const comparing = isComparing(hostel.id);
    const saved = isSaved(hostel.id);

    const handleCompareClick = (e) => {
        e.preventDefault();
        if (!comparing && !canAddMore) return;
        toggleCompare(hostel);
    };

    const handleWishlistClick = (e) => {
        e.preventDefault();
        if (!isLoggedIn()) {
            openAuthModal(() => toggleSaved(hostel.id), `Log in to save ${hostel.name} to your wishlist`);
            return;
        }
        toggleSaved(hostel.id).catch(() => {});
    };

    return (
        <div className="hostel-card">
            <div className="card-img-wrap">
                <img
                    src={hostel.thumbnailUrl || FALLBACK_IMAGE}
                    alt={hostel.name}
                    loading="lazy"
                    onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = FALLBACK_IMAGE;
                    }}
                />
                <div className="card-img-gradient" />

                <span className="type-tag">{TYPE_LABELS[hostel.type] || hostel.type}</span>

                <button
                    className={`wishlist-toggle ${saved ? "active" : ""}`}
                    onClick={handleWishlistClick}
                    title={saved ? "Remove from wishlist" : "Save to wishlist"}
                    aria-pressed={saved}
                >
                    {saved ? "♥" : "♡"}
                </button>

                <button
                    className={`compare-toggle ${comparing ? "active" : ""}`}
                    onClick={handleCompareClick}
                    disabled={!comparing && !canAddMore}
                    title={comparing ? "Remove from comparison" : "Add to comparison"}
                >
                    {comparing ? "✓ Comparing" : "+ Compare"}
                </button>

                <span className="price-chip">
                    ₹{Number(hostel.pricePerMonth).toLocaleString("en-IN")}
                    <small>/mo</small>
                </span>

                {hostel.aiRecommended && <span className="ai-pick-chip">🤖 AI Pick</span>}
            </div>

            <div className="card-body">
                <div className="card-top">
                    <h2>{hostel.name}</h2>
                    <span className="rating-chip">★ {hostel.rating}</span>
                </div>

                <p className="location">
                    📍 {hostel.locality}, {hostel.city}
                    {typeof hostel.distanceKm === "number" && (
                        <span className="distance-chip">
                            {" "}· {hostel.distanceKm < 1
                                ? `${Math.round(hostel.distanceKm * 1000)} m away`
                                : `${hostel.distanceKm.toFixed(1)} km away`}
                        </span>
                    )}
                </p>

                <div className="card-meta-row">
                    {hostel.verified && <span className="verified">✔ Verified</span>}
                    <span className="reviews-count">{hostel.totalReviews} reviews</span>
                    <span className="rooms-left">
                        <strong>{hostel.availableRooms}</strong> rooms left
                    </span>
                </div>

                <div className="badges">
                    {hostel.foodIncluded && <span>🍽 Food</span>}
                    {hostel.metroNearby && <span>🚇 Metro</span>}
                    {hostel.coWorkingSpace && <span>💻 Co-working</span>}
                </div>

                <Link to={`/hostel/${hostel.id}`} className="view-details-link">
                    <button>
                        View Details <span className="arrow">→</span>
                    </button>
                </Link>
            </div>
        </div>
    );
};

export default HostelCard;
