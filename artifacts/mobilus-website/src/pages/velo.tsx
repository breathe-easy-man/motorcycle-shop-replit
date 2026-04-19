import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";

const categories = ["All", "City", "Mountain", "Electric", "Kids", "Road"];

const bikes = [
  {
    id: 1,
    name: "Urban Glide Pro 28\"",
    price: 289,
    category: "City",
    image: "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?q=80&w=800&auto=format&fit=crop",
    badge: "Popular",
  },
  {
    id: 2,
    name: "Trail Blazer MTB 29",
    price: 549,
    category: "Mountain",
    image: "https://images.unsplash.com/photo-1576435728678-68d0fbf94946?q=80&w=800&auto=format&fit=crop",
    badge: null,
  },
  {
    id: 3,
    name: "E-City Commuter 250W",
    price: 1290,
    category: "Electric",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop",
    badge: "Electric",
  },
  {
    id: 4,
    name: "Speed Road Carbon",
    price: 899,
    category: "Road",
    image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=800&auto=format&fit=crop",
    badge: null,
  },
  {
    id: 5,
    name: "Kids Ranger 20\"",
    price: 149,
    category: "Kids",
    image: "https://images.unsplash.com/photo-1519583272095-6433daf26b6e?q=80&w=800&auto=format&fit=crop",
    badge: "Kids",
  },
  {
    id: 6,
    name: "Gravel Master X1",
    price: 749,
    category: "Mountain",
    image: "https://images.unsplash.com/photo-1502743780242-f10d2ce370f3?q=80&w=800&auto=format&fit=crop",
    badge: null,
  },
  {
    id: 7,
    name: "Retro City Cruiser",
    price: 399,
    category: "City",
    image: "https://images.unsplash.com/photo-1511994298241-608e28f14fde?q=80&w=800&auto=format&fit=crop",
    badge: "New",
  },
  {
    id: 8,
    name: "E-Mountain Trail 500W",
    price: 2190,
    category: "Electric",
    image: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?q=80&w=800&auto=format&fit=crop",
    badge: "Electric",
  },
];

export default function Velo() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = activeCategory === "All"
    ? bikes
    : bikes.filter((b) => b.category === activeCategory);

  return (
    <div className="pt-24 pb-20 min-h-screen bg-background">
      {/* Hero Banner */}
      <div className="relative h-64 md:h-80 overflow-hidden mb-16">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <img
          src="https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=2070&auto=format&fit=crop"
          alt="Bicycles"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-end container mx-auto px-4 md:px-6 pb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter"
          >
            Velo
          </motion.h1>
          <p className="text-muted-foreground text-lg mt-2">
            250+ bicycle models for every taste — €7 to €50
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
          {filtered.map((bike, i) => (
            <motion.div
              key={bike.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group bg-card border border-border hover:border-primary/50 transition-all duration-300 overflow-hidden"
            >
              <div className="relative overflow-hidden aspect-[4/3] bg-muted">
                {bike.badge && (
                  <span className="absolute top-3 left-3 z-10 bg-primary text-white text-xs font-bold px-2 py-1 uppercase tracking-wider">
                    {bike.badge}
                  </span>
                )}
                <img
                  src={bike.image}
                  alt={bike.name}
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs uppercase tracking-wider border-muted text-muted-foreground">
                    {bike.category}
                  </Badge>
                </div>
                <h3 className="font-bold text-foreground text-sm leading-tight mb-3">
                  {bike.name}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-black text-primary">
                    €{bike.price.toLocaleString()}
                  </span>
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

        {/* Info Banner */}
        <div className="mt-20 border border-border p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 bg-card">
          <div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">
              Find Your Perfect Ride
            </h2>
            <p className="text-muted-foreground">
              Visit our store in Riga, Dārzciema 123 — our experts will help you choose.
            </p>
          </div>
          <Link href="/contact">
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-none px-8 uppercase font-bold tracking-widest whitespace-nowrap">
              Get in Touch <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
