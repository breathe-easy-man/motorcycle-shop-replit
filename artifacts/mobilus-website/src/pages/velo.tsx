import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ChevronRight, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface ProductVariant {
  id: number;
  colorName: string;
  colorHex: string | null;
  image: string;
  stock: number;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  category: string;
  price: number;
  oldPrice: number | null;
  engine: string | null;
  badge: string | null;
  image: string;
  stock: number;
  variants: ProductVariant[];
}

const VELO_CATEGORIES = ["Pilsēta", "Kalns", "E-Velo", "Bērniem", "Šoseja"];

export default function Velo() {
  const { t, lang } = useI18n();
  const [activeCategory, setActiveCategory] = useState("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredImages, setHoveredImages] = useState<Record<number, string | null>>({});

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        const list: Product[] = Array.isArray(data) ? data : (data.products ?? []);
        setProducts(list.filter((p) => VELO_CATEGORIES.includes(p.category)));
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const categoryLabel: Record<string, string> = {
    All: t.velo.filter_all,
    Pilsēta: t.velo.cat_city,
    Kalns: t.velo.cat_mountain,
    "E-Velo": t.velo.cat_electric,
    Bērniem: t.velo.cat_kids,
    Šoseja: t.velo.cat_road,
  };

  const filterKeys = ["All", ...VELO_CATEGORIES];

  const filtered =
    activeCategory === "All"
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <div className="pt-24 pb-20 min-h-screen bg-background">
      {/* Hero Banner */}
      <div className="relative h-64 md:h-80 overflow-hidden mb-16">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <img
          src="https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=2070&auto=format&fit=crop"
          alt="Bicycles"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-end container mx-auto px-4 md:px-6 pb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter"
          >
            {t.velo.title}
          </motion.h1>
          <p className="text-muted-foreground text-lg mt-2">{t.velo.subtitle}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-12">
          {filterKeys.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 text-sm font-bold uppercase tracking-widest border transition-colors ${
                activeCategory === cat
                  ? "bg-primary border-primary text-white"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {categoryLabel[cat] ?? cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((bike, i) => (
              <motion.div
                key={bike.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group bg-card border border-border hover:border-primary/50 transition-all duration-300 overflow-hidden"
              >
                <div className="relative overflow-hidden aspect-[4/3] bg-muted">
                  {bike.badge && (
                    <span className="absolute top-3 left-3 z-10 bg-primary text-white text-xs font-bold px-2 py-1 uppercase tracking-wider">
                      {bike.badge}
                    </span>
                  )}
                  <img
                    src={hoveredImages[bike.id] ?? bike.image}
                    alt={bike.name}
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=800&auto=format&fit=crop";
                    }}
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs uppercase tracking-wider border-muted text-muted-foreground">
                      {categoryLabel[bike.category] ?? bike.category}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-foreground text-sm leading-tight mb-2">{bike.name}</h3>
                  {Array.isArray(bike.variants) && bike.variants.length > 0 && (
                    <div className="flex items-center gap-1.5 mb-3">
                      {bike.variants.slice(0, 6).map((v) => (
                        <span
                          key={v.id}
                          title={v.colorName}
                          className="h-4 w-4 rounded-full border-2 border-border hover:border-primary flex-shrink-0 cursor-pointer transition-transform hover:scale-125"
                          style={{ backgroundColor: v.colorHex ?? "#888" }}
                          onMouseEnter={() => setHoveredImages((prev) => ({ ...prev, [bike.id]: v.image }))}
                          onMouseLeave={() => setHoveredImages((prev) => ({ ...prev, [bike.id]: null }))}
                        />
                      ))}
                      {bike.variants.length > 6 && (
                        <span className="text-xs text-muted-foreground">+{bike.variants.length - 6}</span>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xl font-black text-primary">€{bike.price.toLocaleString()}</span>
                    {bike.oldPrice && (
                      <span className="text-sm text-muted-foreground line-through">€{bike.oldPrice.toLocaleString()}</span>
                    )}
                  </div>
                  <Link href={`/velo/${bike.slug}`}>
                    <Button className="w-full bg-transparent border border-primary text-primary hover:bg-primary hover:text-white transition-colors rounded-none text-xs uppercase tracking-widest font-bold">
                      {lang === "lv" ? "Skatīt" : lang === "ru" ? "Смотреть" : "View"}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Info Banner */}
        <div className="mt-20 border border-border p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 bg-card">
          <div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">
              {t.velo.cta_title}
            </h2>
            <p className="text-muted-foreground">{t.velo.cta_sub}</p>
          </div>
          <Link href="/contact">
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-none px-8 uppercase font-bold tracking-widest whitespace-nowrap">
              {t.velo.contact} <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
