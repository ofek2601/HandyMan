# CLAUDE.md — Instructions for Claude Code

## Project: Handyman Queue (תור הנדימן)

Read `PRD.md` fully before writing any code. It is the single source of truth.

---

## Critical Constraints

1. **Hebrew RTL** — Every page must have `dir="rtl"` and `lang="he"` on the root. All text is Hebrew. All layout flows right-to-left. Test that padding, margins, and icons don't break in RTL.

2. **Mobile-first** — 90%+ of users will come from WhatsApp/Facebook links on their phones. Design for 375px width first. Every tap target must be at least 48px. Test on a narrow viewport before calling anything done.

3. **One database table** — The schema has ONE table called `requests`. Do not create additional tables. Do not add a users table. Do not add an auth table.

4. **No auth system** — Admin access uses a query param (`?key=ADMIN_SECRET`) stored in a cookie. Do not install NextAuth, Clerk, or any auth library. This is intentional for v1.

5. **Free tier only** — Vercel free, Turso free, Uploadthing free. Do not use any service that requires a paid plan. Do not add Redis, Postgres, Supabase, or any other DB.

6. **Zero English in UI** — All user-facing text, labels, buttons, errors, placeholders, and confirmations are in Hebrew. Comments in code can be English.

---

## Tech Stack (do not deviate)

- **Next.js 14+ (App Router)** — use `app/` directory, server components by default, client components only where interactivity is needed
- **TypeScript** — strict mode, no `any` types
- **Tailwind CSS** — for all styling, use `dir="rtl"` utilities where needed (`rtl:` prefix)
- **Drizzle ORM** — for database access, with `@libsql/client` driver for Turso
- **Uploadthing** — for photo uploads (max 3 photos, max 5MB each, jpg/png/webp)
- **nanoid** — for generating request IDs (12 chars)

---

## Project Structure

```
/
├── CLAUDE.md              (this file)
├── PRD.md                 (product requirements)
├── app/
│   ├── layout.tsx         (root layout: fonts, RTL, metadata)
│   ├── page.tsx           (public landing page)
│   ├── admin/
│   │   └── page.tsx       (admin dashboard)
│   ├── api/
│   │   ├── requests/
│   │   │   ├── route.ts       (GET list, POST create)
│   │   │   └── [id]/
│   │   │       └── route.ts   (PATCH update)
│   │   ├── stats/
│   │   │   └── route.ts       (GET dashboard stats)
│   │   ├── promo/
│   │   │   └── route.ts       (GET promo slots remaining — public)
│   │   └── uploadthing/
│   │       ├── core.ts        (uploadthing file router)
│   │       └── route.ts       (uploadthing API route)
├── components/
│   ├── landing/           (hero, services, steps, form sections)
│   ├── admin/             (stats bar, filters, request card)
│   ├── ui/                (shared: button, input, badge, etc.)
│   ├── promo/             (launch promo popup)
│   └── upload/            (photo upload component)
├── db/
│   ├── schema.ts          (Drizzle schema — single requests table)
│   ├── index.ts           (DB client initialization)
│   └── migrate.ts         (migration script)
├── lib/
│   ├── utils.ts           (shared utilities)
│   ├── validations.ts     (Zod schemas for form/API validation)
│   └── uploadthing.ts     (Uploadthing client config)
├── drizzle.config.ts
├── tailwind.config.ts
├── .env.example
└── package.json
```

---

## Implementation Order

Build in this exact order. Test each step before moving on.

### Phase 1: Foundation
1. Initialize Next.js project with TypeScript and Tailwind
2. Set up fonts (Heebo + Rubik from Google Fonts) in root layout
3. Set up RTL (`dir="rtl"`, `lang="he"`) in root layout
4. Set up Drizzle + Turso connection
5. Define the `requests` schema (see PRD for exact columns)
6. Run initial migration

### Phase 2: Public Landing Page
7. Build the landing page sections top-to-bottom:
   - Hero with CTA
   - Trust strip
   - Services grid
   - How it works steps
   - Request form
   - Footer with phone
   - Floating CTA button
8. Implement form validation (Zod, Hebrew error messages)
9. Set up Uploadthing and build photo upload component
10. Implement `POST /api/requests` — validate, upload photos, insert to DB
11. Show success state with queue position after submission
12. Build promo popup component:
    - Fetches `GET /api/promo` on mount (only if `NEXT_PUBLIC_PROMO_TOTAL_SLOTS` > 0)
    - Shows after 2.5 second delay with fade-in + scale animation
    - Displays remaining slots from DB count
    - CTA scrolls to form and closes popup
    - If remaining = 0, show "המבצע הסתיים!" with no CTA
    - If env var is 0 or missing, component renders nothing

### Phase 3: Admin Dashboard
13. Build admin route with cookie-based access check
14. Build stats bar (total, pending, in-progress, done this week, promo slots remaining)
15. Implement `GET /api/requests` with status/type filters
16. Build request cards with status badges, photo thumbnails, expand/collapse
17. Implement `PATCH /api/requests/[id]` for status changes and admin notes
18. Add lightbox for photo viewing
19. Build empty state

### Phase 4: Polish
20. Add rate limiting on form submission (5/IP/hour, in-memory)
21. Add loading states and optimistic UI updates on admin
22. Test full flow on mobile viewport
23. Verify RTL rendering on all components
24. Test promo popup: shows correctly, counter matches DB, disappears when slots = 0 or env var = 0
25. Create `.env.example` with all required vars documented

---

## Form Validation Rules

```
name:        required, min 2 chars, max 100 chars
phone:       required, matches /^05\d{1}-?\d{3}-?\d{4}$/ (Israeli mobile)
address:     required, min 2 chars, max 200 chars
work_type:   required, must be one of the predefined types
description: required, min 10 chars, max 1000 chars
photos:      optional, max 3 files, each max 5MB, types: image/jpeg, image/png, image/webp
```

All validation error messages must be in Hebrew. Examples:
- "שדה חובה" (Required field)
- "מספר טלפון לא תקין" (Invalid phone number)
- "תיאור חייב להכיל לפחות 10 תווים" (Description must be at least 10 characters)
- "ניתן להעלות עד 3 תמונות" (Maximum 3 photos)
- "גודל קובץ מקסימלי: 5MB" (Max file size: 5MB)

---

## Work Type Options (exact values)

Use these as both display labels and stored values:

```typescript
const WORK_TYPES = [
  "תליית תמונות ומדפים",
  "הרכבת ארונות ורהיטים",
  "תיקונים כלליים",
  "חשמל ותאורה בסיסיים",
  "אינסטלציה קלה",
  "עבודות בית שונות",
  "אחר",
] as const;
```

---

## Status Flow

```
pending → in_progress → done
pending → cancelled
in_progress → cancelled
in_progress → done
```

No backward transitions. Once `done` or `cancelled`, status cannot change.

---

## Admin Access Pattern

```typescript
// Middleware or route-level check:
// 1. Check cookie 'admin_token' 
// 2. If no cookie, check query param '?key='
// 3. If query param matches ADMIN_SECRET, set cookie and redirect to clean URL
// 4. If neither, return 401

// Cookie name: 'handyman_admin'
// Cookie value: the ADMIN_SECRET value
// Cookie maxAge: 30 days
// Cookie httpOnly: true
```

---

## Rate Limiting (Simple)

```typescript
// In-memory Map<string, { count: number, resetAt: number }>
// Key: IP address from request headers (x-forwarded-for or x-real-ip)
// Limit: 5 requests per hour per IP
// On exceed: return 429 with Hebrew message "יותר מדי בקשות. נסו שוב מאוחר יותר"
// Reset: clear entries older than 1 hour on each request
```

This resets on redeploy. That's fine for v1.

---

## Common Mistakes to Avoid

- **Don't use `<form>` with default action** — handle submission with client-side fetch and loading states
- **Don't forget `"use client"` directive** — any component with useState, useEffect, onClick, or form handling needs it
- **Don't hardcode the handyman's name or phone** — always read from `process.env.NEXT_PUBLIC_HANDYMAN_NAME` and `NEXT_PUBLIC_HANDYMAN_PHONE`
- **Don't use `text-left` or `text-right` for alignment** — use `text-start` and `text-end` for RTL compatibility
- **Don't use `ml-` or `mr-`** — use `ms-` and `me-` (margin-inline-start/end) for RTL
- **Don't use `pl-` or `pr-`** — use `ps-` and `pe-` (padding-inline-start/end) for RTL
- **Don't fetch on the client when server components work** — the admin list page can be a server component with search params for filters
- **Don't add loading skeletons everywhere** — a simple spinner or "טוען..." text is fine for v1
- **Don't over-engineer the photo upload** — Uploadthing handles the hard parts; just build a clean drop zone with preview
- **Don't build what's not in the PRD** — no email notifications, no scheduling, no reviews. Check the "What is NOT in v1" section.
- **Don't fake the promo counter** — it MUST come from the actual DB row count via `/api/promo`. No hardcoded numbers, no localStorage tricks.
- **Don't show the promo popup if `NEXT_PUBLIC_PROMO_TOTAL_SLOTS` is 0 or undefined** — check the env var before even mounting the component or making the API call.

---

## Testing Checklist (before considering it done)

- [ ] Landing page renders correctly on 375px viewport (iPhone SE size)
- [ ] All text is Hebrew, no English leaks in UI
- [ ] RTL layout is correct — content flows right to left
- [ ] Form validation shows Hebrew errors
- [ ] Photo upload works (select files, see previews, remove individual photos)
- [ ] Form submission creates a request in the database
- [ ] Success message shows with queue position
- [ ] Admin page blocked without correct key
- [ ] Admin page shows all requests after auth
- [ ] Status filter works
- [ ] Status change persists to database
- [ ] Admin notes save correctly
- [ ] Photos display in admin cards and expand in lightbox
- [ ] Phone numbers are clickable (tel: links)
- [ ] Page loads under 2 seconds on throttled network
- [ ] Rate limiting blocks 6th submission from same IP within an hour
- [ ] Promo popup appears after ~2.5 seconds on page load
- [ ] Promo slots counter matches actual DB request count (total - submitted = remaining)
- [ ] Promo popup CTA scrolls to form and closes popup
- [ ] Promo popup shows "ended" state when remaining = 0
- [ ] Promo popup does NOT appear when `NEXT_PUBLIC_PROMO_TOTAL_SLOTS` is 0 or not set
- [ ] Admin dashboard shows promo slots status in stats bar
