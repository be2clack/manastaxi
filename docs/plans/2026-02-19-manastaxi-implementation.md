# Manas Taxi Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a production-ready multilingual taxi service website for Manas Airport with booking, flight tracking, tours, admin panel, and SEO optimization.

**Architecture:** Next.js 15 App Router with `[locale]` dynamic segment for i18n. Drizzle ORM with Neon PostgreSQL. Server Actions for mutations. shadcn/ui components with blue/yellow theme. Admin panel behind NextAuth credentials auth.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Drizzle ORM, Neon PostgreSQL, NextAuth.js, next-intl, AviationStack API, Vercel

---

## Task 1: Project Scaffolding & Configuration

**Files:**
- Create: `package.json`, `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`
- Create: `drizzle.config.ts`, `.env.example`
- Create: `src/app/layout.tsx`, `src/app/globals.css`
- Create: `components.json` (shadcn)

**Step 1:** Initialize Next.js 15 project with TypeScript and Tailwind

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack
```

**Step 2:** Install dependencies

```bash
npm install drizzle-orm @neondatabase/serverless next-intl next-auth@beta @auth/drizzle-adapter
npm install -D drizzle-kit
npm install lucide-react class-variance-authority clsx tailwind-merge tailwindcss-animate
```

**Step 3:** Initialize shadcn/ui

```bash
npx shadcn@latest init
```

Configure with blue/yellow theme colors.

**Step 4:** Configure Tailwind with custom blue (#1e40af) / yellow (#eab308) theme

**Step 5:** Create `.env.example` with all required env vars:
- `DATABASE_URL` (Neon)
- `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- `AVIATIONSTACK_API_KEY`
- `CHATBOT_API_URL`

**Step 6:** Commit: `feat: initial project scaffolding`

---

## Task 2: Database Schema & Drizzle Setup

**Files:**
- Create: `src/db/index.ts` (connection)
- Create: `src/db/schema.ts` (all tables)
- Create: `src/db/seed.ts` (seed data)

**Step 1:** Create Drizzle connection to Neon

**Step 2:** Define all tables in schema:
- `users` (id, name, email, password, role, createdAt)
- `routes` (id, fromLocation, toLocation, distanceKm, durationMin, priceSom, priceUsd, isPopular, isActive, sortOrder)
- `bookings` (id, name, phone, email, flightNumber, routeId, pickupDate, pickupTime, passengers, luggage, status, notes, createdAt)
- `tours` (id, slug, durationDays, priceUsd, priceSom, maxGroup, isActive, sortOrder, imageUrl)
- `services` (id, slug, priceUsd, priceSom, isActive, sortOrder, iconName)
- `settings` (id, key, value) — for phone, email, social links, etc.
- `seoMeta` (id, pageSlug, locale, title, description, keywords, ogImage)
- `translations` — not needed, we use JSON files with next-intl

**Step 3:** Create seed script with real data:
- 30+ routes (Bishkek center, Osh, Issyk-Kul, Karakol, Cholpon-Ata, etc.)
- 5 tours (Issyk-Kul, Son-Kul, Ala-Archa, Silk Road, Osh)
- 5 services (airport transfer, meet & greet, VIP, hotel booking, city tour)
- SEO meta for all pages in all 5 languages
- Default settings (phone, email, social links)
- Admin user

**Step 4:** Run migration and seed

```bash
npx drizzle-kit push
npx tsx src/db/seed.ts
```

**Step 5:** Commit: `feat: database schema and seed data`

---

## Task 3: i18n Setup (next-intl)

**Files:**
- Create: `src/i18n/config.ts`
- Create: `src/i18n/request.ts`
- Create: `src/messages/ru.json`, `en.json`, `ky.json`, `zh.json`, `hi.json`
- Create: `src/middleware.ts`
- Create: `src/app/[locale]/layout.tsx`

**Step 1:** Configure next-intl with 5 locales (ru default)

**Step 2:** Create middleware for locale routing with URL prefixes

**Step 3:** Create all 5 translation JSON files with complete translations:
- Navigation, hero, booking form, routes, tours, services, contacts, footer
- SEO texts, button labels, form validation messages
- All content fully translated (not placeholders)

**Step 4:** Create `[locale]` layout with locale provider

**Step 5:** Commit: `feat: i18n setup with 5 languages`

---

## Task 4: Layout & Navigation

**Files:**
- Create: `src/components/layout/header.tsx`
- Create: `src/components/layout/footer.tsx`
- Create: `src/components/layout/language-switcher.tsx`
- Create: `src/components/layout/mobile-menu.tsx`
- Create: `src/components/ui/whatsapp-button.tsx`

**Step 1:** Install shadcn components: button, sheet, dropdown-menu, navigation-menu

**Step 2:** Build Header with:
- Logo (text-based: "MANAS TAXI")
- Navigation links (Routes, Booking, Flights, Tours, Services, Contacts)
- Language switcher dropdown (5 flags/labels)
- Mobile hamburger menu (Sheet)
- Phone number CTA button

**Step 3:** Build Footer with:
- Contact info (phone, email)
- Social media links (WhatsApp, Telegram, Viber, WeChat, Instagram, Facebook)
- Quick links
- Copyright

**Step 4:** Build floating WhatsApp button (bottom-right, always visible)

**Step 5:** Commit: `feat: header, footer, language switcher`

---

## Task 5: Home Page

**Files:**
- Create: `src/app/[locale]/page.tsx`
- Create: `src/components/home/hero-section.tsx`
- Create: `src/components/home/quick-booking-form.tsx`
- Create: `src/components/home/popular-routes.tsx`
- Create: `src/components/home/services-preview.tsx`
- Create: `src/components/home/why-us.tsx`
- Create: `src/components/home/testimonials.tsx`

**Step 1:** Build Hero Section:
- Full-width gradient background (blue to dark)
- Headline + subtext
- Embedded quick booking form (name, phone, flight, destination, date)
- Airport image/illustration

**Step 2:** Build Quick Booking Form (Server Action):
- Fields: name, phone, flight number, destination (select from routes), date, time
- Submit creates booking in DB with status "new"
- Also option to send via WhatsApp (opens wa.me link)

**Step 3:** Build Popular Routes section (fetched from DB, isPopular=true)

**Step 4:** Build Services Preview (4 cards: transfer, meet & greet, tours, VIP)

**Step 5:** Build "Why Choose Us" section (24/7, fixed prices, flight tracking, etc.)

**Step 6:** Commit: `feat: home page with booking form`

---

## Task 6: Routes Page

**Files:**
- Create: `src/app/[locale]/routes/page.tsx`
- Create: `src/components/routes/route-card.tsx`
- Create: `src/components/routes/route-search.tsx`

**Step 1:** Build routes page with search/filter
- List all routes from DB
- Search by destination name
- Show distance, duration, price (SOM + USD)
- "Book Now" button per route

**Step 2:** Commit: `feat: routes page`

---

## Task 7: Booking Page

**Files:**
- Create: `src/app/[locale]/booking/page.tsx`
- Create: `src/components/booking/booking-form.tsx`
- Create: `src/app/api/bookings/route.ts`

**Step 1:** Build full booking form:
- Personal: name, phone, email
- Trip: flight number, route (dropdown), pickup date/time, passengers, luggage count
- Notes textarea
- Submit options: "Book Online" or "Book via WhatsApp"

**Step 2:** Server Action to save booking to DB

**Step 3:** Commit: `feat: booking page and form`

---

## Task 8: Flight Tracking Page

**Files:**
- Create: `src/app/[locale]/flights/page.tsx`
- Create: `src/components/flights/flight-search.tsx`
- Create: `src/components/flights/flight-board.tsx`
- Create: `src/app/api/flights/route.ts`
- Create: `src/lib/aviationstack.ts`

**Step 1:** Create AviationStack API client (with caching)

**Step 2:** Build flight search form (by flight number or airport)

**Step 3:** Build flight board showing arrivals/departures at FRU (Manas)

**Step 4:** API route that queries AviationStack and caches results

**Step 5:** Commit: `feat: flight tracking page`

---

## Task 9: Tours Page

**Files:**
- Create: `src/app/[locale]/tours/page.tsx`
- Create: `src/components/tours/tour-card.tsx`

**Step 1:** Build tours listing page
- Cards with image, title, duration, price, description
- "Book Tour" button → opens booking form or WhatsApp

**Step 2:** Commit: `feat: tours page`

---

## Task 10: Services Page

**Files:**
- Create: `src/app/[locale]/services/page.tsx`
- Create: `src/components/services/service-card.tsx`

**Step 1:** Build services page:
- Airport Transfer, Meet & Greet, VIP Service, Hotel Booking, City Tour
- Each with icon, description, price, CTA

**Step 2:** Commit: `feat: services page`

---

## Task 11: Contacts Page

**Files:**
- Create: `src/app/[locale]/contacts/page.tsx`
- Create: `src/components/contacts/contact-form.tsx`
- Create: `src/components/contacts/social-links.tsx`

**Step 1:** Build contacts page:
- Address, phone numbers, email
- All social media with icons
- Contact form (name, email, message)
- Embedded Google Maps (Manas Airport location)

**Step 2:** Commit: `feat: contacts page`

---

## Task 12: Admin Panel — Auth & Layout

**Files:**
- Create: `src/app/[locale]/admin/layout.tsx`
- Create: `src/app/[locale]/admin/login/page.tsx`
- Create: `src/app/[locale]/admin/page.tsx` (dashboard)
- Create: `src/lib/auth.ts` (NextAuth config)
- Create: `src/app/api/auth/[...nextauth]/route.ts`

**Step 1:** Configure NextAuth with credentials provider + Drizzle adapter

**Step 2:** Build admin login page

**Step 3:** Build admin dashboard (booking count, recent bookings, quick stats)

**Step 4:** Build admin sidebar layout

**Step 5:** Commit: `feat: admin auth and dashboard`

---

## Task 13: Admin CRUD Pages

**Files:**
- Create: `src/app/[locale]/admin/bookings/page.tsx`
- Create: `src/app/[locale]/admin/routes/page.tsx`
- Create: `src/app/[locale]/admin/tours/page.tsx`
- Create: `src/app/[locale]/admin/services/page.tsx`
- Create: `src/app/[locale]/admin/settings/page.tsx`
- Create: `src/app/[locale]/admin/seo/page.tsx`

**Step 1:** Build Bookings management (list, view, update status: new/confirmed/completed/cancelled)

**Step 2:** Build Routes management (CRUD)

**Step 3:** Build Tours management (CRUD)

**Step 4:** Build Services management (CRUD)

**Step 5:** Build Settings page (edit phone, email, social links)

**Step 6:** Build SEO management (edit meta per page/locale)

**Step 7:** Commit: `feat: admin CRUD pages`

---

## Task 14: SEO Optimization

**Files:**
- Create: `src/app/sitemap.ts`
- Create: `src/app/robots.ts`
- Modify: `src/app/[locale]/layout.tsx` (metadata)
- Create: `src/lib/structured-data.ts`

**Step 1:** Dynamic metadata generation per page/locale from DB

**Step 2:** Generate sitemap.xml with all pages x all locales

**Step 3:** robots.txt

**Step 4:** JSON-LD structured data (LocalBusiness, TaxiService)

**Step 5:** hreflang alternate links

**Step 6:** Open Graph + Twitter Card meta

**Step 7:** Commit: `feat: SEO optimization`

---

## Task 15: Chatbot API Integration

**Files:**
- Create: `src/app/api/chatbot/route.ts`
- Create: `src/lib/chatbot.ts`

**Step 1:** Create API endpoint for Baileys webhook:
- POST /api/chatbot — receives messages from WhatsApp bot
- Processes booking requests
- Returns responses

**Step 2:** Commit: `feat: chatbot API endpoint`

---

## Task 16: Final Polish & Deploy

**Step 1:** Add loading states, error boundaries

**Step 2:** Test all pages responsive on mobile

**Step 3:** Verify all 5 languages work

**Step 4:** Deploy to Vercel

**Step 5:** Commit: `feat: production ready`
