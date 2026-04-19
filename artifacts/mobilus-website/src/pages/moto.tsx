import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, ChevronRight } from "lucide-react";

const categories = ["All", "Skūteri", "Elektro", "Motocikli", "ATV", "Ekipējums"];

const products = [
  {
    id: 1,
    name: "ZN50QT-34 (F11) BLACK/Blue",
    price: 1950,
    oldPrice: 2000,
    category: "Skūteri",
    engine: "49cc",
    image: "https://www.mobilus.lv/upload/sm_F11-B-scaled%20black:blue.jpg",
    badge: "-3%",
  },
  {
    id: 2,
    name: "ZN50QT-34 (F11) BLACK/Green",
    price: 1950,
    oldPrice: 2000,
    category: "Skūteri",
    engine: "49cc",
    image: "https://www.mobilus.lv/upload/sm_F11-G-%20black:green.jpg",
    badge: "-3%",
  },
  {
    id: 3,
    name: "Znen Cruise 49CC Silver",
    price: 1950,
    oldPrice: 2000,
    category: "Skūteri",
    engine: "49cc",
    image: "https://www.mobilus.lv/upload/sm_Group-3-1.jpeg",
    badge: "-3%",
  },
  {
    id: 4,
    name: "ZNEN ZN50QT-R8 49cc White",
    price: 1950,
    oldPrice: 2000,
    category: "Skūteri",
    engine: "49cc",
    image: "https://www.mobilus.lv/upload/sm_Screen%20Shot%202019-02-05%20at%2013.46.33.png",
    badge: "-3%",
  },
  {
    id: 5,
    name: "ZN50QT-34 (F11) BLACK/Red",
    price: 1950,
    oldPrice: 2000,
    category: "Skūteri",
    engine: "49cc",
    image: "https://www.mobilus.lv/upload/sm_F11-R654-%20Black:Red.jpg",
    badge: "-3%",
  },
  {
    id: 6,
    name: "ZNEN ZN50QT-R8 49cc Black",
    price: 1950,
    oldPrice: 2000,
    category: "Skūteri",
    engine: "49cc",
    image: "https://www.mobilus.lv/upload/sm_R8%20black%5B14642%5D.jpg",
    badge: "-3%",
  },
  {
    id: 7,
    name: "CFMoto Papio Electric",
    price: 3490,
    oldPrice: null,
    category: "Elektro",
    engine: "Electric",
    image: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?q=80&w=800&auto=format&fit=crop",
    badge: "Electric",
  },
  {
    id: 8,
    name: "EcoRide Urban 72V",
    price: 2890,
    oldPrice: null,
    category: "Elektro",
    engine: "Electric",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop",
    badge: "Electric",
  },
  {
    id: 9,
    name: "E-Moto Sprint 60V",
    price: 1990,
    oldPrice: null,
    category: "Elektro",
    engine: "Electric",
    image: "https://images.unsplash.com/photo-1609711549733-f49bde77d0f3?q=80&w=800&auto=format&fit=crop",
    badge: "Electric",
  },
  {
    id: 10,
    name: "Benelli TRK 502X",
    price: 7490,
    oldPrice: null,
    category: "Motocikli",
    engine: "500cc",
    image: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?q=80&w=800&auto=format&fit=crop",
    badge: "New",
  },
  {
    id: 11,
    name: "CFMoto CFORCE 400",
    price: 6990,
    oldPrice: null,
    category: "ATV",
    engine: "400cc",
    image: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?q=80&w=800&auto=format&fit=crop",
    badge: "ATV",
  },
  {
    id: 12,
    name: "CFMoto UFORCE 800",
    price: 11690,
    oldPrice: null,
    category: "ATV",
    engine: "800cc",
    image: "https://images.unsplash.com/photo-1486611367184-17759508999c?q=80&w=800&auto=format&fit=crop",
    badge: "ATV",
  },
];

export default function Moto() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = activeCategory === "All"
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
            Moto
          </motion.h1>
          <p className="text-muted-foreground text-lg mt-2">
            120+ models — Scooters, Motorcycles, Electric, ATV
          </p>
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
              <div className="relative overflow-hidden aspect-[4/3] bg-muted">
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
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs uppercase tracking-wider border-muted text-muted-foreground">
                    {product.engine}
                  </Badge>
                  <Badge variant="outline" className="text-xs uppercase tracking-wider border-muted text-muted-foreground">
                    {product.category}
                  </Badge>
                </div>
                <h3 className="font-bold text-foreground text-sm leading-tight mb-3">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between">
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
                <Link href="/contact">
                  <Button className="mt-4 w-full bg-transparent border border-primary text-primary hover:bg-primary hover:text-white transition-colors rounded-none text-xs uppercase tracking-widest font-bold">
                    Inquire
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Leasing CTA */}
        <div className="mt-20 border border-border p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 bg-card">
          <div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">
              Finance Your Ride
            </h2>
            <p className="text-muted-foreground">
              Monthly payments starting from €49/month with our leasing partners.
            </p>
          </div>
          <Link href="/leasing">
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-none px-8 uppercase font-bold tracking-widest whitespace-nowrap">
              Leasing Calculator <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
