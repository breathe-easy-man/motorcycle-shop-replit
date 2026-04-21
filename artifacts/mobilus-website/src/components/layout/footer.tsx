import { Link } from "wouter";
import { MapPin, Phone, Mail } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { t, lang } = useI18n();

  const hours = {
    lv: { pf: "P–Pk", s: "Sestdiena", sv: "Svētdiena", closed: "Slēgts" },
    en: { pf: "Mon–Fri", s: "Saturday", sv: "Sunday", closed: "Closed" },
    ru: { pf: "Пн–Пт", s: "Суббота", sv: "Воскресенье", closed: "Закрыто" },
  };
  const h = hours[lang];

  const quickLinks = {
    lv: { moto: "Moto katalogs", velo: "Velo katalogs", leasing: "Līzinga kalkulators", about: "Par mums" },
    en: { moto: "Moto Catalog", velo: "Velo Catalog", leasing: "Leasing Calculator", about: "About Us" },
    ru: { moto: "Мото каталог", velo: "Вело каталог", leasing: "Калькулятор лизинга", about: "О нас" },
  };
  const ql = quickLinks[lang];

  const sectionTitles = {
    lv: { links: "Ātrās saites", contact: "Kontakti", hours: "Darba laiks" },
    en: { links: "Quick Links", contact: "Contact", hours: "Store Hours" },
    ru: { links: "Быстрые ссылки", contact: "Контакты", hours: "Часы работы" },
  };
  const st = sectionTitles[lang];

  const tagline = {
    lv: "Latvijas galvenais atpūtas mobilitātes un sporta aprīkojuma pārdevējs.",
    en: "Latvia's premier retailer of recreational mobility and sports gear.",
    ru: "Ведущий латвийский ритейлер рекреационной мобильности и спортивного снаряжения.",
  };

  const privacy = {
    lv: { pp: "Privātuma politika", tos: "Lietošanas noteikumi" },
    en: { pp: "Privacy Policy", tos: "Terms of Use" },
    ru: { pp: "Политика конфиденциальности", tos: "Условия использования" },
  };

  return (
    <footer className="bg-gray-900 border-t border-gray-800 pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-1">
            <Link href="/" className="inline-block mb-6">
              <span className="text-3xl font-black tracking-tighter text-white uppercase italic">
                Mobilus<span className="text-primary">.</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              {tagline[lang]}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-200 mb-6 uppercase tracking-wider">{st.links}</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/moto" className="text-gray-400 hover:text-primary transition-colors text-sm uppercase">{ql.moto}</Link>
              </li>
              <li>
                <Link href="/velo" className="text-gray-400 hover:text-primary transition-colors text-sm uppercase">{ql.velo}</Link>
              </li>
              <li>
                <Link href="/leasing" className="text-gray-400 hover:text-primary transition-colors text-sm uppercase">{ql.leasing}</Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-primary transition-colors text-sm uppercase">{ql.about}</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-200 mb-6 uppercase tracking-wider">{st.contact}</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-gray-400 text-sm">
                <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
                <span>Dārzciema iela 123,<br />Rīga, LV-1073</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <Phone size={18} className="text-primary shrink-0" />
                <div className="flex flex-col">
                  <a href="tel:+37167676402" className="hover:text-primary transition-colors">+371 67 676 402</a>
                  <a href="tel:+37129509623" className="hover:text-primary transition-colors">+371 29 509 623</a>
                </div>
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <Mail size={18} className="text-primary shrink-0" />
                <a href="mailto:commerce@mobilus.lv" className="hover:text-primary transition-colors">commerce@mobilus.lv</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-200 mb-6 uppercase tracking-wider">{st.hours}</h3>
            <ul className="space-y-3">
              <li className="flex items-center justify-between text-sm text-gray-400">
                <span>{h.pf}</span>
                <span className="text-gray-200 font-medium">10:00 – 19:00</span>
              </li>
              <li className="flex items-center justify-between text-sm text-gray-400">
                <span>{h.s}</span>
                <span className="text-gray-200 font-medium">10:00 – 16:00</span>
              </li>
              <li className="flex items-center justify-between text-sm text-gray-400">
                <span>{h.sv}</span>
                <span className="text-primary font-medium">{h.closed}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Mobilus. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="hover:text-primary cursor-pointer transition-colors">{privacy[lang].pp}</span>
            <span className="hover:text-primary cursor-pointer transition-colors">{privacy[lang].tos}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
