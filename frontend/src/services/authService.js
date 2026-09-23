import { apiRequest } from "./api";

/**
 * Logs a user in and returns the backend's AuthResponse:
 * { accessToken, refreshToken, tokenType, userId, fullName, email, role }
 */
export async function loginUser({ email, password }) {
    return apiRequest("/auth/login", {
        method: "POST",
        body: { email, password },
    });
}

/**
 * Registers a new user and returns the same AuthResponse shape as login,
 * so a successful registration can immediately log the user in.
 */
export async function registerUser({ fullName, email, password, phoneNumber }) {
    return apiRequest("/auth/register", {
        method: "POST",
        body: { fullName, email, password, phoneNumber },
    });
}

export function saveSession(authResponse) {
    localStorage.setItem("token", authResponse.accessToken);
    localStorage.setItem("refreshToken", authResponse.refreshToken || "");
    localStorage.setItem(
        "user",
        JSON.stringify({
            userId: authResponse.userId,
            fullName: authResponse.fullName,
            email: authResponse.email,
            role: authResponse.role,
        })
    );
}

export function clearSession() {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
}

export function getCurrentUser() {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export function isLoggedIn() {
    return !!localStorage.getItem("token");
}
