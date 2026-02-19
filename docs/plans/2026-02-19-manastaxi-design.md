# Manas Taxi — Design Document

## Overview
Official taxi service website for Manas Airport, Bishkek (manastaxi.kg).

## Tech Stack
- Next.js 15 (App Router) + TypeScript
- shadcn/ui + Tailwind CSS
- PostgreSQL (Neon) + Drizzle ORM
- NextAuth.js (credentials) for admin
- next-intl for i18n (ru, en, ky, zh, hi)
- AviationStack API for flights
- Vercel deployment

## Colors
- Primary Blue: #1e40af
- Primary Yellow: #eab308
- Dark: #0f172a
- Light: #f8fafc

## Database Schema
- routes, bookings, tours, services, settings, users, seo_meta

## Pages
- / (home), /routes, /booking, /flights, /tours, /services, /contacts
- /admin/* (CRUD for all entities)

## i18n
- URL prefixes: /ru/, /en/, /ky/, /zh/, /hi/
- Default: /ru/

## Integrations
- AviationStack (flights)
- WhatsApp quick booking (Baileys API via external server)
- Social: WhatsApp, Telegram, Viber, WeChat, Instagram, Facebook

## SEO
- Dynamic meta per page/language
- JSON-LD (LocalBusiness, TaxiService)
- sitemap.xml, robots.txt, hreflang, OG/Twitter cards
