import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Menu, X, ChevronRight, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useI18n, Lang } from "@/lib/i18n";
import { useCart } from "@/lib/cart";

const LANGS: { code: Lang; label: string }[] = [
  { code: "lv", label: "LV" },
  { code: "en", label: "EN" },
  { code: "ru", label: "RU" },
];

export function Navbar() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, lang, setLang } = useI18n();
  const { count } = useCart();

  const navLinks = [
    { href: "/moto", label: t.nav.moto },
    { href: "/velo", label: t.nav.velo },
    { href: "/leasing", label: t.nav.leasing },
    { href: "/about", label: t.nav.about },
    { href: "/contact", label: t.nav.contact },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-white border-b border-border shadow-sm">
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between gap-6 h-16">
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

        {/* Right: Language Switcher + Cart */}
        <div className="hidden md:flex items-center gap-3 flex-shrink-0">
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

        {/* Mobile: Cart + Menu Toggle */}
        <div className="md:hidden flex items-center gap-3">
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

      {/* Mobile Nav */}
      {mobileMenuOpen && (
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
          {/* Mobile Language Switcher */}
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
