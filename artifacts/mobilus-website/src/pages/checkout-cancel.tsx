import { Link } from "wouter";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export default function CheckoutCancel() {
  const { lang } = useI18n();

  return (
    <div className="pt-32 pb-20 min-h-screen bg-background">
      <div className="container mx-auto px-4 max-w-lg text-center">
        <XCircle className="h-24 w-24 text-red-400 mx-auto mb-6" />
        <h1 className="text-4xl font-black uppercase tracking-tighter text-foreground mb-4">
          {lang === "lv" ? "Maksājums atcelts" : lang === "ru" ? "Оплата отменена" : "Payment Cancelled"}
        </h1>
        <p className="text-muted-foreground mb-8">
          {lang === "lv"
            ? "Jūsu pasūtījums netika pabeigts. Varat mēģināt vēlreiz."
            : lang === "ru"
            ? "Ваш заказ не был завершён. Вы можете попробовать ещё раз."
            : "Your order was not completed. You can try again."}
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/cart">
            <Button className="bg-primary text-white rounded-none h-12 px-8 font-black uppercase tracking-widest">
              {lang === "lv" ? "← Atpakaļ uz grozu" : lang === "ru" ? "← Назад в корзину" : "← Back to Cart"}
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="rounded-none h-12 px-8 font-black uppercase tracking-widest">
              {lang === "lv" ? "Uz sākumu" : lang === "ru" ? "На главную" : "Home"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
