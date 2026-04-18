# Al-Shat Al-Aqari — API Endpoints Reference

All routes are prefixed with `/api/v1`. Authenticated routes require a Bearer token in the `Authorization` header.

---

## 1. Auth / OTP

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/auth/otp/send` | Send OTP to buyer phone number | Public |
| `POST` | `/auth/otp/verify` | Verify OTP and return buyer session token | Public |
| `POST` | `/auth/buyer/register` | Register new buyer (name + phone) | Public |
| `POST` | `/auth/buyer/login` | Buyer login via phone + OTP | Public |
| `POST` | `/auth/office/register` | Register new office (name, email, phone, password) | Public |
| `POST` | `/auth/office/login` | Office login via email + password | Public |
| `POST` | `/auth/admin/login` | Admin login via password | Public |
| `POST` | `/auth/logout` | Invalidate current session token | Bearer |

### Request Examples

**POST `/auth/otp/send`**
```json
{ "phone": "+966501234567" }
```

**POST `/auth/otp/verify`**
```json
{ "phone": "+966501234567", "code": "123456" }
```

---

## 2. Listings

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/listings` | List all listings (filterable) | Public |
| `GET` | `/listings/:id` | Get a single listing by ID | Public |
| `GET` | `/listings/:id/similar` | Get similar listings (same city/type) | Public |
| `GET` | `/offices/:officeId/listings` | List all listings for a specific office | Bearer (Office) |
| `POST` | `/offices/:officeId/listings` | Create a new listing | Bearer (Office) |
| `PUT` | `/offices/:officeId/listings/:id` | Update a listing | Bearer (Office) |
| `DELETE` | `/offices/:officeId/listings/:id` | Delete a listing | Bearer (Office) |

### Query Params — `GET /listings`

| Param | Type | Description |
|-------|------|-------------|
| `city_id` | string | Filter by city |
| `property_type` | string | Filter by type (Villa, Apartment, …) |
| `price_min` | number | Minimum price |
| `price_max` | number | Maximum price |
| `bedrooms_min` | number | Minimum bedrooms |
| `status` | string | `active` \| `pending` \| `sold` |
| `office_id` | string | Filter by office |
| `q` | string | Full-text search (address, description) |

### Request Body — `POST /offices/:officeId/listings`
```json
{
  "property_type": "Villa",
  "address": "Al Yasmin, North Riyadh",
  "price": 1250000,
  "area": 350,
  "bedrooms": 4,
  "bathrooms": 3,
  "city_id": "1",
  "description": "...",
  "features": ["Pool", "Garden"],
  "images": ["https://..."]
}
```

---

## 3. Offices

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/offices` | List all offices | Bearer (Admin) |
| `GET` | `/offices/:id` | Get office profile by ID | Bearer (Office) |
| `GET` | `/offices/slug/:slug` | Get public office profile by slug | Public |
| `PUT` | `/offices/:id` | Update office profile | Bearer (Office) |
| `PUT` | `/offices/:id/suspend` | Suspend an office | Bearer (Admin) |
| `PUT` | `/offices/:id/ranking` | Update office ranking/score | Bearer (Admin) |

### Request Body — `PUT /offices/:id`
```json
{
  "name": "Prime Real Estate",
  "bio": "We help you find your dream home.",
  "phone": "+966501234567",
  "email": "contact@office.sa",
  "whatsapp": "+966501234567",
  "address": "King Fahd Road, Riyadh",
  "website": "https://office.sa",
  "logo_url": "https://..."
}
```

---

## 4. Campaigns

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/offices/:officeId/campaigns` | List all campaigns for an office | Bearer (Office) |
| `GET` | `/offices/:officeId/campaigns/:id` | Get campaign detail + analytics report | Bearer (Office) |
| `POST` | `/offices/:officeId/campaigns` | Create a new campaign | Bearer (Office) |
| `PUT` | `/offices/:officeId/campaigns/:id` | Update campaign (e.g. pause/resume/launch) | Bearer (Office) |
| `DELETE` | `/offices/:officeId/campaigns/:id` | Delete a campaign | Bearer (Office) |

### Request Body — `POST /offices/:officeId/campaigns`
```json
{
  "name": "Spring Promo",
  "listing_id": "listing-1",
  "audience_filter": "serious|urgent",
  "scheduled_at": "2026-04-20T09:00:00Z"
}
```

### Request Body — `PUT …/campaigns/:id` (status change)
```json
{ "status": "active" }
```

---

## 5. Leads / Demands

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/demands` | Create a buyer demand request (after OTP) | Bearer (Buyer) |
| `GET` | `/offices/:officeId/leads` | List leads distributed to an office | Bearer (Office) |
| `GET` | `/offices/:officeId/leads/:id` | Get lead detail | Bearer (Office) |
| `POST` | `/offices/:officeId/leads/:id/respond` | Respond to a lead (send message) | Bearer (Office) |

### Query Params — `GET /offices/:officeId/leads`

| Param | Type | Description |
|-------|------|-------------|
| `status` | string | `pending` \| `validated` \| `rejected` |
| `intent_level` | string | `browsing` \| `serious` \| `urgent` |
| `q` | string | Search by buyer name or property type |

### Request Body — `POST /demands`
```json
{
  "buyer_name": "Mohammed Al-Farsi",
  "phone": "+966501234567",
  "city_id": "1",
  "budget_min": 500000,
  "budget_max": 900000,
  "property_type": "Apartment",
  "bedrooms_min": 3,
  "intent_level": "serious",
  "notes": "Prefer North Riyadh"
}
```

---

## 6. Negotiations

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/buyers/:buyerId/negotiations` | List all negotiations for a buyer | Bearer (Buyer) |
| `GET` | `/negotiations/:id` | Get negotiation detail with full history | Bearer |
| `POST` | `/listings/:listingId/negotiations` | Start a new negotiation (initial offer) | Bearer (Buyer) |
| `POST` | `/negotiations/:id/offers` | Submit a new counter-offer | Bearer |
| `PUT` | `/negotiations/:id/accept` | Accept current offer and close negotiation | Bearer |

### Request Body — `POST /listings/:listingId/negotiations`
```json
{
  "initial_offer": 1100000,
  "message": "I'd like to negotiate."
}
```

### Request Body — `POST /negotiations/:id/offers`
```json
{
  "offer": 1150000,
  "message": "Counter-offer from buyer."
}
```

---

## 7. Visit Requests

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/buyers/:buyerId/visits` | List all visit requests for a buyer | Bearer (Buyer) |
| `POST` | `/listings/:listingId/visits` | Schedule a visit for a listing | Bearer (Buyer) |
| `PUT` | `/visits/:id/cancel` | Cancel a pending visit request | Bearer (Buyer) |
| `PUT` | `/visits/:id/confirm` | Office confirms a visit | Bearer (Office) |

### Request Body — `POST /listings/:listingId/visits`
```json
{
  "scheduled_at": "2026-04-25T14:00:00Z",
  "notes": "Please call before arrival."
}
```

---

## 8. Subscriptions

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/offices/:officeId/subscription` | Get current subscription plan | Bearer (Office) |
| `PUT` | `/offices/:officeId/subscription` | Upgrade / change plan | Bearer (Office) |
| `DELETE` | `/offices/:officeId/subscription` | Cancel subscription | Bearer (Office) |

### Request Body — `PUT /offices/:officeId/subscription`
```json
{
  "plan_id": "professional",
  "billing_cycle": "annual"
}
```

---

## 9. Page Builder / Mini-Pages

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/offices/:officeId/page` | Get office page config (blocks + theme) | Bearer (Office) |
| `PUT` | `/offices/:officeId/page` | Save/update page config | Bearer (Office) |
| `POST` | `/offices/:officeId/page/publish` | Publish page (make public) | Bearer (Office) |
| `GET` | `/pages/:slug` | Get published public page by slug | Public |
| `GET` | `/offices/:officeId/linktree` | Get linktree config (links, appearance, profile) | Bearer (Office) |
| `PUT` | `/offices/:officeId/linktree` | Save linktree config | Bearer (Office) |

### Request Body — `PUT /offices/:officeId/page`
```json
{
  "theme": {
    "primaryColor": "#1A56DB",
    "fontFamily": "Cairo",
    "buttonStyle": "rounded"
  },
  "background": {
    "type": "gradient",
    "value": "linear-gradient(135deg, #1A56DB, #0E9F6E)"
  },
  "blocks": [
    {
      "id": "block-1",
      "type": "hero",
      "visible": true,
      "data": { "heading": "Welcome", "subheading": "..." }
    }
  ]
}
```

### Request Body — `PUT /offices/:officeId/linktree`
```json
{
  "profile": { "name": "Prime RE", "bio": "...", "avatar": "https://..." },
  "links": [
    { "id": "link-1", "title": "WhatsApp", "url": "https://wa.me/...", "icon": "whatsapp", "active": true }
  ],
  "appearance": { "background": "brand", "buttonStyle": "rounded", "font": "Cairo" }
}
```

---

## 10. Chat / AI

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/chat/conversations` | List all conversations (buyer's history) | Bearer (Buyer) |
| `POST` | `/chat/conversations` | Start a new conversation | Bearer (Buyer) |
| `GET` | `/chat/conversations/:id` | Get conversation messages | Bearer (Buyer) |
| `DELETE` | `/chat/conversations/:id` | Delete a conversation | Bearer (Buyer) |
| `POST` | `/chat/conversations/:id/messages` | Send a user message and get AI response | Bearer (Buyer) |

### Request Body — `POST /chat/conversations/:id/messages`
```json
{ "content": "I'm looking for a 3-bedroom villa in Riyadh under 1.5M SAR" }
```

### Response — AI message
```json
{
  "id": "msg-xyz",
  "role": "assistant",
  "content": "Here are some options that match your criteria:",
  "listings": [ { "id": "listing-1", "..." : "..." } ],
  "suggestions": ["Show cheaper options", "Add to my demand list"],
  "timestamp": "2026-04-13T10:00:00Z"
}
```

---

## 11. Analytics

### Page Analytics

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/offices/:officeId/analytics/page` | Page views, unique visitors, clicks, leads, traffic sources, block stats, device split | Bearer (Office) |

### Query Params — `GET /offices/:officeId/analytics/page`

| Param | Type | Description |
|-------|------|-------------|
| `range` | string | `7d` \| `30d` \| `90d` |

### Office / Listing Analytics

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/offices/:officeId/analytics` | KPI stats: listings, views, leads, conversion rate, monthly trends | Bearer (Office) |
| `GET` | `/offices/:officeId/analytics/listings` | Per-listing stats (views, inquiries) | Bearer (Office) |

### Platform Analytics (Admin)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/admin/analytics` | Platform KPIs: total users, offices, listings, revenue, signups | Bearer (Admin) |
| `GET` | `/admin/analytics/offices` | Per-office metrics: ad quality %, response rate %, satisfaction % | Bearer (Admin) |

---

## 12. Admin / Compliance

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/admin/offices` | List all offices with metrics | Bearer (Admin) |
| `PUT` | `/admin/offices/:id/suspend` | Suspend an office account | Bearer (Admin) |
| `PUT` | `/admin/offices/:id/ranking` | Set office ranking score | Bearer (Admin) |
| `GET` | `/admin/compliance` | List compliance incidents (spam, fraud, abuse) | Bearer (Admin) |
| `GET` | `/admin/compliance/:id` | Get incident detail | Bearer (Admin) |
| `GET` | `/admin/settings` | Get platform settings | Bearer (Admin) |
| `PUT` | `/admin/settings` | Update platform settings | Bearer (Admin) |

### Request Body — `PUT /admin/settings`
```json
{
  "commission_rate": 2.5,
  "min_listing_price": 100000,
  "max_free_listings_per_office": 5
}
```

---

## 13. Cities (Reference Data)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/cities` | List all supported cities | Public |

---

## Summary

| Domain | Endpoint Count |
|--------|---------------|
| Auth / OTP | 8 |
| Listings | 7 |
| Offices | 6 |
| Campaigns | 5 |
| Leads / Demands | 4 |
| Negotiations | 5 |
| Visit Requests | 4 |
| Subscriptions | 3 |
| Page Builder / Mini-Pages | 6 |
| Chat / AI | 5 |
| Analytics | 6 |
| Admin / Compliance | 8 |
| Cities | 1 |
| **Total** | **68** |
