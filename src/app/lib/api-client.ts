/**
 * Central API client for Al-Shat Al-Aqari.
 *
 * Every request:
 *  - Sends `Accept-Language` from the stored language preference (default: ar).
 *  - Attaches `Authorization: Bearer <token>` when a token exists.
 *  - Throws an Error whose message comes from the backend response body,
 *    so the UI can display it directly without hardcoding error strings.
 */

import { getToken, getLang } from './auth';

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://79.72.4.1:8000';
const API_PREFIX = '/api/v1';

// ── Core fetch wrapper ────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const lang = getLang();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept-Language': lang,
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${API_PREFIX}${path}`, {
    ...options,
    headers,
  });

  // 204 No Content → return empty object
  if (res.status === 204) return {} as T;

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    // Backend may return errors in several shapes:
    // { detail: "…" }  |  { message: "…" }  |  { error: "…" }
    // or DRF field-level errors: { field: ["msg"] }
    const fallback = lang === 'en' ? 'An error occurred. Please try again.' : 'حدث خطأ. الرجاء المحاولة مجدداً.';
    const msg =
      (body as Record<string, unknown>).detail ??
      (body as Record<string, unknown>).message ??
      (body as Record<string, unknown>).error ??
      extractFieldErrors(body as Record<string, unknown[]>) ??
      fallback;
    throw new Error(String(msg));
  }

  return body as T;
}

function extractFieldErrors(body: Record<string, unknown>): string | undefined {
  const entries = Object.entries(body);
  if (entries.length === 0) return undefined;
  for (const [, val] of entries) {
    if (Array.isArray(val) && typeof val[0] === 'string') return val[0];
  }
  return undefined;
}

// ── 1. Auth ───────────────────────────────────────────────────────────────────

export interface AuthResponse {
  token: string;
  buyer_id?: string;
  office_id?: string;
}

export const auth = {
  sendOtp: (phone: string) =>
    apiFetch<{ ok: boolean }>('/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }),

  verifyOtp: (phone: string, code: string) =>
    apiFetch<{ ok: boolean }>('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ phone, code }),
    }),

  buyerRegister: (name: string, phone: string) =>
    apiFetch<AuthResponse>('/auth/buyer/register', {
      method: 'POST',
      body: JSON.stringify({ name, phone }),
    }),

  buyerLogin: (phone: string) =>
    apiFetch<AuthResponse>('/auth/buyer/login', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }),

  officeRegister: (name: string, email: string, phone: string, password: string) =>
    apiFetch<AuthResponse>('/auth/office/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, phone, password }),
    }),

  officeLogin: (email: string, password: string) =>
    apiFetch<AuthResponse>('/auth/office/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  adminLogin: (email: string, password: string) =>
    apiFetch<{ token: string }>('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    apiFetch<void>('/auth/logout', { method: 'POST' }),
};

// ── 2. Buyers ─────────────────────────────────────────────────────────────────

export const buyers = {
  getProfile: (buyerId: string) =>
    apiFetch<Record<string, unknown>>(`/buyers/${buyerId}/`),

  updateName: (buyerId: string, name: string) =>
    apiFetch<Record<string, unknown>>(`/buyers/${buyerId}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    }),

  deleteAccount: (buyerId: string) =>
    apiFetch<void>(`/buyers/${buyerId}/`, { method: 'DELETE' }),

  listNegotiations: (buyerId: string) =>
    apiFetch<unknown[]>(`/buyers/${buyerId}/negotiations/`),

  listVisits: (buyerId: string) =>
    apiFetch<unknown[]>(`/buyers/${buyerId}/visits/`),
};

// ── 3. Listings ───────────────────────────────────────────────────────────────

export interface ListingFilters {
  property_type?: string;
  price_min?: number;
  price_max?: number;
  bedrooms_min?: number;
  status?: string;
  city?: string;
  page?: number;
}

export const listings = {
  list: (filters: ListingFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== '') params.set(k, String(v));
    });
    const qs = params.toString();
    return apiFetch<unknown[]>(`/listings/${qs ? `?${qs}` : ''}`);
  },

  get: (listingId: string) =>
    apiFetch<Record<string, unknown>>(`/listings/${listingId}`),

  getSimilar: (listingId: string) =>
    apiFetch<unknown[]>(`/listings/${listingId}/similar`),

  startNegotiation: (listingId: string, initialOffer: number, message: string) =>
    apiFetch<Record<string, unknown>>(`/listings/${listingId}/negotiations/`, {
      method: 'POST',
      body: JSON.stringify({ initial_offer: initialOffer, message }),
    }),

  scheduleVisit: (listingId: string, scheduledAt: string, notes: string) =>
    apiFetch<Record<string, unknown>>(`/listings/${listingId}/visits/`, {
      method: 'POST',
      body: JSON.stringify({ scheduled_at: scheduledAt, notes }),
    }),
};

// ── 4. Offices ────────────────────────────────────────────────────────────────

export const offices = {
  listAll: () => apiFetch<unknown[]>('/offices/'),

  getById: (officeId: string) =>
    apiFetch<Record<string, unknown>>(`/offices/${officeId}/`),

  getBySlug: (slug: string) =>
    apiFetch<Record<string, unknown>>(`/offices/slug/${slug}/`),

  update: (officeId: string, data: Record<string, unknown>) =>
    apiFetch<Record<string, unknown>>(`/offices/${officeId}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  suspend: (officeId: string, suspended: boolean) =>
    apiFetch<Record<string, unknown>>(`/offices/${officeId}/suspend/`, {
      method: 'PUT',
      body: JSON.stringify({ suspended }),
    }),

  updateRanking: (officeId: string, rankingScore: number) =>
    apiFetch<Record<string, unknown>>(`/offices/${officeId}/ranking/`, {
      method: 'PUT',
      body: JSON.stringify({ ranking_score: rankingScore }),
    }),

  // Listings
  listListings: (officeId: string) =>
    apiFetch<unknown[]>(`/offices/${officeId}/listings`),

  createListing: (officeId: string, data: Record<string, unknown>) =>
    apiFetch<Record<string, unknown>>(`/offices/${officeId}/listings`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateListing: (officeId: string, listingId: string, data: Record<string, unknown>) =>
    apiFetch<Record<string, unknown>>(`/offices/${officeId}/listings/${listingId}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteListing: (officeId: string, listingId: string) =>
    apiFetch<void>(`/offices/${officeId}/listings/${listingId}/`, { method: 'DELETE' }),

  // Leads
  listLeads: (officeId: string, params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch<unknown[]>(`/offices/${officeId}/leads/${qs ? `?${qs}` : ''}`);
  },

  getLeadDetail: (officeId: string, demandId: string) =>
    apiFetch<Record<string, unknown>>(`/offices/${officeId}/leads/${demandId}/`),

  respondToLead: (officeId: string, demandId: string) =>
    apiFetch<Record<string, unknown>>(`/offices/${officeId}/leads/${demandId}/respond/`, {
      method: 'POST',
    }),

  // Campaigns
  listCampaigns: (officeId: string) =>
    apiFetch<unknown[]>(`/offices/${officeId}/campaigns/`),

  getCampaign: (officeId: string, campaignId: string) =>
    apiFetch<Record<string, unknown>>(`/offices/${officeId}/campaigns/${campaignId}/`),

  createCampaign: (officeId: string, data: Record<string, unknown>) =>
    apiFetch<Record<string, unknown>>(`/offices/${officeId}/campaigns`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCampaign: (officeId: string, campaignId: string, data: Record<string, unknown>) =>
    apiFetch<Record<string, unknown>>(`/offices/${officeId}/campaigns/${campaignId}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteCampaign: (officeId: string, campaignId: string) =>
    apiFetch<void>(`/offices/${officeId}/campaigns/${campaignId}/`, { method: 'DELETE' }),

  // Negotiations
  listNegotiations: (officeId: string) =>
    apiFetch<unknown[]>(`/offices/${officeId}/negotiations/`),

  // Visits
  listVisits: (officeId: string) =>
    apiFetch<unknown[]>(`/offices/${officeId}/visits/`),

  // Subscription
  getSubscription: (officeId: string) =>
    apiFetch<Record<string, unknown>>(`/offices/${officeId}/subscription/`),

  updateSubscription: (officeId: string, planId: string, billingCycle: string) =>
    apiFetch<Record<string, unknown>>(`/offices/${officeId}/subscription/`, {
      method: 'PUT',
      body: JSON.stringify({ plan_id: planId, billing_cycle: billingCycle }),
    }),

  cancelSubscription: (officeId: string) =>
    apiFetch<void>(`/offices/${officeId}/subscription/`, { method: 'DELETE' }),

  // Analytics
  getAnalytics: (officeId: string) =>
    apiFetch<Record<string, unknown>>(`/offices/${officeId}/analytics/`),

  getListingAnalytics: (officeId: string) =>
    apiFetch<unknown[]>(`/offices/${officeId}/analytics/listings/`),

  getPageAnalytics: (officeId: string, range = '30d') =>
    apiFetch<Record<string, unknown>>(`/offices/${officeId}/analytics/page/?range=${range}`),

  // Page builder
  getPage: (officeId: string) =>
    apiFetch<Record<string, unknown>>(`/offices/${officeId}/page`),

  savePage: (officeId: string, config: Record<string, unknown>) =>
    apiFetch<Record<string, unknown>>(`/offices/${officeId}/page/`, {
      method: 'PUT',
      body: JSON.stringify(config),
    }),

  publishPage: (officeId: string) =>
    apiFetch<Record<string, unknown>>(`/offices/${officeId}/page/publish/`, {
      method: 'POST',
    }),

  getLinktree: (officeId: string) =>
    apiFetch<Record<string, unknown>>(`/offices/${officeId}/linktree/`),

  saveLinktree: (officeId: string, config: Record<string, unknown>) =>
    apiFetch<Record<string, unknown>>(`/offices/${officeId}/linktree/`, {
      method: 'PUT',
      body: JSON.stringify(config),
    }),
};

// ── 5. Demands ────────────────────────────────────────────────────────────────

export const demands = {
  create: (data: Record<string, unknown>) =>
    apiFetch<Record<string, unknown>>('/demands/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ── 6. Negotiations ───────────────────────────────────────────────────────────

export const negotiations = {
  get: (negotiationId: string) =>
    apiFetch<Record<string, unknown>>(`/negotiations/${negotiationId}/`),

  submitOffer: (negotiationId: string, offer: number, message: string) =>
    apiFetch<Record<string, unknown>>(`/negotiations/${negotiationId}/offers/`, {
      method: 'POST',
      body: JSON.stringify({ offer, message }),
    }),

  accept: (negotiationId: string) =>
    apiFetch<Record<string, unknown>>(`/negotiations/${negotiationId}/accept/`, {
      method: 'PUT',
    }),

  reject: (negotiationId: string) =>
    apiFetch<Record<string, unknown>>(`/negotiations/${negotiationId}/reject/`, {
      method: 'PUT',
    }),
};

// ── 7. Visits ─────────────────────────────────────────────────────────────────

export const visits = {
  cancel: (visitId: string) =>
    apiFetch<Record<string, unknown>>(`/visits/${visitId}/cancel/`, { method: 'PUT' }),

  confirm: (visitId: string) =>
    apiFetch<Record<string, unknown>>(`/visits/${visitId}/confirm/`, { method: 'PUT' }),
};

// ── 8. Subscriptions ──────────────────────────────────────────────────────────

export const subscriptions = {
  listPlans: () => apiFetch<unknown[]>('/subscription-plans/'),

  getPlan: (planId: string) =>
    apiFetch<Record<string, unknown>>(`/subscription-plans/${planId}/`),
};

// ── 9. Chat / AI ──────────────────────────────────────────────────────────────

export const chat = {
  listConversations: () =>
    apiFetch<unknown[]>('/chat/conversations/'),

  startConversation: () =>
    apiFetch<Record<string, unknown>>('/chat/conversations', { method: 'POST' }),

  getMessages: (conversationId: string) =>
    apiFetch<Record<string, unknown>>(`/chat/conversations/${conversationId}`),

  sendMessage: (conversationId: string, content: string) =>
    apiFetch<Record<string, unknown>>(`/chat/conversations/${conversationId}/messages/`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  deleteConversation: (conversationId: string) =>
    apiFetch<void>(`/chat/conversations/${conversationId}/`, { method: 'DELETE' }),
};

// ── 10. Admin ─────────────────────────────────────────────────────────────────

export const admin = {
  listOffices: () => apiFetch<unknown[]>('/admin/offices'),

  suspendOffice: (officeId: string) =>
    apiFetch<Record<string, unknown>>(`/admin/offices/${officeId}/suspend/`, { method: 'PUT' }),

  setOfficeRanking: (officeId: string, rankingScore: number) =>
    apiFetch<Record<string, unknown>>(`/admin/offices/${officeId}/ranking/`, {
      method: 'PUT',
      body: JSON.stringify({ ranking_score: rankingScore }),
    }),

  listCompliance: () => apiFetch<unknown[]>('/admin/compliance/'),

  getCompliance: (complianceId: string) =>
    apiFetch<Record<string, unknown>>(`/admin/compliance/${complianceId}/`),

  getSettings: () => apiFetch<Record<string, unknown>>('/admin/settings/'),

  updateSettings: (data: Record<string, unknown>) =>
    apiFetch<Record<string, unknown>>('/admin/settings/', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getAnalytics: () => apiFetch<Record<string, unknown>>('/admin/analytics/'),

  getOfficeMetrics: () => apiFetch<unknown[]>('/admin/analytics/offices/'),

  listDemands: () => apiFetch<unknown[]>('/admin/demands/'),

  distributeDemand: (demandId: string, officeIds: string[]) =>
    apiFetch<Record<string, unknown>>(`/admin/demands/${demandId}/distribute/`, {
      method: 'POST',
      body: JSON.stringify({ office_ids: officeIds }),
    }),

  viewDemandDistributions: (demandId: string) =>
    apiFetch<unknown[]>(`/admin/demands/${demandId}/distributions/`),

  listBuyers: () => apiFetch<unknown[]>('/admin/buyers/'),

  listSubscriptions: () => apiFetch<unknown[]>('/admin/subscriptions/'),
};

// ── 11. Cities ────────────────────────────────────────────────────────────────

export const cities = {
  list: () => apiFetch<{ id: string; name: string }[]>('/cities/'),
};

// ── 12. Public pages ──────────────────────────────────────────────────────────

export const pages = {
  getPublicPage: (slug: string) =>
    apiFetch<Record<string, unknown>>(`/pages/${slug}/`),
};
