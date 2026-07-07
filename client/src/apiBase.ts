/**
 * In dev, Vite's proxy forwards relative "/api" calls to the local API server.
 * In production the API is a separate Vercel project on its own domain, so
 * VITE_API_URL must be set to that project's URL.
 */
// Stripped of any trailing slash: a trailing slash on VITE_API_URL plus the
// leading slash on every path here would otherwise produce a double slash
// (e.g. ".app//api/submit"), which Vercel 308-redirects — and browsers
// refuse to follow redirects during a CORS preflight, breaking the request.
export const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

/** Resolves a possibly-relative URL returned by the API (e.g. the Postgres-backed PDF route) against API_BASE. */
export function resolveApiUrl(url: string): string {
  return url.startsWith("http") ? url : `${API_BASE}${url}`;
}
