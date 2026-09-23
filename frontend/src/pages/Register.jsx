import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "../styles/login.css";

import { registerUser, saveSession } from "../services/authService";

const Register = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        fullName: "",
        email: "",
        password: "",
        phoneNumber: "",
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [serverError, setServerError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const updateField = (field) => (e) => {
        setForm({ ...form, [field]: e.target.value });
        if (fieldErrors[field]) setFieldErrors({ ...fieldErrors, [field]: null });
        if (serverError) setServerError("");
    };

    const validate = () => {
        const errors = {};
        if (!form.fullName.trim()) errors.fullName = "Full name is required";

        if (!form.email.trim()) {
            errors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
            errors.email = "Enter a valid email address";
        }

        if (!form.password) {
            errors.password = "Password is required";
        } else if (form.password.length < 6) {
            errors.password = "Password must be at least 6 characters";
        }

        if (form.phoneNumber && !/^[0-9+\-\s]{7,15}$/.test(form.phoneNumber.trim())) {
            errors.phoneNumber = "Enter a valid phone number";
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
            const response = await registerUser({
                fullName: form.fullName.trim(),
                email: form.email.trim(),
                password: form.password,
                phoneNumber: form.phoneNumber.trim() || undefined,
            });
            // Registration returns a full AuthResponse, so we can log the
            // user straight in instead of forcing a second login step.
            saveSession(response);
            setSuccess(true);
            setTimeout(() => navigate("/", { replace: true }), 900);
        } catch (err) {
            setServerError(
                err.message.toLowerCase().includes("already in use")
                    ? "An account with this email already exists."
                    : err.message || "Registration failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-brand">🏠 Nest<span>IQ</span></div>
                <h2>Create your account</h2>
                <p className="auth-subtitle">Find verified hostels & PGs across Bengaluru and beyond</p>

                {serverError && <div className="auth-banner error">⚠️ {serverError}</div>}
                {success && (
                    <div className="auth-banner success">
                        ✅ Account created! Redirecting you in...
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    <div className="auth-field">
                        <label htmlFor="reg-name">Full Name</label>
                        <div className="auth-input-wrap">
                            <span className="auth-icon">🧑</span>
                            <input
                                id="reg-name"
                                type="text"
                                placeholder="Your full name"
                                autoComplete="name"
                                className={fieldErrors.fullName ? "input-error" : ""}
                                value={form.fullName}
                                onChange={updateField("fullName")}
                            />
                        </div>
                        {fieldErrors.fullName && (
                            <span className="auth-field-error">{fieldErrors.fullName}</span>
                        )}
                    </div>

                    <div className="auth-field">
                        <label htmlFor="reg-email">Email</label>
                        <div className="auth-input-wrap">
                            <span className="auth-icon">✉️</span>
                            <input
                                id="reg-email"
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
                        <label htmlFor="reg-password">Password</label>
                        <div className="auth-input-wrap">
                            <span className="auth-icon">🔒</span>
                            <input
                                id="reg-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="At least 6 characters"
                                autoComplete="new-password"
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

                    <div className="auth-field">
                        <label htmlFor="reg-phone">Phone Number (optional)</label>
                        <div className="auth-input-wrap">
                            <span className="auth-icon">📞</span>
                            <input
                                id="reg-phone"
                                type="tel"
                                placeholder="+91-9876543210"
                                autoComplete="tel"
                                className={fieldErrors.phoneNumber ? "input-error" : ""}
                                value={form.phoneNumber}
                                onChange={updateField("phoneNumber")}
                            />
                        </div>
                        {fieldErrors.phoneNumber && (
                            <span className="auth-field-error">{fieldErrors.phoneNumber}</span>
                        )}
                    </div>

                    <button className="auth-submit" type="submit" disabled={loading || success}>
                        {loading && <span className="auth-spinner" />}
                        {loading ? "Creating account..." : "Create Account"}
                    </button>
                </form>

                <p className="auth-switch">
                    Already have an account? <Link to="/login">Log in</Link>
                </p>
                <Link to="/" className="auth-back-home">← Back to home</Link>
            </div>
        </div>
    );
};

export default Register;
