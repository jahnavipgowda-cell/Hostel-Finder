import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import { getHostelById } from "../services/hostelService";

import "../styles/compare.css";

const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&q=70&auto=format&fit=crop";

const ROWS = [
    { label: "Price / month", get: (h) => `₹${Number(h.pricePerMonth).toLocaleString("en-IN")}`, highlight: "min" },
    { label: "Security Deposit", get: (h) => `₹${Number(h.securityDeposit).toLocaleString("en-IN")}` },
    { label: "Rating", get: (h) => `⭐ ${h.rating} (${h.totalReviews} reviews)`, highlight: "max", key: "rating" },
    { label: "Type", get: (h) => h.type?.replaceAll("_", " ") },
    { label: "Gender", get: (h) => h.genderType },
    { label: "Available Rooms", get: (h) => h.availableRooms },
    { label: "Food Included", get: (h) => (h.foodIncluded ? `✅ ${h.mealsPerDay || ""} meals/day` : "❌ Not included") },
    { label: "Metro Nearby", get: (h) => (h.metroNearby ? `✅ ${h.metroDistanceKm} km` : "❌") },
    { label: "Co-working Space", get: (h) => (h.coWorkingSpace ? "✅" : "❌") },
    { label: "AI Safety Score", get: (h) => h.aiSafetyScore ? `${h.aiSafetyScore} / 5` : "—", highlight: "max", key: "aiSafetyScore" },
    { label: "Noise Level", get: (h) => h.noiseLevel || "—" },
    { label: "Verified", get: (h) => (h.verified ? "✔ Verified" : "—") },
];

const Compare = () => {
    const [searchParams] = useSearchParams();
    const ids = (searchParams.get("ids") || "").split(",").filter(Boolean);

    const [hostels, setHostels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (ids.length === 0) {
            setLoading(false);
            return;
        }
        Promise.all(ids.map((id) => getHostelById(id)))
            .then(setHostels)
            .catch((err) => setError(err.message || "Could not load one or more hostels."))
            .finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const bestValue = (row, hostels) => {
        if (!row.highlight || !row.key) return null;
        const values = hostels.map((h) => h[row.key]).filter((v) => v != null);
        if (values.length < 2) return null;
        return row.highlight === "max" ? Math.max(...values) : Math.min(...values);
    };

    return (
        <>
            <Navbar />
            <div className="compare-page">
                <h1>Compare Hostels & PGs</h1>

                {loading ? (
                    <Loader />
                ) : ids.length === 0 ? (
                    <p className="compare-empty">
                        No hostels selected yet. Go back and tap <strong>+ Compare</strong> on a
                        couple of listings, then hit Compare. <Link to="/hostels">Browse hostels →</Link>
                    </p>
                ) : error ? (
                    <p className="compare-empty">⚠️ {error}</p>
                ) : (
                    <div className="compare-table-wrap">
                        <table className="compare-table">
                            <thead>
                                <tr>
                                    <th></th>
                                    {hostels.map((h) => (
                                        <th key={h.id}>
                                            <img
                                                src={h.imageUrls?.[0] || FALLBACK_IMAGE}
                                                alt={h.name}
                                                onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                                            />
                                            <div className="compare-hostel-name">{h.name}</div>
                                            <div className="compare-hostel-loc">📍 {h.locality}, {h.city}</div>
                                            <Link to={`/hostel/${h.id}`} className="compare-view-link">
                                                View full details →
                                            </Link>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {ROWS.map((row) => {
                                    const best = bestValue(row, hostels);
                                    return (
                                        <tr key={row.label}>
                                            <td className="compare-row-label">{row.label}</td>
                                            {hostels.map((h) => (
                                                <td
                                                    key={h.id}
                                                    className={
                                                        best != null && h[row.key] === best
                                                            ? "compare-best"
                                                            : ""
                                                    }
                                                >
                                                    {row.get(h)}
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })}
                                <tr>
                                    <td className="compare-row-label">Facilities</td>
                                    {hostels.map((h) => (
                                        <td key={h.id}>
                                            {(h.facilities || []).slice(0, 6).join(", ") || "—"}
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
};

export default Compare;
