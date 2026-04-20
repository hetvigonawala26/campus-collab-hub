const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request(path, { method = "GET", body, headers } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(headers || {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    const message = data?.message || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  // Auth
  register: (payload) => request("/api/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/api/auth/login", { method: "POST", body: payload }),
  logout: () => request("/api/auth/logout", { method: "POST" }),
  me: () => request("/api/auth/me"),

  // Projects
  listProjects: () => request("/api/projects"),
  getProject: (id) => request(`/api/projects/${id}`),
  createProject: (payload) => request("/api/projects", { method: "POST", body: payload }),
  updateProject: (id, payload) =>
    request(`/api/projects/${id}`, { method: "PUT", body: payload }),
  deleteProject: (id) => request(`/api/projects/${id}`, { method: "DELETE" }),

  // Applications
  apply: (projectId) => request(`/api/applications/${projectId}`, { method: "POST" }),
  accept: (applicationId) =>
    request(`/api/applications/${applicationId}/accept`, { method: "PATCH" }),
  reject: (applicationId) =>
    request(`/api/applications/${applicationId}/reject`, { method: "PATCH" }),

  // Dashboard
  dashboard: () => request("/api/users/dashboard")
};

