import { useEffect, useState } from "react";
import { Link } from "wouter";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n";

export default function CheckoutSuccess() {
  const { clear } = useCart();
  const { lang } = useI18n();
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("order_id");
    if (id) setOrderId(id);
    clear();
  }, []);

  return (
    <div className="pt-32 pb-20 min-h-screen bg-background">
      <div className="container mx-auto px-4 max-w-lg text-center">
        <CheckCircle2 className="h-24 w-24 text-emerald-500 mx-auto mb-6" />
        <h1 className="text-4xl font-black uppercase tracking-tighter text-foreground mb-4">
          {lang === "lv" ? "Maksājums veiksmīgs!" : lang === "ru" ? "Оплата прошла успешно!" : "Payment Successful!"}
        </h1>
        {orderId && (
          <p className="text-muted-foreground mb-4">
            {lang === "lv" ? `Pasūtījuma nr.: #${orderId}` : lang === "ru" ? `Номер заказа: #${orderId}` : `Order #${orderId}`}
          </p>
        )}
        <p className="text-muted-foreground mb-8">
          {lang === "lv"
            ? "Paldies par jūsu pasūtījumu! Mūsu komanda sazināsies ar jums tuvāko 24 stundu laikā."
            : lang === "ru"
            ? "Спасибо за ваш заказ! Наша команда свяжется с вами в течение 24 часов."
            : "Thank you for your order! Our team will contact you within 24 hours."}
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/">
            <Button className="bg-primary text-white rounded-none h-12 px-8 font-black uppercase tracking-widest">
              {lang === "lv" ? "Uz sākumu" : lang === "ru" ? "На главную" : "Back to Home"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
