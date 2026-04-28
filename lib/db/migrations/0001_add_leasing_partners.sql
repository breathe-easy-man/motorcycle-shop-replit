-- Incremental migration: add leasing_partners table
-- Run this on existing deployments to add the leasing partners feature.

CREATE TABLE IF NOT EXISTS "leasing_partners" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "logo_url" text,
  "interest_rate" numeric(5, 2) DEFAULT '8.90' NOT NULL,
  "info_text" text DEFAULT '' NOT NULL,
  "display_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
