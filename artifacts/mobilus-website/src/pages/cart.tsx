import { Link } from "wouter";
import { motion } from "framer-motion";
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";
import { useState } from "react";

export default function CartPage() {
  const { items, remove, update, subtotal, vat, total, count } = useCart();
  const { lang } = useI18n();
  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [giftCode, setGiftCode] = useState("");
  const [giftApplied, setGiftApplied] = useState(false);

  const t = {
    title: lang === "lv" ? "Grozs" : lang === "ru" ? "Корзина" : "Cart",
    empty: lang === "lv" ? "Jūsu grozs ir tukšs" : lang === "ru" ? "Ваша корзина пуста" : "Your cart is empty",
    emptyBtn: lang === "lv" ? "Turpināt iepirkties" : lang === "ru" ? "Продолжить покупки" : "Continue Shopping",
    product: lang === "lv" ? "Prece" : lang === "ru" ? "Товар" : "Product",
    qty: lang === "lv" ? "Daudzums" : lang === "ru" ? "Кол-во" : "Qty",
    unit: lang === "lv" ? "Cena/gab." : lang === "ru" ? "Цена/шт." : "Unit Price",
    total: lang === "lv" ? "Kopā" : lang === "ru" ? "Итого" : "Total",
    remove: lang === "lv" ? "Noņemt" : lang === "ru" ? "Удалить" : "Remove",
    subtotal: lang === "lv" ? "Summa (bez PVN)" : lang === "ru" ? "Сумма (без НДС)" : "Subtotal (excl. VAT)",
    vatLabel: lang === "lv" ? "PVN (21%)" : lang === "ru" ? "НДС (21%)" : "VAT (21%)",
    totalLabel: lang === "lv" ? "Kopā ar PVN" : lang === "ru" ? "Итого с НДС" : "Total incl. VAT",
    checkout: lang === "lv" ? "Noformēt pasūtījumu" : lang === "ru" ? "Оформить заказ" : "Proceed to Checkout",
    discount: lang === "lv" ? "Atlaides kods" : lang === "ru" ? "Промокод" : "Discount Code",
    gift: lang === "lv" ? "Dāvanu karte" : lang === "ru" ? "Подарочная карта" : "Gift Card",
    apply: lang === "lv" ? "Lietot" : lang === "ru" ? "Применить" : "Apply",
    applied: lang === "lv" ? "Pielietots!" : lang === "ru" ? "Применено!" : "Applied!",
    continueShopping: lang === "lv" ? "← Turpināt iepirkties" : lang === "ru" ? "← Продолжить покупки" : "← Continue Shopping",
  };

  if (count === 0) {
    return (
      <div className="pt-32 pb-20 min-h-screen bg-background">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-foreground mb-10">{t.title}</h1>
          <div className="flex flex-col items-center justify-center py-24 gap-6">
            <ShoppingCart className="h-20 w-20 text-muted-foreground/20" />
            <p className="text-xl text-muted-foreground">{t.empty}</p>
            <Link href="/moto">
              <Button className="bg-primary text-white rounded-none h-12 px-8 font-black uppercase tracking-widest">
                {t.emptyBtn}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 min-h-screen bg-background">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-foreground mb-10">{t.title}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Cart items */}
          <div className="lg:col-span-2">
            <div className="border border-border">
              {/* Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-muted border-b border-border text-xs font-bold uppercase tracking-widest text-muted-foreground">
                <div className="col-span-5">{t.product}</div>
                <div className="col-span-2 text-right">{t.unit}</div>
                <div className="col-span-3 text-center">{t.qty}</div>
                <div className="col-span-2 text-right">{t.total}</div>
              </div>

              {/* Items */}
              {items.map((item) => (
                <motion.div
                  key={`${item.productId}-${item.colorName ?? ""}`}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-12 gap-4 px-6 py-5 border-b border-border last:border-b-0 items-center"
                >
                  {/* Product */}
                  <div className="col-span-12 md:col-span-5 flex items-center gap-4">
                    <Link href={`/${item.section}/${item.slug}`}>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-16 w-16 object-cover border border-border flex-shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    </Link>
                    <div>
                      <Link href={`/${item.section}/${item.slug}`}>
                        <p className="font-bold text-foreground text-sm leading-tight hover:text-primary transition-colors">{item.name}</p>
                      </Link>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.sku}</p>
                      {item.colorName && (
                        <div className="flex items-center gap-1 mt-1">
                          {item.colorHex && (
                            <span className="h-3 w-3 rounded-full border border-black/10" style={{ backgroundColor: item.colorHex }} />
                          )}
                          <span className="text-xs text-muted-foreground">{item.colorName}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Unit price */}
                  <div className="hidden md:block col-span-2 text-right">
                    <span className="font-bold text-foreground">€{item.price.toLocaleString()}</span>
                  </div>

                  {/* Quantity controls */}
                  <div className="col-span-8 md:col-span-3 flex items-center justify-start md:justify-center gap-2">
                    <button
                      onClick={() => update(item.productId, item.colorName, item.quantity - 1)}
                      className="h-8 w-8 border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center font-bold text-foreground">{item.quantity}</span>
                    <button
                      onClick={() => update(item.productId, item.colorName, item.quantity + 1)}
                      className="h-8 w-8 border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => remove(item.productId, item.colorName)}
                      className="h-8 w-8 border border-border flex items-center justify-center hover:border-red-500 hover:text-red-500 transition-colors ml-1"
                      title={t.remove}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Line total */}
                  <div className="col-span-4 md:col-span-2 text-right">
                    <span className="font-black text-foreground">€{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            <Link href="/moto" className="inline-block mt-6 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
              {t.continueShopping}
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="border border-border p-6 sticky top-24">
              <h2 className="text-sm font-black uppercase tracking-widest text-foreground mb-6">
                {lang === "lv" ? "Pasūtījuma kopsavilkums" : lang === "ru" ? "Сводка заказа" : "Order Summary"}
              </h2>

              {/* Discount code */}
              <div className="mb-4">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">{t.discount}</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder="PROMO2024"
                    className="flex-1 border border-border bg-background text-foreground text-xs px-3 py-2 focus:outline-none focus:border-primary"
                  />
                  <button
                    onClick={() => { if (discountCode) setDiscountApplied(true); }}
                    className="border border-border px-3 py-2 text-xs font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-colors"
                  >
                    {discountApplied ? "✓" : t.apply}
                  </button>
                </div>
                {discountApplied && <p className="text-xs text-emerald-500 mt-1">{t.applied}</p>}
              </div>

              {/* Gift card */}
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">{t.gift}</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={giftCode}
                    onChange={(e) => setGiftCode(e.target.value)}
                    placeholder="GIFT-XXXX"
                    className="flex-1 border border-border bg-background text-foreground text-xs px-3 py-2 focus:outline-none focus:border-primary"
                  />
                  <button
                    onClick={() => { if (giftCode) setGiftApplied(true); }}
                    className="border border-border px-3 py-2 text-xs font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-colors"
                  >
                    {giftApplied ? "✓" : t.apply}
                  </button>
                </div>
                {giftApplied && <p className="text-xs text-emerald-500 mt-1">{t.applied}</p>}
              </div>

              <div className="border-t border-border pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t.subtotal}</span>
                  <span className="font-bold text-foreground">€{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t.vatLabel}</span>
                  <span className="font-bold text-foreground">€{vat.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {lang === "lv" ? "Saņemšana" : lang === "ru" ? "Самовывоз" : "Pickup"}
                  </span>
                  <span className="font-bold text-emerald-500">
                    {lang === "lv" ? "Bezmaksas" : lang === "ru" ? "Бесплатно" : "Free"}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-black border-t border-border pt-3">
                  <span className="text-foreground">{t.totalLabel}</span>
                  <span className="text-primary">€{total.toLocaleString()}</span>
                </div>
              </div>

              <Link href="/checkout">
                <Button className="w-full mt-6 bg-primary hover:bg-primary/90 text-white rounded-none h-12 font-black uppercase tracking-widest">
                  {t.checkout}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
