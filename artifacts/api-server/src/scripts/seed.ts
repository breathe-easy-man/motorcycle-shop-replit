import { eq } from "drizzle-orm";
import { db, productsTable, productVariantsTable, locationsTable, deliveryOptionsTable, leasingPartnersTable } from "@workspace/db";

const products = [
  {
    slug: "zn50qt-34-f11",
    name: "ZN50QT-34 (F11)",
    price: 1950,
    oldPrice: 2000,
    category: "Skūteri",
    engine: "49cc",
    image: "https://www.familygokarts.com/wp-content/uploads/product-images/amigo/am-zn50qt-g/am-zn50qt-g-black-600x600.jpg",
    badge: "-3%",
    stock: 11,
    descriptionLv: "Stilīgs un ekonomisks skūteris ikdienas braucieniem pa pilsētu. Kompakts dizains ar jaudīgu 49cc dzinēju.",
    descriptionEn: "Stylish and economical scooter for everyday city rides. Compact design with a powerful 49cc engine.",
    descriptionRu: "Стильный и экономичный скутер для ежедневных поездок по городу. Компактный дизайн с мощным двигателем 49cc.",
    specs: [
      { label: { lv: "Dzinējs", en: "Engine", ru: "Двигатель" }, value: "49cc 4-stroke" },
      { label: { lv: "Ātrums maks.", en: "Max Speed", ru: "Макс. скорость" }, value: "45 km/h" },
      { label: { lv: "Svars", en: "Weight", ru: "Вес" }, value: "95 kg" },
      { label: { lv: "Degvielas tvertne", en: "Fuel Tank", ru: "Бак" }, value: "5.5 L" },
      { label: { lv: "Garantija", en: "Warranty", ru: "Гарантия" }, value: "12 mēn. / months / мес." },
    ],
    variants: [
      { colorName: "Black/Blue", colorHex: "#1a3a5c", image: "https://www.familygokarts.com/wp-content/uploads/product-images/amigo/am-zn50qt-g/am-zn50qt-g-black-600x600.jpg", stock: 5 },
      { colorName: "Black/Green", colorHex: "#2d5a1b", image: "https://sportbike.lv/wp-content/uploads/2020/07/F11-Green-z-1.jpg", stock: 3 },
      { colorName: "Black/Red", colorHex: "#8b1a1a", image: "https://images.unsplash.com/photo-1647250671958-51d5d68cefc5?q=80&w=900&auto=format&fit=crop", stock: 3 },
    ],
  },
  {
    slug: "znen-cruise-49cc-silver",
    name: "Znen Cruise 49cc Silver",
    price: 1950,
    oldPrice: 2000,
    category: "Skūteri",
    engine: "49cc",
    image: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?q=80&w=900&auto=format&fit=crop",
    badge: "-3%",
    stock: 2,
    descriptionLv: "Retro stila krūzera skūteris ar mūsdienīgu tehnoloģiju. Ideāls braucieniem pa pilsētu un priekšpilsētu.",
    descriptionEn: "Retro-style cruiser scooter with modern technology. Ideal for city and suburban rides.",
    descriptionRu: "Скутер-крейсер в стиле ретро с современными технологиями. Идеален для поездок по городу и пригороду.",
    specs: [
      { label: { lv: "Dzinējs", en: "Engine", ru: "Двигатель" }, value: "49cc 4-stroke" },
      { label: { lv: "Ātrums maks.", en: "Max Speed", ru: "Макс. скорость" }, value: "45 km/h" },
      { label: { lv: "Svars", en: "Weight", ru: "Вес" }, value: "98 kg" },
      { label: { lv: "Garantija", en: "Warranty", ru: "Гарантия" }, value: "12 mēn. / months / мес." },
    ],
    variants: [],
  },
  {
    slug: "znen-zn50qt-r8-49cc",
    name: "Znen ZN50QT-R8 49cc",
    price: 1950,
    oldPrice: 2000,
    category: "Skūteri",
    engine: "49cc",
    image: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d8?q=80&w=900&auto=format&fit=crop",
    badge: "-3%",
    stock: 6,
    descriptionLv: "Elegantais R8 skūteris — mūsdienīgs dizains un uzticama veiktspēja katru dienu.",
    descriptionEn: "The elegant R8 scooter — modern design and reliable daily performance.",
    descriptionRu: "Элегантный скутер R8 — современный дизайн и надёжные характеристики на каждый день.",
    specs: [
      { label: { lv: "Dzinējs", en: "Engine", ru: "Двигатель" }, value: "49cc 4-stroke" },
      { label: { lv: "Ātrums maks.", en: "Max Speed", ru: "Макс. скорость" }, value: "45 km/h" },
      { label: { lv: "Svars", en: "Weight", ru: "Вес" }, value: "92 kg" },
      { label: { lv: "Garantija", en: "Warranty", ru: "Гарантия" }, value: "12 mēn. / months / мес." },
    ],
    variants: [
      { colorName: "White", colorHex: "#f5f5f5", image: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d8?q=80&w=900&auto=format&fit=crop", stock: 4 },
      { colorName: "Black", colorHex: "#1a1a1a", image: "https://images.unsplash.com/photo-1580341289255-5b47c98a59dd?q=80&w=900&auto=format&fit=crop", stock: 2 },
    ],
  },
  {
    slug: "super-soco-tc-max",
    name: "Electro-scooter Super Soco TC MAx",
    price: 3990,
    oldPrice: null,
    category: "Elektro",
    engine: "Electric",
    image: "https://urbanebikes.com/cdn/shop/files/TC-max-full-black-2_1024x1024.jpg",
    badge: "Elektro",
    stock: 2,
    descriptionLv: "Super Soco TC MAx ir jaudīgs elektriskais skūteris ar lielu akumulatoru un iespaidīgu braukšanas diapazonu.",
    descriptionEn: "The Super Soco TC MAx is a powerful electric scooter with a large battery and impressive riding range.",
    descriptionRu: "Super Soco TC MAx — мощный электрический скутер с большим аккумулятором и впечатляющим запасом хода.",
    specs: [
      { label: { lv: "Motors", en: "Motor", ru: "Мотор" }, value: "3000W BOSCH" },
      { label: { lv: "Diapazons", en: "Range", ru: "Запас хода" }, value: "≈150 km" },
      { label: { lv: "Ātrums maks.", en: "Max Speed", ru: "Макс. скорость" }, value: "80 km/h" },
      { label: { lv: "Akumulators", en: "Battery", ru: "Аккумулятор" }, value: "60V 50Ah" },
      { label: { lv: "Garantija", en: "Warranty", ru: "Гарантия" }, value: "24 mēn. / months / мес." },
    ],
    variants: [],
  },
  {
    slug: "super-soco-tc",
    name: "Electro-scooter Super Soco TC",
    price: 2990,
    oldPrice: null,
    category: "Elektro",
    engine: "Electric",
    image: "http://urbanebikes.com/cdn/shop/products/green-TC_1200x1200.jpg?v=1698840666",
    badge: "Elektro",
    stock: 3,
    descriptionLv: "Super Soco TC ir pilsētas elektriskais skūteris ar lielisku cenas/vērtības attiecību un zero emisijām.",
    descriptionEn: "The Super Soco TC is a city electric scooter with excellent value for money and zero emissions.",
    descriptionRu: "Super Soco TC — городской электрический скутер с отличным соотношением цены и качества и нулевыми выбросами.",
    specs: [
      { label: { lv: "Motors", en: "Motor", ru: "Мотор" }, value: "2000W" },
      { label: { lv: "Diapazons", en: "Range", ru: "Запас хода" }, value: "≈100 km" },
      { label: { lv: "Ātrums maks.", en: "Max Speed", ru: "Макс. скорость" }, value: "65 km/h" },
      { label: { lv: "Akumulators", en: "Battery", ru: "Аккумулятор" }, value: "60V 30Ah" },
      { label: { lv: "Garantija", en: "Warranty", ru: "Гарантия" }, value: "24 mēn. / months / мес." },
    ],
    variants: [
      { colorName: "Green", colorHex: "#2ecc71", image: "http://urbanebikes.com/cdn/shop/products/green-TC_1200x1200.jpg?v=1698840666", stock: 2 },
      { colorName: "Black", colorHex: "#1a1a1a", image: "https://urbanebikes.com/cdn/shop/files/TC-max-full-black-2_1024x1024.jpg", stock: 1 },
    ],
  },
  {
    slug: "jonway-xing-mai",
    name: "JonWay Xing Mai Electric Car",
    price: 8000,
    oldPrice: null,
    category: "Elektro",
    engine: "Electric",
    image: "https://www.jonway.com/english/images/product/xinxing/pd1.jpg",
    badge: "E-Car",
    stock: 1,
    descriptionLv: "JonWay Xing Mai ir kompakts elektriskais automobilis, ideāls pilsētas braucieniem ar nulles emisijām.",
    descriptionEn: "The JonWay Xing Mai is a compact electric car, ideal for zero-emission city driving.",
    descriptionRu: "JonWay Xing Mai — компактный электромобиль, идеальный для городских поездок с нулевыми выбросами.",
    specs: [
      { label: { lv: "Motors", en: "Motor", ru: "Мотор" }, value: "4000W" },
      { label: { lv: "Diapazons", en: "Range", ru: "Запас хода" }, value: "≈120 km" },
      { label: { lv: "Ātrums maks.", en: "Max Speed", ru: "Макс. скорость" }, value: "70 km/h" },
      { label: { lv: "Sēdvietas", en: "Seats", ru: "Мест" }, value: "2" },
      { label: { lv: "Garantija", en: "Warranty", ru: "Гарантия" }, value: "24 mēn. / months / мес." },
    ],
    variants: [],
  },
  {
    slug: "motocikls-vz5",
    name: "Motocikls VZ-5 125cc",
    price: 2300,
    oldPrice: 2500,
    category: "Motocikli",
    engine: "125cc",
    image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=900&auto=format&fit=crop",
    badge: "-8%",
    stock: 4,
    descriptionLv: "VZ-5 ir sportisks 125cc motocikls, ideāls jaunajiem braucējiem, kuri vēlas kaut ko vairāk par skūteri.",
    descriptionEn: "The VZ-5 is a sporty 125cc motorcycle, ideal for new riders who want something more than a scooter.",
    descriptionRu: "VZ-5 — спортивный мотоцикл 125cc, идеальный для новых гонщиков, которые хотят большего, чем скутер.",
    specs: [
      { label: { lv: "Dzinējs", en: "Engine", ru: "Двигатель" }, value: "125cc" },
      { label: { lv: "Jauda", en: "Power", ru: "Мощность" }, value: "11 kW" },
      { label: { lv: "Ātrums maks.", en: "Max Speed", ru: "Макс. скорость" }, value: "110 km/h" },
      { label: { lv: "Svars", en: "Weight", ru: "Вес" }, value: "148 kg" },
      { label: { lv: "Garantija", en: "Warranty", ru: "Гарантия" }, value: "12 mēn. / months / мес." },
    ],
    variants: [
      { colorName: "Black", colorHex: "#1a1a1a", image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=900&auto=format&fit=crop", stock: 2 },
      { colorName: "Red", colorHex: "#c0392b", image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=900&auto=format&fit=crop", stock: 2 },
    ],
  },
  {
    slug: "cfmoto-cforce-625l",
    name: "CFMoto Cforce 625L (L7E)",
    price: 8590,
    oldPrice: null,
    category: "ATV",
    engine: "600cc",
    image: "https://www.cfmoto.com/content/dam/cfmoto/site/global/product/atv/atv/cforce-625-touring/2024/banner/PC_banner.jpg",
    badge: "ATV",
    stock: 2,
    descriptionLv: "CFMoto Cforce 625L ir jaudīgs kvadracikls ar 600cc dzinēju, piemērots gan sporta, gan lauksaimniecības vajadzībām.",
    descriptionEn: "The CFMoto Cforce 625L is a powerful quad bike with a 600cc engine, suitable for both sports and agricultural use.",
    descriptionRu: "CFMoto Cforce 625L — мощный квадроцикл с двигателем 600cc, подходящий как для спорта, так и для сельского хозяйства.",
    specs: [
      { label: { lv: "Dzinējs", en: "Engine", ru: "Двигатель" }, value: "600cc EFI" },
      { label: { lv: "Jauda", en: "Power", ru: "Мощность" }, value: "41 kW" },
      { label: { lv: "Piedziņa", en: "Drive", ru: "Привод" }, value: "4WD/2WD" },
      { label: { lv: "Svars", en: "Weight", ru: "Вес" }, value: "380 kg" },
      { label: { lv: "Garantija", en: "Warranty", ru: "Гарантия" }, value: "12 mēn. / months / мес." },
    ],
    variants: [
      { colorName: "Camo Green", colorHex: "#4a5240", image: "https://www.cfmoto.com/content/dam/cfmoto/site/global/product/atv/atv/cforce-625-touring/2024/banner/PC_banner.jpg", stock: 1 },
      { colorName: "Orange", colorHex: "#e67e22", image: "https://www.cfmoto.com/content/dam/cfmoto/site/global/product/atv/atv/cforce-625-touring/2024/banner/PC_banner.jpg", stock: 1 },
    ],
  },
  {
    slug: "cfmoto-cforce-450l",
    name: "CFMoto CFORCE 450L",
    price: 5890,
    oldPrice: null,
    category: "ATV",
    engine: "400cc",
    image: "https://www.cfmoto.com/content/dam/cfmoto/site/global/product/atv/atv/cforce-450-l-/gallery-small-pictures/CFORECE450L-banner.png",
    badge: "ATV",
    stock: 3,
    descriptionLv: "CFORCE 450L apvieno spēku un manevrētspēju. Ideāls kvadracikls gan pieredzējušiem, gan jauniem braucējiem.",
    descriptionEn: "The CFORCE 450L combines power and maneuverability. An ideal quad for both experienced and new riders.",
    descriptionRu: "CFORCE 450L сочетает мощность и маневренность. Идеальный квадроцикл для опытных и начинающих гонщиков.",
    specs: [
      { label: { lv: "Dzinējs", en: "Engine", ru: "Двигатель" }, value: "400cc EFI" },
      { label: { lv: "Jauda", en: "Power", ru: "Мощность" }, value: "28 kW" },
      { label: { lv: "Piedziņa", en: "Drive", ru: "Привод" }, value: "4WD/2WD" },
      { label: { lv: "Svars", en: "Weight", ru: "Вес" }, value: "310 kg" },
      { label: { lv: "Garantija", en: "Warranty", ru: "Гарантия" }, value: "12 mēn. / months / мес." },
    ],
    variants: [
      { colorName: "Green", colorHex: "#27ae60", image: "https://www.cfmoto.com/content/dam/cfmoto/site/global/product/atv/atv/cforce-450-l-/gallery-small-pictures/CFORECE450L-banner.png", stock: 2 },
      { colorName: "Blue", colorHex: "#2980b9", image: "https://www.cfmoto.com/content/dam/cfmoto/site/global/product/atv/atv/cforce-450-l-/gallery-small-pictures/CFORECE450L-banner.png", stock: 1 },
    ],
  },
  {
    slug: "cfmoto-110-youth",
    name: "CFMoto 110 Youth ATV",
    price: 2290,
    oldPrice: null,
    category: "ATV",
    engine: "110cc",
    image: "https://www.cfmoto.com/content/dam/cfmoto/site/global/product/youth/atv/cforce-110/2024/CFORCE110_1.png",
    badge: "Youth",
    stock: 5,
    descriptionLv: "CFMoto 110 Youth ir drošs un jautrs kvadracikls bērniem un pusaudžiem, lai iepazītos ar ATV braukšanu.",
    descriptionEn: "The CFMoto 110 Youth is a safe and fun quad bike for children and teenagers to start their ATV journey.",
    descriptionRu: "CFMoto 110 Youth — безопасный и весёлый квадроцикл для детей и подростков, чтобы начать путь в мире ATV.",
    specs: [
      { label: { lv: "Dzinējs", en: "Engine", ru: "Двигатель" }, value: "110cc" },
      { label: { lv: "Ātrums maks.", en: "Max Speed", ru: "Макс. скорость" }, value: "40 km/h" },
      { label: { lv: "Vecums", en: "Age", ru: "Возраст" }, value: "10+" },
      { label: { lv: "Garantija", en: "Warranty", ru: "Гарантия" }, value: "12 mēn. / months / мес." },
    ],
    variants: [],
  },
  {
    slug: "atv-pentora-110-cvt",
    name: "ATV Pentora 110 CVT KID",
    price: 1590,
    oldPrice: null,
    category: "ATV",
    engine: "110cc",
    image: "https://images.unsplash.com/photo-1574768338754-6c0b51b82099?q=80&w=900&auto=format&fit=crop",
    badge: "Kids",
    stock: 4,
    descriptionLv: "Pentora 110 CVT — bērnu ATV ar automātisko pārnesumkārbu (CVT), ērti vadāms un drošs.",
    descriptionEn: "The Pentora 110 CVT is a kids' ATV with automatic transmission (CVT), easy to handle and safe.",
    descriptionRu: "Pentora 110 CVT — детский квадроцикл с автоматической коробкой передач (CVT), простой в управлении и безопасный.",
    specs: [
      { label: { lv: "Dzinējs", en: "Engine", ru: "Двигатель" }, value: "110cc CVT" },
      { label: { lv: "Ātrums maks.", en: "Max Speed", ru: "Макс. скорость" }, value: "35 km/h" },
      { label: { lv: "Vecums", en: "Age", ru: "Возраст" }, value: "6-12" },
      { label: { lv: "Garantija", en: "Warranty", ru: "Гарантия" }, value: "12 mēn. / months / мес." },
    ],
    variants: [],
  },
  {
    slug: "atv-kayo-110-kid",
    name: "ATV Kayo 110 Kid",
    price: 1390,
    oldPrice: null,
    category: "ATV",
    engine: "110cc",
    image: "https://static.wixstatic.com/media/4e7fac_b9040d41297a4d23b479d0a1e21da0fc~mv2.jpg/v1/fill/w_980,h_614,q_90,enc_avif,quality_auto/4e7fac_b9040d41297a4d23b479d0a1e21da0fc~mv2.jpg",
    badge: "Kids",
    stock: 6,
    descriptionLv: "Kayo 110 Kid ir izcils sākumpunkts jaunajiem ATV entuziastiem. Uzticams, drošs un viegli vadāms.",
    descriptionEn: "The Kayo 110 Kid is an excellent starting point for young ATV enthusiasts. Reliable, safe, and easy to ride.",
    descriptionRu: "Kayo 110 Kid — отличная отправная точка для юных любителей ATV. Надёжный, безопасный и простой в управлении.",
    specs: [
      { label: { lv: "Dzinējs", en: "Engine", ru: "Двигатель" }, value: "110cc" },
      { label: { lv: "Ātrums maks.", en: "Max Speed", ru: "Макс. скорость" }, value: "35 km/h" },
      { label: { lv: "Vecums", en: "Age", ru: "Возраст" }, value: "6-12" },
      { label: { lv: "Garantija", en: "Warranty", ru: "Гарантия" }, value: "12 mēn. / months / мес." },
    ],
    variants: [],
  },
];

async function seed() {
  console.log("Seeding products with variant support...");
  for (const { variants, ...p } of products) {
    const [existing] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.slug, p.slug))
      .catch(() => []);

    if (existing) {
      console.log(`  Skipping existing product: ${p.slug}`);
      continue;
    }

    const [product] = await db.insert(productsTable).values(p).returning();
    console.log(`  Inserted product: ${product.slug} (id=${product.id})`);

    for (const v of variants) {
      await db.insert(productVariantsTable).values({ ...v, productId: product.id });
      console.log(`    Added variant: ${v.colorName}`);
    }
  }
  // Seed default location and delivery option if not present
  const existingLocs = await db.select().from(locationsTable);
  if (existingLocs.length === 0) {
    await db.insert(locationsTable).values({
      name: "Mobilus Rīga",
      address: "Rīga, Dārzciema 123",
      workHours: "P-Pk 9:00-18:00, S 10:00-15:00",
      contacts: { phone: "+371 20 000 000", email: "info@mobilus.lv" },
      leadTimeDays: 1,
      isActive: true,
    });
    console.log("  Seeded default Rīga location");
  }
  const existingDelivery = await db.select().from(deliveryOptionsTable);
  if (existingDelivery.length === 0) {
    await db.insert(deliveryOptionsTable).values({
      name: "Piegāde uz adresi",
      priceMin: 5,
      priceMax: 15,
      leadTimeDays: 3,
      isActive: true,
    });
    console.log("  Seeded default delivery option");
  }

  const existingPartners = await db.select().from(leasingPartnersTable);
  if (existingPartners.length === 0) {
    await db.insert(leasingPartnersTable).values([
      {
        name: "InCredit Group",
        logoUrl: null,
        interestRate: "8.9",
        infoText: "Ātra lēmuma pieņemšana, elastīgi nosacījumi. Pirmā iemaksa no 10%. Termiņš no 12 līdz 60 mēnešiem.",
        displayOrder: 1,
      },
      {
        name: "UNO Leasing",
        logoUrl: null,
        interestRate: "8.5",
        infoText: "Zema procentu likme, bez slēptajām maksām. Iespēja apdrošināt preci pie mums. Ātrs pieteikuma process tiešsaistē.",
        displayOrder: 2,
      },
      {
        name: "Motive",
        logoUrl: null,
        interestRate: "9.2",
        infoText: "Finansēšana gan privātpersonām, gan uzņēmumiem. Īpaši nosacījumi elektro tehnikā. Lēmums 15 minūtēs.",
        displayOrder: 3,
      },
    ]);
    console.log("  Seeded default leasing partners");
  }

  console.log(`Done seeding.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
