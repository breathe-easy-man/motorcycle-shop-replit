import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { db, ordersTable, productsTable, updateOrderSchema } from "@workspace/db";
import { requireAdmin } from "../middlewares/adminAuth";

const router = Router();

const VALID_PAYMENT_METHODS = new Set(["card", "bank", "cash", "inbank"]);
const VAT_RATE = 0.21;

interface CreateOrderItem {
  productId: number;
  slug: string;
  name: string;
  image?: string;
  quantity: number;
  sku?: string;
  colorName?: string;
}

interface CreateOrderBody {
  paymentMethod: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  deliveryAddress: Record<string, unknown>;
  items: CreateOrderItem[];
  discountCode?: string | null;
  giftCode?: string | null;
  notes?: string | null;
}

function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function validateCreateOrder(body: unknown): { data: CreateOrderBody } | { error: string } {
  const b = body as Record<string, unknown>;
  if (!b || typeof b !== "object") return { error: "Invalid request body" };
  if (typeof b["customerName"] !== "string" || !b["customerName"].trim()) return { error: "customerName is required" };
  if (typeof b["customerEmail"] !== "string" || !isEmail(b["customerEmail"])) return { error: "Valid customerEmail is required" };
  if (!VALID_PAYMENT_METHODS.has(b["paymentMethod"] as string)) return { error: "Invalid paymentMethod" };
  if (!Array.isArray(b["items"]) || b["items"].length === 0) return { error: "items must be a non-empty array" };
  for (const item of b["items"] as unknown[]) {
    const it = item as Record<string, unknown>;
    if (!Number.isInteger(it["productId"]) || (it["productId"] as number) <= 0) return { error: "Each item must have a valid productId" };
    if (!Number.isInteger(it["quantity"]) || (it["quantity"] as number) < 1) return { error: "Each item must have quantity >= 1" };
  }
  return {
    data: {
      paymentMethod: b["paymentMethod"] as string,
      customerName: (b["customerName"] as string).trim(),
      customerEmail: b["customerEmail"] as string,
      customerPhone: typeof b["customerPhone"] === "string" ? b["customerPhone"] : "",
      deliveryAddress: (b["deliveryAddress"] as Record<string, unknown>) ?? {},
      items: (b["items"] as CreateOrderItem[]).map((i) => ({
        productId: Number(i.productId),
        slug: String(i.slug ?? ""),
        name: String(i.name ?? ""),
        image: String(i.image ?? ""),
        quantity: Number(i.quantity),
        sku: String(i.sku ?? ""),
        colorName: i.colorName ? String(i.colorName) : undefined,
      })),
      discountCode: typeof b["discountCode"] === "string" ? b["discountCode"] : null,
      notes: typeof b["notes"] === "string" ? b["notes"] : null,
    },
  };
}

router.get("/orders", requireAdmin, async (_req, res) => {
  try {
    const rows = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt));
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

router.post("/orders", async (req, res) => {
  try {
    const validated = validateCreateOrder(req.body);
    if ("error" in validated) {
      res.status(400).json({ error: validated.error });
      return;
    }
    const { items: clientItems, paymentMethod, customerName, customerEmail, customerPhone, deliveryAddress, discountCode, notes } = validated.data;

    const productIds = [...new Set(clientItems.map((i) => i.productId))];

    const allDbProducts: { id: number; price: number }[] = [];
    for (const pid of productIds) {
      const [p] = await db
        .select({ id: productsTable.id, price: productsTable.price })
        .from(productsTable)
        .where(eq(productsTable.id, pid));
      if (p) allDbProducts.push(p);
    }

    const priceMap = new Map(allDbProducts.map((p) => [p.id, p.price]));

    const enrichedItems = clientItems.map((i) => {
      const authorativePrice = priceMap.get(i.productId);
      if (authorativePrice === undefined) {
        throw new Error(`Product ${i.productId} not found`);
      }
      return { ...i, price: authorativePrice };
    });

    const subtotalExcl = Math.round(
      enrichedItems.reduce((acc, i) => acc + i.price * i.quantity, 0) / (1 + VAT_RATE)
    );
    const vatAmount = Math.round(subtotalExcl * VAT_RATE);
    const totalAmount = subtotalExcl + vatAmount;

    const [order] = await db.insert(ordersTable).values({
      status: "pending",
      paymentMethod,
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      items: enrichedItems,
      subtotal: subtotalExcl,
      vat: vatAmount,
      total: totalAmount,
      discountCode: discountCode ?? null,
      notes: notes ?? null,
    }).returning();
    res.status(201).json(order);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create order";
    res.status(500).json({ error: msg });
  }
});

router.get("/orders/:id", requireAdmin, async (req, res) => {
  try {
    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, Number(req.params.id)));
    if (!order) { res.status(404).json({ error: "Order not found" }); return; }
    res.json(order);
  } catch {
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

router.patch("/orders/:id", requireAdmin, async (req, res) => {
  try {
    const parsed = updateOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid data", details: parsed.error.issues });
      return;
    }
    const [order] = await db
      .update(ordersTable)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(ordersTable.id, Number(req.params.id)))
      .returning();
    if (!order) { res.status(404).json({ error: "Order not found" }); return; }
    res.json(order);
  } catch {
    res.status(500).json({ error: "Failed to update order" });
  }
});

router.post("/orders/stripe-session", async (req, res) => {
  const stripeKey = process.env["STRIPE_SECRET_KEY"];
  if (!stripeKey) {
    res.status(503).json({ error: "Stripe is not configured" });
    return;
  }
  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(stripeKey);
    const { items, customerEmail, orderId, successUrl, cancelUrl } = req.body as {
      items: { name: string; price: number; quantity: number; image?: string }[];
      customerEmail: string;
      orderId: number;
      successUrl: string;
      cancelUrl: string;
    };

    const lineItems = items.map((item) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: item.name,
          ...(item.image ? { images: [item.image] } : {}),
        },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      customer_email: customerEmail,
      success_url: successUrl + `?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url: cancelUrl + `?order_id=${orderId}`,
      metadata: { orderId: String(orderId) },
    });

    if (orderId) {
      await db.update(ordersTable).set({ stripeSessionId: session.id }).where(eq(ordersTable.id, orderId));
    }

    res.json({ url: session.url, sessionId: session.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to create Stripe session" });
  }
});

router.post("/orders/stripe-webhook", async (req, res) => {
  const stripeKey = process.env["STRIPE_SECRET_KEY"];
  const webhookSecret = process.env["STRIPE_WEBHOOK_SECRET"];
  if (!stripeKey) { res.status(503).json({ error: "Stripe not configured" }); return; }

  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(stripeKey);

  const rawBody: Buffer = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body));
  const sig = req.headers["stripe-signature"] as string | undefined;

  let event: import("stripe").Stripe.Event;

  if (webhookSecret) {
    if (!sig) {
      res.status(400).json({ error: "Missing stripe-signature header" });
      return;
    }
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch {
      res.status(400).json({ error: "Webhook signature verification failed" });
      return;
    }
  } else if (process.env["NODE_ENV"] === "production") {
    res.status(400).json({ error: "STRIPE_WEBHOOK_SECRET is required in production" });
    return;
  } else {
    try {
      event = JSON.parse(rawBody.toString()) as import("stripe").Stripe.Event;
    } catch {
      res.status(400).json({ error: "Invalid JSON body" });
      return;
    }
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as import("stripe").Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      if (orderId) {
        await db.update(ordersTable).set({ status: "paid", updatedAt: new Date() }).where(eq(ordersTable.id, Number(orderId)));
      }
    }
    res.json({ received: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    res.status(500).json({ error: msg });
  }
});

export default router;
