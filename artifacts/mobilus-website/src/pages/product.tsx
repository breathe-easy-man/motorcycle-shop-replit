import { useMemo, useState, useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, Clock, Loader2, Phone } from "lucide-react";
import { useI18n, Lang } from "@/lib/i18n";

interface Spec {
  label: { lv: string; en: string; ru: string };
  value: string;
}

interface ProductFromAPI {
  id: number;
  slug: string;
  name: string;
  price: number;
  oldPrice: number | null;
  category: string;
  engine: string;
  image: string;
  badge: string | null;
  stock: number;
  descriptionLv: string;
  descriptionEn: string;
  descriptionRu: string;
  specs: Spec[];
  createdAt: string;
  updatedAt: string;
}

const ANNUAL_RATE = 0.089;
const MONTHLY_RATE = ANNUAL_RATE / 12;
const TERM_OPTIONS = [12, 24, 36, 48, 60];

function calcMonthly(price: number, downPct: number, term: number) {
  const down = Math.round((price * downPct) / 100);
  const principal = price - down;
  if (principal <= 0) return 0;
  const r = MONTHLY_RATE;
  return (principal * r) / (1 - Math.pow(1 + r, -term));
}

const FALLBACK_IMAGES: Record<string, string> = {
  Skūteri: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=900&auto=format&fit=crop",
  Elektro: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?q=80&w=900&auto=format&fit=crop",
  Motocikli: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=900&auto=format&fit=crop",
  ATV: "https://images.unsplash.com/photo-1558981395-d5e1fa28e06e?q=80&w=900&auto=format&fit=crop",
  default: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=900&auto=format&fit=crop",
};

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const [location] = useLocation();
  const { t, lang } = useI18n();

  const parentSection = location.startsWith("/velo/") ? "velo"
    : location.startsWith("/skates/") ? "skates"
    : location.startsWith("/winter/") ? "winter"
    : "moto";

  const parentLabel =
    parentSection === "velo" ? (lang === "lv" ? "Velo" : lang === "ru" ? "Vело" : "Velo")
    : parentSection === "skates" ? (lang === "lv" ? "Skrituļslidas" : lang === "ru" ? "Ролики" : "Skates")
    : parentSection === "winter" ? (lang === "lv" ? "Ziemas Sports" : lang === "ru" ? "Зимний спорт" : "Winter Sports")
    : "Moto";

  const parentHref = `/${parentSection}`;

  const [product, setProduct] = useState<ProductFromAPI | null>(null);
  const [related, setRelated] = useState<ProductFromAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  const [firstPaymentPct, setFirstPaymentPct] = useState(10);
  const [term, setTerm] = useState(24);
  const [financingMode, setFinancingMode] = useState<"cash" | "incredit" | "uno">("incredit");

  useEffect(() => {
    setLoading(true);
    setImgError(false);
    fetch(`/api/products/slug/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        setProduct(data);
        return fetch("/api/products");
      })
      .then((r) => r.json())
      .then((all: ProductFromAPI[]) => {
        const list = Array.isArray(all) ? all : [];
        setRelated(list.filter((p) => p.slug !== slug).slice(0, 4));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (product) {
      const allProducts = fetch("/api/products")
        .then((r) => r.json())
        .then((all: ProductFromAPI[]) => {
          const list = Array.isArray(all) ? all : [];
          setRelated(
            list.filter((p) => p.category === product.category && p.slug !== slug).slice(0, 4)
          );
        });
    }
  }, [product, slug]);

  const monthlyIncredit = useMemo(
    () => product ? calcMonthly(product.price, firstPaymentPct, term) : 0,
    [product, firstPaymentPct, term]
  );
  const monthlyUno = useMemo(
    () => product ? calcMonthly(product.price, firstPaymentPct, term) * 1.02 : 0,
    [product, firstPaymentPct, term]
  );

  if (loading) {
    return (
      <div className="pt-32 pb-20 flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product || (product as any).error) {
    return (
      <div className="pt-32 pb-20 container mx-auto px-4 text-center">
        <h1 className="text-4xl font-black text-white mb-4">Produkts nav atrasts</h1>
        <Link href={parentHref}>
          <Button className="bg-primary text-white rounded-none">← {lang === "lv" ? "Atpakaļ" : lang === "ru" ? "Назад" : "Back"}</Button>
        </Link>
      </div>
    );
  }

  const desc =
    lang === "lv" ? product.descriptionLv :
    lang === "ru" ? product.descriptionRu :
    product.descriptionEn;

  const discountPct = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null;

  const fallbackImg = FALLBACK_IMAGES[product.category] ?? FALLBACK_IMAGES.default;
  const productImg = imgError ? fallbackImg : product.image;

  const firstPayment = Math.round((product.price * firstPaymentPct) / 100);

  const moLabel = lang === "lv" ? "mēn" : lang === "ru" ? "мес" : "mo";
  const moLabelDot = lang === "lv" ? "mēn." : lang === "ru" ? "мес." : "mo.";

  const stockStatus =
    product.stock === 0
      ? { label: lang === "lv" ? "Nav noliktavā" : lang === "ru" ? "Нет в наличии" : "Out of Stock", color: "text-red-500", icon: AlertCircle }
      : product.stock <= 2
      ? { label: lang === "lv" ? `Ierobežots (${product.stock} gab.)` : lang === "ru" ? `Ограничено (${product.stock} шт.)` : `Limited (${product.stock} left)`, color: "text-amber-400", icon: Clock }
      : { label: lang === "lv" ? `Noliktavā — ${product.stock} gab.` : lang === "ru" ? `В наличии — ${product.stock} шт.` : `In Stock — ${product.stock} units`, color: "text-emerald-400", icon: CheckCircle2 };

  const StockIcon = stockStatus.icon;

  return (
    <div className="pt-24 pb-20 min-h-screen bg-background">
      <div className="container mx-auto px-4 md:px-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-10">
          <Link href="/" className="hover:text-primary transition-colors">
            {lang === "lv" ? "Sākums" : lang === "ru" ? "Главная" : "Home"}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={parentHref} className="hover:text-primary transition-colors">{parentLabel}</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-primary">{product.name}</span>
        </nav>

        {/* Main Product Block */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">

          {/* === LEFT: Image === */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-4"
          >
            <div className="relative overflow-hidden bg-card border border-border aspect-[4/3] group">
              {discountPct && (
                <div className="absolute top-4 left-4 z-10 bg-primary text-white text-sm font-black px-3 py-1.5 uppercase tracking-wider">
                  -{discountPct}%
                </div>
              )}
              {product.badge && !discountPct && (
                <div className="absolute top-4 left-4 z-10 bg-primary text-white text-sm font-black px-3 py-1.5 uppercase tracking-wider">
                  {product.badge}
                </div>
              )}
              <img
                src={productImg}
                alt={product.name}
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                onError={() => setImgError(true)}
              />
            </div>

            {/* Thumbnail strip (decorative – shows same image in different aspect ratio variations) */}
            <div className="grid grid-cols-4 gap-2">
              {[product.image, product.image, product.image].map((src, i) => (
                <div
                  key={i}
                  className={`aspect-square overflow-hidden border cursor-pointer transition-colors ${
                    i === 0 ? "border-primary" : "border-border hover:border-primary/50"
                  }`}
                >
                  <img
                    src={imgError ? fallbackImg : src}
                    alt=""
                    className="w-full h-full object-cover object-center"
                    onError={(e) => { (e.target as HTMLImageElement).src = fallbackImg; }}
                  />
                </div>
              ))}
              <div className="aspect-square overflow-hidden border border-border flex items-center justify-center bg-card cursor-pointer hover:border-primary/50 transition-colors">
                <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider text-center leading-tight px-1">
                  360°
                </span>
              </div>
            </div>
          </motion.div>

          {/* === RIGHT: Info === */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col"
          >
            {/* Category + Engine */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-widest border border-border text-muted-foreground px-3 py-1">
                {product.category}
              </span>
              {product.engine && (
                <span className="text-xs font-bold uppercase tracking-widest border border-border text-muted-foreground px-3 py-1">
                  {product.engine}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white uppercase tracking-tighter leading-none mb-4">
              {product.name}
            </h1>

            {/* Stock status */}
            <div className={`flex items-center gap-2 text-sm font-bold mb-5 ${stockStatus.color}`}>
              <StockIcon className="h-4 w-4" />
              {stockStatus.label}
            </div>

            {/* Description */}
            <p className="text-muted-foreground text-base leading-relaxed mb-6 border-l-2 border-primary/40 pl-4">
              {desc}
            </p>

            {/* Price */}
            <div className="flex items-baseline gap-4 mb-8">
              <span className="text-5xl font-black text-primary">€{product.price.toLocaleString()}</span>
              {product.oldPrice && (
                <div className="flex flex-col">
                  <span className="text-lg text-muted-foreground line-through">€{product.oldPrice.toLocaleString()}</span>
                  <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
                    {lang === "lv" ? `Ietaupīji €${product.oldPrice - product.price}` : lang === "ru" ? `Экономия €${product.oldPrice - product.price}` : `Save €${product.oldPrice - product.price}`}
                  </span>
                </div>
              )}
            </div>

            {/* Financing Options */}
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                {lang === "lv" ? "Apmaksas veids" : lang === "ru" ? "Способ оплаты" : "Payment Option"}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {/* Cash */}
                <button
                  onClick={() => setFinancingMode("cash")}
                  className={`p-4 border text-left transition-all duration-200 ${
                    financingMode === "cash"
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/40 bg-card"
                  }`}
                >
                  <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${financingMode === "cash" ? "text-primary" : "text-muted-foreground"}`}>
                    {lang === "lv" ? "Uzreiz" : lang === "ru" ? "Сразу" : "Cash"}
                  </div>
                  <div className="text-lg font-black text-white">€{product.price.toLocaleString()}</div>
                  {discountPct && (
                    <div className="text-xs text-emerald-400 font-bold mt-0.5">-{discountPct}%</div>
                  )}
                </button>

                {/* InCredit */}
                <button
                  onClick={() => setFinancingMode("incredit")}
                  className={`p-4 border text-left transition-all duration-200 ${
                    financingMode === "incredit"
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/40 bg-card"
                  }`}
                >
                  <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${financingMode === "incredit" ? "text-primary" : "text-muted-foreground"}`}>
                    IN<span className="text-primary">CREDIT</span>
                  </div>
                  <div className="text-lg font-black text-white">€{monthlyIncredit.toFixed(0)}</div>
                  <div className="text-xs text-muted-foreground">/{moLabel}</div>
                </button>

                {/* Uno Leasing */}
                <button
                  onClick={() => setFinancingMode("uno")}
                  className={`p-4 border text-left transition-all duration-200 ${
                    financingMode === "uno"
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/40 bg-card"
                  }`}
                >
                  <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${financingMode === "uno" ? "text-primary" : "text-muted-foreground"}`}>
                    UNO<span className="text-primary">LEASING</span>
                  </div>
                  <div className="text-lg font-black text-white">€{monthlyUno.toFixed(0)}</div>
                  <div className="text-xs text-muted-foreground">/{moLabel}</div>
                </button>
              </div>

              {financingMode !== "cash" && (
                <p className="text-xs text-muted-foreground mt-2">
                  {lang === "lv"
                    ? `Pirmā iemaksa ${firstPaymentPct}% · ${term} ${moLabelDot} · 8.9% p.a. (indikatīvs)`
                    : lang === "ru"
                    ? `Первоначальный взнос ${firstPaymentPct}% · ${term} ${moLabelDot} · 8.9% г.с. (индикативно)`
                    : `Down payment ${firstPaymentPct}% · ${term} ${moLabelDot} · 8.9% p.a. (indicative)`}
                </p>
              )}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/contact" className="flex-1">
                <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-none h-14 text-sm font-black uppercase tracking-widest">
                  <Phone className="mr-2 h-4 w-4" />
                  {t.product.inquire}
                </Button>
              </Link>
              <Link href="/leasing" className="flex-1">
                <Button variant="outline" className="w-full border-border text-foreground hover:border-primary hover:text-primary rounded-none h-14 text-sm font-bold uppercase tracking-widest">
                  {lang === "lv" ? "Aprēķināt līzingu" : lang === "ru" ? "Рассчитать лизинг" : "Calculate Lease"}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Trust line */}
            <div className="mt-4 flex items-center gap-6 text-xs text-muted-foreground border-t border-border pt-4">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                {lang === "lv" ? "Garantija" : lang === "ru" ? "Гарантия" : "Warranty"}
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                {lang === "lv" ? "Serviss" : lang === "ru" ? "Сервис" : "Service"}
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                {lang === "lv" ? "Piegāde Latvijā" : lang === "ru" ? "Доставка по Латвии" : "Latvia Delivery"}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Specs + Leasing Calculator */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-20">

          {/* Specs Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card border border-border p-8"
          >
            <h2 className="text-xs font-black uppercase tracking-widest text-primary mb-6">
              {t.product.specs}
            </h2>
            <div className="space-y-0">
              {(product.specs as Spec[]).map((spec, i) => (
                <div
                  key={i}
                  className={`flex justify-between items-center py-3 ${
                    i % 2 === 0 ? "bg-background/50" : ""
                  } px-3`}
                >
                  <span className="text-muted-foreground text-sm">
                    {spec.label[lang as Lang] || spec.label.en}
                  </span>
                  <span className="font-black text-white text-sm">{spec.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Leasing Calculator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border p-8"
          >
            <h2 className="text-xs font-black uppercase tracking-widest text-primary mb-6">
              {t.product.leasing_title}
            </h2>

            {/* Product Price (fixed) */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-border">
              <span className="text-sm text-muted-foreground uppercase tracking-wider font-bold">{t.product.price_label}</span>
              <span className="text-2xl font-black text-white">€{product.price.toLocaleString()}</span>
            </div>

            {/* Monthly result */}
            <div className="bg-primary/10 border border-primary/20 px-6 py-5 mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                  {t.product.monthly}
                </p>
                <div className="text-4xl font-black text-white">
                  €{monthlyIncredit.toFixed(0)}
                  <span className="text-base font-normal text-muted-foreground ml-2">/{moLabel}</span>
                </div>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <div>{firstPaymentPct}% {lang === "lv" ? "iemaksa" : lang === "ru" ? "взнос" : "down"}</div>
                <div className="text-primary font-bold">{term} {moLabelDot}</div>
              </div>
            </div>

            {/* First Payment Slider */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t.product.first_payment}
                </label>
                <span className="text-sm font-black text-white">{firstPaymentPct}% — €{firstPayment.toLocaleString()}</span>
              </div>
              <Slider
                min={0}
                max={50}
                step={5}
                value={[firstPaymentPct]}
                onValueChange={([val]) => setFirstPaymentPct(val)}
                className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary"
              />
              <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                <span>0%</span><span>50%</span>
              </div>
            </div>

            {/* Lease Term */}
            <div className="mb-6">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-3">
                {t.product.term}
              </label>
              <div className="flex gap-2">
                {TERM_OPTIONS.map((t_) => (
                  <button
                    key={t_}
                    onClick={() => setTerm(t_)}
                    className={`flex-1 py-2.5 text-xs font-black border transition-colors ${
                      term === t_
                        ? "bg-primary border-primary text-white"
                        : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                    }`}
                  >
                    {t_}m
                  </button>
                ))}
              </div>
            </div>

            <Link href="/contact">
              <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-none h-12 font-black uppercase tracking-widest text-sm">
                {t.product.apply} <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground mt-3">{t.leasing.indicative}</p>
          </motion.div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                {lang === "lv" ? "Līdzīgi produkti" : lang === "ru" ? "Похожие товары" : "Related Products"}
              </h2>
              <Link href="/moto" className="text-xs font-bold uppercase tracking-widest text-primary hover:underline flex items-center gap-1">
                {lang === "lv" ? "Visi" : lang === "ru" ? "Все" : "All"} <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map((rel, i) => (
                <motion.div
                  key={rel.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="group bg-card border border-border hover:border-primary/50 transition-all overflow-hidden"
                >
                  <Link href={`/moto/${rel.slug}`} className="block">
                    <div className="aspect-[4/3] overflow-hidden bg-muted">
                      <img
                        src={rel.image}
                        alt={rel.name}
                        className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = FALLBACK_IMAGES[rel.category] ?? FALLBACK_IMAGES.default;
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{rel.category}</p>
                      <h3 className="font-black text-sm text-white leading-tight mb-2">{rel.name}</h3>
                      <div className="flex items-baseline gap-2">
                        <span className="font-black text-primary">€{rel.price.toLocaleString()}</span>
                        {rel.oldPrice && (
                          <span className="text-xs text-muted-foreground line-through">€{rel.oldPrice.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
