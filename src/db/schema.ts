import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  serial,
  varchar,
  decimal,
  pgEnum,
  jsonb,
  uniqueIndex,
  unique,
} from "drizzle-orm/pg-core";

// ============ ENUMS ============
export const bookingStatusEnum = pgEnum("booking_status", [
  "new",
  "confirmed",
  "driver_search",
  "assigned",
  "in_progress",
  "completed",
  "cancelled",
]);

export const userRoleEnum = pgEnum("user_role", ["admin", "manager"]);

export const channelEnum = pgEnum("channel", ["whatsapp", "telegram"]);

export const bookingChannelEnum = pgEnum("booking_channel", [
  "website",
  "whatsapp",
  "telegram",
  "manual",
]);

export const conversationStatusEnum = pgEnum("conversation_status", [
  "active",
  "completed",
  "archived",
]);

export const messageRoleEnum = pgEnum("message_role", [
  "client",
  "bot",
  "manager",
]);

export const orderEventEnum = pgEnum("order_event", [
  "created",
  "confirmed",
  "driver_search",
  "assigned",
  "driver_accepted",
  "force_majeure",
  "reassigned",
  "completed",
  "feedback_received",
  "cancelled",
]);

export const aiProviderEnum = pgEnum("ai_provider", ["openai", "anthropic"]);

export const telegramBotTypeEnum = pgEnum("telegram_bot_type", [
  "client",
  "driver",
  "admin",
]);

// ============ USERS ============
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: userRoleEnum("role").default("admin").notNull(),
  telegramChatId: varchar("telegram_chat_id", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============ VEHICLE CLASSES ============
export const vehicleClasses = pgTable("vehicle_classes", {
  id: serial("id").primaryKey(),
  name: jsonb("name").notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: jsonb("description"),
  maxPassengers: integer("max_passengers").default(4),
  maxLuggage: integer("max_luggage").default(3),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============ ROUTES ============
export const routes = pgTable("routes", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  fromLocation: varchar("from_location", { length: 500 }).notNull(),
  toLocation: varchar("to_location", { length: 500 }).notNull(),
  distanceKm: integer("distance_km").notNull(),
  durationMin: integer("duration_min").notNull(),
  priceSom: integer("price_som").notNull(),
  priceUsd: integer("price_usd").notNull(),
  isPopular: boolean("is_popular").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============ ROUTE PRICES ============
export const routePrices = pgTable(
  "route_prices",
  {
    id: serial("id").primaryKey(),
    routeId: integer("route_id")
      .references(() => routes.id, { onDelete: "cascade" })
      .notNull(),
    vehicleClassId: integer("vehicle_class_id")
      .references(() => vehicleClasses.id, { onDelete: "cascade" })
      .notNull(),
    priceSom: decimal("price_som", { precision: 10, scale: 2 }).notNull(),
    priceUsd: decimal("price_usd", { precision: 10, scale: 2 }).notNull(),
  },
  (table) => ({
    routeVehicleUnique: unique("route_vehicle_unique").on(
      table.routeId,
      table.vehicleClassId,
    ),
  }),
);

// ============ DRIVERS ============
export const drivers = pgTable("drivers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull().unique(),
  vehicleClassId: integer("vehicle_class_id")
    .references(() => vehicleClasses.id)
    .notNull(),
  vehicleMake: varchar("vehicle_make", { length: 255 }).notNull(),
  vehiclePlate: varchar("vehicle_plate", { length: 50 }).notNull(),
  telegramChatId: varchar("telegram_chat_id", { length: 100 }),
  isActive: boolean("is_active").default(true),
  hasActiveOrder: boolean("has_active_order").default(false),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("5.00"),
  totalTrips: integer("total_trips").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============ BOOKINGS ============
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  email: varchar("email", { length: 255 }),
  flightNumber: varchar("flight_number", { length: 50 }),
  routeId: integer("route_id").references(() => routes.id),
  customDestination: varchar("custom_destination", { length: 500 }),
  pickupDate: varchar("pickup_date", { length: 20 }).notNull(),
  pickupTime: varchar("pickup_time", { length: 10 }),
  passengers: integer("passengers").default(1).notNull(),
  luggage: integer("luggage").default(1).notNull(),
  status: bookingStatusEnum("status").default("new").notNull(),
  notes: text("notes"),
  source: varchar("source", { length: 50 }).default("website"),
  vehicleClassId: integer("vehicle_class_id").references(
    () => vehicleClasses.id,
  ),
  driverId: integer("driver_id").references(() => drivers.id),
  needsSign: boolean("needs_sign").default(false),
  signText: varchar("sign_text", { length: 255 }),
  scheduledAt: timestamp("scheduled_at"),
  totalPriceSom: decimal("total_price_som", { precision: 10, scale: 2 }),
  totalPriceUsd: decimal("total_price_usd", { precision: 10, scale: 2 }),
  channel: bookingChannelEnum("channel").default("website"),
  language: varchar("language", { length: 10 }),
  clientCountry: varchar("client_country", { length: 10 }),
  isUrgent: boolean("is_urgent").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============ TOURS ============
export const tours = pgTable("tours", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  durationDays: integer("duration_days").notNull(),
  priceUsd: integer("price_usd").notNull(),
  priceSom: integer("price_som").notNull(),
  maxGroup: integer("max_group").default(10).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  imageUrl: varchar("image_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============ SERVICES ============
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  priceUsd: decimal("price_usd", { precision: 10, scale: 2 }),
  priceSom: decimal("price_som", { precision: 10, scale: 2 }),
  iconName: varchar("icon_name", { length: 100 }),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============ SETTINGS ============
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 255 }).notNull().unique(),
  value: text("value").notNull(),
});

// ============ SEO META ============
export const seoMeta = pgTable("seo_meta", {
  id: serial("id").primaryKey(),
  pageSlug: varchar("page_slug", { length: 255 }).notNull(),
  locale: varchar("locale", { length: 10 }).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description").notNull(),
  keywords: text("keywords"),
  ogImage: varchar("og_image", { length: 500 }),
});

// ============ CONTACT MESSAGES ============
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

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
  status: conversationStatusEnum("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============ MESSAGES ============
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id")
    .references(() => conversations.id, { onDelete: "cascade" })
    .notNull(),
  role: messageRoleEnum("role").notNull(),
  content: text("content").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============ ORDER EVENTS ============
export const orderEvents = pgTable("order_events", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id")
    .references(() => bookings.id, { onDelete: "cascade" })
    .notNull(),
  event: orderEventEnum("event").notNull(),
  driverId: integer("driver_id").references(() => drivers.id),
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============ FEEDBACK ============
export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id")
    .references(() => bookings.id)
    .notNull()
    .unique(),
  driverId: integer("driver_id")
    .references(() => drivers.id)
    .notNull(),
  ratingDriver: integer("rating_driver").notNull(),
  ratingVehicle: integer("rating_vehicle").notNull(),
  comment: text("comment"),
  language: varchar("language", { length: 10 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// ============ AI SETTINGS ============
export const aiSettings = pgTable("ai_settings", {
  id: serial("id").primaryKey(),
  provider: aiProviderEnum("provider").notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  apiKey: varchar("api_key", { length: 500 }).notNull(),
  systemPrompt: text("system_prompt").notNull(),
  temperature: decimal("temperature", { precision: 3, scale: 2 }).default(
    "0.70",
  ),
  isActive: boolean("is_active").default(false),
});

// ============ TELEGRAM BOT SETTINGS ============
export const telegramBotSettings = pgTable("telegram_bot_settings", {
  id: serial("id").primaryKey(),
  botType: telegramBotTypeEnum("bot_type").notNull().unique(),
  token: varchar("token", { length: 500 }).notNull(),
  webhookUrl: varchar("webhook_url", { length: 500 }),
  isActive: boolean("is_active").default(false),
});
