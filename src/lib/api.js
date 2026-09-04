// Minimal fetch wrapper with the axios-style surface the pages use.
// Backend accepts cookie OR Bearer; errors mimic axios: err.response = { data, status }.
const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const setToken = (token) => {
  if (token) localStorage.setItem("loomboard_token", token);
  else localStorage.removeItem("loomboard_token");
};

const buildQuery = (params) => {
  if (!params) return "";
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") q.append(k, v);
  }
  const s = q.toString();
  return s ? `?${s}` : "";
};

async function request(method, url, body, config = {}) {
  const headers = { ...(config.headers || {}) };
  const token = localStorage.getItem("loomboard_token");
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload;
  if (body instanceof FormData) {
    delete headers["Content-Type"]; // browser sets multipart boundary itself
    payload = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(BASE + url + buildQuery(config.params), {
      method,
      headers,
      body: payload,
      credentials: "include",
      signal: config.signal,
    });
  } catch (e) {
    const err = new Error("Network error. Is the backend running?");
    err.response = { data: { success: false, message: "Network error. Is the backend running?" }, status: 0 };
    throw err;
  }

  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { success: false, message: text || "Bad response" };
  }

  if (!res.ok) {
    const err = new Error(data.message || `Request failed (${res.status})`);
    err.response = { data, status: res.status };
    throw err;
  }
  return { data, status: res.status };
}

const api = {
  get: (url, config) => request("GET", url, undefined, config),
  post: (url, body, config) => request("POST", url, body, config),
  put: (url, body, config) => request("PUT", url, body, config),
  patch: (url, body, config) => request("PATCH", url, body, config),
  delete: (url, config) => request("DELETE", url, undefined, config),
};

export default api;
