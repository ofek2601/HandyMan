# Task: Add Launch Promo Popup to Existing Handyman Queue App

## What exists already
The app is built and working — Next.js App Router, Turso DB with a `requests` table, Drizzle ORM, Uploadthing, Tailwind CSS, Hebrew RTL. Public landing page at `/` and admin dashboard at `/admin`.

## What to build
A promotional popup on the public landing page that shows remaining slots for a launch promo deal. The counter is REAL — it comes from the database.

---

## New Environment Variables

Add these to `.env` (and `.env.example`):

```env
NEXT_PUBLIC_PROMO_TOTAL_SLOTS=20    # set to 0 to disable popup entirely
NEXT_PUBLIC_PROMO_PRICE=200          # price in shekels, displayed as ₪200
```

---

## New API Route: `GET /api/promo`

**Public, no auth required.**

```typescript
// app/api/promo/route.ts
// 
// Returns: { remaining: number, total: number, active: boolean }
//
// Logic:
// - total = parseInt(NEXT_PUBLIC_PROMO_TOTAL_SLOTS) or 0
// - if total === 0, return { remaining: 0, total: 0, active: false }
// - count = SELECT COUNT(*) FROM requests (all rows, regardless of status)
// - remaining = Math.max(0, total - count)
// - active = remaining > 0
// - Cache response for 30 seconds (Cache-Control or next revalidate) to avoid hammering DB
```

---

## New Component: `PromoPopup`

**File:** `components/promo/PromoPopup.tsx`

This is a `"use client"` component. Add it to the public landing page layout/page.

### Behavior
1. On mount, check `process.env.NEXT_PUBLIC_PROMO_TOTAL_SLOTS` — if `0`, `undefined`, or `""`, render nothing. Do not make any API call.
2. If promo is enabled, fetch `GET /api/promo` on mount.
3. Wait **2.5 seconds** after page load, then show the popup with animation.
4. If `remaining > 0`: show the full promo content with CTA.
5. If `remaining === 0`: show "המבצע הסתיים!" (Promo ended!) — no CTA button.
6. User can close via: X button, clicking backdrop, or clicking CTA.
7. CTA button scrolls smoothly to the form section (`#form` or whatever your form section ID is) and closes the popup.

### Content (Hebrew)

```
🎉 מבצע השקה!

20 הלקוחות הראשונים מקבלים שירות במחיר מיוחד

₪[NEXT_PUBLIC_PROMO_PRICE] לכל עבודה

נשארו רק [remaining] מקומות!

[Button: כן, אני רוצה!]
```

When `remaining === 0`:
```
😔 המבצע הסתיים!

כל [total] המקומות נתפסו.
אבל אפשר עדיין לשלוח בקשה ונחזור אליכם עם הצעת מחיר.

[Button: שליחת בקשה]
```

### Design Specs
- **Backdrop:** fixed, full screen, `bg-black/50`, `z-50`, fade in 300ms
- **Card:** centered (flex items-center justify-center), white background, rounded-2xl (16px), max-w-sm, w-[90vw], padding 32px 24px, shadow-xl
- **Entry animation:** backdrop fades in, then card scales from 0.95→1.0 and fades in (150ms ease-out)
- **Exit animation:** reverse — card fades out, then backdrop fades out
- **Close X button:** absolute top-left corner (RTL!), 48px tap target, text-gray-400 hover:text-gray-600
- **Emoji:** 48px font size, centered, margin bottom 16px
- **Title "מבצע השקה!":** Rubik font, bold, 24px, text-center
- **Price line:** Rubik font, bold, 36px, accent gold color (`#D4A853`)
- **Remaining counter:** inline pill/badge, amber background (`#FEF3C7`), amber text (`#92400E`), rounded-full, px-4 py-1, font-bold
- **CTA button:** full width, accent gold background, dark text, rounded-full, h-12 min, font-bold, hover:darker gold
- **All text centered, all Hebrew**

### Important Implementation Notes
- Do NOT use localStorage or sessionStorage to track "shown" state — show it every visit
- Do NOT hardcode the remaining count — always fetch from `/api/promo`
- Use `useEffect` with `setTimeout` for the 2.5s delay
- Clean up the timeout on unmount
- Handle loading state gracefully — don't flash the popup then hide it. Wait for both the API response AND the 2.5s timer before showing anything.
- The popup should NOT block initial page render or affect LCP

---

## Admin Dashboard Update

In the existing stats bar on `/admin`, add one more stat card:

```
🎁 מבצע השקה
[remaining]/[total] מקומות נותרו
```

If promo is disabled (env var = 0), don't show this card at all.

This data can come from the same `/api/promo` endpoint or from the existing `/api/stats` route — your choice, whichever is simpler given the current code.

---

## Testing

After implementing, verify:
- [ ] Popup appears ~2.5s after page load
- [ ] Remaining count matches: PROMO_TOTAL_SLOTS minus total rows in requests table
- [ ] Submitting a new request decreases the counter on next page load
- [ ] CTA button scrolls to form and closes popup
- [ ] X button and backdrop click both close popup
- [ ] Setting `NEXT_PUBLIC_PROMO_TOTAL_SLOTS=0` hides popup completely (no API call, no DOM)
- [ ] When remaining = 0, shows "ended" message instead of promo
- [ ] Popup looks correct on 375px mobile viewport
- [ ] All text is Hebrew, RTL layout correct
- [ ] Close button is top-LEFT (RTL), tap target is 48px+
- [ ] Admin stats bar shows promo status
- [ ] No layout shift or flash when popup appears
