import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, CreditCard, Building2, Banknote, BarChart3, Loader2 } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";

type PaymentMethod = "card" | "bank" | "cash" | "inbank";
type DeliveryMethod = "riga" | "valmiera";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  company: string;
  buyForCompany: boolean;
}

const emptyForm = (): FormData => ({
  firstName: "", lastName: "", email: "", phone: "",
  address: "", city: "", postalCode: "", country: "LV",
  company: "", buyForCompany: false,
});

export default function CheckoutPage() {
  const { items, subtotal, vat, total, count, clear } = useCart();
  const { lang } = useI18n();
  const [, setLocation] = useLocation();

  const [form, setForm] = useState<FormData>(emptyForm);
  const [delivery, setDelivery] = useState<DeliveryMethod>("riga");
  const [payment, setPayment] = useState<PaymentMethod>("card");
  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState<number | null>(null);

  const labels = {
    title: lang === "lv" ? "Noformēt pasūtījumu" : lang === "ru" ? "Оформление заказа" : "Checkout",
    contactInfo: lang === "lv" ? "Kontaktinformācija" : lang === "ru" ? "Контактные данные" : "Contact Information",
    deliveryTitle: lang === "lv" ? "Saņemšanas veids" : lang === "ru" ? "Способ получения" : "Delivery Method",
    paymentTitle: lang === "lv" ? "Apmaksas veids" : lang === "ru" ? "Способ оплаты" : "Payment Method",
    summary: lang === "lv" ? "Pasūtījuma kopsavilkums" : lang === "ru" ? "Сводка заказа" : "Order Summary",
    placeOrder: lang === "lv" ? "Veikt pasūtījumu" : lang === "ru" ? "Оформить заказ" : "Place Order",
    subtotal: lang === "lv" ? "Summa (bez PVN)" : lang === "ru" ? "Сумма (без НДС)" : "Subtotal (excl. VAT)",
    vatLabel: lang === "lv" ? "PVN (21%)" : lang === "ru" ? "НДС (21%)" : "VAT (21%)",
    totalLabel: lang === "lv" ? "Kopā" : lang === "ru" ? "Итого" : "Total",
    free: lang === "lv" ? "Bezmaksas" : lang === "ru" ? "Бесплатно" : "Free",
    required: lang === "lv" ? "Obligāts lauks" : lang === "ru" ? "Обязательное поле" : "Required field",
    backToCart: lang === "lv" ? "← Atpakaļ uz grozu" : lang === "ru" ? "← Назад в корзину" : "← Back to Cart",
    discount: lang === "lv" ? "Atlaides kods" : lang === "ru" ? "Промокод" : "Discount Code",
    apply: lang === "lv" ? "Lietot" : lang === "ru" ? "Применить" : "Apply",
    applied: lang === "lv" ? "Pielietots!" : lang === "ru" ? "Применено!" : "Applied!",
  };

  const field = (key: keyof FormData, label: string, type = "text", placeholder = "") => (
    <div>
      <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">{label}</label>
      <input
        type={type}
        value={String(form[key])}
        onChange={(e) => { setForm((f) => ({ ...f, [key]: e.target.value })); setErrors((er) => ({ ...er, [key]: undefined })); }}
        placeholder={placeholder}
        className={`w-full border bg-background text-foreground text-sm px-3 py-2.5 focus:outline-none focus:border-primary transition-colors ${errors[key] ? "border-red-400" : "border-border"}`}
      />
      {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key]}</p>}
    </div>
  );

  const validate = () => {
    const errs: Partial<Record<keyof FormData, string>> = {};
    if (!form.firstName.trim()) errs.firstName = labels.required;
    if (!form.lastName.trim()) errs.lastName = labels.required;
    if (!form.email.trim() || !form.email.includes("@")) errs.email = labels.required;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const buildOrderPayload = () => ({
    status: "pending",
    paymentMethod: payment,
    customerName: `${form.firstName} ${form.lastName}`,
    customerEmail: form.email,
    customerPhone: form.phone,
    deliveryAddress: {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      address: form.address,
      city: form.city,
      postalCode: form.postalCode,
      country: form.country,
      company: form.company,
      buyForCompany: form.buyForCompany,
      deliveryMethod: delivery,
    },
    items: items.map((i) => ({
      productId: i.productId,
      slug: i.slug,
      name: i.name,
      image: i.image,
      price: i.price,
      quantity: i.quantity,
      sku: i.sku,
      colorName: i.colorName,
    })),
    subtotal,
    vat,
    total,
    discountCode: discountApplied ? discountCode : null,
  });

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildOrderPayload()),
      });
      if (!orderRes.ok) throw new Error("Failed to create order");
      const order = await orderRes.json();

      if (payment === "card") {
        const base = window.location.origin + import.meta.env.BASE_URL.replace(/\/$/, "");
        const sessionRes = await fetch("/api/orders/stripe-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: items.map((i) => ({ name: i.name, price: i.price, quantity: i.quantity, image: i.image })),
            customerEmail: form.email,
            orderId: order.id,
            successUrl: `${base}/checkout/success`,
            cancelUrl: `${base}/checkout/cancel`,
          }),
        });
        const sessionData = await sessionRes.json();
        if (sessionData.url) {
          window.location.href = sessionData.url;
          return;
        } else {
          throw new Error(sessionData.error || "Stripe error");
        }
      } else {
        setConfirmedOrderId(order.id);
        setConfirmed(true);
        clear();
      }
    } catch (err: any) {
      alert(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmed) {
    return (
      <div className="pt-32 pb-20 min-h-screen bg-background">
        <div className="container mx-auto px-4 max-w-lg text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <CheckCircle2 className="h-20 w-20 text-emerald-500 mx-auto mb-6" />
            <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground mb-4">
              {lang === "lv" ? "Pasūtījums pieņemts!" : lang === "ru" ? "Заказ принят!" : "Order Placed!"}
            </h1>
            <p className="text-muted-foreground mb-2">
              {lang === "lv" ? `Pasūtījuma nr.: #${confirmedOrderId}` : lang === "ru" ? `Номер заказа: #${confirmedOrderId}` : `Order #${confirmedOrderId}`}
            </p>
            <p className="text-muted-foreground mb-8">
              {payment === "bank"
                ? (lang === "lv" ? "Lūdzu veiciet pārskaitījumu uz: LV12 HABA 0000 0000 0000 (Mobilus SIA). Norādiet pasūtījuma numuru kā maksājuma mērķi." : lang === "ru" ? "Пожалуйста, переведите оплату на: LV12 HABA 0000 0000 0000 (Mobilus SIA). Укажите номер заказа в назначении платежа." : "Please transfer to: LV12 HABA 0000 0000 0000 (Mobilus SIA). Include your order number as payment reference.")
                : payment === "cash"
                ? (lang === "lv" ? "Lūdzu apmaksājiet pasūtījumu saņemšanas brīdī veikalā." : lang === "ru" ? "Оплатите заказ при получении в магазине." : "Please pay in cash when you collect your order at the store.")
                : (lang === "lv" ? "Mūsu komanda sazināsies ar jums tuvāko 24 stundu laikā." : lang === "ru" ? "Наша команда свяжется с вами в ближайшие 24 часа." : "Our team will contact you within 24 hours.")}
            </p>
            <Link href="/">
              <Button className="bg-primary text-white rounded-none h-12 px-8 font-black uppercase tracking-widest">
                {lang === "lv" ? "Atpakaļ uz sākumu" : lang === "ru" ? "На главную" : "Back to Home"}
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  if (count === 0) {
    return (
      <div className="pt-32 pb-20 min-h-screen bg-background">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground mb-4">{lang === "lv" ? "Grozs ir tukšs" : lang === "ru" ? "Корзина пуста" : "Your cart is empty"}</p>
          <Link href="/cart"><Button className="bg-primary text-white rounded-none">← Cart</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 min-h-screen bg-background">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-foreground mb-2">{labels.title}</h1>
        <Link href="/cart" className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors block mb-8">
          {labels.backToCart}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: Forms */}
          <div className="lg:col-span-2 space-y-8">
            {/* Contact info */}
            <section className="border border-border p-6">
              <h2 className="text-xs font-black uppercase tracking-widest text-foreground mb-6 flex items-center gap-2">
                <span className="bg-primary text-white h-6 w-6 flex items-center justify-center text-xs font-black">1</span>
                {labels.contactInfo}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {field("firstName", lang === "lv" ? "Vārds *" : lang === "ru" ? "Имя *" : "First Name *")}
                {field("lastName", lang === "lv" ? "Uzvārds *" : lang === "ru" ? "Фамилия *" : "Last Name *")}
                {field("email", lang === "lv" ? "E-pasts *" : lang === "ru" ? "Email *" : "Email *", "email")}
                {field("phone", lang === "lv" ? "Tālrunis" : lang === "ru" ? "Телефон" : "Phone", "tel", "+371")}
                {field("address", lang === "lv" ? "Adrese" : lang === "ru" ? "Адрес" : "Address")}
                {field("city", lang === "lv" ? "Pilsēta" : lang === "ru" ? "Город" : "City")}
                {field("postalCode", lang === "lv" ? "Pasta indekss" : lang === "ru" ? "Почтовый индекс" : "Postal Code")}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
                    {lang === "lv" ? "Valsts" : lang === "ru" ? "Страна" : "Country"}
                  </label>
                  <select
                    value={form.country}
                    onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                    className="w-full border border-border bg-background text-foreground text-sm px-3 py-2.5 focus:outline-none focus:border-primary"
                  >
                    <option value="LV">Latvia</option>
                    <option value="EE">Estonia</option>
                    <option value="LT">Lithuania</option>
                    <option value="EU">Other EU</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="buyForCompany"
                  checked={form.buyForCompany}
                  onChange={(e) => setForm((f) => ({ ...f, buyForCompany: e.target.checked }))}
                  className="h-4 w-4 border-border accent-primary"
                />
                <label htmlFor="buyForCompany" className="text-sm text-foreground cursor-pointer">
                  {lang === "lv" ? "Pirkums uzņēmumam" : lang === "ru" ? "Покупка для юридического лица" : "Buy for company"}
                </label>
              </div>
              {form.buyForCompany && (
                <div className="mt-4">
                  {field("company", lang === "lv" ? "Uzņēmuma nosaukums / Reģ. nr." : lang === "ru" ? "Название компании / Рег. номер" : "Company Name / Reg. No.")}
                </div>
              )}
            </section>

            {/* Delivery */}
            <section className="border border-border p-6">
              <h2 className="text-xs font-black uppercase tracking-widest text-foreground mb-6 flex items-center gap-2">
                <span className="bg-primary text-white h-6 w-6 flex items-center justify-center text-xs font-black">2</span>
                {labels.deliveryTitle}
              </h2>
              <div className="space-y-3">
                {(["riga", "valmiera"] as DeliveryMethod[]).map((method) => (
                  <label
                    key={method}
                    onClick={() => setDelivery(method)}
                    className={`flex items-center justify-between p-4 border cursor-pointer transition-all ${delivery === method ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${delivery === method ? "border-primary" : "border-muted-foreground"}`}>
                        {delivery === method && <div className="h-2 w-2 rounded-full bg-primary" />}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-foreground">
                          {method === "riga"
                            ? (lang === "lv" ? "Saņemšana Rīgā — Dārzciema 123" : lang === "ru" ? "Самовывоз Рига — Dārzciema 123" : "Pickup Riga — Dārzciema 123")
                            : (lang === "lv" ? "Saņemšana Valmierā" : lang === "ru" ? "Самовывоз Валмиера" : "Pickup Valmiera")}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {lang === "lv" ? "P–Pk 10:00–19:00, Se 10:00–16:00" : lang === "ru" ? "Пн–Пт 10:00–19:00, Сб 10:00–16:00" : "Mon–Fri 10:00–19:00, Sat 10:00–16:00"}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-emerald-500">{labels.free}</span>
                  </label>
                ))}
              </div>
            </section>

            {/* Payment */}
            <section className="border border-border p-6">
              <h2 className="text-xs font-black uppercase tracking-widest text-foreground mb-6 flex items-center gap-2">
                <span className="bg-primary text-white h-6 w-6 flex items-center justify-center text-xs font-black">3</span>
                {labels.paymentTitle}
              </h2>
              <div className="space-y-3">
                {([
                  { key: "card", icon: CreditCard, label: lang === "lv" ? "Bankas karte (Stripe)" : lang === "ru" ? "Банковская карта (Stripe)" : "Card Payment (Stripe)", sub: "Visa, Mastercard, Google Pay, Apple Pay" },
                  { key: "bank", icon: Building2, label: lang === "lv" ? "Bankas pārskaitījums" : lang === "ru" ? "Банковский перевод" : "Bank Transfer", sub: "LV12 HABA 0000 0000 0000" },
                  { key: "cash", icon: Banknote, label: lang === "lv" ? "Skaidra nauda veikalā" : lang === "ru" ? "Наличные в магазине" : "Cash at Store", sub: lang === "lv" ? "Apmaksa saņemot preci" : lang === "ru" ? "Оплата при получении" : "Pay on pickup" },
                  { key: "inbank", icon: BarChart3, label: "InBank " + (lang === "lv" ? "līzings" : lang === "ru" ? "лизинг" : "Leasing"), sub: lang === "lv" ? "Ērti ikmēneša maksājumi" : lang === "ru" ? "Удобные ежемесячные платежи" : "Easy monthly payments" },
                ] as { key: PaymentMethod; icon: any; label: string; sub: string }[]).map(({ key, icon: Icon, label, sub }) => (
                  <label
                    key={key}
                    onClick={() => setPayment(key)}
                    className={`flex items-center gap-4 p-4 border cursor-pointer transition-all ${payment === key ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
                  >
                    <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${payment === key ? "border-primary" : "border-muted-foreground"}`}>
                      {payment === key && <div className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                    <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="font-bold text-sm text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground">{sub}</p>
                    </div>
                  </label>
                ))}
              </div>

              {payment === "inbank" && (
                <div className="mt-4 p-4 bg-muted border border-border">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                    {lang === "lv" ? "InBank līzinga nosacījumi" : lang === "ru" ? "Условия лизинга InBank" : "InBank Leasing Terms"}
                  </p>
                  <p className="text-sm text-foreground">
                    {lang === "lv"
                      ? `Ikmēneša maksājums: €${Math.round(total / 24).toLocaleString()}/mēn. (24 mēn., 10% pirmā iemaksa, 8.9% p.a.)`
                      : lang === "ru"
                      ? `Ежемесячный платёж: €${Math.round(total / 24).toLocaleString()}/мес. (24 мес., 10% первоначальный взнос, 8.9% годовых)`
                      : `Monthly payment: €${Math.round(total / 24).toLocaleString()}/mo. (24 months, 10% down, 8.9% p.a.)`}
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* Right: Order Summary (sticky) */}
          <div className="lg:col-span-1">
            <div className="border border-border p-6 sticky top-24">
              <h2 className="text-xs font-black uppercase tracking-widest text-foreground mb-4">{labels.summary}</h2>

              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.colorName}`} className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="h-10 w-10 object-cover border border-border flex-shrink-0" referrerPolicy="no-referrer" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{item.name}</p>
                      {item.colorName && <p className="text-xs text-muted-foreground">{item.colorName}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-bold text-foreground">€{(item.price * item.quantity).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">×{item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Discount code */}
              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder={labels.discount}
                    className="flex-1 border border-border bg-background text-foreground text-xs px-3 py-2 focus:outline-none focus:border-primary"
                  />
                  <button
                    onClick={() => { if (discountCode) setDiscountApplied(true); }}
                    className="border border-border px-3 py-2 text-xs font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-colors"
                  >
                    {discountApplied ? "✓" : labels.apply}
                  </button>
                </div>
                {discountApplied && <p className="text-xs text-emerald-500 mt-1">{labels.applied}</p>}
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{labels.subtotal}</span>
                  <span className="font-bold text-foreground">€{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{labels.vatLabel}</span>
                  <span className="font-bold text-foreground">€{vat.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{lang === "lv" ? "Saņemšana" : lang === "ru" ? "Самовывоз" : "Pickup"}</span>
                  <span className="font-bold text-emerald-500">{labels.free}</span>
                </div>
                <div className="flex justify-between font-black text-base border-t border-border pt-2 mt-2">
                  <span className="text-foreground">{labels.totalLabel}</span>
                  <span className="text-primary">€{total.toLocaleString()}</span>
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full mt-6 bg-primary hover:bg-primary/90 text-white rounded-none h-12 font-black uppercase tracking-widest"
              >
                {submitting
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{lang === "lv" ? "Apstrādā..." : lang === "ru" ? "Обработка..." : "Processing..."}</>
                  : labels.placeOrder}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-3">
                {lang === "lv" ? "Droša šifrēta savienojuma aizsardzība" : lang === "ru" ? "Защищено шифрованием" : "Secured with SSL encryption"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
