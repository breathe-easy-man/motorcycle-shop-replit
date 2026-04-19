import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useSearch } from "wouter";
import { ChevronRight, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";

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
  description: string | null;
  stock: number;
}

export default function Moto() {
  const { t } = useI18n();
  const search = useSearch();
  const categoryParam = new URLSearchParams(search).get("category");
  const [activeCategory, setActiveCategory] = useState(categoryParam ?? t.moto.filter_all);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        const list: Product[] = Array.isArray(data) ? data : (data.products ?? []);
        setProducts(list);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const categories = [
    t.moto.filter_all,
    "Skūteri",
    "Elektro",
    "Motocikli",
    "ATV",
  ];

  const filtered =
    activeCategory === t.moto.filter_all || !categories.includes(activeCategory)
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <div className="pt-24 pb-20 min-h-screen bg-background">
      {/* Hero Banner */}
      <div className="relative h-64 md:h-80 overflow-hidden mb-16">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <img
          src="https://www.mobilus.lv/img/main/moto_lv.png"
          alt="Moto"
          className="absolute inset-0 w-full h-full object-cover object-center"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=2070&auto=format&fit=crop";
          }}
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-end container mx-auto px-4 md:px-6 pb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter"
          >
            {t.moto.title}
          </motion.h1>
          <p className="text-muted-foreground text-lg mt-2">{t.moto.subtitle}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 text-sm font-bold uppercase tracking-widest border transition-colors ${
                activeCategory === cat
                  ? "bg-primary border-primary text-white"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
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
                className="group bg-card border border-border hover:border-primary/50 transition-all duration-300 overflow-hidden"
              >
                <Link href={`/moto/${product.slug}`} className="block">
                  <div className="relative overflow-hidden aspect-[4/3] bg-muted cursor-pointer">
                    {product.badge && (
                      <span className="absolute top-3 left-3 z-10 bg-primary text-white text-xs font-bold px-2 py-1 uppercase tracking-wider">
                        {product.badge}
                      </span>
                    )}
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=600&auto=format&fit=crop";
                      }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                      <span className="text-white text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity bg-primary px-4 py-2">
                        {t.moto.view_details}
                      </span>
                    </div>
                  </div>
                </Link>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    {product.engine && (
                      <Badge variant="outline" className="text-xs uppercase tracking-wider border-muted text-muted-foreground">
                        {product.engine}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs uppercase tracking-wider border-muted text-muted-foreground">
                      {product.category}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-foreground text-sm leading-tight mb-3">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-xl font-black text-primary">
                        €{product.price.toLocaleString()}
                      </span>
                      {product.oldPrice && (
                        <span className="ml-2 text-sm text-muted-foreground line-through">
                          €{product.oldPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <Link href={`/moto/${product.slug}`}>
                    <Button className="w-full bg-transparent border border-primary text-primary hover:bg-primary hover:text-white transition-colors rounded-none text-xs uppercase tracking-widest font-bold">
                      {t.moto.view_details} <ChevronRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Leasing CTA */}
        <div className="mt-20 border border-border p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 bg-card">
          <div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">
              {t.moto.finance}
            </h2>
            <p className="text-muted-foreground">{t.moto.finance_sub}</p>
          </div>
          <Link href="/leasing">
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-none px-8 uppercase font-bold tracking-widest whitespace-nowrap">
              {t.moto.leasing_calc} <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
