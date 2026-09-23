import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const NotFound = () => {
    return (
        <>
            <Navbar />
            <div style={{ textAlign: "center", padding: "100px 20px" }}>
                <h1 style={{ fontSize: "4rem", margin: 0 }}>404</h1>
                <p style={{ color: "#6b7280", marginBottom: 24 }}>
                    The page you're looking for doesn't exist.
                </p>
                <Link
                    to="/"
                    style={{
                        background: "#0a9396",
                        color: "white",
                        padding: "10px 22px",
                        borderRadius: 8,
                        textDecoration: "none",
                        fontWeight: 700,
                    }}
                >
                    ← Back to Home
                </Link>
            </div>
            <Footer />
        </>
    );
};

export default NotFound;
