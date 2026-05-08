import { db, categoriesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const TOP_LEVEL = [
  { name: "Skūteri", slug: "skuteri", sortOrder: 0 },
  { name: "Elektro", slug: "elektro", sortOrder: 1 },
  { name: "Motocikli", slug: "motocikli", sortOrder: 2 },
  { name: "ATV", slug: "atv", sortOrder: 3 },
  { name: "Velo", slug: "velo", sortOrder: 4 },
  { name: "Skrituļslidas", slug: "skritulslidas", sortOrder: 5 },
  { name: "Slēpes", slug: "slepes", sortOrder: 6 },
  { name: "Snoubords", slug: "snoubords", sortOrder: 7 },
];

async function main() {
  console.log("Seeding categories...");
  for (const cat of TOP_LEVEL) {
    const existing = await db.select().from(categoriesTable).where(eq(categoriesTable.slug, cat.slug));
    if (existing.length === 0) {
      await db.insert(categoriesTable).values({ ...cat, parentId: null });
      console.log(`  Created: ${cat.name}`);
    } else {
      console.log(`  Skipped (exists): ${cat.name}`);
    }
  }
  console.log("Done.");
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
