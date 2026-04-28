import { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Link } from "wouter";
import { ChevronRight, Calculator, Building2, Info } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { api, type ApiLeasingPartner } from "@/lib/api";

const MONTHLY_RATE = 0.089 / 12;
const TERM_OPTIONS = [12, 24, 36, 48, 60];

export default function Leasing() {
  const { t } = useI18n();
  const [price, setPrice] = useState(3000);
  const [firstPaymentPct, setFirstPaymentPct] = useState(10);
  const [term, setTerm] = useState(24);
  const [partners, setPartners] = useState<ApiLeasingPartner[]>([]);
  const [openBubble, setOpenBubble] = useState<number | null>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.leasingPartners.list().then(setPartners).catch(() => {});
  }, []);

  // Close bubble on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (bubbleRef.current && !bubbleRef.current.contains(e.target as Node)) {
        setOpenBubble(null);
      }
    }
    if (openBubble !== null) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openBubble]);

  const firstPayment = Math.round((price * firstPaymentPct) / 100);
  const principal = price - firstPayment;

  const monthlyPayment = useMemo(() => {
    if (principal <= 0) return 0;
    const r = MONTHLY_RATE;
    const n = term;
    return (principal * r) / (1 - Math.pow(1 + r, -n));
  }, [principal, term]);

  const totalPayable = monthlyPayment * term + firstPayment;
  const totalInterest = totalPayable - price;

  return (
    <div className="pt-24 pb-20 min-h-screen bg-background">
      {/* Header */}
      <div className="container mx-auto px-4 md:px-6 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl"
        >
          <p className="text-primary font-bold uppercase tracking-widest text-sm mb-3">
            {t.leasing.label}
          </p>
          <h1 className="text-5xl md:text-7xl font-black text-foreground uppercase tracking-tighter leading-none mb-6 whitespace-pre-line">
            {t.leasing.title}
          </h1>
          <p className="text-muted-foreground text-lg">{t.leasing.subtitle}</p>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        <div className="space-y-8">

          {/* ===== Unified Calculator Card ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border overflow-hidden"
          >
            <div className="p-8 md:p-10">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tighter mb-8 flex items-center gap-3">
                <Calculator className="h-6 w-6 text-primary" />
                {t.leasing.calculate}
              </h2>

              {/* Price Slider */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    {t.leasing.price}
                  </label>
                  <span className="text-2xl font-black text-foreground">€{price.toLocaleString()}</span>
                </div>
                <Slider
                  min={500}
                  max={15000}
                  step={100}
                  value={[price]}
                  onValueChange={([val]) => setPrice(val)}
                  className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary"
                />
                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                  <span>€500</span>
                  <span>€15,000</span>
                </div>
              </div>

              {/* First Payment Slider — no number inputs */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    {t.leasing.first_payment}
                  </label>
                  <span className="text-xl font-black text-foreground">
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

              {/* Loan Term */}
              <div className="mb-8">
                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground block mb-3">
                  {t.leasing.term}
                </label>
                <div className="flex gap-2">
                  {TERM_OPTIONS.map((tOpt) => (
                    <button
                      key={tOpt}
                      onClick={() => setTerm(tOpt)}
                      className={`flex-1 py-3 text-sm font-bold border transition-colors ${
                        term === tOpt
                          ? "bg-primary border-primary text-white"
                          : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                      }`}
                    >
                      {tOpt}m
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Monthly Payment Result — inside same card */}
            <div className="bg-primary px-8 md:px-10 py-8">
              <p className="text-white/70 text-sm font-bold uppercase tracking-widest mb-2">
                {t.leasing.monthly}
              </p>
              <div className="text-6xl md:text-7xl font-black text-white mb-2">
                €{monthlyPayment.toFixed(0)}
              </div>
              <p className="text-white/70 text-sm mb-6">
                {t.leasing.for_months.replace("{n}", String(term))}
              </p>
              <Link href="/contact">
                <Button className="w-full bg-white hover:bg-white/90 text-primary rounded-none h-12 text-sm font-bold uppercase tracking-widest">
                  {t.leasing.apply}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* ===== Below: Breakdown + Partners side by side ===== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card border border-border p-6"
            >
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-5">
                {t.leasing.breakdown}
              </h3>
              <div className="space-y-3">
                {[
                  { label: t.leasing.product_price, value: `€${price.toLocaleString()}` },
                  { label: t.leasing.down_payment, value: `€${firstPayment.toLocaleString()} (${firstPaymentPct}%)` },
                  { label: t.leasing.financed, value: `€${principal.toLocaleString()}` },
                  { label: t.leasing.total_interest, value: `€${totalInterest.toFixed(0)}` },
                  { label: t.leasing.total_payable, value: `€${totalPayable.toFixed(0)}` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center border-b border-border pb-3 last:border-0 last:pb-0">
                    <span className="text-muted-foreground text-xs">{label}</span>
                    <span className="font-bold text-foreground text-sm">{value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Leasing Partners */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card border border-border p-6"
            >
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-5 flex items-center gap-2">
                <Building2 className="h-4 w-4" /> {t.leasing.partners_title}
              </h3>
              <div className="space-y-3" ref={bubbleRef}>
                {partners.map((partner) => (
                  <div key={partner.id} className="relative flex items-center gap-3 p-3 border border-border">
                    {partner.logoUrl
                      ? <img src={partner.logoUrl} alt={partner.name} className="w-8 h-8 object-contain flex-shrink-0" />
                      : <div className="w-2 h-2 bg-primary flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground text-sm">{partner.name}</p>
                      <p className="text-xs text-muted-foreground">{partner.interestRate}% p.a.</p>
                    </div>
                    {partner.infoText && (
                      <div
                        className="relative flex-shrink-0"
                        onMouseEnter={() => setOpenBubble(partner.id)}
                        onMouseLeave={() => setOpenBubble(null)}
                      >
                        <button
                          onClick={() => setOpenBubble(openBubble === partner.id ? null : partner.id)}
                          className="text-muted-foreground hover:text-primary transition-colors"
                          aria-label="Info"
                        >
                          <Info className="h-4 w-4" />
                        </button>
                        {openBubble === partner.id && (
                          <div className="absolute right-0 bottom-7 z-20 w-64 bg-foreground text-background text-xs p-3 leading-relaxed shadow-lg">
                            <div className="absolute right-2 bottom-[-5px] w-2.5 h-2.5 bg-foreground rotate-45" />
                            {partner.infoText}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {partners.length === 0 && (
                  <p className="text-muted-foreground text-sm">—</p>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-4">{t.leasing.indicative}</p>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}
