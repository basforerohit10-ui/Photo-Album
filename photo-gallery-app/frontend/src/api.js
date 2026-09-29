// Cleanly resolve the API Base URL:
// - If VITE_API_URL is "https://example.com" -> "https://example.com/api"
// - If VITE_API_URL is "https://example.com/api" -> "https://example.com/api"
// - If VITE_API_URL is not set -> "/api" (same domain, works on local & Vercel serverless)
const getApiBaseUrl = () => {
  const envUrl = (import.meta.env.VITE_API_URL || "").trim();
  if (!envUrl) return "/api";
  const cleaned = envUrl.replace(/\/+$/, "");
  return cleaned.endsWith("/api") ? cleaned : `${cleaned}/api`;
};

const API_BASE_URL = getApiBaseUrl();

const request = async (path, options = {}) => {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    });
  } catch {
    throw new Error(
      "Unable to connect to the API server. Please check your internet connection and verify the backend is running."
    );
  }

  const contentType = response.headers.get("content-type") || "";
  let data;

  if (contentType.includes("application/json")) {
    data = await response.json().catch(() => ({}));
  } else {
    // If the server returned HTML (e.g. Vercel SPA rewrite fallback or 404 page)
    const textSnippet = (await response.text().catch(() => "")).slice(0, 120);
    if (textSnippet.includes("<!DOCTYPE") || textSnippet.includes("<html")) {
      throw new Error(
        `Backend API endpoint not reached at ${API_BASE_URL}${path}. Please verify backend deployment and environment settings.`
      );
    }
    data = { message: textSnippet || "Non-JSON response from server." };
  }

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }
  return data;
};

const authHeaders = (token) => ({ Authorization: `Bearer ${token}` });

export const api = {
  register: (payload) => request("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  registerAdmin: (token, payload) => request("/admin/users", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  }),
  login: (payload) => request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  getPhotos: () => request("/photos"),
  getMyPhotos: (token) => request("/photos/mine", { headers: authHeaders(token) }),
  submitPhoto: (token, payload) => request("/photos", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  }),
  getPendingPhotos: (token) => request("/admin/photos/pending", { headers: authHeaders(token) }),
  approvePhoto: (token, id) => request(`/admin/photos/${id}/approve`, {
    method: "PATCH",
    headers: authHeaders(token),
  }),
  deletePhoto: (token, id) => request(`/admin/photos/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  }),
};
