# CRM + AI Bot Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the existing Manas Taxi admin panel into a full CRM with AI chatbot (WhatsApp/Telegram), driver management, automated order distribution, and feedback collection.

**Architecture:** Monolith Next.js on Vercel. Telegram bots via webhook mode. WhatsApp via external Baileys server (wa.kaymak.kg) API. AI via OpenAI/Anthropic with function calling. Cron jobs via Vercel cron. PostgreSQL (Neon) with Drizzle ORM.

**Tech Stack:** Next.js 16, Drizzle ORM, PostgreSQL (Neon), NextAuth 5, Telegram Bot API (webhook), OpenAI SDK, Anthropic SDK, next-intl, shadcn/ui, Tailwind CSS 4.

**Design doc:** `docs/plans/2026-03-07-crm-ai-bot-design.md`

---

## Phase 1: Database Schema Extension

### Task 1: Add new enums and vehicle_classes table

**Files:**
- Modify: `src/db/schema.ts`

**Step 1: Add new enums and vehicle_classes table to schema**

Add after existing enums in `src/db/schema.ts`:

```typescript
import { jsonb, uniqueIndex } from "drizzle-orm/pg-core";

// New enums
export const channelEnum = pgEnum("channel", ["whatsapp", "telegram"]);
export const bookingChannelEnum = pgEnum("booking_channel", ["website", "whatsapp", "telegram", "manual"]);
export const conversationStatusEnum = pgEnum("conversation_status", ["active", "completed", "archived"]);
export const messageRoleEnum = pgEnum("message_role", ["client", "bot", "manager"]);
export const orderEventEnum = pgEnum("order_event", [
  "created", "confirmed", "driver_search", "assigned", "driver_accepted",
  "force_majeure", "reassigned", "completed", "feedback_received", "cancelled",
]);
export const aiProviderEnum = pgEnum("ai_provider", ["openai", "anthropic"]);
export const telegramBotTypeEnum = pgEnum("telegram_bot_type", ["client", "driver", "admin"]);

// ============ VEHICLE CLASSES ============
export const vehicleClasses = pgTable("vehicle_classes", {
  id: serial("id").primaryKey(),
  name: jsonb("name").notNull(), // {"ru": "Эконом", "en": "Economy", ...}
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: jsonb("description"), // {"ru": "...", "en": "...", ...}
  maxPassengers: integer("max_passengers").default(4).notNull(),
  maxLuggage: integer("max_luggage").default(3).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

**Step 2: Generate and run migration**

```bash
npx drizzle-kit generate
npx drizzle-kit push
```

**Step 3: Commit**

```bash
git add src/db/schema.ts drizzle/
git commit -m "feat: add vehicle_classes table and new enums"
```

---

### Task 2: Add route_prices table

**Files:**
- Modify: `src/db/schema.ts`

**Step 1: Add route_prices table**

```typescript
// ============ ROUTE PRICES ============
export const routePrices = pgTable("route_prices", {
  id: serial("id").primaryKey(),
  routeId: integer("route_id").references(() => routes.id, { onDelete: "cascade" }).notNull(),
  vehicleClassId: integer("vehicle_class_id").references(() => vehicleClasses.id, { onDelete: "cascade" }).notNull(),
  priceSom: decimal("price_som", { precision: 10, scale: 2 }).notNull(),
  priceUsd: decimal("price_usd", { precision: 10, scale: 2 }).notNull(),
}, (table) => [
  uniqueIndex("route_class_unique").on(table.routeId, table.vehicleClassId),
]);
```

**Step 2: Generate and push migration**

```bash
npx drizzle-kit generate
npx drizzle-kit push
```

**Step 3: Commit**

```bash
git add src/db/schema.ts drizzle/
git commit -m "feat: add route_prices table with route x class matrix"
```

---

### Task 3: Add drivers table

**Files:**
- Modify: `src/db/schema.ts`

**Step 1: Add drivers table**

```typescript
// ============ DRIVERS ============
export const drivers = pgTable("drivers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull().unique(),
  vehicleClassId: integer("vehicle_class_id").references(() => vehicleClasses.id).notNull(),
  vehicleMake: varchar("vehicle_make", { length: 255 }).notNull(),
  vehiclePlate: varchar("vehicle_plate", { length: 50 }).notNull(),
  telegramChatId: varchar("telegram_chat_id", { length: 100 }),
  isActive: boolean("is_active").default(true).notNull(),
  hasActiveOrder: boolean("has_active_order").default(false).notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("5.00").notNull(),
  totalTrips: integer("total_trips").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

**Step 2: Push migration**

```bash
npx drizzle-kit generate
npx drizzle-kit push
```

**Step 3: Commit**

```bash
git add src/db/schema.ts drizzle/
git commit -m "feat: add drivers table"
```

---

### Task 4: Add conversations and messages tables

**Files:**
- Modify: `src/db/schema.ts`

**Step 1: Add tables**

```typescript
// ============ CONVERSATIONS ============
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  channel: channelEnum("channel").notNull(),
  externalChatId: varchar("external_chat_id", { length: 255 }).notNull(),
  clientPhone: varchar("client_phone", { length: 50 }),
  clientName: varchar("client_name", { length: 255 }),
  language: varchar("language", { length: 10 }).default("en"),
  clientCountry: varchar("client_country", { length: 10 }),
  clientCountryName: varchar("client_country_name", { length: 100 }),
  clientPhoneCountryCode: varchar("client_phone_country_code", { length: 10 }),
  bookingId: integer("booking_id").references(() => bookings.id),
  status: conversationStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============ MESSAGES ============
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversations.id, { onDelete: "cascade" }).notNull(),
  role: messageRoleEnum("role").notNull(),
  content: text("content").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

**Step 2: Push migration**

```bash
npx drizzle-kit generate
npx drizzle-kit push
```

**Step 3: Commit**

```bash
git add src/db/schema.ts drizzle/
git commit -m "feat: add conversations and messages tables"
```

---

### Task 5: Add order_events, feedback, ai_settings, telegram_bot_settings tables

**Files:**
- Modify: `src/db/schema.ts`

**Step 1: Add tables**

```typescript
// ============ ORDER EVENTS ============
export const orderEvents = pgTable("order_events", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id, { onDelete: "cascade" }).notNull(),
  event: orderEventEnum("event").notNull(),
  driverId: integer("driver_id").references(() => drivers.id),
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============ FEEDBACK ============
export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id).notNull().unique(),
  driverId: integer("driver_id").references(() => drivers.id).notNull(),
  ratingDriver: integer("rating_driver").notNull(),
  ratingVehicle: integer("rating_vehicle").notNull(),
  comment: text("comment"),
  language: varchar("language", { length: 10 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============ AI SETTINGS ============
export const aiSettings = pgTable("ai_settings", {
  id: serial("id").primaryKey(),
  provider: aiProviderEnum("provider").notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  apiKey: varchar("api_key", { length: 500 }).notNull(),
  systemPrompt: text("system_prompt").notNull(),
  temperature: decimal("temperature", { precision: 3, scale: 2 }).default("0.70").notNull(),
  isActive: boolean("is_active").default(false).notNull(),
});

// ============ TELEGRAM BOT SETTINGS ============
export const telegramBotSettings = pgTable("telegram_bot_settings", {
  id: serial("id").primaryKey(),
  botType: telegramBotTypeEnum("bot_type").notNull().unique(),
  token: varchar("token", { length: 500 }).notNull(),
  webhookUrl: varchar("webhook_url", { length: 500 }),
  isActive: boolean("is_active").default(false).notNull(),
});
```

**Step 2: Push migration**

```bash
npx drizzle-kit generate
npx drizzle-kit push
```

**Step 3: Commit**

```bash
git add src/db/schema.ts drizzle/
git commit -m "feat: add order_events, feedback, ai_settings, telegram_bot_settings tables"
```

---

### Task 6: Extend existing bookings and users tables

**Files:**
- Modify: `src/db/schema.ts`

**Step 1: Update bookings table — add new fields**

Update the `bookings` table definition to include new fields. Keep all existing fields, add:

```typescript
export const bookings = pgTable("bookings", {
  // ... all existing fields stay ...
  vehicleClassId: integer("vehicle_class_id").references(() => vehicleClasses.id),
  driverId: integer("driver_id").references(() => drivers.id),
  needsSign: boolean("needs_sign").default(false).notNull(),
  signText: varchar("sign_text", { length: 255 }),
  scheduledAt: timestamp("scheduled_at"),
  totalPriceSom: decimal("total_price_som", { precision: 10, scale: 2 }),
  totalPriceUsd: decimal("total_price_usd", { precision: 10, scale: 2 }),
  channel: bookingChannelEnum("channel").default("website"),
  language: varchar("language", { length: 10 }),
  clientCountry: varchar("client_country", { length: 10 }),
  isUrgent: boolean("is_urgent").default(false).notNull(),
});
```

**Step 2: Update users table — add telegramChatId**

```typescript
export const users = pgTable("users", {
  // ... all existing fields stay ...
  telegramChatId: varchar("telegram_chat_id", { length: 100 }),
});
```

**Step 3: Update bookingStatusEnum to include new statuses**

Replace old enum:
```typescript
export const bookingStatusEnum = pgEnum("booking_status", [
  "new", "confirmed", "driver_search", "assigned", "in_progress", "completed", "cancelled",
]);
```

**Step 4: Push migration**

```bash
npx drizzle-kit generate
npx drizzle-kit push
```

**Step 5: Commit**

```bash
git add src/db/schema.ts drizzle/
git commit -m "feat: extend bookings and users tables with CRM fields"
```

---

### Task 7: Seed default vehicle classes

**Files:**
- Modify: `src/db/seed.ts`

**Step 1: Add vehicle classes seed data**

Add to seed.ts after existing seed logic:

```typescript
import { vehicleClasses } from "./schema";

const defaultVehicleClasses = [
  {
    name: { ru: "Эконом", en: "Economy", ky: "Эконом", zh: "经济型", hi: "इकोनॉमी", ar: "اقتصادي" },
    slug: "economy",
    description: { ru: "Бюджетный вариант", en: "Budget option", ky: "Бюджеттик вариант", zh: "经济实惠", hi: "बजट विकल्प", ar: "خيار اقتصادي" },
    maxPassengers: 4,
    maxLuggage: 3,
    sortOrder: 1,
  },
  {
    name: { ru: "Комфорт", en: "Comfort", ky: "Комфорт", zh: "舒适型", hi: "कम्फर्ट", ar: "مريح" },
    slug: "comfort",
    description: { ru: "Комфортная поездка", en: "Comfortable ride", ky: "Ыңгайлуу жол", zh: "舒适出行", hi: "आरामदायक सवारी", ar: "رحلة مريحة" },
    maxPassengers: 4,
    maxLuggage: 3,
    sortOrder: 2,
  },
  {
    name: { ru: "Бизнес", en: "Business", ky: "Бизнес", zh: "商务型", hi: "बिज़नेस", ar: "أعمال" },
    slug: "business",
    description: { ru: "Бизнес-класс", en: "Business class", ky: "Бизнес-класс", zh: "商务舱", hi: "बिज़नेस क्लास", ar: "درجة رجال الأعمال" },
    maxPassengers: 4,
    maxLuggage: 4,
    sortOrder: 3,
  },
  {
    name: { ru: "VIP", en: "VIP", ky: "VIP", zh: "VIP", hi: "VIP", ar: "VIP" },
    slug: "vip",
    description: { ru: "Премиум обслуживание", en: "Premium service", ky: "Премиум тейлоо", zh: "高端服务", hi: "प्रीमियम सेवा", ar: "خدمة متميزة" },
    maxPassengers: 4,
    maxLuggage: 4,
    sortOrder: 4,
  },
  {
    name: { ru: "Минивэн", en: "Minivan", ky: "Минивэн", zh: "商务车", hi: "मिनीवैन", ar: "ميني فان" },
    slug: "minivan",
    description: { ru: "Для больших групп", en: "For larger groups", ky: "Чоң топтор үчүн", zh: "大型团组", hi: "बड़े समूहों के लिए", ar: "للمجموعات الكبيرة" },
    maxPassengers: 7,
    maxLuggage: 6,
    sortOrder: 5,
  },
  {
    name: { ru: "Микроавтобус", en: "Minibus", ky: "Микроавтобус", zh: "小巴", hi: "मिनीबस", ar: "حافلة صغيرة" },
    slug: "minibus",
    description: { ru: "Для групповых трансферов", en: "For group transfers", ky: "Топтук трансферлер үчүн", zh: "团体接送", hi: "समूह स्थानांतरण के लिए", ar: "للتنقلات الجماعية" },
    maxPassengers: 15,
    maxLuggage: 15,
    sortOrder: 6,
  },
];

// Insert:
await db.insert(vehicleClasses).values(defaultVehicleClasses);
```

**Step 2: Add default AI settings seed**

```typescript
import { aiSettings } from "./schema";

await db.insert(aiSettings).values([
  {
    provider: "openai",
    model: "gpt-4o",
    apiKey: "sk-your-key-here",
    systemPrompt: `You are a polite and efficient manager at Manas Taxi, an airport taxi service in Bishkek, Kyrgyzstan.

Your job is to help clients book taxi transfers. You communicate in the client's language — detect it from their first message.

Keep messages SHORT — 1-3 sentences max. Ask ONE question at a time. Never send walls of text.

Information to collect:
1. Route: Where from and where to (airport to city or city to airport)
2. Date and time of pickup
3. Flight number (if airport transfer)
4. Car class preference
5. Need a meeting sign? (for arrivals)
6. Client name
7. Contact phone number
8. Number of passengers and luggage

For arriving passengers, after booking suggest our tour packages.

Once all info is collected, confirm the details and create the booking.

Be natural, friendly, and helpful. Like a real human manager, not a robot.`,
    temperature: "0.70",
    isActive: true,
  },
  {
    provider: "anthropic",
    model: "claude-sonnet-4-20250514",
    apiKey: "sk-ant-your-key-here",
    systemPrompt: `Same prompt as above (copy)`,
    temperature: "0.70",
    isActive: false,
  },
]);
```

**Step 3: Commit**

```bash
git add src/db/seed.ts
git commit -m "feat: seed default vehicle classes and AI settings"
```

---

## Phase 2: Admin CRUD for New Entities

### Task 8: Vehicle Classes admin actions

**Files:**
- Modify: `src/lib/admin-actions.ts`

**Step 1: Add vehicle class CRUD actions**

```typescript
import { vehicleClasses } from "@/db/schema";

export async function getVehicleClasses() {
  return db.select().from(vehicleClasses).orderBy(vehicleClasses.sortOrder);
}

export async function createVehicleClass(data: {
  name: Record<string, string>;
  slug: string;
  description?: Record<string, string>;
  maxPassengers: number;
  maxLuggage: number;
  sortOrder?: number;
}) {
  await db.insert(vehicleClasses).values(data);
  revalidatePath("/admin/vehicle-classes");
}

export async function updateVehicleClass(id: number, data: Partial<{
  name: Record<string, string>;
  slug: string;
  description: Record<string, string>;
  maxPassengers: number;
  maxLuggage: number;
  sortOrder: number;
  isActive: boolean;
}>) {
  await db.update(vehicleClasses).set(data).where(eq(vehicleClasses.id, id));
  revalidatePath("/admin/vehicle-classes");
}

export async function deleteVehicleClass(id: number) {
  await db.delete(vehicleClasses).where(eq(vehicleClasses.id, id));
  revalidatePath("/admin/vehicle-classes");
}
```

**Step 2: Commit**

```bash
git add src/lib/admin-actions.ts
git commit -m "feat: add vehicle class CRUD admin actions"
```

---

### Task 9: Vehicle Classes admin page

**Files:**
- Create: `src/app/[locale]/admin/vehicle-classes/page.tsx`
- Create: `src/components/admin/vehicle-classes-admin.tsx`

**Step 1: Create page component**

`src/app/[locale]/admin/vehicle-classes/page.tsx`:
```typescript
export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getVehicleClasses } from "@/lib/admin-actions";
import { VehicleClassesAdmin } from "@/components/admin/vehicle-classes-admin";

export default async function AdminVehicleClassesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session) redirect(`/${locale}/admin/login`);

  const classes = await getVehicleClasses();
  return <VehicleClassesAdmin vehicleClasses={classes} />;
}
```

**Step 2: Create VehicleClassesAdmin component**

`src/components/admin/vehicle-classes-admin.tsx`:

Client component following the same pattern as `RoutesAdmin`:
- Table displaying: name (ru), slug, maxPassengers, maxLuggage, sortOrder, isActive toggle
- Create form: name inputs for each locale (ru, en, ky, zh, hi, ar), slug (auto-generated), maxPassengers, maxLuggage
- Edit inline form: same fields
- Delete with confirmation
- Sort order drag or manual input

**Step 3: Commit**

```bash
git add src/app/[locale]/admin/vehicle-classes/ src/components/admin/vehicle-classes-admin.tsx
git commit -m "feat: add vehicle classes admin page with CRUD"
```

---

### Task 10: Route Prices admin actions and page

**Files:**
- Modify: `src/lib/admin-actions.ts`
- Create: `src/app/[locale]/admin/route-prices/page.tsx`
- Create: `src/components/admin/route-prices-admin.tsx`

**Step 1: Add route prices actions to admin-actions.ts**

```typescript
import { routePrices } from "@/db/schema";

export async function getRoutePrices(routeId?: number) {
  if (routeId) {
    return db.select().from(routePrices).where(eq(routePrices.routeId, routeId));
  }
  return db.select().from(routePrices);
}

export async function upsertRoutePrice(data: {
  routeId: number;
  vehicleClassId: number;
  priceSom: string;
  priceUsd: string;
}) {
  // Use ON CONFLICT to upsert
  await db.insert(routePrices).values(data)
    .onConflictDoUpdate({
      target: [routePrices.routeId, routePrices.vehicleClassId],
      set: { priceSom: data.priceSom, priceUsd: data.priceUsd },
    });
  revalidatePath("/admin/route-prices");
}

export async function bulkUpsertRoutePrices(prices: Array<{
  routeId: number;
  vehicleClassId: number;
  priceSom: string;
  priceUsd: string;
}>) {
  for (const price of prices) {
    await upsertRoutePrice(price);
  }
  revalidatePath("/admin/route-prices");
}
```

**Step 2: Create route prices page**

Matrix UI: rows = routes, columns = vehicle classes. Each cell has priceSom/priceUsd inputs. "Save all" button for bulk update. Filter by route search.

**Step 3: Commit**

```bash
git add src/lib/admin-actions.ts src/app/[locale]/admin/route-prices/ src/components/admin/route-prices-admin.tsx
git commit -m "feat: add route prices matrix admin page"
```

---

### Task 11: Drivers admin actions and page

**Files:**
- Modify: `src/lib/admin-actions.ts`
- Create: `src/app/[locale]/admin/drivers/page.tsx`
- Create: `src/components/admin/drivers-admin.tsx`

**Step 1: Add driver CRUD actions**

```typescript
import { drivers } from "@/db/schema";

export async function getDrivers() {
  return db.select({
    driver: drivers,
    vehicleClass: vehicleClasses,
  }).from(drivers)
    .leftJoin(vehicleClasses, eq(drivers.vehicleClassId, vehicleClasses.id))
    .orderBy(drivers.name);
}

export async function createDriver(data: {
  name: string;
  phone: string;
  vehicleClassId: number;
  vehicleMake: string;
  vehiclePlate: string;
}) {
  await db.insert(drivers).values(data);
  revalidatePath("/admin/drivers");
}

export async function updateDriver(id: number, data: Partial<{
  name: string;
  phone: string;
  vehicleClassId: number;
  vehicleMake: string;
  vehiclePlate: string;
  isActive: boolean;
}>) {
  await db.update(drivers).set(data).where(eq(drivers.id, id));
  revalidatePath("/admin/drivers");
}

export async function deleteDriver(id: number) {
  await db.delete(drivers).where(eq(drivers.id, id));
  revalidatePath("/admin/drivers");
}
```

**Step 2: Create drivers admin page**

Table with: name, phone, vehicle class (dropdown), car make, plate, telegram status (connected/not), isActive toggle, rating stars, total trips, hasActiveOrder badge. Create form. Edit inline. Delete with confirmation.

**Step 3: Commit**

```bash
git add src/lib/admin-actions.ts src/app/[locale]/admin/drivers/ src/components/admin/drivers-admin.tsx
git commit -m "feat: add drivers admin page with CRUD"
```

---

### Task 12: AI Settings admin page

**Files:**
- Modify: `src/lib/admin-actions.ts`
- Create: `src/app/[locale]/admin/ai-settings/page.tsx`
- Create: `src/components/admin/ai-settings-admin.tsx`

**Step 1: Add AI settings actions**

```typescript
import { aiSettings } from "@/db/schema";

export async function getAiSettings() {
  return db.select().from(aiSettings);
}

export async function updateAiSettings(id: number, data: Partial<{
  provider: "openai" | "anthropic";
  model: string;
  apiKey: string;
  systemPrompt: string;
  temperature: string;
  isActive: boolean;
}>) {
  // If setting isActive=true, set all others to false first
  if (data.isActive) {
    await db.update(aiSettings).set({ isActive: false });
  }
  await db.update(aiSettings).set(data).where(eq(aiSettings.id, id));
  revalidatePath("/admin/ai-settings");
}
```

**Step 2: Create AI settings admin page**

Two cards (OpenAI / Anthropic). Each card: provider label, model input, API key input (masked), system prompt textarea (large), temperature slider (0.0-1.0), "Active" toggle (radio — only one active). Test button to send a test message.

**Step 3: Commit**

```bash
git add src/lib/admin-actions.ts src/app/[locale]/admin/ai-settings/ src/components/admin/ai-settings-admin.tsx
git commit -m "feat: add AI settings admin page"
```

---

### Task 13: Telegram Bot Settings admin page

**Files:**
- Modify: `src/lib/admin-actions.ts`
- Create: `src/app/[locale]/admin/telegram/page.tsx`
- Create: `src/components/admin/telegram-admin.tsx`

**Step 1: Add telegram settings actions**

```typescript
import { telegramBotSettings } from "@/db/schema";

export async function getTelegramSettings() {
  return db.select().from(telegramBotSettings);
}

export async function upsertTelegramSetting(data: {
  botType: "client" | "driver" | "admin";
  token: string;
  webhookUrl?: string;
  isActive: boolean;
}) {
  await db.insert(telegramBotSettings).values(data)
    .onConflictDoUpdate({
      target: telegramBotSettings.botType,
      set: { token: data.token, webhookUrl: data.webhookUrl, isActive: data.isActive },
    });
  revalidatePath("/admin/telegram");
}
```

**Step 2: Create telegram admin page**

Three sections: Client Bot, Driver Bot, Admin Notifications. Each: token input, webhook URL (auto-generated from app URL), isActive toggle, "Set Webhook" button (calls Telegram setWebhook API), "Test Send" button.

**Step 3: Commit**

```bash
git add src/lib/admin-actions.ts src/app/[locale]/admin/telegram/ src/components/admin/telegram-admin.tsx
git commit -m "feat: add Telegram bot settings admin page"
```

---

### Task 14: WhatsApp Settings admin page

**Files:**
- Create: `src/app/[locale]/admin/whatsapp/page.tsx`
- Create: `src/components/admin/whatsapp-admin.tsx`

**Step 1: Add WhatsApp settings to the settings table**

Use existing `settings` table with keys: `whatsapp_api_url`, `whatsapp_api_key`, `whatsapp_session_id`.

Add actions in admin-actions.ts (use existing `updateSetting` pattern).

**Step 2: Create WhatsApp admin page**

Fields: Baileys Server URL (default: `https://wa.kaymak.kg`), API Key, Session ID. "Test Connection" button (calls list sessions API). Status badge: online/offline.

**Step 3: Commit**

```bash
git add src/app/[locale]/admin/whatsapp/ src/components/admin/whatsapp-admin.tsx
git commit -m "feat: add WhatsApp settings admin page"
```

---

### Task 15: Update AdminSidebar with new menu items

**Files:**
- Modify: `src/components/admin/admin-sidebar.tsx`

**Step 1: Add new menu items**

Add to the `menuItems` array:

```typescript
import { Car, Users, DollarSign, MessageCircle, Activity, Star, Bot, Phone } from "lucide-react";

const menuItems = [
  { href: "/admin", label: "Панель управления", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Бронирования", icon: CalendarCheck },
  { href: "/admin/drivers", label: "Водители", icon: Users },
  { href: "/admin/routes", label: "Маршруты", icon: Route },
  { href: "/admin/vehicle-classes", label: "Классы машин", icon: Car },
  { href: "/admin/route-prices", label: "Цены маршрутов", icon: DollarSign },
  { href: "/admin/tours", label: "Туры", icon: Mountain },
  { href: "/admin/services", label: "Услуги", icon: Wrench },
  { href: "/admin/conversations", label: "Переписки", icon: MessageCircle },
  { href: "/admin/feedback", label: "Отзывы", icon: Star },
  { href: "/admin/events", label: "События", icon: Activity },
  { href: "/admin/messages", label: "Сообщения", icon: MessageSquare },
  { href: "/admin/ai-settings", label: "Настройки ИИ", icon: Bot },
  { href: "/admin/telegram", label: "Telegram боты", icon: Send },
  { href: "/admin/whatsapp", label: "WhatsApp", icon: Phone },
  { href: "/admin/settings", label: "Настройки", icon: Settings },
];
```

**Step 2: Commit**

```bash
git add src/components/admin/admin-sidebar.tsx
git commit -m "feat: update admin sidebar with all CRM menu items"
```

---

### Task 16: Conversations admin page

**Files:**
- Modify: `src/lib/admin-actions.ts`
- Create: `src/app/[locale]/admin/conversations/page.tsx`
- Create: `src/components/admin/conversations-admin.tsx`

**Step 1: Add conversation actions**

```typescript
import { conversations, messages } from "@/db/schema";

export async function getConversations() {
  return db.select().from(conversations).orderBy(desc(conversations.updatedAt));
}

export async function getConversationMessages(conversationId: number) {
  return db.select().from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.createdAt);
}

export async function sendManagerMessage(conversationId: number, content: string) {
  await db.insert(messages).values({
    conversationId,
    role: "manager",
    content,
  });
  // TODO: Also send via WhatsApp/Telegram API based on conversation channel
  revalidatePath("/admin/conversations");
}
```

**Step 2: Create conversations page**

Left panel: list of conversations with client name, channel icon (WhatsApp/Telegram), last message preview, timestamp, status badge. Filter by channel, status.

Right panel: full chat history (like a messenger). Messages styled by role: client (left), bot (right, gray), manager (right, blue). Input field at bottom for manager to reply.

Client info card at top: name, phone, country flag, language.

**Step 3: Commit**

```bash
git add src/lib/admin-actions.ts src/app/[locale]/admin/conversations/ src/components/admin/conversations-admin.tsx
git commit -m "feat: add conversations admin page with chat view"
```

---

### Task 17: Feedback admin page

**Files:**
- Modify: `src/lib/admin-actions.ts`
- Create: `src/app/[locale]/admin/feedback/page.tsx`
- Create: `src/components/admin/feedback-admin.tsx`

**Step 1: Add feedback actions**

```typescript
import { feedback } from "@/db/schema";

export async function getFeedback() {
  return db.select({
    feedback: feedback,
    driver: drivers,
    booking: bookings,
  }).from(feedback)
    .leftJoin(drivers, eq(feedback.driverId, drivers.id))
    .leftJoin(bookings, eq(feedback.bookingId, bookings.id))
    .orderBy(desc(feedback.createdAt));
}
```

**Step 2: Create feedback page**

Table: date, client name (from booking), driver name, driver rating (stars), vehicle rating (stars), comment, language. Filter by rating range, driver.

**Step 3: Commit**

```bash
git add src/lib/admin-actions.ts src/app/[locale]/admin/feedback/ src/components/admin/feedback-admin.tsx
git commit -m "feat: add feedback admin page"
```

---

### Task 18: Events timeline admin page

**Files:**
- Modify: `src/lib/admin-actions.ts`
- Create: `src/app/[locale]/admin/events/page.tsx`
- Create: `src/components/admin/events-admin.tsx`

**Step 1: Add events actions**

```typescript
import { orderEvents } from "@/db/schema";

export async function getOrderEvents(bookingId?: number) {
  const query = db.select({
    event: orderEvents,
    driver: drivers,
    booking: bookings,
  }).from(orderEvents)
    .leftJoin(drivers, eq(orderEvents.driverId, drivers.id))
    .leftJoin(bookings, eq(orderEvents.bookingId, bookings.id))
    .orderBy(desc(orderEvents.createdAt))
    .limit(100);

  if (bookingId) {
    return query.where(eq(orderEvents.bookingId, bookingId));
  }
  return query;
}
```

**Step 2: Create events page**

Timeline view: vertical line with event nodes. Each node: icon by event type, timestamp, booking #, driver name, details. Color-coded: green (completed), red (force_majeure), blue (assigned), yellow (driver_search). Filter by event type, date range.

**Step 3: Commit**

```bash
git add src/lib/admin-actions.ts src/app/[locale]/admin/events/ src/components/admin/events-admin.tsx
git commit -m "feat: add order events timeline admin page"
```

---

### Task 19: Update Dashboard with CRM stats

**Files:**
- Modify: `src/lib/admin-actions.ts`
- Modify: `src/app/[locale]/admin/page.tsx`

**Step 1: Add CRM stats action**

```typescript
export async function getCrmStats() {
  const [bookingStats] = await Promise.all([
    db.select({ count: count() }).from(bookings),
  ]);

  // Active orders (driver_search, assigned, in_progress)
  const activeOrders = await db.select({ count: count() }).from(bookings)
    .where(inArray(bookings.status, ["driver_search", "assigned", "in_progress"]));

  // Online drivers (isActive + telegramChatId set + no active order)
  const onlineDrivers = await db.select({ count: count() }).from(drivers)
    .where(and(eq(drivers.isActive, true), isNotNull(drivers.telegramChatId)));

  // Average rating
  const avgRating = await db.select({ avg: avg(drivers.rating) }).from(drivers);

  // Revenue today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayRevenue = await db.select({ sum: sum(bookings.totalPriceSom) }).from(bookings)
    .where(and(eq(bookings.status, "completed"), gte(bookings.createdAt, today)));

  return { activeOrders, onlineDrivers, avgRating, todayRevenue, ...bookingStats };
}
```

**Step 2: Update dashboard page to show CRM stats**

Add cards: Active Orders (real-time), Online Drivers, Average Rating, Revenue Today/Week/Month. Keep existing booking stats.

**Step 3: Commit**

```bash
git add src/lib/admin-actions.ts src/app/[locale]/admin/page.tsx
git commit -m "feat: update dashboard with CRM stats"
```

---

### Task 20: Update Bookings admin with CRM fields

**Files:**
- Modify: `src/components/admin/bookings-admin.tsx`
- Modify: `src/lib/admin-actions.ts`

**Step 1: Update getBookings to join with drivers and vehicle classes**

```typescript
export async function getBookings() {
  return db.select({
    booking: bookings,
    driver: drivers,
    vehicleClass: vehicleClasses,
  }).from(bookings)
    .leftJoin(drivers, eq(bookings.driverId, drivers.id))
    .leftJoin(vehicleClasses, eq(bookings.vehicleClassId, vehicleClasses.id))
    .orderBy(desc(bookings.createdAt));
}
```

**Step 2: Update BookingsAdmin component**

Add columns: vehicle class, driver name, channel badge (website/whatsapp/telegram/manual), language, country flag, isUrgent badge. Add "Create order manually" button at top with full form. Add event timeline sidebar when viewing a booking.

**Step 3: Commit**

```bash
git add src/components/admin/bookings-admin.tsx src/lib/admin-actions.ts
git commit -m "feat: update bookings admin with CRM fields and manual creation"
```

---

## Phase 3: AI Chat Engine

### Task 21: Install AI SDKs

**Step 1: Install dependencies**

```bash
npm install openai @anthropic-ai/sdk
```

**Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: install OpenAI and Anthropic SDKs"
```

---

### Task 22: Create AI chat service

**Files:**
- Create: `src/lib/ai/chat-service.ts`
- Create: `src/lib/ai/tools.ts`
- Create: `src/lib/ai/providers.ts`

**Step 1: Create provider abstraction** (`src/lib/ai/providers.ts`)

```typescript
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/db";
import { aiSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getActiveAiConfig() {
  const [config] = await db.select().from(aiSettings).where(eq(aiSettings.isActive, true)).limit(1);
  if (!config) throw new Error("No active AI provider configured");
  return config;
}

export async function callAi(systemPrompt: string, messages: Array<{role: string; content: string}>, tools: any[]) {
  const config = await getActiveAiConfig();

  if (config.provider === "openai") {
    return callOpenAi(config, systemPrompt, messages, tools);
  } else {
    return callAnthropic(config, systemPrompt, messages, tools);
  }
}

async function callOpenAi(config, systemPrompt, messages, tools) {
  const client = new OpenAI({ apiKey: config.apiKey });
  const response = await client.chat.completions.create({
    model: config.model,
    temperature: parseFloat(config.temperature),
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ],
    tools: tools.map(t => ({ type: "function", function: t })),
  });
  return parseOpenAiResponse(response);
}

async function callAnthropic(config, systemPrompt, messages, tools) {
  const client = new Anthropic({ apiKey: config.apiKey });
  const response = await client.messages.create({
    model: config.model,
    max_tokens: 1024,
    temperature: parseFloat(config.temperature),
    system: systemPrompt,
    messages: messages,
    tools: tools.map(t => ({
      name: t.name,
      description: t.description,
      input_schema: t.parameters,
    })),
  });
  return parseAnthropicResponse(response);
}
```

**Step 2: Create tool definitions** (`src/lib/ai/tools.ts`)

Define function schemas for: `get_routes`, `search_route`, `get_route_price`, `get_vehicle_classes`, `get_tours`, `get_flight_info`, `create_booking`, `calculate_price`.

Each tool has: name, description, parameters (JSON Schema).

**Step 3: Create chat service** (`src/lib/ai/chat-service.ts`)

```typescript
export async function processClientMessage(
  conversationId: number,
  messageText: string,
): Promise<string> {
  // 1. Load conversation
  // 2. Load last 20 messages for context
  // 3. Build context with routes, classes, tours info
  // 4. Call AI with tools
  // 5. If AI calls a tool -> execute tool -> call AI again with result
  // 6. Save bot response to messages table
  // 7. Return response text
}
```

Tool execution handlers that query the database and return results.

**Step 4: Commit**

```bash
git add src/lib/ai/
git commit -m "feat: create AI chat service with OpenAI/Anthropic providers and function calling"
```

---

### Task 23: Create phone country detection utility

**Files:**
- Create: `src/lib/phone-utils.ts`

**Step 1: Create phone parsing utility**

```typescript
// Map of phone country codes to country info
const COUNTRY_CODES: Record<string, { code: string; name: string }> = {
  "1": { code: "US", name: "United States" },
  "7": { code: "RU", name: "Russia" },
  "81": { code: "JP", name: "Japan" },
  "82": { code: "KR", name: "South Korea" },
  "86": { code: "CN", name: "China" },
  "90": { code: "TR", name: "Turkey" },
  "91": { code: "IN", name: "India" },
  "44": { code: "GB", name: "United Kingdom" },
  "49": { code: "DE", name: "Germany" },
  "33": { code: "FR", name: "France" },
  "996": { code: "KG", name: "Kyrgyzstan" },
  "998": { code: "UZ", name: "Uzbekistan" },
  "7": { code: "KZ", name: "Kazakhstan" },
  // ... expand as needed
};

export function detectCountryFromPhone(phone: string): { code: string; name: string; countryCode: string } | null {
  const cleaned = phone.replace(/[^0-9+]/g, "").replace(/^\+/, "");
  // Try longest prefix first (3 digits, then 2, then 1)
  for (const len of [3, 2, 1]) {
    const prefix = cleaned.substring(0, len);
    if (COUNTRY_CODES[prefix]) {
      return { ...COUNTRY_CODES[prefix], countryCode: `+${prefix}` };
    }
  }
  return null;
}
```

**Step 2: Commit**

```bash
git add src/lib/phone-utils.ts
git commit -m "feat: add phone country detection utility"
```

---

## Phase 4: WhatsApp Integration

### Task 24: WhatsApp webhook and message handler

**Files:**
- Create: `src/app/api/whatsapp/webhook/route.ts`
- Create: `src/lib/whatsapp/client.ts`

**Step 1: Create WhatsApp API client** (`src/lib/whatsapp/client.ts`)

```typescript
import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";

async function getWhatsAppConfig() {
  const rows = await db.select().from(settings)
    .where(inArray(settings.key, ["whatsapp_api_url", "whatsapp_api_key", "whatsapp_session_id"]));
  // Parse into config object
}

export async function sendWhatsAppMessage(to: string, text: string) {
  const config = await getWhatsAppConfig();
  const response = await fetch(
    `${config.apiUrl}/api/sessions/${config.sessionId}/send`,
    {
      method: "POST",
      headers: {
        "x-api-key": config.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ to, text }),
    }
  );
  return response.json();
}
```

**Step 2: Create WhatsApp webhook** (`src/app/api/whatsapp/webhook/route.ts`)

```typescript
export async function POST(request: Request) {
  const body = await request.json();
  // Extract: sender phone, message text, chat ID
  // Find or create conversation (channel: "whatsapp")
  // Detect country from phone number
  // Save client message
  // Process through AI chat service
  // Send AI response back via WhatsApp
  return NextResponse.json({ success: true });
}
```

**Step 3: Commit**

```bash
git add src/app/api/whatsapp/ src/lib/whatsapp/
git commit -m "feat: add WhatsApp webhook and message handler"
```

---

## Phase 5: Telegram Client Bot

### Task 25: Telegram bot utilities

**Files:**
- Create: `src/lib/telegram/client.ts`

**Step 1: Create Telegram API client**

```typescript
import { db } from "@/db";
import { telegramBotSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

async function getBotToken(botType: "client" | "driver" | "admin") {
  const [bot] = await db.select().from(telegramBotSettings)
    .where(eq(telegramBotSettings.botType, botType));
  return bot?.token;
}

export async function sendTelegramMessage(
  botType: "client" | "driver" | "admin",
  chatId: string,
  text: string,
  replyMarkup?: object
) {
  const token = await getBotToken(botType);
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      reply_markup: replyMarkup,
    }),
  });
  return response.json();
}

export async function deleteTelegramMessage(botType: "client" | "driver" | "admin", chatId: string, messageId: number) {
  const token = await getBotToken(botType);
  await fetch(`https://api.telegram.org/bot${token}/deleteMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, message_id: messageId }),
  });
}

export async function setWebhook(botType: "client" | "driver" | "admin", url: string) {
  const token = await getBotToken(botType);
  const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  return response.json();
}
```

**Step 2: Commit**

```bash
git add src/lib/telegram/
git commit -m "feat: add Telegram API client utilities"
```

---

### Task 26: Telegram client bot webhook

**Files:**
- Create: `src/app/api/telegram/client/route.ts`

**Step 1: Create client bot webhook**

```typescript
import { processClientMessage } from "@/lib/ai/chat-service";
import { sendTelegramMessage } from "@/lib/telegram/client";
import { db } from "@/db";
import { conversations, messages } from "@/db/schema";

export async function POST(request: Request) {
  const update = await request.json();

  // Handle /start command
  if (update.message?.text === "/start") {
    await sendTelegramMessage("client", update.message.chat.id, "Welcome to Manas Taxi! ...");
    return NextResponse.json({ ok: true });
  }

  // Regular message
  if (update.message?.text) {
    const chatId = String(update.message.chat.id);
    const text = update.message.text;

    // Find or create conversation
    let conversation = await findOrCreateConversation(chatId, "telegram");

    // Save client message
    await db.insert(messages).values({
      conversationId: conversation.id,
      role: "client",
      content: text,
    });

    // Process through AI
    const response = await processClientMessage(conversation.id, text);

    // Send response
    await sendTelegramMessage("client", chatId, response);
  }

  return NextResponse.json({ ok: true });
}
```

**Step 2: Commit**

```bash
git add src/app/api/telegram/client/
git commit -m "feat: add Telegram client bot webhook"
```

---

## Phase 6: Telegram Driver Bot

### Task 27: Driver bot webhook — verification and order handling

**Files:**
- Create: `src/app/api/telegram/driver/route.ts`
- Create: `src/lib/telegram/driver-bot.ts`

**Step 1: Create driver bot logic** (`src/lib/telegram/driver-bot.ts`)

```typescript
export async function handleDriverUpdate(update: any) {
  // Handle /start -> ask to share phone number
  // Handle contact shared -> verify phone in drivers table -> save telegramChatId
  // Handle callback_query "accept_order_123" -> assign order
  // Handle callback_query "complete_order_123" -> complete order
  // Handle callback_query "force_majeure_123" -> start force majeure flow
  // Handle callback_query "fm_reason_*" -> save reason, reassign
}
```

**Step 2: Create driver webhook** (`src/app/api/telegram/driver/route.ts`)

```typescript
export async function POST(request: Request) {
  const update = await request.json();
  await handleDriverUpdate(update);
  return NextResponse.json({ ok: true });
}
```

**Step 3: Implement order acceptance logic**

When driver presses "Accept":
1. Check order still available (status = driver_search)
2. Assign driver, set status = assigned, hasActiveOrder = true
3. Delete messages from ALL other drivers (store message IDs in order_events metadata)
4. Send full client details to accepting driver with Complete/Force Majeure buttons
5. Create order_event: driver_accepted
6. Notify admins

**Step 4: Implement force majeure logic**

When driver presses "Force Majeure":
1. Send reason buttons (breakdown, accident, traffic, other)
2. On reason selected: save event, reset driver, set booking urgent, re-dispatch

**Step 5: Implement completion logic**

When driver presses "Complete":
1. Set booking completed, reset driver hasActiveOrder
2. Increment totalTrips
3. Schedule feedback collection (via DB flag, cron picks up)

**Step 6: Commit**

```bash
git add src/app/api/telegram/driver/ src/lib/telegram/driver-bot.ts
git commit -m "feat: add Telegram driver bot with order accept/complete/force-majeure"
```

---

## Phase 7: Cron Jobs

### Task 28: Order dispatch cron

**Files:**
- Create: `src/app/api/cron/dispatch-orders/route.ts`
- Create: `src/lib/cron/dispatch.ts`

**Step 1: Create dispatch logic** (`src/lib/cron/dispatch.ts`)

```typescript
export async function dispatchPendingOrders() {
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

  // Find confirmed bookings where scheduledAt <= oneHourLater and status = "confirmed"
  const pendingOrders = await db.select().from(bookings)
    .where(and(
      eq(bookings.status, "confirmed"),
      lte(bookings.scheduledAt, oneHourLater),
      isNotNull(bookings.scheduledAt),
    ));

  for (const order of pendingOrders) {
    // Find matching drivers
    const availableDrivers = await db.select().from(drivers)
      .where(and(
        eq(drivers.vehicleClassId, order.vehicleClassId),
        eq(drivers.isActive, true),
        eq(drivers.hasActiveOrder, false),
        isNotNull(drivers.telegramChatId),
      ));

    if (availableDrivers.length === 0) {
      // Notify admin: no drivers available
      continue;
    }

    // Update status to driver_search
    await db.update(bookings).set({ status: "driver_search" }).where(eq(bookings.id, order.id));

    // Send to all drivers (WITHOUT client details)
    // Store sent message IDs in order_events for later deletion
    for (const driver of availableDrivers) {
      const result = await sendTelegramMessage("driver", driver.telegramChatId, orderSummaryText(order), {
        inline_keyboard: [[
          { text: "✅ Принять заказ", callback_data: `accept_order_${order.id}` }
        ]],
      });
      // Store message ID for later deletion
    }

    // Create order event
    await db.insert(orderEvents).values({
      bookingId: order.id,
      event: "driver_search",
      details: { driversNotified: availableDrivers.length },
    });
  }
}
```

**Step 2: Create cron route** (`src/app/api/cron/dispatch-orders/route.ts`)

```typescript
export async function GET(request: Request) {
  // Verify cron secret (Vercel sends CRON_SECRET header)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dispatchPendingOrders();
  return NextResponse.json({ success: true });
}
```

**Step 3: Commit**

```bash
git add src/app/api/cron/dispatch-orders/ src/lib/cron/dispatch.ts
git commit -m "feat: add order dispatch cron job"
```

---

### Task 29: Reminders cron

**Files:**
- Create: `src/app/api/cron/send-reminders/route.ts`
- Create: `src/lib/cron/reminders.ts`

**Step 1: Create reminder logic**

Send reminder to assigned driver 30 min before scheduledAt. Only for bookings with status "assigned".

**Step 2: Create cron route with auth check**

**Step 3: Commit**

```bash
git add src/app/api/cron/send-reminders/ src/lib/cron/reminders.ts
git commit -m "feat: add driver reminder cron job"
```

---

### Task 30: Feedback collection cron

**Files:**
- Create: `src/app/api/cron/collect-feedback/route.ts`
- Create: `src/lib/cron/feedback.ts`

**Step 1: Create feedback logic**

Find completed bookings where:
- status = "completed"
- No feedback exists yet
- completedAt (from order_events) was > 10 minutes ago
- No feedback request sent yet (track in order_events)

Send message to client in their language asking for driver rating (1-5 inline keyboard). Track the feedback collection state in conversation.

**Step 2: Create cron route**

**Step 3: Commit**

```bash
git add src/app/api/cron/collect-feedback/ src/lib/cron/feedback.ts
git commit -m "feat: add feedback collection cron job"
```

---

### Task 31: Stale order check cron

**Files:**
- Create: `src/app/api/cron/check-stale/route.ts`
- Create: `src/lib/cron/stale-check.ts`

**Step 1: Create stale check logic**

Find orders in `driver_search` status for > 30 minutes. Notify admin via Telegram.

**Step 2: Create cron route**

**Step 3: Commit**

```bash
git add src/app/api/cron/check-stale/ src/lib/cron/stale-check.ts
git commit -m "feat: add stale order check cron job"
```

---

### Task 32: Configure Vercel cron

**Files:**
- Create: `vercel.json`

**Step 1: Create vercel.json**

```json
{
  "crons": [
    { "path": "/api/cron/dispatch-orders", "schedule": "* * * * *" },
    { "path": "/api/cron/send-reminders", "schedule": "* * * * *" },
    { "path": "/api/cron/collect-feedback", "schedule": "* * * * *" },
    { "path": "/api/cron/check-stale", "schedule": "*/15 * * * *" }
  ]
}
```

**Step 2: Add CRON_SECRET to .env.local**

```
CRON_SECRET=your-random-secret-here
```

**Step 3: Commit**

```bash
git add vercel.json
git commit -m "feat: configure Vercel cron jobs"
```

---

## Phase 8: Admin Notifications

### Task 33: Admin notification service

**Files:**
- Create: `src/lib/notifications.ts`

**Step 1: Create notification service**

```typescript
export async function notifyAdmins(message: string) {
  // Get all users with telegramChatId set
  const admins = await db.select().from(users).where(isNotNull(users.telegramChatId));

  for (const admin of admins) {
    await sendTelegramMessage("admin", admin.telegramChatId!, message);
  }
}

export async function notifyNewOrder(booking: any) {
  await notifyAdmins(`🆕 Новый заказ #${booking.id}\n${booking.name}\n${booking.phone}\n...`);
}

export async function notifyForceMajeure(booking: any, driver: any, reason: string) {
  await notifyAdmins(`⚠️ Форс-мажор заказ #${booking.id}\nВодитель: ${driver.name}\nПричина: ${reason}`);
}

export async function notifyStaleOrder(booking: any) {
  await notifyAdmins(`🔴 Заказ #${booking.id} не принят > 30 мин!`);
}
```

**Step 2: Commit**

```bash
git add src/lib/notifications.ts
git commit -m "feat: add admin notification service via Telegram"
```

---

## Phase 9: Integration & Polish

### Task 34: Update booking creation flow (website + bot)

**Files:**
- Modify: `src/lib/actions.ts` — update `createBooking` to include new fields
- Modify: `src/app/api/bookings/route.ts` — update API to accept new fields
- Modify: `src/components/booking/BookingForm.tsx` — add vehicle class selector

**Step 1: Update createBooking action**

Add vehicleClassId, scheduledAt, channel fields. Create order_event on creation. Notify admins.

**Step 2: Update booking form**

Add vehicle class dropdown (fetched from vehicleClasses). Show price based on selected route + class from route_prices matrix.

**Step 3: Commit**

```bash
git add src/lib/actions.ts src/app/api/bookings/route.ts src/components/booking/
git commit -m "feat: update booking flow with vehicle class and CRM integration"
```

---

### Task 35: Update middleware for API auth

**Files:**
- Modify: `src/middleware.ts`

**Step 1: Ensure API routes are excluded from i18n middleware**

Current matcher already excludes `/api/` routes. Verify cron routes work without locale prefix.

**Step 2: Add cron auth verification helper**

Already handled in each cron route via CRON_SECRET check.

**Step 3: Commit (if changes needed)**

```bash
git add src/middleware.ts
git commit -m "feat: verify middleware excludes API and cron routes"
```

---

### Task 36: Webhook setup API endpoint

**Files:**
- Create: `src/app/api/telegram/setup-webhook/route.ts`

**Step 1: Create webhook setup endpoint**

Called from Telegram admin page to register webhooks with Telegram API:

```typescript
export async function POST(request: Request) {
  const { botType } = await request.json();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL;

  const webhookUrls = {
    client: `${appUrl}/api/telegram/client`,
    driver: `${appUrl}/api/telegram/driver`,
  };

  const result = await setWebhook(botType, webhookUrls[botType]);
  return NextResponse.json(result);
}
```

**Step 2: Commit**

```bash
git add src/app/api/telegram/setup-webhook/
git commit -m "feat: add Telegram webhook setup endpoint"
```

---

### Task 37: Manual booking creation from admin

**Files:**
- Create: `src/app/api/bookings/manual/route.ts`

**Step 1: Create manual booking endpoint**

Allows managers to create bookings with all fields pre-filled:

```typescript
export async function POST(request: Request) {
  // Verify session (manager or admin)
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await request.json();
  // Create booking with channel: "manual"
  // Create order_event: created
  // Notify admins
  return NextResponse.json({ success: true, booking });
}
```

**Step 2: Commit**

```bash
git add src/app/api/bookings/manual/
git commit -m "feat: add manual booking creation API for managers"
```

---

### Task 38: Feedback handling in client bot (Telegram callback)

**Files:**
- Modify: `src/app/api/telegram/client/route.ts`

**Step 1: Handle callback queries for feedback**

When client presses rating buttons (from feedback collection cron):
- `feedback_driver_5_bookingId` -> save driver rating, ask for vehicle rating
- `feedback_vehicle_5_bookingId` -> save vehicle rating, ask for comment
- `feedback_skip_bookingId` -> save without comment, thank and close
- Text message during feedback flow -> save as comment

Update conversation status to "completed" after feedback.

**Step 2: Commit**

```bash
git add src/app/api/telegram/client/
git commit -m "feat: handle feedback collection in client Telegram bot"
```

---

### Task 39: End-to-end integration test

**Step 1: Verify all database migrations are applied**

```bash
npx drizzle-kit push
```

**Step 2: Run seed to populate default data**

```bash
npx tsx src/db/seed.ts
```

**Step 3: Start dev server and verify**

```bash
npm run dev
```

Verify:
- All admin pages load without errors
- Vehicle classes CRUD works
- Drivers CRUD works
- Route prices matrix works
- AI settings save correctly
- Telegram settings save correctly
- Dashboard shows CRM stats
- Booking creation includes new fields

**Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix: integration fixes and verification"
```

---

## Summary

**Total Tasks:** 39
**Phases:**
1. Database Schema (Tasks 1-7)
2. Admin CRUD Pages (Tasks 8-20)
3. AI Chat Engine (Tasks 21-23)
4. WhatsApp Integration (Task 24)
5. Telegram Client Bot (Tasks 25-26)
6. Telegram Driver Bot (Task 27)
7. Cron Jobs (Tasks 28-32)
8. Admin Notifications (Task 33)
9. Integration & Polish (Tasks 34-39)

**New files:** ~30+
**Modified files:** ~10
**New npm packages:** openai, @anthropic-ai/sdk
