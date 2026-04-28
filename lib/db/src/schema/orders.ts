import { pgTable, serial, text, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export type OrderStatus = "pending" | "confirmed" | "paid" | "shipped" | "completed" | "cancelled";

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  status: text("status").notNull().default("pending"),
  paymentMethod: text("payment_method").notNull(),
  stripeSessionId: text("stripe_session_id"),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull().default(""),
  deliveryAddress: jsonb("delivery_address").notNull().default({}),
  items: jsonb("items").notNull().default([]),
  subtotal: integer("subtotal").notNull(),
  vat: integer("vat").notNull(),
  total: integer("total").notNull(),
  discountCode: text("discount_code"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateOrderSchema = insertOrderSchema.partial();

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type UpdateOrder = z.infer<typeof updateOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
