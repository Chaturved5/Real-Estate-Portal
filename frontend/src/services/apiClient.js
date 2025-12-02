// src/services/apiClient.js

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

let authToken = null;

// Build full URL: base + path   e.g.  http://127.0.0.1:8000 + /api/signup
const buildUrl = (path) => {
  if (!API_BASE_URL) {
    throw new Error("API base URL is not configured");
  }

  const base = API_BASE_URL.replace(/\/$/, "");      // remove trailing /
  const cleanPath = path.replace(/^\//, "");         // remove starting /
  return `${base}/${cleanPath}`;
};

const request = async (method, path, body) => {
  const url = buildUrl(path);

  const headers = {
    Accept: "application/json",
  };

  // Only set JSON header when it's not FormData
  if (body !== undefined && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  // Send Sanctum token when logged in
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const options = {
    method,
    headers,
  };

  if (body !== undefined) {
    options.body = body instanceof FormData ? body : JSON.stringify(body);
  }

  const response = await fetch(url, options);

  // Read response safely
  const rawText = await response.text();
  let data = null;

  if (rawText) {
    try {
      data = JSON.parse(rawText);
    } catch {
      data = rawText;
    }
  }

  if (!response.ok) {
    // Try to show Laravel error message if present
    const message =
      (data && data.message) ||
      data ||
      `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  // 204 No Content
  if (response.status === 204) {
    return null;
  }

  return data;
};

export const apiClient = {
  isEnabled: Boolean(API_BASE_URL),
  setAuthToken: (token) => {
    authToken = token || null;
  },
  clearAuthToken: () => {
    authToken = null;
  },
  get: (path) => request("GET", path),
  post: (path, body) => request("POST", path, body),
  patch: (path, body) => request("PATCH", path, body),
  delete: (path) => request("DELETE", path),
};
