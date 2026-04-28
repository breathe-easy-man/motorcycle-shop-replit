import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { db, ordersTable, insertOrderSchema, updateOrderSchema } from "@workspace/db";
import { requireAdmin } from "../middlewares/adminAuth";

const router = Router();

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
    const parsed = insertOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid data", details: parsed.error.issues });
      return;
    }
    const [order] = await db.insert(ordersTable).values(parsed.data).returning();
    res.status(201).json(order);
  } catch {
    res.status(500).json({ error: "Failed to create order" });
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
