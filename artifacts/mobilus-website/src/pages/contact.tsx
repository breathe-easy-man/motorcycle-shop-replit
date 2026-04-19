import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock, CheckCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function Contact() {
  const { t } = useI18n();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="pt-24 pb-20 min-h-screen bg-background">
      {/* Header */}
      <div className="container mx-auto px-4 md:px-6 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl"
        >
          <p className="text-primary font-bold uppercase tracking-widest text-sm mb-3">
            {t.contact.label}
          </p>
          <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none mb-6">
            {t.contact.title}
          </h1>
          <p className="text-muted-foreground text-lg">{t.contact.subtitle}</p>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <div className="bg-card border border-border p-8">
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">
                {t.contact.store_info}
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t.contact.address_label}</p>
                    <p className="font-bold text-white">Rīga, Dārzciema 123</p>
                    <p className="text-sm text-muted-foreground">{t.home.country}, LV-1073</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t.contact.phone_label}</p>
                    <a href="tel:+37167676402" className="font-bold text-white hover:text-primary transition-colors block">
                      +371 67 676 402
                    </a>
                    <a href="tel:+37129509623" className="text-sm text-muted-foreground hover:text-primary transition-colors block">
                      +371 29 509 623
                    </a>
                    <a href="tel:+37129296613" className="text-xs text-muted-foreground hover:text-primary transition-colors block mt-1">
                      +371 29 296 613 (Service)
                    </a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t.contact.email_label}</p>
                    <a href="mailto:commerce@mobilus.lv" className="font-bold text-white hover:text-primary transition-colors">
                      commerce@mobilus.lv
                    </a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t.contact.hours_label}</p>
                    <div className="space-y-1">
                      <p className="text-sm text-white font-medium">{t.contact.hours_weekday}</p>
                      <p className="text-sm text-white font-medium">{t.contact.hours_weekend}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="bg-card border border-border overflow-hidden h-48 relative flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-muted to-background opacity-80" />
              <div className="relative z-10 text-center">
                <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-bold text-white">Rīga, Dārzciema 123</p>
                <a
                  href="https://maps.google.com/?q=Dārzciema+123,+Riga,+Latvia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline mt-1 block"
                >
                  {t.contact.open_maps}
                </a>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-card border border-border p-8 md:p-10"
          >
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-20 text-center"
                >
                  <div className="w-20 h-20 bg-primary/10 flex items-center justify-center mb-6">
                    <CheckCircle className="h-10 w-10 text-primary" />
                  </div>
                  <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">
                    {t.contact.success_title}
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-md">
                    {t.contact.success_msg.replace("{h}", t.contact.success_hours).split(t.contact.success_hours)[0]}
                    <span className="text-primary font-bold">{t.contact.success_hours}</span>
                    {t.contact.success_msg.replace("{h}", t.contact.success_hours).split(t.contact.success_hours)[1]}
                  </p>
                  <Button
                    onClick={() => {
                      setSubmitted(false);
                      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
                    }}
                    variant="outline"
                    className="mt-8 border-primary text-primary hover:bg-primary hover:text-white rounded-none uppercase font-bold tracking-widest"
                  >
                    {t.contact.send_another}
                  </Button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-8">
                    {t.contact.form_title}
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        {t.contact.name}
                      </label>
                      <Input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        placeholder="..."
                        className="rounded-none bg-background border-border focus:border-primary h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        {t.contact.phone}
                      </label>
                      <Input
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        type="tel"
                        placeholder="+371 ..."
                        className="rounded-none bg-background border-border focus:border-primary h-12"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      {t.contact.email}
                    </label>
                    <Input
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      type="email"
                      placeholder="your@email.com"
                      className="rounded-none bg-background border-border focus:border-primary h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      {t.contact.subject}
                    </label>
                    <select
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      className="w-full h-12 px-3 bg-background border border-border text-foreground text-sm focus:outline-none focus:border-primary rounded-none"
                    >
                      <option value="">...</option>
                      {t.contact.subjects.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      {t.contact.message}
                    </label>
                    <Textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      placeholder="..."
                      className="rounded-none bg-background border-border focus:border-primary resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-white rounded-none h-14 text-base font-bold uppercase tracking-widest"
                  >
                    {t.contact.submit}
                  </Button>

                  <p className="text-xs text-muted-foreground">{t.contact.required}</p>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
