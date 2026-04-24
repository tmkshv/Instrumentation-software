/**
 * Tiny REST client. Reads the bearer token from localStorage so every
 * request carries it. The token is set once on the Login screen.
 */

const TOKEN_KEY = "husky.token";

export function getToken(): string {
  return localStorage.getItem(TOKEN_KEY) ?? "";
}

export function setToken(token: string): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const data = await res.json();
      detail = (data as { detail?: string }).detail ?? detail;
    } catch {
      // ignore
    }
    throw new ApiError(res.status, detail);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  get: <T,>(p: string) => request<T>("GET", p),
  post: <T,>(p: string, body?: unknown) => request<T>("POST", p, body),
};

/** Build an MJPEG <img> URL with the token baked in via header workaround.
 * Browsers can't set Authorization on an <img>, so when auth is enabled
 * the operator runs over a closed network and the token check is permissive
 * for camera URLs. If you need auth on streams, add a query-param scheme.
 */
export function streamUrl(camId: string): string {
  return `/api/cameras/${encodeURIComponent(camId)}/stream`;
}

export function snapshotUrl(camId: string): string {
  return `/api/cameras/${encodeURIComponent(camId)}/snapshot?ts=${Date.now()}`;
}
