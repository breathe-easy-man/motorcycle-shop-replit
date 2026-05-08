import { pgTable, serial, text, integer, jsonb, timestamp, boolean, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const categoriesTable = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  parentId: integer("parent_id"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCategorySchema = createInsertSchema(categoriesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateCategorySchema = insertCategorySchema.partial();

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type UpdateCategory = z.infer<typeof updateCategorySchema>;
export type Category = typeof categoriesTable.$inferSelect;

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  oldPrice: integer("old_price"),
  category: text("category").notNull(),
  categoryId: integer("category_id").references(() => categoriesTable.id, { onDelete: "set null" }),
  engine: text("engine").notNull(),
  image: text("image").notNull(),
  badge: text("badge"),
  stock: integer("stock").notNull().default(0),
  featured: boolean("featured").notNull().default(false),
  descriptionLv: text("description_lv").notNull().default(""),
  descriptionEn: text("description_en").notNull().default(""),
  descriptionRu: text("description_ru").notNull().default(""),
  specs: jsonb("specs").notNull().default([]),
  manufacturerLogoUrl: text("manufacturer_logo_url"),
  manufacturerYoutubeId: text("manufacturer_youtube_id"),
  manufacturerDescLv: text("manufacturer_desc_lv"),
  manufacturerDescEn: text("manufacturer_desc_en"),
  manufacturerDescRu: text("manufacturer_desc_ru"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateProductSchema = insertProductSchema.partial();

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;
export type Product = typeof productsTable.$inferSelect;

export const productVariantsTable = pgTable("product_variants", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => productsTable.id, { onDelete: "cascade" }),
  colorName: text("color_name").notNull(),
  colorHex: text("color_hex"),
  image: text("image").notNull(),
  stock: integer("stock").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProductVariantSchema = createInsertSchema(productVariantsTable).omit({
  id: true,
  createdAt: true,
});

export const updateProductVariantSchema = insertProductVariantSchema.partial();

export type InsertProductVariant = z.infer<typeof insertProductVariantSchema>;
export type UpdateProductVariant = z.infer<typeof updateProductVariantSchema>;
export type ProductVariant = typeof productVariantsTable.$inferSelect;

export const reviewsTable = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  productSlug: text("product_slug").notNull(),
  name: text("name").notNull(),
  rating: integer("rating").notNull().default(5),
  text: text("text").notNull(),
  approved: boolean("approved").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertReviewSchema = createInsertSchema(reviewsTable).omit({
  id: true,
  approved: true,
  createdAt: true,
});

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviewsTable.$inferSelect;

export const inquiriesTable = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  productSlug: text("product_slug").notNull(),
  productName: text("product_name").notNull(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertInquirySchema = createInsertSchema(inquiriesTable).omit({
  id: true,
  read: true,
  createdAt: true,
});

export type InsertInquiry = z.infer<typeof insertInquirySchema>;
export type Inquiry = typeof inquiriesTable.$inferSelect;

export const locationsTable = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  workHours: text("work_hours").notNull().default(""),
  contacts: jsonb("contacts").notNull().default({}),
  leadTimeDays: integer("lead_time_days").notNull().default(1),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertLocationSchema = createInsertSchema(locationsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateLocationSchema = insertLocationSchema.partial();

export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type UpdateLocation = z.infer<typeof updateLocationSchema>;
export type Location = typeof locationsTable.$inferSelect;

export const deliveryOptionsTable = pgTable("delivery_options", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  priceMin: integer("price_min").notNull().default(0),
  priceMax: integer("price_max").notNull().default(0),
  leadTimeDays: integer("lead_time_days").notNull().default(3),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDeliveryOptionSchema = createInsertSchema(deliveryOptionsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateDeliveryOptionSchema = insertDeliveryOptionSchema.partial();

export type InsertDeliveryOption = z.infer<typeof insertDeliveryOptionSchema>;
export type UpdateDeliveryOption = z.infer<typeof updateDeliveryOptionSchema>;
export type DeliveryOption = typeof deliveryOptionsTable.$inferSelect;

export const leasingPartnersTable = pgTable("leasing_partners", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  logoUrl: text("logo_url"),
  interestRate: numeric("interest_rate", { precision: 5, scale: 2 }).notNull().default("8.90"),
  infoText: text("info_text").notNull().default(""),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertLeasingPartnerSchema = createInsertSchema(leasingPartnersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateLeasingPartnerSchema = insertLeasingPartnerSchema.partial();

export type InsertLeasingPartner = z.infer<typeof insertLeasingPartnerSchema>;
export type UpdateLeasingPartner = z.infer<typeof updateLeasingPartnerSchema>;
export type LeasingPartner = typeof leasingPartnersTable.$inferSelect;

export const productLocationStockTable = pgTable("product_location_stock", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => productsTable.id, { onDelete: "cascade" }),
  variantId: integer("variant_id").references(() => productVariantsTable.id, { onDelete: "set null" }),
  locationId: integer("location_id").references(() => locationsTable.id, { onDelete: "cascade" }),
  deliveryOptionId: integer("delivery_option_id").references(() => deliveryOptionsTable.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(0),
  serialNumber: text("serial_number"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertProductLocationStockSchema = createInsertSchema(productLocationStockTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateProductLocationStockSchema = insertProductLocationStockSchema.partial();

export type InsertProductLocationStock = z.infer<typeof insertProductLocationStockSchema>;
export type UpdateProductLocationStock = z.infer<typeof updateProductLocationStockSchema>;
export type ProductLocationStock = typeof productLocationStockTable.$inferSelect;

export const settingsTable = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Setting = typeof settingsTable.$inferSelect;
