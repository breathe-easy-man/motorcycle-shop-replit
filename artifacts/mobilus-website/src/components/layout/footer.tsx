import { Link } from "wouter";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-1">
            <Link href="/" className="inline-block mb-6">
              <span className="text-3xl font-black tracking-tighter text-white uppercase italic">
                Mobilus<span className="text-primary">.</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Latvia's premier retailer of recreational mobility and sports gear. Find your next adventure with us.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/moto" className="text-muted-foreground hover:text-primary transition-colors text-sm uppercase">Moto Catalog</Link>
              </li>
              <li>
                <Link href="/velo" className="text-muted-foreground hover:text-primary transition-colors text-sm uppercase">Velo Catalog</Link>
              </li>
              <li>
                <Link href="/leasing" className="text-muted-foreground hover:text-primary transition-colors text-sm uppercase">Leasing Calculator</Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors text-sm uppercase">About Us</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-muted-foreground text-sm">
                <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
                <span>Dārzciema iela 123,<br />Rīga, LV-1073</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground text-sm">
                <Phone size={18} className="text-primary shrink-0" />
                <div className="flex flex-col">
                  <span>+371 67 676 402</span>
                  <span>+371 29 509 623</span>
                </div>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground text-sm">
                <Mail size={18} className="text-primary shrink-0" />
                <span>commerce@mobilus.lv</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider">Store Hours</h3>
            <ul className="space-y-3">
              <li className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Monday - Friday</span>
                <span className="text-white">10:00 - 19:00</span>
              </li>
              <li className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Saturday</span>
                <span className="text-white">10:00 - 16:00</span>
              </li>
              <li className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Sunday</span>
                <span className="text-primary font-medium">Closed</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Mobilus. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Privātuma politika</span>
            <span>Lietošanas noteikumi</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
