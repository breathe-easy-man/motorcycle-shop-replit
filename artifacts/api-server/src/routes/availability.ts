import { Router } from "express";
import { eq, sql } from "drizzle-orm";
import {
  db,
  productLocationStockTable,
  locationsTable,
  deliveryOptionsTable,
  productVariantsTable,
  productsTable,
} from "@workspace/db";
import { requireAdmin } from "../middlewares/adminAuth";

const router = Router();

async function fetchAvailabilityEntries(productId: number) {
  return db
    .select({
      id: productLocationStockTable.id,
      productId: productLocationStockTable.productId,
      variantId: productLocationStockTable.variantId,
      locationId: productLocationStockTable.locationId,
      deliveryOptionId: productLocationStockTable.deliveryOptionId,
      quantity: productLocationStockTable.quantity,
      serialNumber: productLocationStockTable.serialNumber,
      locationName: locationsTable.name,
      locationAddress: locationsTable.address,
      locationLeadTimeDays: locationsTable.leadTimeDays,
      locationIsActive: locationsTable.isActive,
      deliveryName: deliveryOptionsTable.name,
      deliveryPriceMin: deliveryOptionsTable.priceMin,
      deliveryPriceMax: deliveryOptionsTable.priceMax,
      deliveryLeadTimeDays: deliveryOptionsTable.leadTimeDays,
      deliveryIsActive: deliveryOptionsTable.isActive,
      variantColorName: productVariantsTable.colorName,
    })
    .from(productLocationStockTable)
    .leftJoin(locationsTable, eq(productLocationStockTable.locationId, locationsTable.id))
    .leftJoin(deliveryOptionsTable, eq(productLocationStockTable.deliveryOptionId, deliveryOptionsTable.id))
    .leftJoin(productVariantsTable, eq(productLocationStockTable.variantId, productVariantsTable.id))
    .where(eq(productLocationStockTable.productId, productId));
}

router.get("/products/:id/availability", async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const [product] = await db.select({ id: productsTable.id }).from(productsTable).where(eq(productsTable.id, productId));
    if (!product) { res.status(404).json({ error: "Product not found" }); return; }

    const rawEntries = await fetchAvailabilityEntries(productId);
    // Public response excludes serialNumber
    const entries = rawEntries.map(({ serialNumber: _sn, ...rest }) => rest);

    const totalStockRow = await db
      .select({ total: sql<number>`coalesce(sum(${productLocationStockTable.quantity}), 0)` })
      .from(productLocationStockTable)
      .where(eq(productLocationStockTable.productId, productId));

    const totalStock = Number(totalStockRow[0]?.total ?? 0);

    res.json({ entries, totalStock });
  } catch {
    res.status(500).json({ error: "Failed to fetch availability" });
  }
});

// Admin endpoint — includes serialNumber, requires admin key
router.get("/products/:id/availability/admin", requireAdmin, async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const [product] = await db.select({ id: productsTable.id }).from(productsTable).where(eq(productsTable.id, productId));
    if (!product) { res.status(404).json({ error: "Product not found" }); return; }

    const entries = await fetchAvailabilityEntries(productId);

    const totalStockRow = await db
      .select({ total: sql<number>`coalesce(sum(${productLocationStockTable.quantity}), 0)` })
      .from(productLocationStockTable)
      .where(eq(productLocationStockTable.productId, productId));

    const totalStock = Number(totalStockRow[0]?.total ?? 0);

    res.json({ entries, totalStock });
  } catch {
    res.status(500).json({ error: "Failed to fetch admin availability" });
  }
});

router.post("/products/:id/availability", requireAdmin, async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const [product] = await db.select({ id: productsTable.id }).from(productsTable).where(eq(productsTable.id, productId));
    if (!product) { res.status(404).json({ error: "Product not found" }); return; }

    const { variantId, locationId, deliveryOptionId, quantity, serialNumber } = req.body as Record<string, unknown>;

    if (locationId === undefined && deliveryOptionId === undefined) {
      res.status(400).json({ error: "Either locationId or deliveryOptionId is required" });
      return;
    }
    if (typeof quantity !== "number" || quantity < 0) {
      res.status(400).json({ error: "quantity must be a non-negative number" });
      return;
    }

    const [entry] = await db.insert(productLocationStockTable).values({
      productId,
      variantId: variantId != null ? Number(variantId) : null,
      locationId: locationId != null ? Number(locationId) : null,
      deliveryOptionId: deliveryOptionId != null ? Number(deliveryOptionId) : null,
      quantity: Number(quantity),
      serialNumber: serialNumber ? String(serialNumber) : null,
    }).returning();

    res.status(201).json(entry);
  } catch {
    res.status(500).json({ error: "Failed to create availability entry" });
  }
});

router.delete("/availability/:entryId", requireAdmin, async (req, res) => {
  try {
    const entryId = Number(req.params.entryId);
    const [deleted] = await db
      .delete(productLocationStockTable)
      .where(eq(productLocationStockTable.id, entryId))
      .returning();
    if (!deleted) { res.status(404).json({ error: "Entry not found" }); return; }
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete availability entry" });
  }
});

export default router;
