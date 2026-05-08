import { Router } from "express";
import { eq, asc, isNull, count } from "drizzle-orm";
import { db, categoriesTable, productsTable, insertCategorySchema, updateCategorySchema } from "@workspace/db";
import { requireAdmin } from "../middlewares/adminAuth";

const router = Router();

router.get("/categories", async (req, res) => {
  try {
    const rows = await db.select().from(categoriesTable).orderBy(asc(categoriesTable.sortOrder), asc(categoriesTable.name));
    const parents = rows.filter((r) => r.parentId === null);
    const tree = parents.map((p) => ({
      ...p,
      children: rows.filter((c) => c.parentId === p.id).sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)),
    }));
    res.json(tree);
  } catch {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

router.post("/categories", requireAdmin, async (req, res) => {
  try {
    const parsed = insertCategorySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid data", details: parsed.error.issues });
      return;
    }
    const [created] = await db.insert(categoriesTable).values(parsed.data).returning();
    res.status(201).json(created);
  } catch (err: any) {
    if (err?.code === "23505") {
      res.status(409).json({ error: "A category with that slug already exists" });
    } else {
      res.status(500).json({ error: "Failed to create category" });
    }
  }
});

router.patch("/categories/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const parsed = updateCategorySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid data", details: parsed.error.issues });
      return;
    }
    const [updated] = await db
      .update(categoriesTable)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(categoriesTable.id, id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Category not found" });
      return;
    }
    res.json(updated);
  } catch (err: any) {
    if (err?.code === "23505") {
      res.status(409).json({ error: "A category with that slug already exists" });
    } else {
      res.status(500).json({ error: "Failed to update category" });
    }
  }
});

router.delete("/categories/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [productCount] = await db
      .select({ count: count() })
      .from(productsTable)
      .where(eq(productsTable.categoryId, id));
    if (productCount && productCount.count > 0) {
      res.status(409).json({ error: `Cannot delete: ${productCount.count} product(s) are assigned to this category` });
      return;
    }
    const [childCount] = await db
      .select({ count: count() })
      .from(categoriesTable)
      .where(eq(categoriesTable.parentId, id));
    if (childCount && childCount.count > 0) {
      res.status(409).json({ error: `Cannot delete: this category has ${childCount.count} subcategory(ies). Delete them first.` });
      return;
    }
    const [deleted] = await db.delete(categoriesTable).where(eq(categoriesTable.id, id)).returning();
    if (!deleted) {
      res.status(404).json({ error: "Category not found" });
      return;
    }
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete category" });
  }
});

export default router;
