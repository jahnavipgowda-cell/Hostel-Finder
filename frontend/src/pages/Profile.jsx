import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import HostelCard from "../components/HostelCard";

import { getMyProfile, updateMyProfile, getSavedHostels } from "../services/userService";
import { getHostelById } from "../services/hostelService";
import { clearSession } from "../services/authService";

import "../styles/profile.css";

// HostelCard expects the "summary" shape (thumbnailUrl, etc.) that search
// results use, but getHostelById returns the fuller "detail" shape
// (imageUrls list). This just adapts one to the other rather than
// duplicating card markup for the wishlist grid.
const toCardShape = (detail) => ({
    ...detail,
    thumbnailUrl: detail.imageUrls?.[0],
});

const Profile = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [savedHostels, setSavedHostels] = useState([]);
    const [savedLoading, setSavedLoading] = useState(true);

    useEffect(() => {
        getMyProfile()
            .then(setProfile)
            .catch((err) => setError(err.message || "Could not load profile."))
            .finally(() => setLoading(false));

        getSavedHostels()
            .then((data) => {
                const ids = Array.isArray(data?.savedHostelIds) ? data.savedHostelIds : [];
                return Promise.all(ids.map((id) => getHostelById(id).catch(() => null)));
            })
            .then((hostels) => setSavedHostels(hostels.filter(Boolean).map(toCardShape)))
            .catch(() => setSavedHostels([]))
            .finally(() => setSavedLoading(false));
    }, []);

    const handleChange = (field) => (e) =>
        setProfile({ ...profile, [field]: e.target.value });

    const handleSave = async () => {
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            const updated = await updateMyProfile({
                fullName: profile.fullName,
                phoneNumber: profile.phoneNumber,
            });
            setProfile(updated);
            setSuccess("Profile updated successfully.");
        } catch (err) {
            setError(err.message || "Could not save changes.");
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        clearSession();
        navigate("/login");
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <Loader />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="profile-page">
                <div className="profile-card">
                    <div className="profile-avatar">
                        {(profile?.fullName || "?").charAt(0).toUpperCase()}
                    </div>
                    <h2>{profile?.fullName}</h2>
                    <p style={{ color: "#6b7280", marginTop: -8 }}>{profile?.role}</p>

                    {error && <div className="profile-banner error">⚠️ {error}</div>}
                    {success && <div className="profile-banner success">✅ {success}</div>}

                    <div className="profile-field">
                        <label>Full Name</label>
                        <input value={profile?.fullName || ""} onChange={handleChange("fullName")} />
                    </div>

                    <div className="profile-field">
                        <label>Email</label>
                        <input value={profile?.email || ""} disabled />
                    </div>

                    <div className="profile-field">
                        <label>Phone Number</label>
                        <input
                            value={profile?.phoneNumber || ""}
                            onChange={handleChange("phoneNumber")}
                            placeholder="+91-9876543210"
                        />
                    </div>

                    <div className="profile-actions">
                        <button className="profile-save" onClick={handleSave} disabled={saving}>
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                        <button className="profile-logout" onClick={handleLogout}>
                            Log Out
                        </button>
                    </div>
                </div>

                <div className="profile-saved-section">
                    <h3>Saved PGs & Hostels</h3>
                    {savedLoading ? (
                        <Loader />
                    ) : savedHostels.length === 0 ? (
                        <p className="profile-saved-empty">
                            Nothing saved yet — tap the ♡ on any listing to add it here.
                        </p>
                    ) : (
                        <div className="profile-saved-grid">
                            {savedHostels.map((h) => (
                                <HostelCard key={h.id} hostel={h} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Profile;
