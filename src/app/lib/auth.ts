// Authentication state utilities – stored in localStorage

export type UserRole = 'buyer' | 'office' | 'admin';

export interface AuthUser {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  slug?: string;
}

const KEYS = {
  TOKEN: 'auth_token',
  REFRESH: 'auth_refresh_token',
  ROLE: 'auth_role',
  USER: 'auth_user',
  LANG: 'lang',
} as const;

// ── Token ────────────────────────────────────────────────────────────────────

export function getToken(): string | null {
  return localStorage.getItem(KEYS.TOKEN);
}

export function setToken(token: string): void {
  localStorage.setItem(KEYS.TOKEN, token);
}

export function removeToken(): void {
  localStorage.removeItem(KEYS.TOKEN);
}

// ── Refresh token ─────────────────────────────────────────────────────────────

export function getRefreshToken(): string | null {
  return localStorage.getItem(KEYS.REFRESH);
}

export function setRefreshToken(token: string): void {
  localStorage.setItem(KEYS.REFRESH, token);
}

// ── Role ─────────────────────────────────────────────────────────────────────

export function getRole(): UserRole | null {
  return localStorage.getItem(KEYS.ROLE) as UserRole | null;
}

export function setRole(role: UserRole): void {
  localStorage.setItem(KEYS.ROLE, role);
}

// ── User ─────────────────────────────────────────────────────────────────────

export function getUser(): AuthUser | null {
  const stored = localStorage.getItem(KEYS.USER);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as AuthUser;
  } catch {
    return null;
  }
}

export function setUser(user: AuthUser): void {
  localStorage.setItem(KEYS.USER, JSON.stringify(user));
}

// ── Language ─────────────────────────────────────────────────────────────────
// Defaults to 'ar'. Used as the Accept-Language request header.

export function getLang(): string {
  return localStorage.getItem(KEYS.LANG) || 'ar';
}

export function setLang(lang: string): void {
  localStorage.setItem(KEYS.LANG, lang);
}

// ── Raw auth response ─────────────────────────────────────────────────────────
// Stores the entire login API response so we can extract the office ID
// from any field path, regardless of the exact response shape the backend uses.

export function setRawAuthResponse(data: Record<string, unknown>): void {
  // Omit token to avoid double-storing sensitive data
  const { token: _, ...rest } = data as { token?: unknown; [k: string]: unknown };
  localStorage.setItem('auth_raw', JSON.stringify(rest));
}

export function getOfficeIdFromRawResponse(): string | null {
  const raw = localStorage.getItem('auth_raw');
  if (!raw) return null;
  try {
    const r = JSON.parse(raw) as Record<string, unknown>;
    const d = r.data as Record<string, unknown> | undefined;
    const u = d?.user as Record<string, unknown> | undefined;
    return (
      (u?.id as string | undefined) ||
      (d?.office_id as string | undefined) ||
      (d?.id as string | undefined) ||
      (r.office_id as string | undefined) ||
      (r.id as string | undefined) ||
      ((r.office as Record<string, unknown> | undefined)?.id as string | undefined) ||
      ((r.user as Record<string, unknown> | undefined)?.id as string | undefined) ||
      null
    );
  } catch {
    return null;
  }
}

// ── JWT decode ───────────────────────────────────────────────────────────────

/**
 * Decodes the JWT payload (no verification) and returns the office_id
 * or subject claim. Used as a fallback when auth_user is missing from
 * localStorage (e.g. stale session before the auth fix was deployed).
 */
export function getOfficeIdFromToken(): string | null {
  const token = getToken();
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    // JWT sub is the office/user UUID in this backend
    return (
      payload?.office_id ??
      payload?.sub ??
      payload?.id ??
      payload?.user_id ??
      null
    );
  } catch {
    return null;
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}

/** Clear every auth key from localStorage */
export function logout(): void {
  localStorage.removeItem(KEYS.TOKEN);
  localStorage.removeItem(KEYS.REFRESH);
  localStorage.removeItem(KEYS.ROLE);
  localStorage.removeItem('auth_raw');
  localStorage.removeItem(KEYS.USER);
}
