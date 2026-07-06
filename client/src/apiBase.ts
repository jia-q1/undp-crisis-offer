/**
 * In dev, Vite's proxy forwards relative "/api" calls to the local API server.
 * In production the API is a separate Vercel project on its own domain, so
 * VITE_API_URL must be set to that project's URL.
 */
export const API_BASE = import.meta.env.VITE_API_URL ?? "";

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

/** Resolves a possibly-relative URL returned by the API (e.g. the Postgres-backed PDF route) against API_BASE. */
export function resolveApiUrl(url: string): string {
  return url.startsWith("http") ? url : `${API_BASE}${url}`;
}
