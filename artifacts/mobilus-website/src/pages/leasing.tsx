import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Link } from "wouter";
import { ChevronRight, Calculator, Building2, Percent, Clock } from "lucide-react";

const ANNUAL_RATE = 0.089;
const MONTHLY_RATE = ANNUAL_RATE / 12;

const TERM_OPTIONS = [12, 24, 36, 48, 60];

export default function Leasing() {
  const [price, setPrice] = useState(3000);
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [term, setTerm] = useState(36);

  const downPayment = Math.round((price * downPaymentPct) / 100);
  const principal = price - downPayment;

  const monthlyPayment = useMemo(() => {
    if (principal <= 0) return 0;
    const r = MONTHLY_RATE;
    const n = term;
    return (principal * r) / (1 - Math.pow(1 + r, -n));
  }, [principal, term]);

  const totalPayable = monthlyPayment * term + downPayment;
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
            Financing
          </p>
          <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none mb-6">
            Leasing
            <br />
            Calculator
          </h1>
          <p className="text-muted-foreground text-lg">
            Calculate your monthly payments with our trusted leasing partners.
            Flexible terms from 12 to 60 months.
          </p>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Calculator Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border p-8 md:p-10"
          >
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
              <Calculator className="h-6 w-6 text-primary" />
              Calculate
            </h2>

            {/* Price */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Product Price
                </label>
                <span className="text-2xl font-black text-white">
                  €{price.toLocaleString()}
                </span>
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

            {/* Down Payment */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Down Payment
                </label>
                <span className="text-xl font-black text-white">
                  {downPaymentPct}% — €{downPayment.toLocaleString()}
                </span>
              </div>
              <Slider
                min={0}
                max={50}
                step={5}
                value={[downPaymentPct]}
                onValueChange={([val]) => setDownPaymentPct(val)}
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
                Lease Term
              </label>
              <div className="flex gap-2">
                {TERM_OPTIONS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTerm(t)}
                    className={`flex-1 py-3 text-sm font-bold border transition-colors ${
                      term === t
                        ? "bg-primary border-primary text-white"
                        : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                    }`}
                  >
                    {t}m
                  </button>
                ))}
              </div>
            </div>

            {/* Interest Rate Info */}
            <div className="border border-border p-4 mb-8 flex items-center gap-3">
              <Percent className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Interest Rate</p>
                <p className="text-lg font-black text-white">8.9% <span className="font-normal text-sm text-muted-foreground">per annum</span></p>
              </div>
            </div>

            <Link href="/contact">
              <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-none h-14 text-base font-bold uppercase tracking-widest">
                Apply for Leasing
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>

          {/* Results Panel */}
          <div className="space-y-6">
            {/* Monthly Payment Hero */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-primary p-8 md:p-10"
            >
              <p className="text-white/70 text-sm font-bold uppercase tracking-widest mb-2">
                Monthly Payment
              </p>
              <div className="text-6xl md:text-7xl font-black text-white mb-2">
                €{monthlyPayment.toFixed(0)}
              </div>
              <p className="text-white/70 text-sm">
                for {term} months
              </p>
            </motion.div>

            {/* Breakdown */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card border border-border p-8"
            >
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">
                Breakdown
              </h3>
              <div className="space-y-4">
                {[
                  { label: "Product Price", value: `€${price.toLocaleString()}` },
                  { label: "Down Payment", value: `€${downPayment.toLocaleString()} (${downPaymentPct}%)` },
                  { label: "Financed Amount", value: `€${principal.toLocaleString()}` },
                  { label: "Total Interest", value: `€${totalInterest.toFixed(0)}` },
                  { label: "Total Payable", value: `€${totalPayable.toFixed(0)}` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center border-b border-border pb-3 last:border-0 last:pb-0">
                    <span className="text-muted-foreground text-sm">{label}</span>
                    <span className="font-bold text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Leasing Partners */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card border border-border p-8"
            >
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
                <Building2 className="h-4 w-4" /> Leasing Partners
              </h3>
              <div className="space-y-4">
                {[
                  { name: "InCredit Group", desc: "Fast approval, flexible terms" },
                  { name: "UNO Leasing", desc: "Low interest, no hidden fees" },
                  { name: "Motive", desc: "Business & personal financing" },
                ].map((partner) => (
                  <div key={partner.name} className="flex items-center gap-4 p-3 border border-border">
                    <div className="w-2 h-2 bg-primary flex-shrink-0" />
                    <div>
                      <p className="font-bold text-white text-sm">{partner.name}</p>
                      <p className="text-xs text-muted-foreground">{partner.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                * Calculation is indicative. Final terms are subject to credit approval by the leasing company.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
