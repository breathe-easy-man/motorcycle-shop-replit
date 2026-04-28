import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, locationsTable, deliveryOptionsTable } from "@workspace/db";
import { requireAdmin } from "../middlewares/adminAuth";

const router = Router();

router.get("/locations", async (_req, res) => {
  try {
    const rows = await db.select().from(locationsTable).orderBy(locationsTable.id);
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch locations" });
  }
});

router.post("/locations", requireAdmin, async (req, res) => {
  try {
    const { name, address, workHours, contacts, leadTimeDays, isActive } = req.body as Record<string, unknown>;
    if (!name || !address) {
      res.status(400).json({ error: "name and address are required" });
      return;
    }
    const [loc] = await db.insert(locationsTable).values({
      name: String(name),
      address: String(address),
      workHours: workHours ? String(workHours) : "",
      contacts: (contacts as Record<string, string>) ?? {},
      leadTimeDays: Number(leadTimeDays ?? 1),
      isActive: isActive !== false,
    }).returning();
    res.status(201).json(loc);
  } catch {
    res.status(500).json({ error: "Failed to create location" });
  }
});

router.patch("/locations/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, address, workHours, contacts, leadTimeDays, isActive } = req.body as Record<string, unknown>;
    const update: Record<string, unknown> = { updatedAt: new Date() };
    if (name !== undefined) update["name"] = String(name);
    if (address !== undefined) update["address"] = String(address);
    if (workHours !== undefined) update["workHours"] = String(workHours);
    if (contacts !== undefined) update["contacts"] = contacts;
    if (leadTimeDays !== undefined) update["leadTimeDays"] = Number(leadTimeDays);
    if (isActive !== undefined) update["isActive"] = Boolean(isActive);
    const [loc] = await db.update(locationsTable).set(update).where(eq(locationsTable.id, id)).returning();
    if (!loc) { res.status(404).json({ error: "Location not found" }); return; }
    res.json(loc);
  } catch {
    res.status(500).json({ error: "Failed to update location" });
  }
});

router.delete("/locations/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [deleted] = await db.delete(locationsTable).where(eq(locationsTable.id, id)).returning();
    if (!deleted) { res.status(404).json({ error: "Location not found" }); return; }
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete location" });
  }
});

router.get("/delivery-options", async (_req, res) => {
  try {
    const rows = await db.select().from(deliveryOptionsTable).orderBy(deliveryOptionsTable.id);
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch delivery options" });
  }
});

router.post("/delivery-options", requireAdmin, async (req, res) => {
  try {
    const { name, priceMin, priceMax, leadTimeDays, isActive } = req.body as Record<string, unknown>;
    if (!name) {
      res.status(400).json({ error: "name is required" });
      return;
    }
    const [opt] = await db.insert(deliveryOptionsTable).values({
      name: String(name),
      priceMin: Number(priceMin ?? 0),
      priceMax: Number(priceMax ?? 0),
      leadTimeDays: Number(leadTimeDays ?? 3),
      isActive: isActive !== false,
    }).returning();
    res.status(201).json(opt);
  } catch {
    res.status(500).json({ error: "Failed to create delivery option" });
  }
});

router.patch("/delivery-options/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, priceMin, priceMax, leadTimeDays, isActive } = req.body as Record<string, unknown>;
    const update: Record<string, unknown> = { updatedAt: new Date() };
    if (name !== undefined) update["name"] = String(name);
    if (priceMin !== undefined) update["priceMin"] = Number(priceMin);
    if (priceMax !== undefined) update["priceMax"] = Number(priceMax);
    if (leadTimeDays !== undefined) update["leadTimeDays"] = Number(leadTimeDays);
    if (isActive !== undefined) update["isActive"] = Boolean(isActive);
    const [opt] = await db.update(deliveryOptionsTable).set(update).where(eq(deliveryOptionsTable.id, id)).returning();
    if (!opt) { res.status(404).json({ error: "Delivery option not found" }); return; }
    res.json(opt);
  } catch {
    res.status(500).json({ error: "Failed to update delivery option" });
  }
});

router.delete("/delivery-options/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [deleted] = await db.delete(deliveryOptionsTable).where(eq(deliveryOptionsTable.id, id)).returning();
    if (!deleted) { res.status(404).json({ error: "Delivery option not found" }); return; }
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete delivery option" });
  }
});

export default router;
