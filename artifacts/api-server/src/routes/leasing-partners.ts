import { Router } from "express";
import { asc, eq } from "drizzle-orm";
import { db, leasingPartnersTable } from "@workspace/db";
import { requireAdmin } from "../middlewares/adminAuth";

const router = Router();

router.get("/leasing-partners", async (_req, res) => {
  try {
    const rows = await db
      .select()
      .from(leasingPartnersTable)
      .orderBy(asc(leasingPartnersTable.displayOrder), asc(leasingPartnersTable.id));
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch leasing partners" });
  }
});

router.post("/leasing-partners", requireAdmin, async (req, res) => {
  try {
    const { name, logoUrl, interestRate, infoText, displayOrder } = req.body as Record<string, unknown>;
    if (!name || typeof name !== "string") {
      res.status(400).json({ error: "name is required" });
      return;
    }
    const [row] = await db.insert(leasingPartnersTable).values({
      name: String(name),
      logoUrl: logoUrl ? String(logoUrl) : null,
      interestRate: interestRate !== undefined ? String(interestRate) : "8.9",
      infoText: infoText ? String(infoText) : "",
      displayOrder: displayOrder !== undefined ? Number(displayOrder) : 0,
    }).returning();
    res.status(201).json(row);
  } catch {
    res.status(500).json({ error: "Failed to create leasing partner" });
  }
});

router.patch("/leasing-partners/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, logoUrl, interestRate, infoText, displayOrder } = req.body as Record<string, unknown>;
    const update: Partial<typeof leasingPartnersTable.$inferInsert> = {};
    if (name !== undefined) update.name = String(name);
    if (logoUrl !== undefined) update.logoUrl = logoUrl ? String(logoUrl) : null;
    if (interestRate !== undefined) update.interestRate = String(interestRate);
    if (infoText !== undefined) update.infoText = String(infoText);
    if (displayOrder !== undefined) update.displayOrder = Number(displayOrder);
    update.updatedAt = new Date();
    const [row] = await db.update(leasingPartnersTable).set(update).where(eq(leasingPartnersTable.id, id)).returning();
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json(row);
  } catch {
    res.status(500).json({ error: "Failed to update leasing partner" });
  }
});

router.delete("/leasing-partners/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [deleted] = await db.delete(leasingPartnersTable).where(eq(leasingPartnersTable.id, id)).returning();
    if (!deleted) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete leasing partner" });
  }
});

export default router;
