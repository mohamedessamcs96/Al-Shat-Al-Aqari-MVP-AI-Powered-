// Authentication state utilities – stored in localStorage

export type UserRole = 'buyer' | 'office' | 'admin';

export interface AuthUser {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
}

const KEYS = {
  TOKEN: 'auth_token',
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
  localStorage.removeItem(KEYS.ROLE);
  localStorage.removeItem(KEYS.USER);
}
