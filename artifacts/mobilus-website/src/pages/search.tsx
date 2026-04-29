import { useState, useEffect, useMemo } from "react";
import { useSearch, useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight, Loader2, SlidersHorizontal, X, CheckCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { api, type ApiSearchResult } from "@/lib/api";

type SortKey = "price-asc" | "price-desc" | "newest" | "name-asc";

const MOTO_CATS = new Set(["Skūteri", "Elektro", "Motocikli", "ATV"]);
const VELO_CATS = new Set(["Pilsēta", "Kalns", "E-Velo", "Bērniem", "Šoseja"]);
const SKATE_CATS = new Set(["Skrituļslidas"]);
const WINTER_CATS = new Set(["Slēpošana", "Snoubords"]);

function getProductPath(r: ApiSearchResult): string {
  const cat = r.category;
  if (MOTO_CATS.has(cat)) return `/moto/${r.slug}`;
  if (VELO_CATS.has(cat)) return `/velo/${r.slug}`;
  if (SKATE_CATS.has(cat)) return `/skates/${r.slug}`;
  if (WINTER_CATS.has(cat)) return `/winter/${r.slug}`;
  return `/moto/${r.slug}`;
}

export default function SearchPage() {
  const { t } = useI18n();
  const searchStr = useSearch();
  const [, navigate] = useLocation();
  const q = new URLSearchParams(searchStr).get("q") ?? "";

  const [results, setResults] = useState<ApiSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("name-asc");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [featuredProducts, setFeaturedProducts] = useState<ApiSearchResult[]>([]);

  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  useEffect(() => {
    if (!q || q.trim().length < 2) { setResults([]); return; }
    setLoading(true);
    api.search.query(q.trim(), 50)
      .then(setResults)
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [q]);

  useEffect(() => {
    fetch("/api/products?featured=true")
      .then(r => r.json())
      .then((data: unknown) => {
        const list: ApiSearchResult[] = (Array.isArray(data) ? data : []).map((p: Record<string, unknown>) => ({
          id: Number(p.id),
          slug: String(p.slug ?? ""),
          name: String(p.name ?? ""),
          category: String(p.category ?? ""),
          image: String(p.image ?? ""),
          price: Number(p.price ?? 0),
          createdAt: String(p.createdAt ?? ""),
        }));
        setFeaturedProducts(list.slice(0, 6));
      })
      .catch(() => {});
  }, []);

  const allCategories = useMemo(() => {
    const cats = new Set(results.map((r) => r.category));
    return Array.from(cats).sort();
  }, [results]);

  const filteredResults = useMemo(() => {
    let list = selectedCategories.length > 0
      ? results.filter((r) => selectedCategories.includes(r.category))
      : results;

    switch (sortKey) {
      case "price-asc": list = [...list].sort((a, b) => a.price - b.price); break;
      case "price-desc": list = [...list].sort((a, b) => b.price - a.price); break;
      case "newest": list = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
      case "name-asc": list = [...list].sort((a, b) => a.name.localeCompare(b.name)); break;
    }
    return list;
  }, [results, selectedCategories, sortKey]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
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
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="mb-10">
          <p className="text-primary font-bold uppercase tracking-widest text-sm mb-2">{t.search.results_for}</p>
          <h1 className="text-4xl md:text-5xl font-black text-foreground uppercase tracking-tighter">
            "{q}"
          </h1>
          {!loading && results.length > 0 && (
            <p className="text-muted-foreground mt-2">
              {filteredResults.length} {t.search.results_count}
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : results.length === 0 ? (
          /* ===== NOTHING FOUND STATE ===== */
          <div className="max-w-2xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-3xl md:text-4xl font-black text-foreground uppercase tracking-tighter mb-3">
                {t.search.no_results_title}
              </h2>
              <p className="text-muted-foreground text-lg mb-10">{t.search.no_results_sub}</p>

              {contactSubmitted ? (
                <div className="bg-card border border-border p-10 flex flex-col items-center text-center">
                  <CheckCircle className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-2xl font-black uppercase tracking-tighter">{t.contact.success_title}</h3>
                  <p className="text-muted-foreground mt-2">{t.contact.success_msg.replace("{h}", "24")}</p>
                </div>
              ) : (
                <form
                  onSubmit={(e) => { e.preventDefault(); setContactSubmitted(true); }}
                  className="bg-card border border-border p-8 space-y-5"
                >
                  <h3 className="text-lg font-black uppercase tracking-tighter">{t.search.contact_form_title}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t.contact.name}</label>
                      <Input
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm((f) => ({ ...f, name: e.target.value }))}
                        className="rounded-none h-11"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t.contact.email}</label>
                      <Input
                        required
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm((f) => ({ ...f, email: e.target.value }))}
                        className="rounded-none h-11"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t.contact.message}</label>
                    <Textarea
                      required
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) => setContactForm((f) => ({ ...f, message: e.target.value }))}
                      className="rounded-none resize-none"
                      placeholder={`${t.search.no_results_title} "${q}"...`}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white rounded-none h-12 font-bold uppercase tracking-widest">
                    {t.contact.submit}
                  </Button>
                </form>
              )}

              {/* Featured Products Below */}
              {featuredProducts.length > 0 && (
                <div className="mt-16">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">{t.search.featured_below}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {featuredProducts.map((p) => (
                      <Link key={p.id} href={getProductPath(p)} className="group block border border-border hover:border-primary/50 transition-colors">
                        <div className="aspect-[4/3] overflow-hidden bg-muted">
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                        <div className="p-3">
                          <p className="text-xs font-bold text-foreground truncate">{p.name}</p>
                          <p className="text-sm font-black text-primary">€{p.price.toLocaleString()}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        ) : (
          /* ===== RESULTS WITH FILTERS ===== */
          <div className="flex gap-8">
            {/* Sidebar */}
            <aside className={`flex-shrink-0 transition-all ${sidebarOpen ? "w-52" : "w-0 overflow-hidden"}`}>
              {sidebarOpen && (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t.search.filter_category}</h3>
                      {selectedCategories.length > 0 && (
                        <button
                          onClick={() => setSelectedCategories([])}
                          className="text-xs text-primary hover:underline"
                        >
                          <X className="h-3 w-3 inline" /> Reset
                        </button>
                      )}
                    </div>
                    <div className="space-y-2">
                      {allCategories.map((cat) => (
                        <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(cat)}
                            onChange={() => toggleCategory(cat)}
                            className="accent-primary"
                          />
                          <span className={`text-sm transition-colors ${selectedCategories.includes(cat) ? "text-primary font-bold" : "text-foreground group-hover:text-primary"}`}>
                            {cat}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Sort + filter toggle bar */}
              <div className="flex items-center justify-between mb-6 gap-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {sidebarOpen ? t.search.collapse_filter : t.search.show_filter}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResults.map((r, i) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="group bg-card border border-border hover:border-primary/50 transition-all overflow-hidden"
                  >
                    <Link href={getProductPath(r)} className="block">
                      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                        <img
                          src={r.image}
                          alt={r.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=600&auto=format&fit=crop"; }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <span className="text-white text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity bg-primary px-4 py-2">
                            {t.home.featured_view_details}
                          </span>
                        </div>
                      </div>
                    </Link>
                    <div className="p-5">
                      <Badge variant="outline" className="text-xs uppercase tracking-wider border-muted text-muted-foreground mb-2">
                        {r.category}
                      </Badge>
                      <h3 className="font-bold text-foreground text-sm leading-tight mb-3">{r.name}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-black text-primary">€{r.price.toLocaleString()}</span>
                        <Link href={getProductPath(r)}>
                          <Button size="sm" className="bg-transparent border border-primary text-primary hover:bg-primary hover:text-white rounded-none text-xs uppercase font-bold">
                            <ChevronRight className="h-3 w-3" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
