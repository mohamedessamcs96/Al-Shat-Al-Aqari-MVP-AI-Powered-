# Al-Shat Al-Aqari — Database Class Diagram

```mermaid
erDiagram

    %% ─── Auth ───────────────────────────────────────────────────
    BUYER {
        uuid    id PK
        string  name
        string  phone UK
        string  session_token
        boolean is_verified
        timestamp created_at
    }

    OFFICE {
        uuid    id PK
        string  name
        string  slug UK
        string  email UK
        string  password_hash
        string  phone
        string  whatsapp
        string  address
        string  website
        string  logo_url
        string  bio
        string  city_id FK
        float   rating
        int     total_listings
        boolean verified
        boolean suspended
        int     ranking_score
        timestamp created_at
    }

    ADMIN {
        uuid    id PK
        string  email UK
        string  password_hash
        timestamp created_at
    }

    CITY {
        uuid    id PK
        string  name
        string  name_ar
    }

    %% ─── Listings ───────────────────────────────────────────────
    LISTING {
        uuid    id PK
        uuid    office_id FK
        uuid    city_id FK
        float   price
        float   area
        int     bedrooms
        int     bathrooms
        string  property_type
        string  description
        string  address
        float   quality_score
        string  status
        string  source_site
        jsonb   images
        jsonb   features
        timestamp created_at
    }

    %% ─── Demands / Leads ────────────────────────────────────────
    DEMAND {
        uuid    id PK
        uuid    buyer_id FK
        uuid    city_id FK
        string  buyer_name
        float   budget_min
        float   budget_max
        string  property_type
        int     bedrooms_min
        string  intent_level
        string  validation_status
        string  notes
        timestamp created_at
    }

    DEMAND_DISTRIBUTION {
        uuid    id PK
        uuid    demand_id FK
        uuid    office_id FK
        string  status
        timestamp distributed_at
        timestamp responded_at
    }

    %% ─── Negotiations ───────────────────────────────────────────
    NEGOTIATION {
        uuid    id PK
        uuid    listing_id FK
        uuid    buyer_id FK
        uuid    office_id FK
        float   listing_price
        float   current_offer
        string  status
        timestamp created_at
        timestamp updated_at
    }

    NEGOTIATION_OFFER {
        uuid    id PK
        uuid    negotiation_id FK
        float   offer_amount
        string  party
        string  message
        timestamp created_at
    }

    %% ─── Visit Requests ─────────────────────────────────────────
    VISIT_REQUEST {
        uuid    id PK
        uuid    listing_id FK
        uuid    buyer_id FK
        uuid    office_id FK
        string  buyer_name
        timestamp scheduled_at
        string  status
        string  notes
        timestamp confirmed_at
        timestamp created_at
    }

    %% ─── Campaigns ──────────────────────────────────────────────
    CAMPAIGN {
        uuid    id PK
        uuid    office_id FK
        uuid    listing_id FK
        string  name
        string  audience_filter
        timestamp scheduled_at
        string  status
        int     sent_count
        int     click_count
        int     lead_count
        timestamp created_at
    }

    %% ─── Subscriptions ──────────────────────────────────────────
    SUBSCRIPTION_PLAN {
        uuid    id PK
        string  name
        float   price_monthly
        float   price_annual
        int     max_listings
        int     max_campaigns
        boolean ai_leads
        boolean page_builder
        boolean analytics
    }

    OFFICE_SUBSCRIPTION {
        uuid    id PK
        uuid    office_id FK
        uuid    plan_id FK
        string  billing_cycle
        string  status
        timestamp started_at
        timestamp expires_at
        timestamp cancelled_at
    }

    %% ─── Page Builder ───────────────────────────────────────────
    PAGE_CONFIG {
        uuid    id PK
        uuid    office_id FK UK
        string  slug UK
        jsonb   theme
        jsonb   background
        jsonb   seo
        boolean published
        timestamp published_at
        timestamp updated_at
    }

    PAGE_BLOCK {
        uuid    id PK
        uuid    page_config_id FK
        string  type
        int     order
        boolean visible
        jsonb   data
    }

    %% ─── Linktree ───────────────────────────────────────────────
    LINKTREE_CONFIG {
        uuid    id PK
        uuid    office_id FK UK
        jsonb   profile
        jsonb   appearance
        timestamp updated_at
    }

    LINKTREE_LINK {
        uuid    id PK
        uuid    linktree_id FK
        string  title
        string  url
        string  icon
        boolean active
        int     order
    }

    %% ─── Chat / AI ──────────────────────────────────────────────
    CONVERSATION {
        uuid    id PK
        uuid    buyer_id FK
        string  title
        timestamp created_at
        timestamp updated_at
    }

    MESSAGE {
        uuid    id PK
        uuid    conversation_id FK
        string  role
        text    content
        jsonb   suggestions
        jsonb   listings_snapshot
        boolean has_no_demand_cta
        timestamp created_at
    }

    %% ─── Analytics ──────────────────────────────────────────────
    PAGE_VIEW_EVENT {
        uuid    id PK
        uuid    page_config_id FK
        string  source
        string  device_type
        string  visitor_id
        timestamp viewed_at
    }

    BLOCK_CLICK_EVENT {
        uuid    id PK
        uuid    page_config_id FK
        uuid    block_id FK
        string  visitor_id
        timestamp clicked_at
    }

    COMPLIANCE_INCIDENT {
        uuid    id PK
        uuid    office_id FK
        string  type
        string  description
        string  status
        timestamp reported_at
        timestamp resolved_at
    }

    %% ─── Relationships ──────────────────────────────────────────

    CITY                ||--o{ OFFICE                : "has"
    CITY                ||--o{ LISTING               : "has"
    CITY                ||--o{ DEMAND                : "targets"

    OFFICE              ||--o{ LISTING               : "owns"
    OFFICE              ||--o{ CAMPAIGN              : "runs"
    OFFICE              ||--o{ DEMAND_DISTRIBUTION   : "receives"
    OFFICE              ||--o{ NEGOTIATION           : "involved in"
    OFFICE              ||--o{ VISIT_REQUEST         : "receives"
    OFFICE              ||--|{ OFFICE_SUBSCRIPTION   : "has"
    OFFICE              ||--|| PAGE_CONFIG           : "has"
    OFFICE              ||--|| LINKTREE_CONFIG       : "has"
    OFFICE              ||--o{ COMPLIANCE_INCIDENT   : "flagged in"

    SUBSCRIPTION_PLAN   ||--o{ OFFICE_SUBSCRIPTION  : "defines"

    BUYER               ||--o{ DEMAND                : "creates"
    BUYER               ||--o{ NEGOTIATION           : "initiates"
    BUYER               ||--o{ VISIT_REQUEST         : "schedules"
    BUYER               ||--o{ CONVERSATION          : "has"

    LISTING             ||--o{ NEGOTIATION           : "subject of"
    LISTING             ||--o{ VISIT_REQUEST         : "subject of"
    LISTING             ||--o{ CAMPAIGN              : "promoted by"

    DEMAND              ||--o{ DEMAND_DISTRIBUTION   : "distributed via"

    NEGOTIATION         ||--o{ NEGOTIATION_OFFER     : "contains"

    PAGE_CONFIG         ||--o{ PAGE_BLOCK            : "contains"
    PAGE_CONFIG         ||--o{ PAGE_VIEW_EVENT       : "tracks"
    PAGE_CONFIG         ||--o{ BLOCK_CLICK_EVENT     : "tracks"

    PAGE_BLOCK          ||--o{ BLOCK_CLICK_EVENT     : "tracked by"

    LINKTREE_CONFIG     ||--o{ LINKTREE_LINK         : "contains"

    CONVERSATION        ||--o{ MESSAGE               : "contains"
```

---

## Table Descriptions

| Table | Purpose |
|-------|---------|
| `BUYER` | End-user accounts (phone-based auth via OTP) |
| `OFFICE` | Real-estate office accounts (email + password auth) |
| `ADMIN` | Platform administrator accounts |
| `CITY` | Reference table of supported Saudi cities |
| `LISTING` | Property listings owned by offices |
| `DEMAND` | Buyer property demand requests submitted after OTP verification |
| `DEMAND_DISTRIBUTION` | Junction tracking which offices received a demand and their response |
| `NEGOTIATION` | Active price negotiation thread between a buyer and an office's listing |
| `NEGOTIATION_OFFER` | Individual offer entries inside a negotiation (append-only history) |
| `VISIT_REQUEST` | Scheduled property visit requests from buyers |
| `CAMPAIGN` | Marketing campaigns run by offices targeting buyer segments |
| `SUBSCRIPTION_PLAN` | Available subscription tiers (Starter / Professional / Enterprise) |
| `OFFICE_SUBSCRIPTION` | An office's active or historical subscription record |
| `PAGE_CONFIG` | Full page builder configuration (theme + background + SEO) per office |
| `PAGE_BLOCK` | Individual content blocks belonging to a page config |
| `LINKTREE_CONFIG` | Linktree-style page profile and appearance settings per office |
| `LINKTREE_LINK` | Individual links inside a linktree config |
| `CONVERSATION` | AI chat conversation session owned by a buyer |
| `MESSAGE` | Individual chat messages (user or AI) within a conversation |
| `PAGE_VIEW_EVENT` | Raw page view events for analytics (source, device, visitor) |
| `BLOCK_CLICK_EVENT` | Raw block click events for per-block analytics |
| `COMPLIANCE_INCIDENT` | Flagged compliance issues (spam, fraud, abuse) linked to an office |

---

## Field Type Legend

| Type | Description |
|------|-------------|
| `uuid` | Primary / foreign keys |
| `string` | `VARCHAR` — short text fields |
| `text` | `TEXT` — long content (messages, descriptions) |
| `float` | `NUMERIC / DECIMAL` — prices, ratings, scores |
| `int` | `INTEGER` — counts, ordering |
| `boolean` | `BOOLEAN` |
| `timestamp` | `TIMESTAMPTZ` — all times stored in UTC |
| `jsonb` | `JSONB` — structured nested objects (blocks, theme, filters, etc.) |
