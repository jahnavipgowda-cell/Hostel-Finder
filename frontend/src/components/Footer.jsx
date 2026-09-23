import { Link } from "react-router-dom";
import "../styles/footer.css";

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-section">
                    <h2>🏠 NestIQ</h2>
                    <p>
                        Find verified Hostels, PGs and Co-living spaces across India.
                        Smart search powered by AI recommendations.
                    </p>
                </div>

                <div className="footer-section">
                    <h3>Quick Links</h3>
                    <Link to="/">Home</Link>
                    <Link to="/hostels">Hostels</Link>
                    <Link to="/#ai-recommendation">AI Recommendations</Link>
                    <Link to="/#contact">Contact</Link>
                </div>

                <div className="footer-section">
                    <h3>Services</h3>
                    <Link to="/hostels?type=STUDENT_RESIDENCE">Student Hostels</Link>
                    <Link to="/hostels?type=PG">PG Rooms</Link>
                    <Link to="/hostels?type=CO_LIVING">Co-Living</Link>
                    <Link to="/dashboard/owner">Owner Dashboard</Link>
                </div>

                <div className="footer-section" id="contact">
                    <h3>Contact</h3>
                    <p>📍 Bengaluru, India</p>
                    <p>📞 +91 9876543210</p>
                    <p>✉ support@nestiq.com</p>
                </div>
            </div>

            <div className="footer-bottom">
                © 2026 NestIQ. All Rights Reserved.
            </div>
        </footer>
    );
};

export default Footer;
