import { useMemo, useState } from "react";
import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calculator, Clock, Percent } from "lucide-react";
import { getProductBySlug } from "@/lib/products";
import { useI18n, Lang } from "@/lib/i18n";

const ANNUAL_RATE = 0.089;
const MONTHLY_RATE = ANNUAL_RATE / 12;
const TERM_OPTIONS = [12, 24, 36, 48, 60];

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, lang } = useI18n();
  const product = getProductBySlug(slug || "");

  const [firstPaymentPct, setFirstPaymentPct] = useState(10);
  const [term, setTerm] = useState(24);

  const firstPayment = product ? Math.round((product.price * firstPaymentPct) / 100) : 0;
  const principal = product ? product.price - firstPayment : 0;

  const monthlyPayment = useMemo(() => {
    if (principal <= 0) return 0;
    const r = MONTHLY_RATE;
    const n = term;
    return (principal * r) / (1 - Math.pow(1 + r, -n));
  }, [principal, term]);

  if (!product) {
    return (
      <div className="pt-32 pb-20 container mx-auto px-4 text-center">
        <h1 className="text-4xl font-black text-white mb-4">Product not found</h1>
        <Link href="/moto">
          <Button className="bg-primary text-white rounded-none">Back to Moto</Button>
        </Link>
      </div>
    );
  }

  const desc = product.description[lang as Lang] || product.description.en;

  return (
    <div className="pt-24 pb-20 min-h-screen bg-background">
      <div className="container mx-auto px-4 md:px-6">
        {/* Breadcrumb */}
        <Link href="/moto" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-bold uppercase tracking-widest mb-10">
          <ChevronLeft className="h-4 w-4" />
          {t.product.back}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="relative overflow-hidden bg-card border border-border aspect-[4/3]">
              {product.badge && (
                <span className="absolute top-4 left-4 z-10 bg-primary text-white text-xs font-bold px-3 py-1 uppercase tracking-wider">
                  {product.badge}
                </span>
              )}
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=800&auto=format&fit=crop";
                }}
              />
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex gap-2 mb-4">
              <Badge variant="outline" className="text-xs uppercase tracking-wider border-muted text-muted-foreground">
                {product.engine}
              </Badge>
              <Badge variant="outline" className="text-xs uppercase tracking-wider border-muted text-muted-foreground">
                {product.category}
              </Badge>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-4 leading-tight">
              {product.name}
            </h1>

            <p className="text-muted-foreground text-base leading-relaxed mb-6">{desc}</p>

            <div className="flex items-baseline gap-3 mb-8">
              <span className="text-4xl font-black text-primary">€{product.price.toLocaleString()}</span>
              {product.oldPrice && (
                <span className="text-xl text-muted-foreground line-through">€{product.oldPrice.toLocaleString()}</span>
              )}
            </div>

            {/* Quick Leasing Preview */}
            <div className="bg-primary/10 border border-primary/20 p-5 mb-8">
              <div className="flex items-center gap-2 mb-1">
                <Calculator className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest text-primary">{t.product.leasing_title}</span>
              </div>
              <div className="text-3xl font-black text-white">
                €{monthlyPayment.toFixed(0)}<span className="text-base font-normal text-muted-foreground ml-2">/ {lang === "lv" ? "mēn" : lang === "ru" ? "мес" : "mo"}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t.product.first_payment}: {firstPaymentPct}% (€{firstPayment}) · {term} {lang === "lv" ? "mēn." : lang === "ru" ? "мес." : "mo."} · 8.9%
              </p>
            </div>

            {/* Specs */}
            <div className="mb-8">
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">{t.product.specs}</h2>
              <div className="space-y-3">
                {product.specs.map((spec, i) => (
                  <div key={i} className="flex justify-between items-center border-b border-border pb-2 last:border-0">
                    <span className="text-muted-foreground text-sm">{spec.label[lang as Lang] || spec.label.en}</span>
                    <span className="font-bold text-foreground text-sm">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link href="/contact">
              <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-none h-14 text-base font-bold uppercase tracking-widest">
                {t.product.inquire} <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Full Leasing Calculator */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card border border-border p-8"
          >
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
              <Calculator className="h-6 w-6 text-primary" />
              {t.product.leasing_title}
            </h2>

            {/* Product Price (fixed) */}
            <div className="mb-6 border-b border-border pb-6">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{t.product.price_label}</span>
                <span className="text-2xl font-black text-white">€{product.price.toLocaleString()}</span>
              </div>
            </div>

            {/* First Payment */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  {t.product.first_payment}
                </label>
                <span className="text-xl font-black text-white">
                  {firstPaymentPct}% — €{firstPayment.toLocaleString()}
                </span>
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
                <span>0%</span>
                <span>50%</span>
              </div>
            </div>

            {/* Lease Term */}
            <div className="mb-8">
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground block mb-3">
                {t.product.term}
              </label>
              <div className="flex gap-2">
                {TERM_OPTIONS.map((t_) => (
                  <button
                    key={t_}
                    onClick={() => setTerm(t_)}
                    className={`flex-1 py-3 text-sm font-bold border transition-colors ${
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

            {/* Interest Rate */}
            <div className="border border-border p-4 mb-8 flex items-center gap-3">
              <Percent className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{t.leasing.interest}</p>
                <p className="text-lg font-black text-white">8.9% <span className="font-normal text-sm text-muted-foreground">p.a.</span></p>
              </div>
            </div>

            <Link href="/contact">
              <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-none h-12 font-bold uppercase tracking-widest">
                {t.product.apply} <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>

          {/* Results */}
          <div className="space-y-6">
            {/* Monthly Payment Hero */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-primary p-8"
            >
              <p className="text-white/70 text-sm font-bold uppercase tracking-widest mb-2">{t.product.monthly}</p>
              <div className="text-6xl font-black text-white mb-2">€{monthlyPayment.toFixed(0)}</div>
              <p className="text-white/70 text-sm">
                {t.leasing.for_months.replace("{n}", String(term))}
              </p>
            </motion.div>

            {/* Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-card border border-border p-8"
            >
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">
                {t.leasing.breakdown}
              </h3>
              <div className="space-y-4">
                {[
                  { label: t.leasing.product_price, value: `€${product.price.toLocaleString()}` },
                  { label: t.leasing.down_payment, value: `€${firstPayment.toLocaleString()} (${firstPaymentPct}%)` },
                  { label: t.leasing.financed, value: `€${principal.toLocaleString()}` },
                  { label: t.leasing.total_payable, value: `€${(monthlyPayment * term + firstPayment).toFixed(0)}` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center border-b border-border pb-3 last:border-0 last:pb-0">
                    <span className="text-muted-foreground text-sm">{label}</span>
                    <span className="font-bold text-foreground">{value}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">{t.leasing.indicative}</p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
