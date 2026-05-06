const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('access_token');
  const headers = new Headers(options.headers);
  if (!headers.has('content-type') && options.body) headers.set('content-type', 'application/json');
  /*
   * Demo token storage: localStorage is simple for learning and easy to inspect.
   * Production apps should evaluate secure, HttpOnly, SameSite cookies, CSRF
   * protections, token rotation, and XSS risk before choosing storage.
   */
  if (token) headers.set('authorization', `Bearer ${token}`);
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw data;
  return data as T;
}

export { API_BASE };
