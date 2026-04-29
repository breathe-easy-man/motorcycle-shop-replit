import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Menu, X, ChevronRight, ShoppingCart, Search } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useI18n, Lang } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { api, type ApiSearchResult } from "@/lib/api";

const LANGS: { code: Lang; label: string }[] = [
  { code: "lv", label: "LV" },
  { code: "en", label: "EN" },
  { code: "ru", label: "RU" },
];

const MOTO_CATS = new Set(["Skūteri", "Elektro", "Motocikli", "ATV"]);
const VELO_CATS = new Set(["Pilsēta", "Kalns", "E-Velo", "Bērniem", "Šoseja"]);
const SKATE_CATS = new Set(["Skrituļslidas"]);
const WINTER_CATS = new Set(["Slēpošana", "Snoubords"]);

function getProductPath(result: ApiSearchResult): string {
  const cat = result.category;
  if (MOTO_CATS.has(cat)) return `/moto/${result.slug}`;
  if (VELO_CATS.has(cat)) return `/velo/${result.slug}`;
  if (SKATE_CATS.has(cat)) return `/skates/${result.slug}`;
  if (WINTER_CATS.has(cat)) return `/winter/${result.slug}`;
  return `/moto/${result.slug}`;
}

export function Navbar() {
  const [location, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, lang, setLang } = useI18n();
  const { count } = useCart();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ApiSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchBarOpen, setSearchBarOpen] = useState(false); // mobile only; desktop is always visible
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navLinks = [
    { href: "/moto", label: t.nav.moto },
    { href: "/velo", label: t.nav.velo },
    { href: "/leasing", label: t.nav.leasing },
    { href: "/about", label: t.nav.about },
    { href: "/contact", label: t.nav.contact },
  ];

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setDropdownOpen(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await api.search.query(searchQuery.trim(), 8);
        setSearchResults(results);
        setDropdownOpen(true);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 150);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery]);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        setSearchBarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleSearchSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setDropdownOpen(false);
    setSearchBarOpen(false);
    navigate(`/search?q=${encodeURIComponent(q)}`);
  }, [searchQuery, navigate]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearchSubmit();
    if (e.key === "Escape") { setDropdownOpen(false); setSearchBarOpen(false); }
  };

  const openSearch = () => {
    setSearchBarOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const groupedResults = searchResults.reduce<Record<string, ApiSearchResult[]>>((acc, r) => {
    if (!acc[r.category]) acc[r.category] = [];
    acc[r.category].push(r);
    return acc;
  }, {});

  return (
    <header className="fixed top-0 w-full z-50 bg-white border-b border-border shadow-sm">
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between gap-4 h-16">
        <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
          <span className="text-2xl font-black tracking-tighter text-foreground uppercase italic">
            Mobilus<span className="text-primary">.</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-7 flex-1 justify-center">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium uppercase tracking-wider transition-colors hover:text-primary",
                location.startsWith(link.href) ? "text-primary" : "text-foreground/60"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Right: Search + Language + Cart */}
        <div className="hidden md:flex items-center gap-3 flex-shrink-0" ref={searchRef}>
          {/* Search — always visible on desktop */}
          <div className="relative">
            <form onSubmit={handleSearchSubmit} className="flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t.search.placeholder}
                className="w-52 h-9 px-3 text-sm border border-border focus:border-primary focus:outline-none bg-background rounded-none"
                autoComplete="off"
              />
              <button type="submit" className="h-9 w-9 flex items-center justify-center border border-l-0 border-border hover:bg-muted text-muted-foreground">
                <Search className="h-4 w-4" />
              </button>
            </form>

            {/* Autocomplete Dropdown */}
            {dropdownOpen && (
              <div className="absolute top-full right-0 mt-1 w-80 bg-white border border-border shadow-xl z-50 max-h-96 overflow-y-auto">
                {searchResults.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground">{t.search.no_results_inline}</div>
                ) : (
                  <>
                    {Object.entries(groupedResults).map(([cat, items]) => (
                      <div key={cat}>
                        <div className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground bg-muted/40 border-b border-border">
                          {cat}
                        </div>
                        {items.map((r) => (
                          <Link
                            key={r.id}
                            href={getProductPath(r)}
                            onClick={() => { setDropdownOpen(false); setSearchBarOpen(false); setSearchQuery(""); }}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors border-b border-border/30 last:border-0"
                          >
                            <img
                              src={r.image}
                              alt={r.name}
                              className="w-12 h-10 object-cover flex-shrink-0 bg-muted"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-foreground truncate">{r.name}</p>
                              <p className="text-xs text-primary font-bold">€{r.price.toLocaleString()}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ))}
                    <button
                      onClick={handleSearchSubmit}
                      className="w-full px-4 py-3 text-sm font-bold text-primary hover:bg-primary hover:text-white transition-colors border-t border-border text-left flex items-center gap-2"
                    >
                      <Search className="h-4 w-4" />
                      {t.search.see_all} "{searchQuery}"
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Language */}
          <div className="flex items-center gap-1">
            {LANGS.map((l, i) => (
              <span key={l.code} className="flex items-center">
                <button
                  onClick={() => setLang(l.code)}
                  className={cn(
                    "text-xs font-bold uppercase tracking-widest px-1 transition-colors",
                    lang === l.code ? "text-primary" : "text-foreground/40 hover:text-foreground"
                  )}
                >
                  {l.label}
                </button>
                {i < LANGS.length - 1 && (
                  <span className="text-border text-xs">|</span>
                )}
              </span>
            ))}
          </div>

          {/* Cart icon */}
          <Link href="/cart" className="relative flex items-center justify-center h-9 w-9 hover:text-primary transition-colors text-foreground/60">
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-black h-5 w-5 rounded-full flex items-center justify-center leading-none">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </Link>
        </div>

        {/* Mobile: Search + Cart + Menu Toggle */}
        <div className="md:hidden flex items-center gap-2" ref={searchRef}>
          <button
            onClick={openSearch}
            className="text-foreground/60 h-9 w-9 flex items-center justify-center"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
          <Link href="/cart" className="relative flex items-center justify-center h-9 w-9 text-foreground/60">
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-black h-5 w-5 rounded-full flex items-center justify-center leading-none">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </Link>
          <button
            className="text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {searchBarOpen && (
        <div className="md:hidden border-b border-border bg-white px-4 py-2">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.search.placeholder}
              className="flex-1 h-10 px-3 text-sm border border-border focus:border-primary focus:outline-none bg-background rounded-none"
              autoFocus
              autoComplete="off"
            />
            <button type="submit" className="h-10 px-4 bg-primary text-white text-sm font-bold uppercase tracking-wider">
              <Search className="h-4 w-4" />
            </button>
          </form>
          {dropdownOpen && searchResults.length > 0 && (
            <div className="mt-2 border border-border bg-white max-h-64 overflow-y-auto">
              {searchResults.map((r) => (
                <Link
                  key={r.id}
                  href={getProductPath(r)}
                  onClick={() => { setDropdownOpen(false); setSearchBarOpen(false); setSearchQuery(""); }}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-muted border-b border-border/30 last:border-0"
                >
                  <img src={r.image} alt={r.name} className="w-10 h-8 object-cover bg-muted flex-shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{r.name}</p>
                    <p className="text-xs text-primary font-bold">€{r.price.toLocaleString()}</p>
                  </div>
                </Link>
              ))}
              <button onClick={handleSearchSubmit} className="w-full px-3 py-2 text-sm font-bold text-primary border-t border-border text-left">
                {t.search.see_all} "{searchQuery}"
              </button>
            </div>
          )}
          {dropdownOpen && searchResults.length === 0 && !searchLoading && searchQuery.trim().length >= 2 && (
            <p className="mt-2 px-3 py-2 text-sm text-muted-foreground">{t.search.no_results_inline}</p>
          )}
        </div>
      )}

      {/* Mobile Nav */}
      {mobileMenuOpen && !searchBarOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-border p-4 flex flex-col gap-2 shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "text-base font-medium uppercase tracking-wider py-3 border-b border-border/50 flex items-center justify-between",
                location.startsWith(link.href) ? "text-primary" : "text-foreground"
              )}
            >
              {link.label}
              <ChevronRight size={16} className="text-muted-foreground" />
            </Link>
          ))}
          <div className="flex gap-4 pt-3">
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => { setLang(l.code); setMobileMenuOpen(false); }}
                className={cn(
                  "text-sm font-bold uppercase tracking-widest",
                  lang === l.code ? "text-primary" : "text-muted-foreground"
                )}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
