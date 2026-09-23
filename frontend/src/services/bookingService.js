import { apiRequest } from "./api";

export async function createBooking(request) {
    return apiRequest("/bookings", {
        method: "POST",
        body: request,
        auth: true,
    });
}

export async function getMyBookings(page = 0, size = 10) {
    return apiRequest(`/bookings/my?page=${page}&size=${size}`, { auth: true });
}

export async function cancelBooking(id, reason) {
    const params = reason ? `?reason=${encodeURIComponent(reason)}` : "";
    return apiRequest(`/bookings/${id}${params}`, { method: "DELETE", auth: true });
}
