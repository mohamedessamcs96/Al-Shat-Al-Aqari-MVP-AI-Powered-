// Lightweight in-memory mock API for local development and testing
// Provides: OTP send/verify, demand creation, simple distribution simulator,
// a tiny in-memory job queue, and campaign/listing stubs.

import {
  mockListings,
  Listing,
  DemandRequest,
  Campaign,
  Negotiation,
  mockListings as listingsData,
  mockOffices,
} from "./mock-data";

function generateId(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

type OtpEntry = { code: string; expiresAt: number };

const OTP_STORE: Record<string, OtpEntry> = {};

// Simple job queue
const JOB_QUEUE: Array<{ id: string; type: string; payload: any }> = [];

export function enqueueJob(type: string, payload: any) {
  const job = { id: generateId('job'), type, payload };
  JOB_QUEUE.push(job);
  // process immediately (synchronous for mock)
  processJob(job);
  return job;
}

function processJob(job: { id: string; type: string; payload: any }) {
  // very small demo: handle campaign-send and distribute-demand
  if (job.type === "distribute-demand") {
    // naive distribution: pick paid offices (mock) and attach to job result
    job.payload.assigned_to = ["office-1", "office-2"];
  }
  if (job.type === "campaign-send") {
    job.payload.sent = true;
  }
}

// OTP mocks
export function sendOtp(phone: string) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
  OTP_STORE[phone] = { code, expiresAt };
  // log to console so developer can see OTP
  // eslint-disable-next-line no-console
  console.log(`[mock-api] sendOtp -> ${phone}: ${code}`);
  return { ok: true, ttl: 300 };
}

export function verifyOtp(phone: string, code: string) {
  const entry = OTP_STORE[phone];
  if (!entry) return { ok: false, reason: "not_sent" };
  if (Date.now() > entry.expiresAt) return { ok: false, reason: "expired" };
  if (entry.code !== code) return { ok: false, reason: "mismatch" };
  delete OTP_STORE[phone];
  return { ok: true };
}

// Demand creation and distribution
export function createDemand(d: Partial<DemandRequest>) {
  const demand: DemandRequest = {
    id: generateId('demand'),
    buyer_id: d.buyer_id || generateId('buyer'),
    buyer_name: d.buyer_name || 'Anonymous',
    city_id: d.city_id || mockListings[0]?.city_id || '1',
    budget_min: d.budget_min ?? 0,
    budget_max: d.budget_max ?? 0,
    property_type: d.property_type || 'Any',
    bedrooms_min: d.bedrooms_min ?? 0,
    intent_level: (d.intent_level as any) || 'browsing',
    validation_status: (d.validation_status as any) || 'pending',
    created_at: new Date().toISOString(),
    notes: d.notes || '',
  } as DemandRequest;
  // enqueue distribution job
  enqueueJob("distribute-demand", { demandId: demand.id });
  return demand;
}

// Lightweight listing/campaign stubs
export function listListings(): Listing[] {
  return listingsData;
}

export function createCampaign(c: Partial<Campaign>) {
  const camp: Campaign = {
    id: generateId('camp'),
    office_id: c.office_id || mockOffices[0]?.id || 'office-1',
    listing_id: c.listing_id || listingsData[0]?.id || '',
    name: c.name || 'Campaign',
    audience_filter: c.audience_filter || 'all',
    scheduled_at: c.scheduled_at || new Date().toISOString(),
    status: (c.status as any) || 'draft',
    sent_count: c.sent_count || 0,
    click_count: c.click_count || 0,
    lead_count: c.lead_count || 0,
  } as Campaign;
  enqueueJob("campaign-send", { campaignId: camp.id });
  return camp;
}

export function getJobQueue() {
  return JOB_QUEUE.slice();
}

export function clearMocks() {
  Object.keys(OTP_STORE).forEach((k) => delete OTP_STORE[k]);
  JOB_QUEUE.splice(0, JOB_QUEUE.length);
}

export default {
  sendOtp,
  verifyOtp,
  createDemand,
  listListings,
  createCampaign,
  getJobQueue,
  clearMocks,
};
