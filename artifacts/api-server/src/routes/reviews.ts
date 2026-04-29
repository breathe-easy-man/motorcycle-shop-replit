import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { db, reviewsTable, insertReviewSchema } from "@workspace/db";
import { requireAdmin } from "../middlewares/adminAuth";
import { sendReviewAdminAlert } from "../lib/email";

const router = Router();

router.get("/reviews", requireAdmin, async (_req, res) => {
  try {
    const rows = await db.select().from(reviewsTable).orderBy(desc(reviewsTable.createdAt));
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

router.get("/reviews/product/:slug", async (req, res) => {
  try {
    const rows = await db.select().from(reviewsTable)
      .where(eq(reviewsTable.productSlug, req.params.slug));
    res.json(rows.filter(r => r.approved));
  } catch {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

router.post("/reviews", async (req, res) => {
  try {
    const parsed = insertReviewSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid data", details: parsed.error.issues });
      return;
    }
    const [review] = await db.insert(reviewsTable).values(parsed.data).returning();

    // Notify admin for moderation (fire-and-forget)
    void sendReviewAdminAlert({
      reviewerName: review.name,
      productSlug: review.productSlug,
      rating: review.rating,
      comment: review.text ?? null,
    });

    res.status(201).json(review);
  } catch {
    res.status(500).json({ error: "Failed to create review" });
  }
});

router.patch("/reviews/:id/approve", requireAdmin, async (req, res) => {
  try {
    const [review] = await db
      .update(reviewsTable)
      .set({ approved: true })
      .where(eq(reviewsTable.id, Number(req.params.id)))
      .returning();
    if (!review) { res.status(404).json({ error: "Review not found" }); return; }
    res.json(review);
  } catch {
    res.status(500).json({ error: "Failed to approve review" });
  }
});

router.delete("/reviews/:id", requireAdmin, async (req, res) => {
  try {
    const [deleted] = await db.delete(reviewsTable).where(eq(reviewsTable.id, Number(req.params.id))).returning();
    if (!deleted) { res.status(404).json({ error: "Review not found" }); return; }
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete review" });
  }
});

export default router;
