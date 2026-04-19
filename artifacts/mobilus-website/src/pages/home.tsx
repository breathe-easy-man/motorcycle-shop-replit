import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const categories = [
    {
      title: "Moto",
      desc: "Scooters, Motorcycles, ATVs",
      href: "/moto",
      image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=2070&auto=format&fit=crop",
    },
    {
      title: "Velo",
      desc: "City, Mountain, Electric Bicycles",
      href: "/velo",
      image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=2070&auto=format&fit=crop",
    },
    {
      title: "Skates",
      desc: "Inline skates & accessories",
      href: "/skates",
      image: "https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?q=80&w=2070&auto=format&fit=crop",
    },
    {
      title: "Fitness",
      desc: "Home gym & workout gear",
      href: "/fitness",
      image: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2070&auto=format&fit=crop",
    },
    {
      title: "Winter",
      desc: "Ski & snowboard equipment",
      href: "/winter",
      image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=80&w=2070&auto=format&fit=crop",
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/60 z-10" />
          <img 
            src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=2070&auto=format&fit=crop" 
            alt="Motorcycle showroom" 
            className="w-full h-full object-cover object-center"
          />
        </div>
        
        <div className="container relative z-20 px-4 md:px-6 text-center max-w-5xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black text-white uppercase tracking-tighter mb-6 leading-tight"
          >
            Your Adventure <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-600">Starts Here</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto font-light"
          >
            Latvia's premier retailer for scooters, motorcycles, ATVs, and premium sports gear.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/moto">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg font-bold uppercase tracking-wider bg-primary hover:bg-primary/90 text-white rounded-none">
                Explore Moto
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg font-bold uppercase tracking-wider border-white/20 text-white hover:bg-white hover:text-black rounded-none">
                Contact Us
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white mb-4">Our Categories</h2>
              <div className="w-20 h-1 bg-primary"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, i) => (
              <Link key={i} href={cat.href}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`group relative overflow-hidden rounded-none bg-card cursor-pointer ${i === 0 || i === 3 ? 'md:col-span-2 lg:col-span-2' : ''} aspect-[16/9] lg:aspect-[4/3]`}
                >
                  <div className="absolute inset-0 bg-black/40 transition-colors group-hover:bg-black/20 z-10" />
                  <img 
                    src={cat.image} 
                    alt={cat.title} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 z-20 p-8 flex flex-col justify-end">
                    <h3 className="text-3xl font-black text-white uppercase tracking-wider mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      {cat.title}
                    </h3>
                    <p className="text-gray-300 opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100 flex items-center gap-2">
                      {cat.desc} <ArrowRight size={16} />
                    </p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Leasing Partners */}
      <section className="py-24 bg-card border-t border-border">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-widest text-white mb-12">Trusted Leasing Partners</h2>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60">
            <h3 className="text-2xl font-black italic tracking-tighter">IN<span className="text-primary">CREDIT</span> GROUP</h3>
            <h3 className="text-2xl font-black tracking-widest">UNO<span className="font-light text-primary">LEASING</span></h3>
            <h3 className="text-2xl font-black tracking-tighter">MOTIVE</h3>
          </div>
          <div className="mt-16">
            <Link href="/leasing">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white rounded-none uppercase font-bold tracking-widest px-8">
                Calculate Your Lease
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
