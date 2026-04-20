import { db, productsTable, productVariantsTable } from "@workspace/db";
import { eq, inArray } from "drizzle-orm";
import pg from "pg";

const { Pool } = pg;

async function migrate() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  console.log("Creating product_variants table if it doesn't exist...");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS product_variants (
      id SERIAL PRIMARY KEY,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      color_name TEXT NOT NULL,
      color_hex TEXT,
      image TEXT NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    )
  `);
  console.log("Table created (or already exists).");

  const allProducts = await db.select().from(productsTable).orderBy(productsTable.id);

  const groups: Record<string, typeof allProducts> = {
    "ZN50QT-34 F11": allProducts.filter(p =>
      p.slug.startsWith("zn50qt-34-f11") || p.name.includes("F11")
    ),
    "ZN50QT-R8": allProducts.filter(p =>
      p.slug.includes("zn50qt-r8") || p.name.includes("R8")
    ),
  };

  for (const [groupName, members] of Object.entries(groups)) {
    if (members.length <= 1) {
      console.log(`Group "${groupName}" has ${members.length} member(s), skipping consolidation.`);
      continue;
    }

    console.log(`\nConsolidating group: ${groupName} (${members.length} products)`);

    const canonical = members[0];
    const duplicates = members.slice(1);

    const existingVariants = await db
      .select()
      .from(productVariantsTable)
      .where(eq(productVariantsTable.productId, canonical.id));

    if (existingVariants.length > 0) {
      console.log(`  Variants already exist for product ${canonical.id}, skipping variant creation.`);
    } else {
      for (const member of members) {
        const colorName = extractColorName(member.name, groupName);
        console.log(`  Adding variant "${colorName}" (image: ${member.image}, stock: ${member.stock})`);
        await db.insert(productVariantsTable).values({
          productId: canonical.id,
          colorName,
          image: member.image,
          stock: member.stock,
        });
      }
    }

    for (const dup of duplicates) {
      console.log(`  Deleting duplicate product: ${dup.slug} (id=${dup.id})`);
      await db.delete(productsTable).where(eq(productsTable.id, dup.id));
    }

    const canonicalName = groupName === "ZN50QT-34 F11"
      ? "ZN50QT-34 (F11)"
      : "Znen ZN50QT-R8 49cc";
    const canonicalSlug = groupName === "ZN50QT-34 F11"
      ? "zn50qt-34-f11"
      : "znen-zn50qt-r8-49cc";

    await db.update(productsTable)
      .set({ name: canonicalName, slug: canonicalSlug, updatedAt: new Date() })
      .where(eq(productsTable.id, canonical.id));

    console.log(`  Canonical product updated: slug=${canonicalSlug}, name=${canonicalName}`);
  }

  await pool.end();
  console.log("\nMigration complete!");
  process.exit(0);
}

function extractColorName(productName: string, groupName: string): string {
  const name = productName.toUpperCase();
  if (name.includes("BLACK/BLUE") || name.includes("BLACK/BLUE") || name.includes("BLUE")) return "Black/Blue";
  if (name.includes("BLACK/GREEN") || name.includes("GREEN")) return "Black/Green";
  if (name.includes("BLACK/RED") || name.includes("RED")) return "Black/Red";
  if (name.includes("WHITE")) return "White";
  if (name.includes("BLACK")) return "Black";
  if (name.includes("SILVER")) return "Silver";
  return productName;
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
