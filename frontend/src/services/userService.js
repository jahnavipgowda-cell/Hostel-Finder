import { apiRequest } from "./api";

export async function getMyProfile() {
    return apiRequest("/users/me", { auth: true });
}

export async function updateMyProfile(updates) {
    return apiRequest("/users/me", { method: "PUT", body: updates, auth: true });
}

export async function getSavedHostels() {
    return apiRequest("/users/me/saved", { auth: true });
}

export async function saveHostel(hostelId) {
    return apiRequest(`/users/me/saved/${hostelId}`, { method: "POST", auth: true });
}

export async function unsaveHostel(hostelId) {
    return apiRequest(`/users/me/saved/${hostelId}`, { method: "DELETE", auth: true });
}
