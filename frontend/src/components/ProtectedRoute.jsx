import { Navigate, useLocation } from "react-router-dom";
import { isLoggedIn } from "../services/authService";

const ProtectedRoute = ({ children }) => {
    const location = useLocation();

    if (!isLoggedIn()) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    return children;
};

export default ProtectedRoute;
