import { useMemo, useState, useEffect, useRef } from "react";
import { useParams, useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, Clock, Loader2,
  Phone, MapPin, Truck, Star, Send, MessageSquare, Tag
} from "lucide-react";
import { useI18n, Lang } from "@/lib/i18n";
import { api } from "@/lib/api";

interface Spec {
  label: { lv: string; en: string; ru: string };
  value: string;
}

interface ProductVariant {
  id: number;
  productId: number;
  colorName: string;
  colorHex: string | null;
  image: string;
  stock: number;
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
  manufacturerLogoUrl: string | null;
  manufacturerYoutubeId: string | null;
  manufacturerDescLv: string | null;
  manufacturerDescEn: string | null;
  manufacturerDescRu: string | null;
  variants: ProductVariant[];
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

interface ManufacturerInfo {
  logo?: string;
  youtubeId?: string;
  descLv: string;
  descEn: string;
  descRu: string;
}

const MANUFACTURER_MAP: Record<string, ManufacturerInfo> = {
  CFMoto: {
    logo: "https://www.cfmoto.com/etc/designs/cfmoto/assets/home/logo.png",
    youtubeId: "g4bYdBGppyI",
    descLv: "CFMOTO izstrādā, ražo un pārdod augstākās kvalitātes motociklus, kvadraciklus un Side-by-Side transportlīdzekļus. Dibināts 1989. gadā, šobrīd sadarbojas ar vairāk nekā 3000 pārstāvniecībām visā pasaulē.",
    descEn: "CFMOTO develops, manufactures and sells high-quality motorcycles, ATVs and Side-by-Side vehicles. Founded in 1989, now cooperating with more than 3000 dealerships worldwide.",
    descRu: "CFMOTO разрабатывает, производит и продаёт высококачественные мотоциклы, квадроциклы и внедорожники. Основана в 1989 году, сотрудничает с более чем 3000 дилерами по всему миру.",
  },
  "Super Soco": {
    youtubeId: "5xj_xk0QKJY",
    descLv: "Super Soco ir vadošais elektrisko mopēdu un motociklu ražotājs. Mūsu produkti apvieno modernu dizainu ar ilgtspējīgu mobilitāti pilsētu vidē.",
    descEn: "Super Soco is a leading manufacturer of electric mopeds and motorcycles, combining modern design with sustainable urban mobility.",
    descRu: "Super Soco — ведущий производитель электрических мопедов и мотоциклов, сочетающий современный дизайн с экологичной городской мобильностью.",
  },
  Rollerblade: {
    youtubeId: "Cp1bEzA0-xw",
    descLv: "Rollerblade ir pasaulē vadošais skrituļslidu ražotājs, piedāvājot augstākās kvalitātes produktus iesācējiem un profesionāļiem kopš 1980. gadu sākuma.",
    descEn: "Rollerblade is the world's leading inline skate manufacturer, offering top-quality products for beginners and professionals since the early 1980s.",
    descRu: "Rollerblade — ведущий мировой производитель роликовых коньков, предлагающий высококачественные товары для начинающих и профессионалов с начала 1980-х годов.",
  },
  "K2": {
    descLv: "K2 ir premium skrituļslidu un slēpošanas aprīkojuma ražotājs, pazīstams ar inovatīvu tehniku un augstas veiktspējas produktiem.",
    descEn: "K2 is a premium inline skate and ski equipment manufacturer known for innovative technology and high-performance products.",
    descRu: "K2 — производитель премиальных роликовых коньков и лыжного снаряжения, известный инновационными технологиями.",
  },
  Fila: {
    descLv: "Fila skrituļslidas apvieno sporta stilu ar augstu komfortu, padarot tos ideālu izvēli gan rekreācijam, gan fitnesa braukšanai.",
    descEn: "Fila inline skates combine sporty style with high comfort, making them an ideal choice for both recreational and fitness skating.",
    descRu: "Ролики Fila сочетают спортивный стиль с высоким комфортом, делая их идеальным выбором для отдыха и фитнес-катания.",
  },
  Atomic: {
    youtubeId: "B9l1LCgUOFk",
    descLv: "Atomic ir Austrijas slēpošanas aprīkojuma ražotājs, kas nodrošina profesionālu kvalitāti gan sacensībās, gan atpūtas slēpošanā kopš 1955. gada.",
    descEn: "Atomic is an Austrian ski equipment manufacturer providing professional quality for both racing and recreational skiing since 1955.",
    descRu: "Atomic — австрийский производитель горнолыжного снаряжения, обеспечивающий профессиональное качество как в соревнованиях, так и в любительском катании с 1955 года.",
  },
  Fischer: {
    descLv: "Fischer Sports ir Austrijas sporta aprīkojuma ražotājs, kas piedāvā augstākās klases slēpes, slēpošanas zābakus un hokeja aprīkojumu.",
    descEn: "Fischer Sports is an Austrian sports equipment manufacturer offering top-class skis, ski boots, and hockey equipment.",
    descRu: "Fischer Sports — австрийский производитель спортивного снаряжения, предлагающий лыжи высшего класса, ботинки и хоккейное оборудование.",
  },
  Rossignol: {
    youtubeId: "QZsE2sWTBwk",
    descLv: "Rossignol ir pasaulē slavenākais slēpošanas zīmols, kas piedāvā inovatīvas slēpes un aprīkojumu visiem līmeņiem kopš 1907. gada.",
    descEn: "Rossignol is one of the world's most renowned ski brands, offering innovative skis and equipment for all levels since 1907.",
    descRu: "Rossignol — один из самых известных лыжных брендов мира, предлагающий инновационные лыжи и снаряжение для всех уровней катания с 1907 года.",
  },
  Burton: {
    youtubeId: "0V8zTKEWuHg",
    descLv: "Burton Snowboards ir pionieris snouborda industrijas, dibināts 1977. gadā. Mūsdienās Burton ir pasaulē vadošais snouborda ražotājs.",
    descEn: "Burton Snowboards is a pioneer in the snowboard industry, founded in 1977. Today, Burton is the world's leading snowboard manufacturer.",
    descRu: "Burton Snowboards — пионер индустрии сноуборда, основанный в 1977 году. Сегодня Burton — ведущий мировой производитель сноубордов.",
  },
  Nitro: {
    descLv: "Nitro Snowboards ir Vācijas izcelsmes snouborda un aprīkojuma ražotājs, kas piedāvā augstākās klases dēļus, zābakus un saites.",
    descEn: "Nitro Snowboards is a German snowboard and equipment manufacturer offering top-class boards, boots, and bindings.",
    descRu: "Nitro Snowboards — немецкий производитель сноубордов и снаряжения, предлагающий доски, ботинки и крепления высшего класса.",
  },
  Kayo: {
    descLv: "Kayo Motors ir sporta kvadraciklu ražotājs ar plašu klāstu bērniem un pusaudžiem. Kayo produkti ir pazīstami ar uzticamību un drošību.",
    descEn: "Kayo Motors is a sports ATV manufacturer with a wide range for children and teenagers. Known for reliability and safety.",
    descRu: "Kayo Motors — производитель спортивных квадроциклов с широким ассортиментом для детей и подростков. Известны надёжностью и безопасностью.",
  },
  default: {
    descLv: "Augstākās kvalitātes produkts no uzticama ražotāja. Garantija un apkalpošana Latvijā.",
    descEn: "A top-quality product from a trusted manufacturer. Warranty and service available in Latvia.",
    descRu: "Высококачественный продукт от надёжного производителя. Гарантия и сервис в Латвии.",
  },
};

function extractBrand(name: string): string {
  const brands = Object.keys(MANUFACTURER_MAP).filter(b => b !== "default");
  for (const brand of brands) {
    if (name.toLowerCase().includes(brand.toLowerCase())) return brand;
  }
  return "default";
}

type TabKey = "apraksts" | "razotajs" | "specifikacija" | "atsauksmes" | "pieprasijumi";

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
  const [activeImg, setActiveImg] = useState(0);

  const [firstPaymentPct, setFirstPaymentPct] = useState(10);
  const [term, setTerm] = useState(24);
  const [financingMode, setFinancingMode] = useState<"cash" | "incredit" | "uno">("incredit");

  const [activeTab, setActiveTab] = useState<TabKey>("apraksts");
  const tabsRef = useRef<HTMLDivElement>(null);

  // Review form state
  const [reviewStars, setReviewStars] = useState(5);
  const [reviewName, setReviewName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Inquiry form state
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryPhone, setInquiryPhone] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquirySent, setInquirySent] = useState(false);

  // Variant selection
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  useEffect(() => {
    setLoading(true);
    setImgError(false);
    setActiveImg(0);
    setSelectedVariant(null);
    fetch(`/api/products/slug/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        setProduct(data);
        if (Array.isArray(data.variants) && data.variants.length > 0) {
          setSelectedVariant(data.variants[0]);
        }
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
      fetch("/api/products")
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

  const handleTabClick = (tab: TabKey) => {
    setActiveTab(tab);
    setTimeout(() => {
      tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

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
  const activeImage = selectedVariant ? selectedVariant.image : product.image;
  const productImg = imgError ? fallbackImg : activeImage;

  const firstPayment = Math.round((product.price * firstPaymentPct) / 100);

  const moLabel = lang === "lv" ? "mēn" : lang === "ru" ? "мес" : "mo";
  const moLabelDot = lang === "lv" ? "mēn." : lang === "ru" ? "мес." : "mo.";

  const displayStock = selectedVariant ? selectedVariant.stock : product.stock;
  const stockStatus =
    displayStock === 0
      ? { label: lang === "lv" ? "Nav noliktavā" : lang === "ru" ? "Нет в наличии" : "Out of Stock", color: "text-red-500", icon: AlertCircle }
      : displayStock <= 2
      ? { label: lang === "lv" ? `Ierobežots (${displayStock} gab.)` : lang === "ru" ? `Ограничено (${displayStock} шт.)` : `Limited (${displayStock} left)`, color: "text-amber-400", icon: Clock }
      : { label: lang === "lv" ? `Noliktavā — ${displayStock} gab.` : lang === "ru" ? `В наличии — ${displayStock} шт.` : `In Stock — ${displayStock} units`, color: "text-emerald-400", icon: CheckCircle2 };

  const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;

  const StockIcon = stockStatus.icon;

  const brand = extractBrand(product.name);
  const staticMfg = MANUFACTURER_MAP[brand] ?? MANUFACTURER_MAP.default;
  const manufacturer: ManufacturerInfo = {
    logo: product.manufacturerLogoUrl ?? staticMfg.logo,
    youtubeId: product.manufacturerYoutubeId ?? staticMfg.youtubeId,
    descLv: product.manufacturerDescLv ?? staticMfg.descLv,
    descEn: product.manufacturerDescEn ?? staticMfg.descEn,
    descRu: product.manufacturerDescRu ?? staticMfg.descRu,
  };
  const mfgDesc = lang === "lv" ? manufacturer.descLv : lang === "ru" ? manufacturer.descRu : manufacturer.descEn;

  const tabs: { key: TabKey; label: string }[] = [
    { key: "apraksts", label: lang === "lv" ? "Apraksts" : lang === "ru" ? "Описание" : "Description" },
    { key: "razotajs", label: lang === "lv" ? "Ražotājs" : lang === "ru" ? "Производитель" : "Manufacturer" },
    { key: "specifikacija", label: lang === "lv" ? "Specifikācija" : lang === "ru" ? "Спецификация" : "Specifications" },
    { key: "atsauksmes", label: lang === "lv" ? "Atsauksmes" : lang === "ru" ? "Отзывы" : "Reviews" },
    { key: "pieprasijumi", label: lang === "lv" ? "Pieprasījumi" : lang === "ru" ? "Запросы" : "Inquiries" },
  ];

  // Group specs: detect groups by checking if any spec has empty value (header) or group by every N specs
  const specsForDisplay = (product.specs as Spec[]) || [];

  // Extract top 3 key specs for callout boxes in Description tab
  const keySpecs = specsForDisplay.slice(0, 3);

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

        {/* ===== MAIN PRODUCT BLOCK ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">

          {/* LEFT: Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-3"
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
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Thumbnail strip — variant images if available, else product image */}
            <div className="grid grid-cols-4 gap-2">
              {hasVariants
                ? product.variants.slice(0, 3).map((v) => (
                    <button
                      key={v.id}
                      onClick={() => { setSelectedVariant(v); setImgError(false); }}
                      title={v.colorName}
                      className={`aspect-square overflow-hidden border cursor-pointer transition-colors ${
                        selectedVariant?.id === v.id ? "border-primary" : "border-border hover:border-primary/50"
                      }`}
                    >
                      <img
                        src={v.image}
                        alt={v.colorName}
                        className="w-full h-full object-cover object-center"
                        onError={(e) => { (e.target as HTMLImageElement).src = fallbackImg; }}
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  ))
                : [product.image, product.image, product.image].map((src, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`aspect-square overflow-hidden border cursor-pointer transition-colors ${
                        activeImg === i ? "border-primary" : "border-border hover:border-primary/50"
                      }`}
                    >
                      <img
                        src={imgError ? fallbackImg : src}
                        alt=""
                        className="w-full h-full object-cover object-center"
                        onError={(e) => { (e.target as HTMLImageElement).src = fallbackImg; }}
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  ))
              }
              <div className="aspect-square overflow-hidden border border-border flex items-center justify-center bg-card cursor-pointer hover:border-primary/50 transition-colors">
                <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider text-center leading-tight px-1">360°</span>
              </div>
            </div>
          </motion.div>

          {/* RIGHT: Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col"
          >
            {/* Brand badge */}
            {brand !== "default" && (
              <div className="text-xs font-bold uppercase tracking-widest text-primary mb-1">{brand}</div>
            )}

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

            {/* Product code */}
            <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">
              {lang === "lv" ? "Preces kods" : lang === "ru" ? "Код товара" : "Product code"}: {product.slug.replace(/-/g, "").toUpperCase().slice(0, 12)}
            </p>

            {/* Stock status */}
            <div className={`flex items-center gap-2 text-sm font-bold mb-4 ${stockStatus.color}`}>
              <StockIcon className="h-4 w-4" />
              {stockStatus.label}
            </div>

            {/* Color variant swatches */}
            {hasVariants && (
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  {lang === "lv" ? "Krāsa" : lang === "ru" ? "Цвет" : "Color"}
                  {selectedVariant && (
                    <span className="ml-2 text-white normal-case tracking-normal font-normal">
                      — {selectedVariant.colorName}
                    </span>
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => { setSelectedVariant(v); setImgError(false); }}
                        title={v.colorName}
                        className={`flex items-center gap-2 px-3 py-1.5 border text-xs font-bold transition-all duration-150 ${
                          isSelected
                            ? "border-primary text-white bg-primary/10"
                            : "border-border text-muted-foreground hover:border-primary/60 hover:text-white"
                        }`}
                      >
                        <span
                          className="h-3 w-3 rounded-full flex-shrink-0 border border-white/20"
                          style={{ backgroundColor: v.colorHex ?? "#888" }}
                        />
                        {v.colorName}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Description */}
            <p className="text-muted-foreground text-base leading-relaxed mb-6 border-l-2 border-primary/40 pl-4">
              {desc}
            </p>

            {/* Price */}
            <div className="flex items-baseline gap-4 mb-2">
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

            {/* Found cheaper link */}
            <button
              onClick={() => handleTabClick("pieprasijumi")}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors mb-6 w-fit"
            >
              <Tag className="h-3 w-3" />
              {lang === "lv" ? "Atradāt lētāk?" : lang === "ru" ? "Нашли дешевле?" : "Found it cheaper?"}
            </button>

            {/* Financing Options */}
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                {lang === "lv" ? "Apmaksas veids" : lang === "ru" ? "Способ оплаты" : "Payment Option"}
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setFinancingMode("cash")}
                  className={`p-4 border text-left transition-all duration-200 ${
                    financingMode === "cash" ? "border-primary bg-primary/10" : "border-border hover:border-primary/40 bg-card"
                  }`}
                >
                  <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${financingMode === "cash" ? "text-primary" : "text-muted-foreground"}`}>
                    {lang === "lv" ? "Uzreiz" : lang === "ru" ? "Сразу" : "Cash"}
                  </div>
                  <div className="text-lg font-black text-white">€{product.price.toLocaleString()}</div>
                  {discountPct && <div className="text-xs text-emerald-400 font-bold mt-0.5">-{discountPct}%</div>}
                </button>

                <button
                  onClick={() => setFinancingMode("incredit")}
                  className={`p-4 border text-left transition-all duration-200 ${
                    financingMode === "incredit" ? "border-primary bg-primary/10" : "border-border hover:border-primary/40 bg-card"
                  }`}
                >
                  <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${financingMode === "incredit" ? "text-primary" : "text-muted-foreground"}`}>
                    IN<span className="text-primary">CREDIT</span>
                  </div>
                  <div className="text-lg font-black text-white">€{monthlyIncredit.toFixed(0)}</div>
                  <div className="text-xs text-muted-foreground">/{moLabel}</div>
                </button>

                <button
                  onClick={() => setFinancingMode("uno")}
                  className={`p-4 border text-left transition-all duration-200 ${
                    financingMode === "uno" ? "border-primary bg-primary/10" : "border-border hover:border-primary/40 bg-card"
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
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Button
                onClick={() => handleTabClick("pieprasijumi")}
                className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-none h-14 text-sm font-black uppercase tracking-widest"
              >
                <Phone className="mr-2 h-4 w-4" />
                {t.product.inquire}
              </Button>
              <Button
                onClick={() => handleTabClick("specifikacija")}
                variant="outline"
                className="flex-1 border-border text-foreground hover:border-primary hover:text-primary rounded-none h-14 text-sm font-bold uppercase tracking-widest"
              >
                {lang === "lv" ? "Aprēķināt līzingu" : lang === "ru" ? "Рассчитать лизинг" : "Calculate Lease"}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Availability */}
            <div className="border border-border bg-card p-4 mb-4">
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">
                {lang === "lv" ? "Pieejamība" : lang === "ru" ? "Наличие" : "Availability"}
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                  <div>
                    <span className="text-white font-bold">
                      {lang === "lv" ? "Rīgā" : lang === "ru" ? "Рига" : "Riga"}
                    </span>
                    <span className="text-muted-foreground ml-2 text-xs">
                      {lang === "lv" ? "Saņem veikalā — bez maksas" : lang === "ru" ? "Самовывоз — бесплатно" : "Pick up in store — free"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                  <div>
                    <span className="text-white font-bold">
                      {lang === "lv" ? "Valmierā" : lang === "ru" ? "Валмиера" : "Valmiera"}
                    </span>
                    <span className="text-muted-foreground ml-2 text-xs">
                      {lang === "lv" ? "Saņem veikalā — bez maksas" : lang === "ru" ? "Самовывоз — бесплатно" : "Pick up in store — free"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm border-t border-border pt-2 mt-2">
                  <Truck className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                  <div>
                    <span className="text-white font-bold">
                      {lang === "lv" ? "Piegāde uz adresi" : lang === "ru" ? "Доставка на адрес" : "Home Delivery"}
                    </span>
                    <span className="text-muted-foreground ml-2 text-xs">
                      {lang === "lv" ? "€19–30 (termiņus noskaidrot)" : lang === "ru" ? "€19–30 (уточнить сроки)" : "€19–30 (inquire for dates)"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust line */}
            <div className="flex items-center gap-6 text-xs text-muted-foreground border-t border-border pt-4">
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

        {/* ===== TAB NAVIGATION ===== */}
        <div ref={tabsRef} className="border-t border-b border-border mb-0 sticky top-16 z-20 bg-background">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabClick(tab.key)}
                className={`flex-shrink-0 px-6 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all duration-200 ${
                  activeTab === tab.key
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-white hover:border-border"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ===== TAB CONTENT ===== */}
        <div className="mb-20">

          {/* ── Apraksts ── */}
          {activeTab === "apraksts" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-12"
            >
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-6">
                {product.name}
              </h2>

              {/* Key spec callout boxes */}
              {keySpecs.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
                  {keySpecs.map((spec, i) => (
                    <div key={i} className="bg-card border border-border p-5 text-center">
                      <div className="text-2xl font-black text-primary mb-1">{spec.value}</div>
                      <div className="text-xs uppercase tracking-widest text-muted-foreground">
                        {spec.label[lang as Lang] || spec.label.en}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Full description */}
              <div className="max-w-3xl">
                <p className="text-muted-foreground text-base leading-relaxed mb-6">
                  {desc}
                </p>

                {/* Spec highlights as bullet features */}
                {specsForDisplay.length > 3 && (
                  <div className="mt-8">
                    <h3 className="text-sm font-black uppercase tracking-widest text-white mb-4">
                      {lang === "lv" ? "Galvenās īpašības" : lang === "ru" ? "Основные характеристики" : "Key Features"}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {specsForDisplay.slice(3).map((spec, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm py-2 border-b border-border/40">
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                          <span className="text-muted-foreground">{spec.label[lang as Lang] || spec.label.en}:</span>
                          <span className="text-white font-bold ml-auto">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── Ražotājs ── */}
          {activeTab === "razotajs" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-12"
            >
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-8">
                {brand !== "default" ? brand : (lang === "lv" ? "Ražotājs" : lang === "ru" ? "Производитель" : "Manufacturer")}
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div>
                  {/* Manufacturer logo */}
                  {manufacturer.logo && (
                    <div className="mb-6 bg-white p-6 inline-block">
                      <img
                        src={manufacturer.logo}
                        alt={brand}
                        className="h-12 w-auto object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                  {!manufacturer.logo && brand !== "default" && (
                    <div className="mb-6">
                      <span className="text-4xl font-black text-white uppercase tracking-tighter">{brand}</span>
                    </div>
                  )}

                  <p className="text-muted-foreground text-base leading-relaxed">{mfgDesc}</p>
                </div>

                {/* YouTube embed */}
                {manufacturer.youtubeId && (
                  <div className="aspect-video bg-card border border-border overflow-hidden">
                    <iframe
                      src={`https://www.youtube.com/embed/${manufacturer.youtubeId}`}
                      title={`${brand} video`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── Specifikācija ── */}
          {activeTab === "specifikacija" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-12"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                {/* Specs table */}
                <div>
                  <h2 className="text-xs font-black uppercase tracking-widest text-primary mb-6">
                    {t.product.specs}
                  </h2>

                  {specsForDisplay.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      {lang === "lv" ? "Specifikācija nav pieejama." : lang === "ru" ? "Спецификация недоступна." : "Specifications not available."}
                    </p>
                  ) : (
                    <div className="space-y-0 border border-border">
                      {specsForDisplay.map((spec, i) => (
                        <div
                          key={i}
                          className={`flex justify-between items-center py-3 px-4 ${
                            i % 2 === 0 ? "bg-card" : "bg-background"
                          }`}
                        >
                          <span className="text-muted-foreground text-sm">
                            {spec.label[lang as Lang] || spec.label.en}
                          </span>
                          <span className="font-black text-white text-sm text-right max-w-[55%]">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Leasing Calculator */}
                <div className="bg-card border border-border p-8">
                  <h2 className="text-xs font-black uppercase tracking-widest text-primary mb-6">
                    {t.product.leasing_title}
                  </h2>

                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-border">
                    <span className="text-sm text-muted-foreground uppercase tracking-wider font-bold">{t.product.price_label}</span>
                    <span className="text-2xl font-black text-white">€{product.price.toLocaleString()}</span>
                  </div>

                  <div className="bg-primary/10 border border-primary/20 px-6 py-5 mb-6 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">{t.product.monthly}</p>
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

                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {t.product.first_payment}
                      </label>
                      <span className="text-sm font-black text-white">{firstPaymentPct}% — €{firstPayment.toLocaleString()}</span>
                    </div>
                    <Slider
                      min={0} max={50} step={5}
                      value={[firstPaymentPct]}
                      onValueChange={([val]) => setFirstPaymentPct(val)}
                      className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary"
                    />
                    <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                      <span>0%</span><span>50%</span>
                    </div>
                  </div>

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
                            term === t_ ? "bg-primary border-primary text-white" : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                          }`}
                        >
                          {t_}m
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={() => handleTabClick("pieprasijumi")}
                    className="w-full bg-primary hover:bg-primary/90 text-white rounded-none h-12 font-black uppercase tracking-widest text-sm"
                  >
                    {t.product.apply} <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                  <p className="text-xs text-muted-foreground mt-3">{t.leasing.indicative}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Atsauksmes ── */}
          {activeTab === "atsauksmes" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-12"
            >
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-8">
                {lang === "lv" ? "Atsauksmes" : lang === "ru" ? "Отзывы" : "Reviews"}
              </h2>

              {reviewSubmitted ? (
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 mb-8 flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  <p className="text-emerald-400 font-bold">
                    {lang === "lv" ? "Paldies! Jūsu atsauksme tika nosūtīta." : lang === "ru" ? "Спасибо! Ваш отзыв отправлен." : "Thank you! Your review has been submitted."}
                  </p>
                </div>
              ) : (
                <div className="max-w-2xl bg-card border border-border p-8">
                  <h3 className="text-sm font-black uppercase tracking-widest text-white mb-6">
                    {lang === "lv" ? "Rakstīt atsauksmi" : lang === "ru" ? "Написать отзыв" : "Write a Review"}
                  </h3>

                  {/* Star rating */}
                  <div className="mb-6">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-3">
                      {lang === "lv" ? "Vērtējums" : lang === "ru" ? "Оценка" : "Rating"}
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button key={s} onClick={() => setReviewStars(s)}>
                          <Star
                            className={`h-7 w-7 transition-colors ${
                              s <= reviewStars ? "text-primary fill-primary" : "text-muted-foreground"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                      {lang === "lv" ? "Jūsu vārds" : lang === "ru" ? "Ваше имя" : "Your Name"}
                    </label>
                    <input
                      type="text"
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      className="w-full bg-background border border-border px-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-colors"
                      placeholder={lang === "lv" ? "Jānis Bērziņš" : lang === "ru" ? "Иван Иванов" : "John Smith"}
                    />
                  </div>

                  <div className="mb-6">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                      {lang === "lv" ? "Jūsu atsauksme" : lang === "ru" ? "Ваш отзыв" : "Your Review"}
                    </label>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      rows={4}
                      className="w-full bg-background border border-border px-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                      placeholder={lang === "lv" ? "Dalieties ar savu pieredzi..." : lang === "ru" ? "Поделитесь своим опытом..." : "Share your experience..."}
                    />
                  </div>

                  <Button
                    onClick={async () => {
                      if (reviewName.trim() && reviewText.trim()) {
                        try {
                          await api.reviews.create({
                            productId: product.id,
                            productSlug: product.slug,
                            name: reviewName.trim(),
                            rating: reviewStars,
                            text: reviewText.trim(),
                          });
                        } catch {}
                        setReviewSubmitted(true);
                      }
                    }}
                    className="bg-primary hover:bg-primary/90 text-white rounded-none h-12 font-black uppercase tracking-widest text-sm px-8"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {lang === "lv" ? "Turpināt" : lang === "ru" ? "Продолжить" : "Submit"}
                  </Button>
                </div>
              )}

              {/* Static example review */}
              <div className="mt-10 max-w-2xl">
                <div className="border border-border p-6 bg-card">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="font-black text-white text-sm">M. Kalniņš</span>
                      <div className="flex gap-0.5 mt-1">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className="h-3.5 w-3.5 text-primary fill-primary" />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">15.01.2025</span>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {lang === "lv"
                      ? "Lielisks produkts par labu cenu. Piegāde notika ātri, un Mobilus komanda bija ļoti profesionāla un izpalīdzīga. Noteikti iesaku!"
                      : lang === "ru"
                      ? "Отличный продукт по хорошей цене. Доставка прошла быстро, команда Mobilus была очень профессиональной и помогла с любыми вопросами. Рекомендую!"
                      : "Excellent product at a great price. Delivery was fast, and the Mobilus team was very professional and helpful. Highly recommended!"}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Pieprasījumi ── */}
          {activeTab === "pieprasijumi" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-12"
            >
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">
                {lang === "lv" ? "Pieprasījumi" : lang === "ru" ? "Запросы" : "Inquiries"}
              </h2>
              <p className="text-muted-foreground text-sm mb-8">
                {lang === "lv"
                  ? `Jautājums par preci: ${product.name}`
                  : lang === "ru"
                  ? `Вопрос о товаре: ${product.name}`
                  : `Question about product: ${product.name}`}
              </p>

              {inquirySent ? (
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 max-w-xl flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  <p className="text-emerald-400 font-bold">
                    {lang === "lv" ? "Paldies! Mēs ar Jums sazināsimies drīzumā." : lang === "ru" ? "Спасибо! Мы свяжемся с вами в ближайшее время." : "Thank you! We will contact you shortly."}
                  </p>
                </div>
              ) : (
                <div className="max-w-xl bg-card border border-border p-8">
                  <div className="mb-4">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                      {lang === "lv" ? "Jūsu vārds" : lang === "ru" ? "Ваше имя" : "Your Name"} *
                    </label>
                    <input
                      type="text"
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      className="w-full bg-background border border-border px-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-colors"
                      placeholder={lang === "lv" ? "Jānis Bērziņš" : lang === "ru" ? "Иван Иванов" : "John Smith"}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                      {lang === "lv" ? "Tālrunis" : lang === "ru" ? "Телефон" : "Phone"} *
                    </label>
                    <input
                      type="tel"
                      value={inquiryPhone}
                      onChange={(e) => setInquiryPhone(e.target.value)}
                      className="w-full bg-background border border-border px-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-colors"
                      placeholder="+371 2X XXX XXX"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                      E-pasts *
                    </label>
                    <input
                      type="email"
                      value={inquiryEmail}
                      onChange={(e) => setInquiryEmail(e.target.value)}
                      className="w-full bg-background border border-border px-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-colors"
                      placeholder="name@example.com"
                    />
                  </div>

                  <Button
                    onClick={async () => {
                      if (inquiryName.trim() && inquiryPhone.trim() && inquiryEmail.trim()) {
                        try {
                          await api.inquiries.create({
                            productId: product.id,
                            productSlug: product.slug,
                            productName: product.name,
                            name: inquiryName.trim(),
                            phone: inquiryPhone.trim(),
                            email: inquiryEmail.trim(),
                          });
                        } catch {}
                        setInquirySent(true);
                      }
                    }}
                    className="w-full bg-primary hover:bg-primary/90 text-white rounded-none h-12 font-black uppercase tracking-widest text-sm"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    {lang === "lv" ? "Sūtīt jautājumu" : lang === "ru" ? "Отправить вопрос" : "Send Inquiry"}
                  </Button>

                  <p className="text-xs text-muted-foreground mt-4">
                    {lang === "lv"
                      ? "Mēs atbildēsim darba dienās 24 stundu laikā."
                      : lang === "ru"
                      ? "Мы ответим в рабочие дни в течение 24 часов."
                      : "We will respond within 24 hours on business days."}
                  </p>
                </div>
              )}

              {/* Test Drive CTA */}
              <div className="mt-10 max-w-xl border border-primary/30 bg-primary/5 p-6 flex items-center justify-between">
                <div>
                  <p className="font-black text-white uppercase tracking-wider text-sm mb-1">
                    {lang === "lv" ? "Izmēģini braukšanu" : lang === "ru" ? "Тест-драйв" : "Test Drive"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {lang === "lv" ? "Piesakies testa braucienam pie mums veikalā." : lang === "ru" ? "Запишитесь на тест-драйв в нашем магазине." : "Book a test ride at our store."}
                  </p>
                </div>
                <Link href="/contact">
                  <Button className="bg-primary hover:bg-primary/90 text-white rounded-none h-10 text-xs font-black uppercase tracking-widest ml-4 flex-shrink-0">
                    <Phone className="mr-2 h-3 w-3" />
                    {lang === "lv" ? "Pieteikties" : lang === "ru" ? "Записаться" : "Book Now"}
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </div>

        {/* ===== RELATED PRODUCTS ===== */}
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
              <Link href={parentHref} className="text-xs font-bold uppercase tracking-widest text-primary hover:underline flex items-center gap-1">
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
                  <Link href={`/${parentSection}/${rel.slug}`} className="block">
                    <div className="aspect-[4/3] overflow-hidden bg-muted">
                      <img
                        src={rel.image}
                        alt={rel.name}
                        className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = FALLBACK_IMAGES[rel.category] ?? FALLBACK_IMAGES.default;
                        }}
                        referrerPolicy="no-referrer"
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
