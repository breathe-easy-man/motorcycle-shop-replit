import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { db, inquiriesTable, insertInquirySchema } from "@workspace/db";
import { requireAdmin } from "../middlewares/adminAuth";
import { sendInquiryAck, sendInquiryAdminAlert } from "../lib/email";

const router = Router();

router.get("/inquiries", requireAdmin, async (_req, res) => {
  try {
    const rows = await db.select().from(inquiriesTable).orderBy(desc(inquiriesTable.createdAt));
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch inquiries" });
  }
});

router.post("/inquiries", async (req, res) => {
  try {
    const parsed = insertInquirySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid data", details: parsed.error.issues });
      return;
    }
    const [inquiry] = await db.insert(inquiriesTable).values(parsed.data).returning();

    // Fire-and-forget emails
    void Promise.all([
      sendInquiryAck({
        customerName: inquiry.name,
        customerEmail: inquiry.email,
        customerPhone: inquiry.phone,
        subject: `Jautājums par: ${inquiry.productName}`,
        message: `Jautājums par produktu "${inquiry.productName}" (${inquiry.productSlug})`,
        productSlug: inquiry.productSlug,
      }),
      sendInquiryAdminAlert({
        customerName: inquiry.name,
        customerEmail: inquiry.email,
        customerPhone: inquiry.phone,
        subject: `Jautājums par: ${inquiry.productName}`,
        message: `Jautājums par produktu "${inquiry.productName}" (${inquiry.productSlug})`,
        productSlug: inquiry.productSlug,
      }),
    ]);

    res.status(201).json(inquiry);
  } catch {
    res.status(500).json({ error: "Failed to create inquiry" });
  }
});

router.patch("/inquiries/:id/read", requireAdmin, async (req, res) => {
  try {
    const [inquiry] = await db
      .update(inquiriesTable)
      .set({ read: true })
      .where(eq(inquiriesTable.id, Number(req.params.id)))
      .returning();
    if (!inquiry) { res.status(404).json({ error: "Inquiry not found" }); return; }
    res.json(inquiry);
  } catch {
    res.status(500).json({ error: "Failed to mark inquiry as read" });
  }
});

router.delete("/inquiries/:id", requireAdmin, async (req, res) => {
  try {
    const [deleted] = await db.delete(inquiriesTable).where(eq(inquiriesTable.id, Number(req.params.id))).returning();
    if (!deleted) { res.status(404).json({ error: "Inquiry not found" }); return; }
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete inquiry" });
  }
});

export default router;
