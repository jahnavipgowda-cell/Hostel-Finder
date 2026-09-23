import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import HostelList from "./pages/HostelList";
import HostelDetails from "./pages/HostelDetails";
import Compare from "./pages/Compare";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

import StudentDashboard from "./pages/dashboard/StudentDashboard";
import OwnerDashboard from "./pages/dashboard/OwnerDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";

import ProtectedRoute from "./components/ProtectedRoute";
import CompareBar from "./components/CompareBar";
import AuthModal from "./components/AuthModal";
import Chatbot from "./components/Chatbot";
import { CompareProvider } from "./context/CompareContext";
import { AuthModalProvider } from "./context/AuthModalContext";
import { WishlistProvider } from "./context/WishlistContext";

function App() {
    return (
        <AuthModalProvider>
        <WishlistProvider>
        <CompareProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/hostels" element={<HostelList />} />
                    <Route path="/hostel/:id" element={<HostelDetails />} />
                    <Route path="/compare" element={<Compare />} />

                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/dashboard/student"
                        element={
                            <ProtectedRoute>
                                <StudentDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/dashboard/owner"
                        element={
                            <ProtectedRoute>
                                <OwnerDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/dashboard/admin"
                        element={
                            <ProtectedRoute>
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* Catch-all: keeps navigation "efficient" by never leaving
                        the user on a blank white screen for a bad URL. */}
                    <Route path="*" element={<NotFound />} />
                </Routes>

                {/* Floating compare bar lives outside <Routes> so it persists
                    across page navigation while the user is comparing. */}
                <CompareBar />
                <Chatbot />
            </BrowserRouter>
        </CompareProvider>
        </WishlistProvider>
        <AuthModal />
        </AuthModalProvider>
    );
}

export default App;
