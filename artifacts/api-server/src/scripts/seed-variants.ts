import { db, productsTable, productVariantsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const variantData: Record<
  string,
  { colorName: string; colorHex: string; image: string; stock: number }[]
> = {
  "zn50qt-34-f11": [
    {
      colorName: "Black/Blue",
      colorHex: "#1a3a5c",
      image:
        "https://www.familygokarts.com/wp-content/uploads/product-images/amigo/am-zn50qt-g/am-zn50qt-g-black-600x600.jpg",
      stock: 5,
    },
    {
      colorName: "Black/Green",
      colorHex: "#2d5a1b",
      image:
        "https://sportbike.lv/wp-content/uploads/2020/07/F11-Green-z-1.jpg",
      stock: 3,
    },
    {
      colorName: "Black/Red",
      colorHex: "#8b1a1a",
      image:
        "https://images.unsplash.com/photo-1647250671958-51d5d68cefc5?q=80&w=900&auto=format&fit=crop",
      stock: 3,
    },
  ],
  "znen-zn50qt-r8-49cc": [
    {
      colorName: "White",
      colorHex: "#f5f5f5",
      image:
        "https://images.unsplash.com/photo-1573164713714-d95e436ab8d8?q=80&w=900&auto=format&fit=crop",
      stock: 4,
    },
    {
      colorName: "Black",
      colorHex: "#1a1a1a",
      image:
        "https://images.unsplash.com/photo-1580341289255-5b47c98a59dd?q=80&w=900&auto=format&fit=crop",
      stock: 2,
    },
  ],
  "motocikls-vz5": [
    {
      colorName: "Black",
      colorHex: "#1a1a1a",
      image:
        "https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=900&auto=format&fit=crop",
      stock: 2,
    },
    {
      colorName: "Red",
      colorHex: "#c0392b",
      image:
        "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=900&auto=format&fit=crop",
      stock: 2,
    },
  ],
  "super-soco-tc": [
    {
      colorName: "Green",
      colorHex: "#2ecc71",
      image:
        "http://urbanebikes.com/cdn/shop/products/green-TC_1200x1200.jpg?v=1698840666",
      stock: 2,
    },
    {
      colorName: "Black",
      colorHex: "#1a1a1a",
      image:
        "https://urbanebikes.com/cdn/shop/files/TC-max-full-black-2_1024x1024.jpg",
      stock: 1,
    },
  ],
  "cfmoto-cforce-625l": [
    {
      colorName: "Camo Green",
      colorHex: "#4a5240",
      image:
        "https://www.cfmoto.com/content/dam/cfmoto/site/global/product/atv/atv/cforce-625-touring/2024/banner/PC_banner.jpg",
      stock: 1,
    },
    {
      colorName: "Orange",
      colorHex: "#e67e22",
      image:
        "https://www.cfmoto.com/content/dam/cfmoto/site/global/product/atv/atv/cforce-625-touring/2024/banner/PC_banner.jpg",
      stock: 1,
    },
  ],
  "cfmoto-cforce-450l": [
    {
      colorName: "Green",
      colorHex: "#27ae60",
      image:
        "https://www.cfmoto.com/content/dam/cfmoto/site/global/product/atv/atv/cforce-450-l-/gallery-small-pictures/CFORECE450L-banner.png",
      stock: 2,
    },
    {
      colorName: "Blue",
      colorHex: "#2980b9",
      image:
        "https://www.cfmoto.com/content/dam/cfmoto/site/global/product/atv/atv/cforce-450-l-/gallery-small-pictures/CFORECE450L-banner.png",
      stock: 1,
    },
  ],
};

async function seedVariants() {
  console.log("Seeding color variants for existing products...");

  for (const [slug, variants] of Object.entries(variantData)) {
    const [product] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.slug, slug));

    if (!product) {
      console.log(`  Product not found in DB: ${slug} — skipping`);
      continue;
    }

    const existingVariants = await db
      .select()
      .from(productVariantsTable)
      .where(eq(productVariantsTable.productId, product.id));

    if (existingVariants.length > 0) {
      console.log(
        `  ${slug} already has ${existingVariants.length} variant(s) — skipping`
      );
      continue;
    }

    for (const v of variants) {
      await db
        .insert(productVariantsTable)
        .values({ ...v, productId: product.id });
      console.log(`    Added variant "${v.colorName}" to ${slug}`);
    }
  }

  console.log("Done seeding variants.");
  process.exit(0);
}

seedVariants().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
