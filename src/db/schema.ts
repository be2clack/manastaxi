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
} from "drizzle-orm/pg-core";

export const bookingStatusEnum = pgEnum("booking_status", [
  "new",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
]);

export const userRoleEnum = pgEnum("user_role", ["admin", "manager"]);

// ============ USERS ============
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: userRoleEnum("role").default("admin").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
