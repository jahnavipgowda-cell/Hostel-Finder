import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import "../styles/login.css";

import { loginUser, saveSession } from "../services/authService";

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [form, setForm] = useState({ email: "", password: "" });
    const [fieldErrors, setFieldErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [serverError, setServerError] = useState("");
    const [loading, setLoading] = useState(false);

    const updateField = (field) => (e) => {
        setForm({ ...form, [field]: e.target.value });
        if (fieldErrors[field]) setFieldErrors({ ...fieldErrors, [field]: null });
        if (serverError) setServerError("");
    };

    const validate = () => {
        const errors = {};
        if (!form.email.trim()) {
            errors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
            errors.email = "Enter a valid email address";
        }
        if (!form.password) {
            errors.password = "Password is required";
        }
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        if (!validate()) return;

        setLoading(true);
        setServerError("");
        try {
            const response = await loginUser({
                email: form.email.trim(),
                password: form.password,
            });
            saveSession(response);

            if (location.state?.from) {
                navigate(location.state.from, { replace: true });
            } else if (response.role === "OWNER") {
                navigate("/dashboard/owner", { replace: true });
            } else if (response.role === "ADMIN") {
                navigate("/dashboard/admin", { replace: true });
            } else {
                navigate("/", { replace: true });
            }
        } catch (err) {
            setServerError(
                err.message === "Failed to fetch" || err.message.includes("reach the server")
                    ? err.message
                    : "Invalid email or password. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-brand">🏠 Nest<span>IQ</span></div>
                <h2>Welcome back</h2>
                <p className="auth-subtitle">Log in to continue your hostel search</p>

                {serverError && (
                    <div className="auth-banner error">⚠️ {serverError}</div>
                )}

                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    <div className="auth-field">
                        <label htmlFor="login-email">Email</label>
                        <div className="auth-input-wrap">
                            <span className="auth-icon">✉️</span>
                            <input
                                id="login-email"
                                type="email"
                                placeholder="you@example.com"
                                autoComplete="email"
                                className={fieldErrors.email ? "input-error" : ""}
                                value={form.email}
                                onChange={updateField("email")}
                            />
                        </div>
                        {fieldErrors.email && (
                            <span className="auth-field-error">{fieldErrors.email}</span>
                        )}
                    </div>

                    <div className="auth-field">
                        <label htmlFor="login-password">Password</label>
                        <div className="auth-input-wrap">
                            <span className="auth-icon">🔒</span>
                            <input
                                id="login-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                className={fieldErrors.password ? "input-error" : ""}
                                value={form.password}
                                onChange={updateField("password")}
                            />
                            <button
                                type="button"
                                className="auth-toggle-visibility"
                                onClick={() => setShowPassword((v) => !v)}
                                tabIndex={-1}
                            >
                                {showPassword ? "🙈" : "👁️"}
                            </button>
                        </div>
                        {fieldErrors.password && (
                            <span className="auth-field-error">{fieldErrors.password}</span>
                        )}
                    </div>

                    <button className="auth-submit" type="submit" disabled={loading}>
                        {loading && <span className="auth-spinner" />}
                        {loading ? "Logging in..." : "Log In"}
                    </button>
                </form>

                <p className="auth-hint">
                    Demo accounts: user@nestiq.in / user123 · owner@nestiq.in / owner123
                </p>

                <p className="auth-switch">
                    Don't have an account? <Link to="/register">Create one</Link>
                </p>
                <Link to="/" className="auth-back-home">← Back to home</Link>
            </div>
        </div>
    );
};

export default Login;
