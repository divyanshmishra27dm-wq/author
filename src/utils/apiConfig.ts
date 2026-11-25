/**
 * Global API configuration.
 * - In single-service hosting (Docker on Render, Nginx, or local dev):
 *   API calls use relative paths ('/api/...').
 * - If frontend and backend are hosted separately:
 *   Set VITE_API_URL in your environment (e.g. VITE_API_URL=https://my-backend.onrender.com).
 */
export const BACKEND_URL: string = (
  (import.meta as any).env?.VITE_API_URL || ''
).replace(/\/+$/, '');

export const APP_PASSWORD = '($1advT%';

export function getAuthHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  return {
    'X-Access-Key': APP_PASSWORD,
    ...extraHeaders
  };
}

export function getApiUrl(endpoint: string): string {
  const clean = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (!BACKEND_URL) {
    return clean;
  }
  return `${BACKEND_URL}${clean}`;
}

