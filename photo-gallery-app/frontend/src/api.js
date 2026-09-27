const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const request = async (path, options = {}) => {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    });
  } catch {
    throw new Error("Unable to connect to the server. Start MongoDB and the API server, then try again.");
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Something went wrong.");
  return data;
};

const authHeaders = (token) => ({ Authorization: `Bearer ${token}` });

export const api = {
  register: (payload) => request("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
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
