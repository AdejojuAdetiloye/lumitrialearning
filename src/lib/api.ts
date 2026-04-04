const base = import.meta.env.VITE_API_URL ?? "";

export function getToken(): string | null {
  return localStorage.getItem("lumetra_token");
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem("lumetra_token", token);
  else localStorage.removeItem("lumetra_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers ?? {}),
  };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }
  // Used for region-based pricing/timezone logic on the API.
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (tz) {
    (headers as Record<string, string>)["X-Client-Timezone"] = tz;
  }
  const res = await fetch(`${base}${path}`, { ...options, headers });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const err = (data && (data.error ?? data.message)) || res.statusText;
    throw new Error(typeof err === "string" ? err : JSON.stringify(err));
  }
  return data as T;
}

export const api = {
  get: <T>(path: string, init?: RequestInit) => request<T>(path, { method: "GET", ...init }),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T = unknown>(path: string) => request<T>(path, { method: "DELETE" }),
};
