CREATE TABLE "delivery_options" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"price_min" integer DEFAULT 0 NOT NULL,
	"price_max" integer DEFAULT 0 NOT NULL,
	"lead_time_days" integer DEFAULT 3 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inquiries" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"product_slug" text NOT NULL,
	"product_name" text NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leasing_partners" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"logo_url" text,
	"interest_rate" numeric(5, 2) DEFAULT '8.90' NOT NULL,
	"info_text" text DEFAULT '' NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"work_hours" text DEFAULT '' NOT NULL,
	"contacts" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"lead_time_days" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_location_stock" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"variant_id" integer,
	"location_id" integer,
	"delivery_option_id" integer,
	"quantity" integer DEFAULT 0 NOT NULL,
	"serial_number" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_variants" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"color_name" text NOT NULL,
	"color_hex" text,
	"image" text NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"price" integer NOT NULL,
	"old_price" integer,
	"category" text NOT NULL,
	"engine" text NOT NULL,
	"image" text NOT NULL,
	"badge" text,
	"stock" integer DEFAULT 0 NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"description_lv" text DEFAULT '' NOT NULL,
	"description_en" text DEFAULT '' NOT NULL,
	"description_ru" text DEFAULT '' NOT NULL,
	"specs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"manufacturer_logo_url" text,
	"manufacturer_youtube_id" text,
	"manufacturer_desc_lv" text,
	"manufacturer_desc_en" text,
	"manufacturer_desc_ru" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"product_slug" text NOT NULL,
	"name" text NOT NULL,
	"rating" integer DEFAULT 5 NOT NULL,
	"text" text NOT NULL,
	"approved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"payment_method" text NOT NULL,
	"stripe_session_id" text,
	"customer_name" text NOT NULL,
	"customer_email" text NOT NULL,
	"customer_phone" text DEFAULT '' NOT NULL,
	"delivery_address" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"items" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"subtotal" integer NOT NULL,
	"vat" integer NOT NULL,
	"total" integer NOT NULL,
	"discount_code" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "product_location_stock" ADD CONSTRAINT "product_location_stock_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_location_stock" ADD CONSTRAINT "product_location_stock_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_location_stock" ADD CONSTRAINT "product_location_stock_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_location_stock" ADD CONSTRAINT "product_location_stock_delivery_option_id_delivery_options_id_fk" FOREIGN KEY ("delivery_option_id") REFERENCES "public"."delivery_options"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;