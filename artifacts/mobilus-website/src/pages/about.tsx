import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ChevronRight, Award, Users, MapPin, Wrench } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const ICONS = [Award, Users, MapPin, Wrench];

export default function About() {
  const { t } = useI18n();

  return (
    <div className="pt-24 pb-20 min-h-screen bg-background">
      {/* Hero */}
      <div className="relative h-64 md:h-96 overflow-hidden mb-20">
        <div className="absolute inset-0 bg-black/70 z-10" />
        <img
          src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=2070&auto=format&fit=crop"
          alt="Mobilus showroom"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-center container mx-auto px-4 md:px-6">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-primary font-bold uppercase tracking-widest text-sm mb-3"
          >
            {t.about.label}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none"
          >
            {t.about.title}
          </motion.h1>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6">
        {/* Intro */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-6 whitespace-pre-line">
              {t.about.retailer.split("\n")[0]}
              <br />
              <span className="text-primary">{t.about.retailer.split("\n")[1]}</span>
            </h2>
            <div className="space-y-4 text-muted-foreground text-base leading-relaxed">
              <p>{t.about.p1}</p>
              <p>{t.about.p2}</p>
              <p>{t.about.p3}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4"
          >
            {t.about.stats.map((stat, i) => (
              <div
                key={i}
                className="bg-card border border-border p-8 flex flex-col items-center text-center"
              >
                <div className="text-4xl font-black text-primary mb-1">{stat.value}</div>
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Values */}
        <div className="mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-12"
          >
            {t.about.values_title}
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.about.values.map((val, i) => {
              const Icon = ICONS[i];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card border border-border p-8"
                >
                  <div className="w-12 h-12 bg-primary/10 flex items-center justify-center mb-6">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight mb-3">
                    {val.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{val.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Leasing Partners */}
        <div className="bg-card border border-border p-10 md:p-16 mb-20">
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">
            {t.about.leasing_title}
          </h2>
          <p className="text-muted-foreground mb-10">{t.about.leasing_sub}</p>
          <div className="flex flex-wrap gap-10 items-center">
            {["InCredit Group", "UNO Leasing", "Motive"].map((partner) => (
              <div key={partner} className="text-xl font-black text-muted-foreground hover:text-white transition-colors">
                {partner}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">
            {t.about.visit}
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">{t.about.visit_sub}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button className="bg-primary hover:bg-primary/90 text-white rounded-none px-8 h-14 text-base font-bold uppercase tracking-widest">
                {t.about.contact_btn} <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/moto">
              <Button variant="outline" className="border-border text-muted-foreground hover:border-primary hover:text-primary rounded-none px-8 h-14 text-base font-bold uppercase tracking-widest">
                {t.about.browse}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
