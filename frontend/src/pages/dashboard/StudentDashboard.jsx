import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Loader from "../../components/Loader";
import { getMyBookings } from "../../services/bookingService";
import "../../styles/profile.css";

const StudentDashboard = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        getMyBookings()
            .then((data) => setBookings(data.content || []))
            .catch((err) => setError(err.message || "Could not load bookings."))
            .finally(() => setLoading(false));
    }, []);

    return (
        <>
            <Navbar />
            <div className="profile-page">
                <div className="profile-card">
                    <h2>My Bookings</h2>
                    {loading ? (
                        <Loader />
                    ) : error ? (
                        <p style={{ color: "#7f1d1d" }}>{error}</p>
                    ) : bookings.length === 0 ? (
                        <p>
                            You haven't booked a stay yet.{" "}
                            <Link to="/hostels">Browse hostels & PGs →</Link>
                        </p>
                    ) : (
                        bookings.map((b) => (
                            <div key={b.id} className="room-type-card">
                                <div>
                                    <strong>{b.hostelName}</strong>
                                    <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                                        {b.status}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default StudentDashboard;
