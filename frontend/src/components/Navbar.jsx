import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import "../styles/Navbar.css";

import { isLoggedIn, getCurrentUser, clearSession } from "../services/authService";

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const loggedIn = isLoggedIn();
    const user = getCurrentUser();

    const logout = () => {
        clearSession();
        navigate("/login");
    };

    // Home is the only page that has an in-page AI Recommendation section
    // and Contact block (in the footer); if we're not already there, route
    // through "/" first so the anchor lands correctly.
    const goToAnchor = (anchor) => (e) => {
        e.preventDefault();
        setMenuOpen(false);
        if (location.pathname === "/") {
            document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth" });
        } else {
            navigate(`/#${anchor}`);
        }
    };

    return (
        <nav className="navbar">
            <div className="logo" onClick={() => navigate("/")}>
                🏠 <span>NestIQ</span>
            </div>

            <div className={`nav-links ${menuOpen ? "active" : ""}`}>
                <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
                <Link to="/hostels" onClick={() => setMenuOpen(false)}>Hostels</Link>
                <a href="/#ai-recommendation" onClick={goToAnchor("ai-recommendation")}>
                    AI Recommendations
                </a>
                <a href="/#contact" onClick={goToAnchor("contact")}>Contact</a>

                {loggedIn ? (
                    <>
                        <Link to="/profile" onClick={() => setMenuOpen(false)}>
                            {user?.fullName ? `Hi, ${user.fullName.split(" ")[0]}` : "Profile"}
                        </Link>
                        <button className="logout-btn" onClick={logout}>
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
                        <Link to="/register" onClick={() => setMenuOpen(false)}>
                            <button className="register-btn">Register</button>
                        </Link>
                    </>
                )}
            </div>

            <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
                ☰
            </div>
        </nav>
    );
};

export default Navbar;
