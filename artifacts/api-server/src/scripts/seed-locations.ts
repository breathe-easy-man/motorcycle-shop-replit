import { db, locationsTable, deliveryOptionsTable } from "@workspace/db";

async function main() {
  const existingLocs = await db.select().from(locationsTable);
  if (existingLocs.length === 0) {
    await db.insert(locationsTable).values({
      name: "Mobilus Rīga",
      address: "Dārzciema iela 123, Rīga",
      workHours: "P-Pk 9:00-18:00, S 10:00-15:00",
      contacts: { phone: "+371 20 000 000", email: "info@mobilus.lv" },
      leadTimeDays: 1,
      isActive: true,
    });
    console.log("Seeded default Rīga location");
  } else {
    console.log("Locations already exist, skipping");
  }

  const existingDelivery = await db.select().from(deliveryOptionsTable);
  if (existingDelivery.length === 0) {
    await db.insert(deliveryOptionsTable).values([
      {
        name: "Piegāde uz adresi",
        priceMin: 5,
        priceMax: 15,
        leadTimeDays: 3,
        isActive: true,
      },
    ]);
    console.log("Seeded default delivery option");
  } else {
    console.log("Delivery options already exist, skipping");
  }
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
