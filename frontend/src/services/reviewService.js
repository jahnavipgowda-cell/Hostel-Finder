import { apiRequest } from "./api";

export async function getReviewsForHostel(hostelId, page = 0, size = 10) {
    return apiRequest(`/reviews/hostel/${hostelId}?page=${page}&size=${size}`);
}

export async function submitReview(request) {
    return apiRequest("/reviews", { method: "POST", body: request, auth: true });
}

export async function markReviewHelpful(id) {
    return apiRequest(`/reviews/${id}/helpful`, { method: "POST", auth: true });
}
