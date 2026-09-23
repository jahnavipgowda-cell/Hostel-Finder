import { useState, useEffect } from "react";
import { useAuthModal } from "../context/AuthModalContext";
import { loginUser, registerUser, saveSession } from "../services/authService";
import "../styles/login.css";
import "../styles/authmodal.css";

const AuthModal = () => {
    const { isOpen, reason, closeAuthModal, handleSuccess } = useAuthModal();
    const [tab, setTab] = useState("login");
    const [form, setForm] = useState({ fullName: "", email: "", password: "", phoneNumber: "" });
    const [fieldErrors, setFieldErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [loading, setLoading] = useState(false);

    // Reset the form each time the modal is freshly opened so leftover
    // input/errors from a previous prompt don't linger.
    useEffect(() => {
        if (isOpen) {
            setTab("login");
            setForm({ fullName: "", email: "", password: "", phoneNumber: "" });
            setFieldErrors({});
            setServerError("");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const update = (field) => (e) => {
        setForm({ ...form, [field]: e.target.value });
        if (fieldErrors[field]) setFieldErrors({ ...fieldErrors, [field]: null });
        if (serverError) setServerError("");
    };

    const validate = () => {
        const errors = {};
        if (tab === "register" && !form.fullName.trim()) errors.fullName = "Full name is required";
        if (!form.email.trim()) {
            errors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
            errors.email = "Enter a valid email address";
        }
        if (!form.password) {
            errors.password = "Password is required";
        } else if (tab === "register" && form.password.length < 6) {
            errors.password = "Password must be at least 6 characters";
        }
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading || !validate()) return;

        setLoading(true);
        setServerError("");
        try {
            const response =
                tab === "login"
                    ? await loginUser({ email: form.email.trim(), password: form.password })
                    : await registerUser({
                          fullName: form.fullName.trim(),
                          email: form.email.trim(),
                          password: form.password,
                          phoneNumber: form.phoneNumber.trim() || undefined,
                      });
            saveSession(response);
            handleSuccess();
        } catch (err) {
            setServerError(
                tab === "login"
                    ? "Invalid email or password. Please try again."
                    : err.message.toLowerCase().includes("already in use")
                    ? "An account with this email already exists."
                    : err.message || "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-modal-overlay" onClick={closeAuthModal}>
            <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
                <button className="auth-modal-close" onClick={closeAuthModal} aria-label="Close">
                    ✕
                </button>

                <div className="auth-modal-brand">🏠 Nest<span>IQ</span></div>

                {reason && <p className="auth-modal-reason">{reason}</p>}

                <div className="auth-modal-tabs">
                    <button
                        className={tab === "login" ? "active" : ""}
                        onClick={() => setTab("login")}
                        type="button"
                    >
                        Log In
                    </button>
                    <button
                        className={tab === "register" ? "active" : ""}
                        onClick={() => setTab("register")}
                        type="button"
                    >
                        Sign Up
                    </button>
                </div>

                {serverError && <div className="auth-banner error">⚠️ {serverError}</div>}

                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    {tab === "register" && (
                        <div className="auth-field">
                            <label>Full Name</label>
                            <input
                                type="text"
                                placeholder="Your full name"
                                className={fieldErrors.fullName ? "input-error" : ""}
                                value={form.fullName}
                                onChange={update("fullName")}
                            />
                            {fieldErrors.fullName && <span className="auth-field-error">{fieldErrors.fullName}</span>}
                        </div>
                    )}

                    <div className="auth-field">
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            className={fieldErrors.email ? "input-error" : ""}
                            value={form.email}
                            onChange={update("email")}
                        />
                        {fieldErrors.email && <span className="auth-field-error">{fieldErrors.email}</span>}
                    </div>

                    <div className="auth-field">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder={tab === "register" ? "At least 6 characters" : "Your password"}
                            className={fieldErrors.password ? "input-error" : ""}
                            value={form.password}
                            onChange={update("password")}
                        />
                        {fieldErrors.password && <span className="auth-field-error">{fieldErrors.password}</span>}
                    </div>

                    {tab === "register" && (
                        <div className="auth-field">
                            <label>Phone Number (optional)</label>
                            <input
                                type="tel"
                                placeholder="+91-9876543210"
                                value={form.phoneNumber}
                                onChange={update("phoneNumber")}
                            />
                        </div>
                    )}

                    <button className="auth-modal-submit" type="submit" disabled={loading}>
                        {loading && <span className="auth-spinner" />}
                        {loading
                            ? tab === "login" ? "Logging in..." : "Creating account..."
                            : tab === "login" ? "Log In" : "Create Account"}
                    </button>
                </form>

                <p className="auth-modal-hint">
                    Demo accounts: user@nestiq.in / user123 · owner@nestiq.in / owner123
                </p>
            </div>
        </div>
    );
};

export default AuthModal;
