import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { ChevronRight, Loader2, SlidersHorizontal, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";

type SortKey = "price-asc" | "price-desc" | "newest" | "name-asc";

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
  createdAt?: string;
}

const SKATE_CATEGORIES = ["Skrituļslidas"];
const FILTER_ENGINES = ["Rekreācija", "Fitness", "Bērnu"];

export default function Skates() {
  const { t, lang } = useI18n();
  const [, setLocation] = useLocation();
  const [activeCategory, setActiveCategory] = useState("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredImages, setHoveredImages] = useState<Record<number, string | null>>({});
  const [sortKey, setSortKey] = useState<SortKey>("name-asc");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarEngines, setSidebarEngines] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        const list: Product[] = Array.isArray(data) ? data : (data.products ?? []);
        setProducts(list.filter((p) => SKATE_CATEGORIES.includes(p.category)));
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const engineLabel: Record<string, string> = {
    Rekreācija: lang === "lv" ? "Rekreācija" : lang === "ru" ? "Рекреация" : "Recreation",
    Fitness: "Fitness",
    Bērnu: lang === "lv" ? "Bērniem" : lang === "ru" ? "Детские" : "Kids",
  };

  const filterLabel: Record<string, string> = {
    All: lang === "lv" ? "Visi" : lang === "ru" ? "Все" : "All",
    Rekreācija: lang === "lv" ? "Rekreācija" : lang === "ru" ? "Рекреация" : "Recreation",
    Fitness: "Fitness",
    Bērnu: lang === "lv" ? "Bērniem" : lang === "ru" ? "Детские" : "Kids",
  };

  const baseFiltered = sidebarEngines.length > 0
    ? products.filter((p) => sidebarEngines.includes(p.engine ?? ""))
    : (activeCategory === "All" ? products : products.filter((p) => p.engine === activeCategory));

  const filtered = useMemo(() => {
    let list = [...baseFiltered];
    switch (sortKey) {
      case "price-asc": list.sort((a, b) => a.price - b.price); break;
      case "price-desc": list.sort((a, b) => b.price - a.price); break;
      case "newest": list.sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()); break;
      case "name-asc": list.sort((a, b) => a.name.localeCompare(b.name)); break;
    }
    return list;
  }, [baseFiltered, sortKey]);

  const toggleSidebarEngine = (eng: string) => {
    setSidebarEngines((prev) =>
      prev.includes(eng) ? prev.filter((e) => e !== eng) : [...prev, eng]
    );
  };

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: "name-asc", label: t.search.sort_name_asc },
    { key: "price-asc", label: t.search.sort_price_asc },
    { key: "price-desc", label: t.search.sort_price_desc },
    { key: "newest", label: t.search.sort_newest },
  ];

  return (
    <div className="pt-24 pb-20 min-h-screen bg-background">
      {/* Hero Banner */}
      <div className="relative h-64 md:h-80 overflow-hidden mb-16">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <img
          src="https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?q=80&w=2070&auto=format&fit=crop"
          alt="Skrituļslidas"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-end container mx-auto px-4 md:px-6 pb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter"
          >
            {lang === "lv" ? "Skrituļslidas" : lang === "ru" ? "Роликовые коньки" : "Inline Skates"}
          </motion.h1>
          <p className="text-muted-foreground text-lg mt-2">
            {lang === "lv" ? "Rollerblade, K2, Fila — labākie brendai Latvijā" : lang === "ru" ? "Rollerblade, K2, Fila — лучшие бренды в Латвии" : "Rollerblade, K2, Fila — top brands in Latvia"}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6">
        {/* Category Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {["All", ...FILTER_ENGINES].map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setSidebarEngines([]); }}
              className={`px-5 py-2 text-sm font-bold uppercase tracking-widest border transition-colors ${
                sidebarEngines.length === 0 && activeCategory === cat
                  ? "bg-primary border-primary text-white"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {filterLabel[cat]}
            </button>
          ))}
        </div>

        {/* Sort + Sidebar Toggle */}
        <div className="flex items-center justify-between mb-8 gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {sidebarOpen ? t.search.collapse_filter : t.search.show_filter}
            {sidebarEngines.length > 0 && (
              <span className="bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {sidebarEngines.length}
              </span>
            )}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t.search.sort_label}:</span>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="text-sm border border-border bg-background px-3 py-1.5 focus:outline-none focus:border-primary rounded-none"
            >
              {sortOptions.map((o) => (
                <option key={o.key} value={o.key}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Collapsible Sidebar */}
          {sidebarOpen && (
            <aside className="w-48 flex-shrink-0">
              <div className="bg-card border border-border p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t.search.filter_label}</h3>
                  {sidebarEngines.length > 0 && (
                    <button onClick={() => setSidebarEngines([])} className="text-xs text-primary hover:underline">
                      <X className="h-3 w-3 inline" />
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {FILTER_ENGINES.map((eng) => (
                    <label key={eng} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={sidebarEngines.includes(eng)}
                        onChange={() => toggleSidebarEngine(eng)}
                        className="accent-primary"
                      />
                      <span className={`text-sm ${sidebarEngines.includes(eng) ? "text-primary font-bold" : "text-foreground group-hover:text-primary"}`}>
                        {engineLabel[eng] ?? eng}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </aside>
          )}

          {/* Products Grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setLocation(`/skates/${product.slug}`)}
                    className="group bg-card border border-border hover:border-primary/50 transition-all duration-300 overflow-hidden cursor-pointer"
                  >
                    <div className="relative overflow-hidden aspect-[4/3] bg-muted">
                      {product.badge && (
                        <span className="absolute top-3 left-3 z-10 bg-primary text-white text-xs font-bold px-2 py-1 uppercase tracking-wider">
                          {product.badge}
                        </span>
                      )}
                      <img
                        src={hoveredImages[product.id] ?? product.image}
                        alt={product.name}
                        className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?q=80&w=800&auto=format&fit=crop";
                        }}
                      />
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs uppercase tracking-wider border-muted text-muted-foreground">
                          {engineLabel[product.engine ?? ""] ?? product.engine}
                        </Badge>
                      </div>
                      <h3 className="font-bold text-foreground text-sm leading-tight mb-2">{product.name}</h3>
                      {Array.isArray(product.variants) && product.variants.length > 0 && (
                        <div className="flex items-center gap-1.5 mb-3">
                          {product.variants.slice(0, 6).map((v) => (
                            <span
                              key={v.id}
                              title={v.colorName}
                              className="h-4 w-4 rounded-full border-2 border-border hover:border-primary flex-shrink-0 cursor-pointer transition-transform hover:scale-125"
                              style={{ backgroundColor: v.colorHex ?? "#888" }}
                              onMouseEnter={() => setHoveredImages((prev) => ({ ...prev, [product.id]: v.image }))}
                              onMouseLeave={() => setHoveredImages((prev) => ({ ...prev, [product.id]: null }))}
                            />
                          ))}
                          {product.variants.length > 6 && (
                            <span className="text-xs text-muted-foreground">+{product.variants.length - 6}</span>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-xl font-black text-primary">€{product.price.toLocaleString()}</span>
                        {product.oldPrice && (
                          <span className="text-sm text-muted-foreground line-through">€{product.oldPrice.toLocaleString()}</span>
                        )}
                      </div>
                      <Link href={`/skates/${product.slug}`}>
                        <Button className="w-full bg-transparent border border-primary text-primary hover:bg-primary hover:text-white transition-colors rounded-none text-xs uppercase tracking-widest font-bold">
                          {lang === "lv" ? "Skatīt" : lang === "ru" ? "Смотреть" : "View"}
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info Banner */}
        <div className="mt-20 border border-border p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 bg-card">
          <div>
            <h2 className="text-3xl font-black text-foreground uppercase tracking-tighter mb-2">
              {lang === "lv" ? "Jautājumi? Mēs palīdzēsim!" : lang === "ru" ? "Вопросы? Мы поможем!" : "Questions? We'll help!"}
            </h2>
            <p className="text-muted-foreground">
              {lang === "lv" ? "Sazinieties ar mums un izvēlieties piemērotākās skrituļslidas." : lang === "ru" ? "Свяжитесь с нами и выберите подходящие ролики." : "Contact us and we'll help you choose the right skates."}
            </p>
          </div>
          <Link href="/contact">
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-none px-8 uppercase font-bold tracking-widest whitespace-nowrap">
              {lang === "lv" ? "Sazināties" : lang === "ru" ? "Связаться" : "Contact Us"} <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
