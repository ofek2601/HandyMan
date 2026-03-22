# PRD: Handyman Queue — Neighborhood Service Request System

## Overview

A Hebrew-language, mobile-first web app for a solo handyman starting to serve his neighborhood. Neighbors submit service requests (with optional photos), and the handyman's son manages all incoming requests through a simple admin dashboard.

This is a **v1 launch tool** — not a SaaS product. Design every decision around: "Can this be live and shared in a WhatsApp group today?"

---

## Problem

A handyman with years of experience just started offering services to his neighborhood. He needs a way to:

1. Let neighbors request his services without back-and-forth phone calls
2. Understand demand — what jobs people need, how many are waiting
3. Prioritize and manage incoming work in order

Currently there is no system. Requests come via random phone calls and get lost.

---

## Users

| User | Description | Access |
|------|-------------|--------|
| **Neighbor (customer)** | Submits a service request via the public landing page. No account needed. | Public page |
| **Admin (the son)** | Views, manages, and updates all requests. Single user, no auth needed initially — protected by obscure URL. | `/admin` route |

The handyman (dad) does NOT use the app directly. The son relays information verbally or via WhatsApp.

---

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | **Next.js (App Router)** | Claude Code handles it well; full-stack in one project; Vercel deploys free |
| Database | **SQLite via Turso (free tier)** | 0-cost, generous free tier (9GB storage, 500M reads/mo), works great with Next.js on Vercel via libsql |
| File Storage | **Cloudflare R2 (free tier)** or **Uploadthing (free tier)** | Photo uploads need object storage. R2 gives 10GB free. Uploadthing is easier to integrate — **use Uploadthing** for simplicity |
| ORM | **Drizzle ORM** | Lightweight, type-safe, works with Turso/libsql |
| Styling | **Tailwind CSS** | Fast, utility-first, RTL support via `dir="rtl"` |
| Language | **TypeScript** | Type safety, Claude Code generates better TS |
| Hosting | **Vercel (free tier)** | Zero-config Next.js deploy, generous free tier |

---

## Pages & Routes

### 1. Public Landing Page — `/`

**Purpose:** Build trust, explain services, and funnel visitors to the request form.

**Layout (top to bottom, single scroll):**

1. **Hero Section**
   - Handyman's name (configurable via env var `NEXT_PUBLIC_HANDYMAN_NAME`)
   - Tagline: "ההנדימן של השכונה" (The neighborhood handyman)
   - Badge: "מקבלים הזמנות חדשות" (Accepting new orders)
   - CTA button: scrolls to form section
   - Phone number (configurable via env var `NEXT_PUBLIC_HANDYMAN_PHONE`)

2. **Trust Indicators Strip**
   - "ניסיון רב שנים" (Years of experience)
   - "אמין ומקצועי" (Reliable & professional)
   - "מהשכונה שלכם" (From your neighborhood)

3. **Services Grid (2 columns on mobile)**
   - תליית תמונות ומדפים (Hanging pictures & shelves)
   - הרכבת ארונות ורהיטים (Furniture assembly)
   - תיקונים כלליים (General repairs)
   - חשמל ותאורה בסיסיים (Basic electrical & lighting)
   - אינסטלציה קלה (Light plumbing)
   - עבודות בית שונות (Misc home work)

4. **How It Works — 3 Steps**
   - Step 1: Fill out the form below
   - Step 2: We contact you within 24 hours
   - Step 3: We come and do the work

5. **Request Form (the core)**
   - Fields:
     - שם מלא (Full name) — required, text
     - טלפון (Phone) — required, tel input, validated for Israeli format (05X-XXXXXXX)
     - כתובת / אזור (Address / Area) — required, text
     - סוג העבודה (Type of work) — required, dropdown matching the services list above + "אחר" (other)
     - תיאור הבקשה (Request description) — required, textarea, min 10 chars
     - תמונות (Photos) — optional, file upload, max 3 images, max 5MB each, jpg/png/webp only
   - Submit button: "שליחת בקשה" (Submit request)
   - On success: show confirmation message with queue position ("הבקשה שלכם התקבלה! אתם מספר X בתור")
   - On error: inline field validation in Hebrew

6. **Footer**
   - Phone number (click-to-call)
   - "מעדיפים להתקשר?" (Prefer to call?)

**Floating CTA:** Appears after scrolling past hero, disappears when form is in view. Links to form section.

### Launch Promo Popup

**Purpose:** Create urgency. The first X customers get a special introductory price. The remaining slots counter is REAL — it decreases as requests come in from the database.

**Behavior:**
- Appears **2.5 seconds after page load** with a smooth fade-in + scale-up animation
- Shows on **every visit** (no "show once" cookie logic — urgency should persist)
- **Backdrop:** semi-transparent dark overlay behind the popup, clicking backdrop closes it
- **Close button:** clear X button in top corner, large tap target (48px)
- CTA button inside popup scrolls to the request form and closes the popup

**Content (all Hebrew):**
```
🎉 מבצע השקה!
X הלקוחות הראשונים מקבלים שירות במחיר מיוחד
[CTA_PRICE]₪ לכל עבודה
נשארו רק [SLOTS_REMAINING] מקומות!
[כן, אני רוצה! →] (button, scrolls to form)
```

**Dynamic slots counter:**
- Configurable total via env var `NEXT_PUBLIC_PROMO_TOTAL_SLOTS` (default: 20)
- Configurable price via env var `NEXT_PUBLIC_PROMO_PRICE` (default: "מחיר מיוחד")
- Remaining = `PROMO_TOTAL_SLOTS` minus total number of rows in `requests` table (regardless of status — a submitted request claims a slot even if later cancelled)
- Fetched via a new lightweight API route: `GET /api/promo` (public, no auth) — returns `{ remaining: number, total: number, active: boolean }`
- When remaining reaches 0: popup still shows but text changes to "המבצע הסתיים!" (Promo ended!) with no CTA button. Or if `active` is false, popup does not show at all.
- Admin can see promo status in the stats bar on the dashboard

**Design:**
- Card style: white surface, rounded corners (16px), centered on screen
- Accent gold border or top accent stripe
- Large emoji or icon at top for visual pop
- Price in large bold Rubik font, accent gold color
- Remaining counter in a contrasting pill/badge (e.g., amber background)
- Mobile: popup should be max 90vw wide, vertically centered
- Smooth entry animation: fade in backdrop, then scale up card from 0.95 to 1.0

**Kill switch:** If `NEXT_PUBLIC_PROMO_TOTAL_SLOTS` is set to `0` or not set, the entire promo popup is disabled — no API call, no popup, no trace. This lets you turn it off instantly after the promo ends.

### 2. Admin Dashboard — `/admin`

**Purpose:** Let the admin (son) see all requests, manage their status, and understand demand.

**Protection:** No auth system. Use an env var `ADMIN_SECRET` as a URL query param for initial access: `/admin?key=YOUR_SECRET`. Store in a cookie after first visit so the URL can be bookmarked cleanly. This is NOT secure — it's acceptable for v1 where the only "attacker" is bored neighbors.

**Layout:**

1. **Stats Bar (top)**
   - Total requests (all time)
   - Pending requests (waiting)
   - In progress
   - Completed this week

2. **Filter/Sort Controls**
   - Filter by status: הכל (All) | ממתין (Pending) | בטיפול (In Progress) | הושלם (Done) | בוטל (Cancelled)
   - Filter by work type (dropdown)
   - Sort by: newest first (default), oldest first

3. **Request Cards List**
   Each card shows:
   - Customer name & phone (click-to-call)
   - Address
   - Work type badge
   - Description (truncated, expandable)
   - Photo thumbnails (click to enlarge/lightbox)
   - Submission date & time
   - Status badge (color-coded)
   - Status change dropdown: ממתין → בטיפול → הושלם / בוטל
   - Optional: free-text notes field for admin (e.g., "need to bring drill", "scheduled for Sunday")

4. **Empty State**
   - Friendly message when no requests exist yet

---

## Database Schema

Single table. Keep it dead simple.

```
Table: requests
├── id              TEXT PRIMARY KEY (nanoid, 12 chars)
├── name            TEXT NOT NULL
├── phone           TEXT NOT NULL
├── address         TEXT NOT NULL
├── work_type       TEXT NOT NULL
├── description     TEXT NOT NULL
├── photo_urls      TEXT (JSON array of URLs, nullable)
├── status          TEXT NOT NULL DEFAULT 'pending'
│                   CHECK(status IN ('pending','in_progress','done','cancelled'))
├── admin_notes     TEXT (nullable)
├── queue_position  INTEGER NOT NULL (auto-increment based on pending count at submission time)
├── created_at      TEXT NOT NULL DEFAULT (datetime('now'))
├── updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
```

No users table. No auth table. No sessions table. One table.

---

## API Routes

All under `/api/`.

| Method | Route | Purpose | Auth |
|--------|-------|---------|------|
| POST | `/api/requests` | Create new request (from public form) | None |
| GET | `/api/requests` | List all requests (admin) | Admin key |
| PATCH | `/api/requests/[id]` | Update status or admin notes | Admin key |
| GET | `/api/stats` | Get dashboard stats | Admin key |
| GET | `/api/promo` | Get promo slots remaining (public) | None |
| POST | `/api/upload` | Upload photos (returns URLs) | None (rate-limited) |

**Rate limiting:** Implement basic in-memory rate limiting on POST `/api/requests` — max 5 submissions per IP per hour. This prevents spam from the WhatsApp/Facebook share.

---

## Design Specifications

### General
- **Direction:** RTL throughout (`dir="rtl"` on html tag)
- **Language:** All UI text in Hebrew, hardcoded (no i18n system needed)
- **Font:** `Heebo` for body, `Rubik` for headings (Google Fonts, both have excellent Hebrew support)
- **Mobile-first:** Design for 375px width first, scale up. 90%+ of traffic will be mobile (WhatsApp/Facebook links)

### Color Palette
- Background: `#FAFAF7` (warm off-white)
- Surface: `#FFFFFF`
- Text primary: `#1A1A1A`
- Text secondary: `#5A5A5A`
- Accent: `#D4A853` (warm gold — trustworthy, professional, not corporate)
- Accent dark: `#B8922F`
- Accent light: `#F5ECD7`
- Success/green: `#4A7C59`
- Green light: `#E8F0EB`
- Border: `#E8E6E1`
- Status colors:
  - Pending: `#F59E0B` (amber)
  - In Progress: `#3B82F6` (blue)
  - Done: `#10B981` (green)
  - Cancelled: `#9CA3AF` (gray)

### Component Notes
- Border radius: 16px for cards, 10px for smaller elements
- Shadows: subtle (`0 2px 20px rgba(0,0,0,0.06)`)
- Animations: subtle fade-in-up on hero elements, smooth scroll to form
- Form inputs: large touch targets (min 48px height), clear focus states with accent border
- Photo upload: drag-and-drop zone with preview thumbnails, remove button on each

---

## Environment Variables

```env
# Required
NEXT_PUBLIC_HANDYMAN_NAME=שם_האבא
NEXT_PUBLIC_HANDYMAN_PHONE=050-XXX-XXXX
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-token
ADMIN_SECRET=some-random-string-here
UPLOADTHING_TOKEN=your-uploadthing-token

# Optional
NEXT_PUBLIC_NEIGHBORHOOD_NAME=שם_השכונה
NEXT_PUBLIC_PROMO_TOTAL_SLOTS=20
NEXT_PUBLIC_PROMO_PRICE=200
```

---

## What is NOT in v1

Be explicit about what to skip. Do not build these:

- ❌ User authentication / accounts
- ❌ Email or SMS notifications
- ❌ WhatsApp integration / bot
- ❌ Payment processing
- ❌ Reviews / testimonials
- ❌ Scheduling / calendar
- ❌ Multi-language support
- ❌ SEO optimization
- ❌ Analytics / tracking
- ❌ PWA / offline support
- ❌ Multiple admin users
- ❌ Customer-facing status tracking ("where's my request")
- ❌ Automated queue position updates

---

## Success Criteria

This is done when:

1. A neighbor can open the link on mobile, understand what's offered, fill out a form with photos, and submit
2. The admin can open `/admin`, see all requests sorted by date, filter by status, and update status
3. The whole thing deploys to Vercel free tier with zero ongoing cost
4. The page loads in under 2 seconds on 4G
5. The form works correctly in Hebrew RTL on iOS Safari and Android Chrome

---

## Deployment Checklist

1. Create Turso database and get credentials
2. Create Uploadthing project and get token
3. Set all env vars in Vercel
4. Deploy via `vercel` CLI or GitHub integration
5. Set `ADMIN_SECRET` to something unguessable
6. Test form submission on mobile
7. Share link in WhatsApp group
