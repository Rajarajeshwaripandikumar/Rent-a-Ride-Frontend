// src/api.js

// -----------------------------------------
// Resolve backend base URL
// -----------------------------------------
function getBaseUrl() {
  // 1. Netlify env
  const envUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "");
  if (envUrl) return envUrl;

  // 2. Dev mode = local backend
  if (import.meta.env.MODE === "development") {
    return "http://localhost:5000";
  }

  // 3. Production fallback = Render backend
  return "https://rent-a-ride-backend-c2km.onrender.com";
}

const API_BASE_URL = getBaseUrl();

// -----------------------------------------
// Core request wrapper
// -----------------------------------------
async function request(
  path,
  { method = "GET", body, headers = {}, ...rest } = {}
) {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;

  // Get stored token (SignIn.jsx saves these)
  const token = localStorage.getItem("accessToken");

  // Attach JSON + Auth token
  const finalHeaders = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  const res = await fetch(url, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: finalHeaders,
    credentials: "include",
    ...rest,
  });

  const text = await res.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const err = new Error(data?.message || res.statusText || "Request failed");
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

// -----------------------------------------
// Public API
// -----------------------------------------
export const api = {
  baseUrl: API_BASE_URL,
  raw: request,
  get: (path, opts) => request(path, { ...opts, method: "GET" }),
  post: (path, body, opts) => request(path, { ...opts, method: "POST", body }),
  put: (path, body, opts) => request(path, { ...opts, method: "PUT", body }),
  patch: (path, body, opts) => request(path, { ...opts, method: "PATCH", body }),
  del: (path, opts) => request(path, { ...opts, method: "DELETE" }),
};
