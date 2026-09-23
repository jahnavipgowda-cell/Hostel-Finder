// Central place for the backend base URL.
// In development, Vite proxies "/api" to http://localhost:8080 (see
// vite.config.js), so a relative base works both in dev and once the
// frontend is built and served behind the same domain as the backend.
export const API_BASE = "/api";

/**
 * Thin wrapper around fetch() that:
 *  - always sends JSON
 *  - attaches the JWT (if present) as a Bearer token
 *  - throws a readable Error with the backend's message on failure
 */
export async function apiRequest(path, { method = "GET", body, auth = false } = {}) {
    const headers = { "Content-Type": "application/json" };

    if (auth) {
        const token = localStorage.getItem("token");
        if (token) headers["Authorization"] = `Bearer ${token}`;
    }

    let response;
    try {
        response = await fetch(`${API_BASE}${path}`, {
            method,
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
    } catch (networkError) {
        throw new Error(
            "Could not reach the server. Please check that the backend is running and try again."
        );
    }

    // No content
    if (response.status === 204) return null;

    let data = null;
    const text = await response.text();
    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            data = text;
        }
    }

    if (!response.ok) {
        const message =
            (data && (data.message || data.error)) ||
            (typeof data === "string" && data) ||
            `Request failed (${response.status})`;
        throw new Error(message);
    }

    return data;
}
