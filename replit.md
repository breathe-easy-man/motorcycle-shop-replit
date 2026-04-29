# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Mobilus Website

Premium rebuild of mobilus.lv — Latvian retailer of scooters, motorcycles, ATVs, bicycles, skates, winter sports.

### Color Scheme
Light theme inspired by K-moto (kmoto.lv):
- Background: off-white `210 17% 97%`
- Foreground: dark charcoal `220 25% 12%`
- Card: pure white `0 0% 100%`
- Primary: warm amber-orange `22 82% 50%` (not aggressive red)
- Footer: explicit dark gray `bg-gray-900` for contrast

### Key Architecture Notes
- Admin key: `ADMIN_SECRET=mobilus-admin-2024`
- DB push: `cd lib/db && pnpm run push`
- Product routes: `/moto/:slug`, `/velo/:slug`, `/skates/:slug`, `/winter/:slug`
- Admin route: `/admin` (requires key stored in localStorage)
- DB tables: `products`, `product_variants`, `reviews`, `inquiries`, `locations`, `delivery_options`, `product_location_stock`
- Review moderation: admin must approve before showing on product page
- Inquiry tracking: read/unread flag, admin can delete
- Availability system: per-product stock entries per location/delivery option; product page shows live totalStock + collapsible Pieejams veikalā / Piegāde accordions with estimated dates
- Seed script: `cd artifacts/api-server && pnpm exec tsx src/scripts/seed-locations.ts`
- Admin "Pieejamība" tab: manage store locations + delivery options CRUD
- Admin product editor "Stock" tab: add/remove per-product stock entries (edit mode only)

## Email Notifications (Resend)

Powered by Resend via Replit connector. All emails fire-and-forget (never block API responses).

### Triggers
| Event | Recipient | Function |
|---|---|---|
| POST /orders | Customer confirmation | `sendOrderConfirmation` |
| POST /orders | Admin alert | `sendOrderAdminAlert` |
| PATCH /orders/:id (status change) | Customer update | `sendOrderStatusUpdate` |
| Stripe webhook paid | Customer receipt | `sendStripePaymentReceipt` |
| POST /inquiries (product) | Customer ACK | `sendInquiryAck` |
| POST /inquiries (product) | Admin alert | `sendInquiryAdminAlert` |
| POST /contact (general form) | Customer ACK | `sendInquiryAck` |
| POST /contact (general form) | Admin alert | `sendInquiryAdminAlert` |
| POST /reviews | Admin moderation alert | `sendReviewAdminAlert` |

### Files
- `artifacts/api-server/src/lib/email.ts` — email service (Resend client + all HTML templates)
- `artifacts/api-server/src/routes/contact.ts` — new `/api/contact` endpoint
- `artifacts/mobilus-website/src/pages/contact.tsx` — wired to POST /api/contact

### Config
- `ADMIN_EMAIL` env var — where admin alerts go (default: `admin@mobilus.lv`)
- From address: configured in Resend integration settings (`from_email` field)
