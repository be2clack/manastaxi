# Manas Taxi CRM + AI Bot System Design

**Date:** 2026-03-07
**Status:** Approved

## Overview

Transform the existing Manas Taxi admin panel into a full CRM system with AI-powered chatbot for WhatsApp and Telegram, automated order distribution to drivers, feedback collection, and multi-channel communication.

## Architecture

**Monolith approach** — everything runs inside the existing Next.js app on Vercel:
- Site, admin/CRM, Telegram bots (webhook mode), AI processing, all API routes
- WhatsApp via external Baileys server (wa.kaymak.kg) — only send/receive messages, all logic in Next.js
- Cron jobs via Vercel cron (`vercel.json`)
- PostgreSQL (Neon) — single database

## Database Schema

### New Tables

#### `vehicle_classes` — Dynamic car classes (managed via admin)
| Field | Type | Description |
|-------|------|-------------|
| id | serial PK | |
| name | jsonb | `{"ru": "Эконом", "en": "Economy", ...}` |
| slug | varchar unique | `economy`, `comfort`, etc. |
| description | jsonb | Description in all languages |
| maxPassengers | int | Max passengers |
| maxLuggage | int | Max luggage |
| sortOrder | int | Display order |
| isActive | boolean | Active flag |

Default classes: Эконом, Комфорт, Бизнес, VIP, Минивэн, Микроавтобус

#### `route_prices` — Price matrix (route x class)
| Field | Type | Description |
|-------|------|-------------|
| id | serial PK | |
| routeId | FK -> routes | |
| vehicleClassId | FK -> vehicle_classes | |
| priceSom | decimal | Price in KGS |
| priceUsd | decimal | Price in USD |

Unique constraint on (routeId, vehicleClassId).

#### `drivers` — Drivers
| Field | Type | Description |
|-------|------|-------------|
| id | serial PK | |
| name | varchar | Full name |
| phone | varchar unique | Phone (verification key) |
| vehicleClassId | FK -> vehicle_classes | Car class |
| vehicleMake | varchar | Make and model (Toyota Camry) |
| vehiclePlate | varchar | License plate |
| telegramChatId | varchar nullable | Filled when driver verifies via bot |
| isActive | boolean | Active flag |
| hasActiveOrder | boolean | Has current order |
| rating | decimal | Average rating |
| totalTrips | int | Total completed trips |
| createdAt | timestamp | |

Driver registration flow: Admin adds driver manually in CRM -> Driver starts Telegram bot -> Shares phone number -> System matches phone in DB -> Saves telegramChatId for notifications.

#### `conversations` — Client chat sessions
| Field | Type | Description |
|-------|------|-------------|
| id | serial PK | |
| channel | enum: whatsapp, telegram | Communication channel |
| externalChatId | varchar | Chat ID in messenger |
| clientPhone | varchar nullable | Client phone |
| clientName | varchar nullable | Client name |
| language | varchar | Detected communication language |
| clientCountry | varchar nullable | Country code (CN, DE, KR...) |
| clientCountryName | varchar nullable | Country name |
| clientPhoneCountryCode | varchar nullable | Phone country code (+86, +49...) |
| bookingId | FK -> bookings nullable | Linked booking |
| status | enum: active, completed, archived | |
| createdAt | timestamp | |
| updatedAt | timestamp | |

#### `messages` — Chat message history
| Field | Type | Description |
|-------|------|-------------|
| id | serial PK | |
| conversationId | FK -> conversations | |
| role | enum: client, bot, manager | Who sent |
| content | text | Message text |
| metadata | jsonb nullable | Extra data (buttons, choices) |
| createdAt | timestamp | |

#### `order_events` — Order event log (CRM timeline)
| Field | Type | Description |
|-------|------|-------------|
| id | serial PK | |
| bookingId | FK -> bookings | |
| event | enum: created, confirmed, driver_search, assigned, driver_accepted, force_majeure, reassigned, completed, feedback_received, cancelled | |
| driverId | FK -> drivers nullable | |
| details | jsonb nullable | Details (force majeure reason, etc.) |
| createdAt | timestamp | |

#### `feedback` — Client feedback
| Field | Type | Description |
|-------|------|-------------|
| id | serial PK | |
| bookingId | FK -> bookings unique | |
| driverId | FK -> drivers | |
| ratingDriver | int (1-5) | Driver rating |
| ratingVehicle | int (1-5) | Vehicle rating |
| comment | text nullable | Comment |
| language | varchar | Feedback language |
| createdAt | timestamp | |

#### `ai_settings` — AI configuration
| Field | Type | Description |
|-------|------|-------------|
| id | serial PK | |
| provider | enum: openai, anthropic | |
| model | varchar | gpt-4o, claude-sonnet-4-20250514, etc. |
| apiKey | varchar | API key |
| systemPrompt | text | System prompt (editable in admin) |
| temperature | decimal | 0.0-1.0 |
| isActive | boolean | Which provider is active |

#### `telegram_bot_settings` — Telegram bot config
| Field | Type | Description |
|-------|------|-------------|
| id | serial PK | |
| botType | enum: client, driver, admin | |
| token | varchar | Bot token |
| webhookUrl | varchar nullable | |
| isActive | boolean | |

### Changes to Existing Tables

#### `bookings` — Add fields:
- vehicleClassId (FK -> vehicle_classes)
- driverId (FK -> drivers, nullable)
- needsSign (boolean) — meet & greet sign
- signText (varchar nullable) — text on sign
- scheduledAt (timestamp) — exact pickup time
- totalPriceSom (decimal)
- totalPriceUsd (decimal)
- channel (enum: website, whatsapp, telegram, manual)
- language (varchar) — client language
- clientCountry (varchar nullable) — client country
- isUrgent (boolean) — set on force majeure

#### `users` — Add fields:
- telegramChatId (varchar nullable) — for manager notifications

## AI Bot Architecture

### Message Processing Flow

```
Client writes in WhatsApp/Telegram
  -> Webhook receives message
  -> Find/create conversation
  -> Save message to messages table
  -> Load chat history (last N messages)
  -> Send to AI (OpenAI/Anthropic):
     - system prompt (from admin settings)
     - context: routes, classes, tours, prices
     - chat history
     - function calling for structured actions
  -> AI responds with text OR calls function
  -> Save bot response to messages
  -> Send response to client via same channel
```

### AI Function Calling (Tool Use)

| Function | When Called | What It Does |
|----------|-----------|-------------|
| get_routes | Client asks where they can go | List of active routes |
| get_route_price | Price inquiry | Price by route + class |
| search_route | Client names a place | Find matching route |
| get_vehicle_classes | Question about car classes | List classes with descriptions |
| get_tours | Interest in tours | List of active tours |
| get_flight_info | Client gives flight number | Arrival/departure time |
| create_booking | All data collected | Creates order in CRM |
| calculate_price | Intermediate calculation | Price with route and class |

### Language & Country Detection

- AI detects language from first message, responds in same language
- Language saved in `conversations.language`
- Country determined by phone number (WhatsApp has phone, parse country code: +86=China, +49=Germany)
- For Telegram: determine by language or ask
- All stored in conversation and booking records

### System Prompt (default, editable in admin)

Bot role: polite manager of Manas Taxi service. Short messages, doesn't annoy. Asks questions one at a time. Collects: route, date/time, car class, sign needed, name, contact phone, flight number (if airport). For arriving passengers — suggests tours. After confirmation — creates order.

## Order Lifecycle

### Statuses

```
new -> confirmed -> driver_search -> assigned -> in_progress -> completed
                                        |
                                  force_majeure -> driver_search (urgent)

cancelled (at any point)
```

### Order Distribution (60 min before scheduledAt)

Cron checks every minute for confirmed orders where scheduledAt - now() <= 60 min.

**Message to ALL matching drivers (before acceptance):**
- From -> To
- Pickup time
- Car class
- Sign: yes/no
- "Urgent" mark if force majeure
- NO phone, name, or client details
- Button: "Accept order"

**After first driver accepts:**
- booking.driverId = this driver
- booking.status = assigned
- driver.hasActiveOrder = true
- DELETE order message from ALL other drivers
- Send driver FULL details:
  - Client name
  - Client phone
  - Flight number
  - Client language (e.g. "Client speaks Chinese")
  - Sign text
  - Exact address / hotel name
  - Notes
- Buttons: "Complete" / "Force Majeure"
- Notify admins in Telegram

### Force Majeure

Driver presses "Force Majeure" -> Bot asks reason (buttons):
- Vehicle breakdown
- Accident
- Traffic, won't make it
- Other (text input)

Then:
- order_events: force_majeure + reason
- driver.hasActiveOrder = false
- booking.driverId = null
- booking.isUrgent = true
- booking.status = driver_search
- Re-broadcast to ALL drivers EXCEPT this one (marked URGENT)
- Notify admins: "Force majeure on order #123, driver X, reason: ..."

### Order Completion

Driver presses "Complete":
- booking.status = completed
- driver.hasActiveOrder = false
- driver.totalTrips += 1
- order_events: completed

After 10 minutes, bot contacts CLIENT (in their language):
1. "How was your trip? Rate the driver: 1-5 stars"
2. "Rate the vehicle condition: 1-5 stars"
3. "Want to leave a comment?" (or "Skip" button)
4. Save feedback, recalculate driver.rating
5. "Thank you! We look forward to seeing you again"
6. order_events: feedback_received

## Cron Jobs

| Job | Interval | Description |
|-----|----------|-------------|
| dispatch-orders | every minute | Check confirmed orders where scheduledAt - now() <= 60 min |
| send-reminders | every minute | Remind driver 30 min before pickup |
| collect-feedback | every minute | Send feedback request 10 min after completion |
| check-stale | every 15 min | Orders in driver_search > 30 min -> notify admin |

Implemented via `vercel.json` cron -> API routes:
- `/api/cron/dispatch-orders`
- `/api/cron/send-reminders`
- `/api/cron/collect-feedback`
- `/api/cron/check-stale`

## Admin CRM Pages

### New Pages

| Page | Functionality |
|------|-------------|
| `/admin/drivers` | CRUD drivers, status, rating, order history, active order |
| `/admin/vehicle-classes` | CRUD classes, sorting, enable/disable |
| `/admin/route-prices` | Price matrix: route x class, bulk editing |
| `/admin/conversations` | Chat list, filter by channel/status, view history, reply manually as manager |
| `/admin/events` | Timeline of all order events in real-time |
| `/admin/feedback` | All feedback, filter by rating, linked to driver |
| `/admin/ai-settings` | Provider, model, API key, system prompt, temperature |
| `/admin/telegram` | Bot tokens, webhook status, test send |
| `/admin/whatsapp` | Baileys server URL, API key, session status |

### Enhanced Existing Pages

- **Dashboard** — add: active orders in real-time, online drivers, average rating, revenue day/week/month
- **Bookings** — add: car class, driver, channel, "create order manually" button, order event timeline
- **Routes** — add: "Configure prices" button -> navigate to price matrix for route

### Manual Order Creation

Managers can create orders:
- Via admin panel: form with all fields + driver assignment
- Via Telegram admin bot: simplified flow

## API Endpoints

### Webhooks
- `POST /api/telegram/client` — client bot webhook
- `POST /api/telegram/driver` — driver bot webhook
- `POST /api/whatsapp/webhook` — webhook from Baileys server

### Cron
- `GET /api/cron/dispatch-orders`
- `GET /api/cron/send-reminders`
- `GET /api/cron/collect-feedback`
- `GET /api/cron/check-stale`

### Internal API
- `POST /api/ai/chat` — process message through AI
- `GET /api/drivers/available` — available drivers by class
- `POST /api/bookings/manual` — manual order creation by manager

## WhatsApp Integration

External Baileys server at wa.kaymak.kg:
- Send messages: `POST /api/sessions/{SESSION_ID}/send`
- Authentication: `x-api-key` header
- Our webhook receives incoming messages at `/api/whatsapp/webhook`
- All business logic runs in our Next.js app

## Telegram Bots

Two separate bots in webhook mode:

**Client bot:**
- Receives messages -> AI processing -> responds
- Collects booking info conversationally
- Sends feedback requests after trip

**Driver bot:**
- Driver shares phone -> verification against DB -> saves chatId
- Receives order notifications with accept button
- Complete / Force Majeure buttons
- Reminder notifications

**Admin notifications:**
- Sent to Telegram group or individual admin chats
- New orders, force majeure, stale orders, low ratings

## Timezone

All times in Asia/Bishkek (UTC+6). Stored as UTC in DB, converted for display and notifications.

## Currency

- KGS (som) — primary
- USD — for foreigners
- Exchange rate managed in admin settings (existing `currency_rate`)
- Future: payment link integration (placeholder only, not implemented now)

## Client Display in CRM

```
Name: John Smith
Phone: +86 138 1234 5678
Country: China
Language: Chinese
Channel: WhatsApp
```

## Flight Integration

Existing AviationStack API integration at `/api/flights`. Bot can query flight info to auto-determine arrival time and suggest pickup time.

Settings placeholder for future real-time flight data providers.
