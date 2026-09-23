import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { getCurrentUser } from "../../services/authService";
import "../../styles/profile.css";

const OwnerDashboard = () => {
    const user = getCurrentUser();

    return (
        <>
            <Navbar />
            <div className="profile-page">
                <div className="profile-card">
                    <h2>Owner Dashboard</h2>
                    <p style={{ color: "#6b7280" }}>
                        Welcome back, {user?.fullName || "Owner"}. Hostel & PG management
                        tools (listings, bookings, occupancy) live here.
                    </p>
                    <p>
                        <Link to="/hostels">Browse all listings →</Link>
                    </p>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default OwnerDashboard;
