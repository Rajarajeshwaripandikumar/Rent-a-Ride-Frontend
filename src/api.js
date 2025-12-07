// src/api.js

// 1️⃣ Pick backend URL from Netlify env (VITE_API_BASE_URL)
// Fallback to Render URL for production or localhost for development
const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL &&
    import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, "")) ||
  "https://rent-a-ride-backend-c2km.onrender.com"; // fallback to Render URL for production

// If running locally, make sure it's localhost
if (import.meta.env.MODE === "development") {
  API_BASE_URL = "http://localhost:5000"; // localhost when in dev mode
}

// 2️⃣ Core request helper
async function request(path, { method = "GET", body, headers, ...rest } = {}) {
  // If path is full URL (http...), don't prepend base
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;

  const res = await fetch(url, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    credentials: "include", // keep cookies (useful for auth)
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

// 3️⃣ Simple helpers for each method
export const api = {
  baseUrl: API_BASE_URL,
  raw: request,
  get: (path, opts) => request(path, { ...opts, method: "GET" }),
  post: (path, body, opts) => request(path, { ...opts, method: "POST", body }),
  put: (path, body, opts) => request(path, { ...opts, method: "PUT", body }),
  patch: (path, body, opts) => request(path, { ...opts, method: "PATCH", body }),
  del: (path, opts) => request(path, { ...opts, method: "DELETE" }),
};
