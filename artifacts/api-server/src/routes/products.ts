import { Router } from "express";
import { and, eq, inArray, asc } from "drizzle-orm";
import { db, productsTable, productVariantsTable, insertProductSchema, updateProductSchema, insertProductVariantSchema, updateProductVariantSchema } from "@workspace/db";
import { requireAdmin } from "../middlewares/adminAuth";

type ProductRow = typeof productsTable.$inferSelect;
type VariantRow = typeof productVariantsTable.$inferSelect;

const router = Router();

async function attachVariants(products: ProductRow[]) {
  if (products.length === 0) return products.map((p) => ({ ...p, variants: [] as VariantRow[] }));
  const ids = products.map((p) => p.id);
  const allVariants = await db
    .select()
    .from(productVariantsTable)
    .where(inArray(productVariantsTable.productId, ids))
    .orderBy(productVariantsTable.id);
  const variantsByProduct: Record<number, VariantRow[]> = {};
  for (const v of allVariants) {
    if (!variantsByProduct[v.productId]) variantsByProduct[v.productId] = [];
    variantsByProduct[v.productId].push(v);
  }
  return products.map((p) => ({ ...p, variants: variantsByProduct[p.id] ?? [] }));
}

router.get("/products", async (req, res) => {
  try {
    const featuredOnly = req.query.featured === "true";
    const rows = featuredOnly
      ? await db.select().from(productsTable).where(eq(productsTable.featured, true)).orderBy(asc(productsTable.id))
      : await db.select().from(productsTable).orderBy(asc(productsTable.id));
    const withVariants = await attachVariants(rows);
    res.json(withVariants);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

router.get("/products/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, id));
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    const variants = await db
      .select()
      .from(productVariantsTable)
      .where(eq(productVariantsTable.productId, id))
      .orderBy(productVariantsTable.id);
    res.json({ ...product, variants });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

router.get("/products/slug/:slug", async (req, res) => {
  try {
    const [product] = await db.select().from(productsTable).where(eq(productsTable.slug, req.params.slug));
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    const variants = await db
      .select()
      .from(productVariantsTable)
      .where(eq(productVariantsTable.productId, product.id))
      .orderBy(productVariantsTable.id);
    res.json({ ...product, variants });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

router.post("/products", requireAdmin, async (req, res) => {
  try {
    const { variants: variantsData, ...productData } = req.body;
    const parsed = insertProductSchema.safeParse(productData);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid data", details: parsed.error.issues });
      return;
    }

    const parsedVariants: (typeof insertProductVariantSchema._type)[] = [];
    if (Array.isArray(variantsData) && variantsData.length > 0) {
      for (let i = 0; i < variantsData.length; i++) {
        const parsedV = insertProductVariantSchema.safeParse({ ...variantsData[i], productId: 0 });
        if (!parsedV.success) {
          res.status(400).json({ error: `Invalid variant at index ${i}`, details: parsedV.error.issues });
          return;
        }
        parsedVariants.push(parsedV.data);
      }
    }

    const result = await db.transaction(async (tx) => {
      const [product] = await tx.insert(productsTable).values(parsed.data).returning();
      const variants = [];
      for (const v of parsedVariants) {
        const [variant] = await tx.insert(productVariantsTable).values({ ...v, productId: product.id }).returning();
        variants.push(variant);
      }
      if (variants.length > 0 && variants[0].image) {
        const [updated] = await tx
          .update(productsTable)
          .set({ image: variants[0].image })
          .where(eq(productsTable.id, product.id))
          .returning();
        return { ...updated, variants };
      }
      return { ...product, variants };
    });

    res.status(201).json(result);
  } catch (err: any) {
    if (err?.code === "23505") {
      res.status(409).json({ error: "Slug already exists" });
    } else {
      res.status(500).json({ error: "Failed to create product" });
    }
  }
});

router.put("/products/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { variants: variantsData, ...productData } = req.body;
    const parsed = updateProductSchema.safeParse(productData);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid data", details: parsed.error.issues });
      return;
    }

    const parsedVariants: (typeof insertProductVariantSchema._type)[] | null = Array.isArray(variantsData)
      ? []
      : null;
    if (parsedVariants !== null && Array.isArray(variantsData)) {
      for (let i = 0; i < variantsData.length; i++) {
        const parsedV = insertProductVariantSchema.safeParse({ ...variantsData[i], productId: id });
        if (!parsedV.success) {
          res.status(400).json({ error: `Invalid variant at index ${i}`, details: parsedV.error.issues });
          return;
        }
        parsedVariants.push(parsedV.data);
      }
    }

    const result = await db.transaction(async (tx) => {
      const [product] = await tx
        .update(productsTable)
        .set({ ...parsed.data, updatedAt: new Date() })
        .where(eq(productsTable.id, id))
        .returning();
      if (!product) return null;

      let variants;
      if (parsedVariants !== null) {
        await tx.delete(productVariantsTable).where(eq(productVariantsTable.productId, id));
        variants = [];
        for (const v of parsedVariants) {
          const [variant] = await tx.insert(productVariantsTable).values(v).returning();
          variants.push(variant);
        }
      } else {
        variants = await tx
          .select()
          .from(productVariantsTable)
          .where(eq(productVariantsTable.productId, id))
          .orderBy(productVariantsTable.id);
      }
      if (variants.length > 0 && variants[0].image) {
        const [synced] = await tx
          .update(productsTable)
          .set({ image: variants[0].image })
          .where(eq(productsTable.id, id))
          .returning();
        return { ...synced, variants };
      }
      return { ...product, variants };
    });

    if (!result) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to update product" });
  }
});

router.delete("/products/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [deleted] = await db.delete(productsTable).where(eq(productsTable.id, id)).returning();
    if (!deleted) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});

router.post("/products/:id/variants", requireAdmin, async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const [product] = await db.select({ id: productsTable.id }).from(productsTable).where(eq(productsTable.id, productId));
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    const parsed = insertProductVariantSchema.safeParse({ ...req.body, productId });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid data", details: parsed.error.issues });
      return;
    }
    const [variant] = await db.insert(productVariantsTable).values(parsed.data).returning();
    res.status(201).json(variant);
  } catch (err) {
    res.status(500).json({ error: "Failed to create variant" });
  }
});

router.put("/products/:id/variants/:variantId", requireAdmin, async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const variantId = Number(req.params.variantId);
    const parsed = updateProductVariantSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid data", details: parsed.error.issues });
      return;
    }
    const [variant] = await db
      .update(productVariantsTable)
      .set(parsed.data)
      .where(and(eq(productVariantsTable.id, variantId), eq(productVariantsTable.productId, productId)))
      .returning();
    if (!variant) {
      res.status(404).json({ error: "Variant not found" });
      return;
    }
    res.json(variant);
  } catch (err) {
    res.status(500).json({ error: "Failed to update variant" });
  }
});

router.delete("/products/:id/variants/:variantId", requireAdmin, async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const variantId = Number(req.params.variantId);
    const [deleted] = await db
      .delete(productVariantsTable)
      .where(and(eq(productVariantsTable.id, variantId), eq(productVariantsTable.productId, productId)))
      .returning();
    if (!deleted) {
      res.status(404).json({ error: "Variant not found" });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete variant" });
  }
});

export default router;
