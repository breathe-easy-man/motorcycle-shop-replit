/**
 * Mobilus Email Service — powered by Resend (via Replit Connector)
 *
 * Triggers:
 *   - orderConfirmation   — customer email on POST /orders
 *   - orderAdminAlert     — admin email on POST /orders
 *   - orderStatusUpdate   — customer email on PATCH /orders/:id (status changes)
 *   - stripePaymentPaid   — customer receipt on stripe webhook checkout.session.completed
 *   - inquiryAck          — customer acknowledgment on POST /inquiries
 *   - inquiryAdminAlert   — admin email on POST /inquiries
 *   - reviewAdminAlert    — admin moderation alert on POST /reviews
 */

import { Resend } from "resend";

// ─── Resend client (never cached — tokens expire) ─────────────────────────────

interface ResendCredentials {
  client: Resend;
  fromEmail: string;
}

async function getResendClient(): Promise<ResendCredentials> {
  const hostname = process.env["REPLIT_CONNECTORS_HOSTNAME"];
  const xReplitToken = process.env["REPL_IDENTITY"]
    ? "repl " + process.env["REPL_IDENTITY"]
    : process.env["WEB_REPL_RENEWAL"]
    ? "depl " + process.env["WEB_REPL_RENEWAL"]
    : null;

  if (!hostname || !xReplitToken) {
    throw new Error("Resend: REPLIT_CONNECTORS_HOSTNAME or identity token not found");
  }

  const data = await fetch(
    `https://${hostname}/api/v2/connection?include_secrets=true&connector_names=resend`,
    {
      headers: {
        Accept: "application/json",
        "X-Replit-Token": xReplitToken,
      },
    }
  )
    .then((r) => r.json())
    .then((d: { items?: Array<{ settings: { api_key?: string; from_email?: string } }> }) => d.items?.[0]);

  if (!data?.settings?.api_key) {
    throw new Error("Resend not connected — complete OAuth in Replit integrations");
  }

  return {
    client: new Resend(data.settings.api_key),
    fromEmail: data.settings.from_email ?? "Mobilus <onboarding@resend.dev>",
  };
}

// ─── Admin address ─────────────────────────────────────────────────────────────

function adminEmail(): string {
  return process.env["ADMIN_EMAIL"] ?? "admin@mobilus.lv";
}

// ─── Shared design helpers ─────────────────────────────────────────────────────

const BRAND_ORANGE = "#e07020";
const BRAND_DARK = "#1a1f2e";
const GRAY_LIGHT = "#f5f6f8";
const GRAY_MID = "#6b7280";

function emailBase(body: string): string {
  return `<!DOCTYPE html>
<html lang="lv">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Mobilus</title>
</head>
<body style="margin:0;padding:0;background:${GRAY_LIGHT};font-family:system-ui,-apple-system,sans-serif;color:${BRAND_DARK};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${GRAY_LIGHT};padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:${BRAND_DARK};padding:28px 40px;">
            <span style="font-size:28px;font-weight:900;letter-spacing:-1px;color:#fff;font-style:italic;">
              Mobilus<span style="color:${BRAND_ORANGE};">.</span>
            </span>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="background:#fff;padding:40px;">
            ${body}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:${BRAND_DARK};padding:24px 40px;text-align:center;">
            <p style="margin:0;color:#9ca3af;font-size:12px;">
              © ${new Date().getFullYear()} Mobilus. Rīga, Latvija |
              <a href="https://mobilus.lv" style="color:${BRAND_ORANGE};text-decoration:none;">mobilus.lv</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function heading(text: string): string {
  return `<h1 style="margin:0 0 24px;font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:-0.5px;color:${BRAND_DARK};">${text}</h1>`;
}

function paragraph(text: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">${text}</p>`;
}

function badge(text: string, color = BRAND_ORANGE): string {
  return `<span style="display:inline-block;background:${color};color:#fff;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;padding:4px 10px;">${text}</span>`;
}

function divider(): string {
  return `<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">`;
}

function button(label: string, url: string): string {
  return `<a href="${url}" style="display:inline-block;background:${BRAND_ORANGE};color:#fff;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;padding:12px 28px;text-decoration:none;margin-top:8px;">${label}</a>`;
}

function keyValueTable(rows: Array<[string, string]>): string {
  const cells = rows
    .map(
      ([k, v]) => `
    <tr>
      <td style="padding:10px 0;font-size:13px;color:${GRAY_MID};font-weight:600;text-transform:uppercase;letter-spacing:0.5px;width:40%;border-bottom:1px solid #f3f4f6;">${k}</td>
      <td style="padding:10px 0;font-size:14px;color:${BRAND_DARK};font-weight:700;border-bottom:1px solid #f3f4f6;">${v}</td>
    </tr>`
    )
    .join("");
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">${cells}</table>`;
}

// ─── Order item table ──────────────────────────────────────────────────────────

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  colorName?: string;
}

function orderItemsTable(items: OrderItem[], total: number, vat: number): string {
  const rows = items
    .map(
      (it) => `
    <tr>
      <td style="padding:12px 0;font-size:14px;color:${BRAND_DARK};border-bottom:1px solid #f3f4f6;">
        <strong>${it.name}</strong>
        ${it.colorName ? `<br><span style="font-size:12px;color:${GRAY_MID};">${it.colorName}</span>` : ""}
      </td>
      <td style="padding:12px 0;font-size:14px;color:${GRAY_MID};border-bottom:1px solid #f3f4f6;text-align:center;">×${it.quantity}</td>
      <td style="padding:12px 0;font-size:14px;font-weight:700;color:${BRAND_ORANGE};border-bottom:1px solid #f3f4f6;text-align:right;">€${(it.price * it.quantity).toLocaleString("lv-LV", { minimumFractionDigits: 2 })}</td>
    </tr>`
    )
    .join("");

  const subtotal = total - vat;

  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
    <tr>
      <th style="text-align:left;padding:8px 0;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:${GRAY_MID};border-bottom:2px solid ${BRAND_DARK};">Prece</th>
      <th style="text-align:center;padding:8px 0;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:${GRAY_MID};border-bottom:2px solid ${BRAND_DARK};">Daudzums</th>
      <th style="text-align:right;padding:8px 0;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:${GRAY_MID};border-bottom:2px solid ${BRAND_DARK};">Summa</th>
    </tr>
    ${rows}
    <tr>
      <td colspan="2" style="padding:10px 0 4px;font-size:13px;color:${GRAY_MID};text-align:right;">Bez PVN:</td>
      <td style="padding:10px 0 4px;font-size:13px;color:${GRAY_MID};text-align:right;">€${subtotal.toLocaleString("lv-LV", { minimumFractionDigits: 2 })}</td>
    </tr>
    <tr>
      <td colspan="2" style="padding:4px 0;font-size:13px;color:${GRAY_MID};text-align:right;">PVN (21%):</td>
      <td style="padding:4px 0;font-size:13px;color:${GRAY_MID};text-align:right;">€${vat.toLocaleString("lv-LV", { minimumFractionDigits: 2 })}</td>
    </tr>
    <tr>
      <td colspan="2" style="padding:12px 0 0;font-size:16px;font-weight:900;text-transform:uppercase;letter-spacing:-0.5px;color:${BRAND_DARK};text-align:right;">KOPĀ:</td>
      <td style="padding:12px 0 0;font-size:20px;font-weight:900;color:${BRAND_ORANGE};text-align:right;">€${total.toLocaleString("lv-LV", { minimumFractionDigits: 2 })}</td>
    </tr>
  </table>`;
}

function paymentMethodLabel(method: string): string {
  const map: Record<string, string> = {
    card: "Bankas karte (Stripe)",
    bank: "Bankas pārskaitījums",
    cash: "Skaidra nauda veikalā",
    inbank: "InBank līzings",
  };
  return map[method] ?? method;
}

// ─── Email payload types ───────────────────────────────────────────────────────

export interface OrderEmailData {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  paymentMethod: string;
  status: string;
  items: OrderItem[];
  total: number;
  vat: number;
  notes?: string | null;
}

export interface InquiryEmailData {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  subject?: string | null;
  message: string;
  productSlug?: string | null;
}

export interface ReviewEmailData {
  reviewerName: string;
  productSlug: string;
  rating: number;
  comment?: string | null;
}

// ─── Shared email send wrapper ─────────────────────────────────────────────────

async function send(to: string | string[], subject: string, html: string): Promise<void> {
  let creds: ResendCredentials;
  try {
    creds = await getResendClient();
  } catch (err) {
    // Degrade gracefully — email unavailable should never break the main request
    console.error("[email] Resend client unavailable:", err instanceof Error ? err.message : err);
    return;
  }
  const result = await creds.client.emails.send({
    from: creds.fromEmail || "Mobilus <onboarding@resend.dev>",
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
  });
  if ("error" in result && result.error) {
    console.error("[email] Send error:", result.error);
  }
}

// ─── 1. Order confirmed (customer) ────────────────────────────────────────────

export async function sendOrderConfirmation(order: OrderEmailData): Promise<void> {
  const html = emailBase(`
    ${heading("Paldies par jūsu pasūtījumu!")}
    ${paragraph(`Labdien, <strong>${order.customerName}</strong>!`)}
    ${paragraph("Jūsu pasūtījums ir saņemts un tiek apstrādāts. Tuvākajā laikā ar jums sazināsimies.")}
    ${keyValueTable([
      ["Pasūtījuma Nr.", `#${order.id}`],
      ["Maksājuma veids", paymentMethodLabel(order.paymentMethod)],
      ["Statuss", badge(order.status === "paid" ? "Apmaksāts" : "Gaida apstiprinājumu")],
    ])}
    ${divider()}
    ${orderItemsTable(order.items, order.total, order.vat)}
    ${order.paymentMethod === "bank" ? `
    ${divider()}
    <div style="background:${GRAY_LIGHT};padding:20px;border-left:4px solid ${BRAND_ORANGE};">
      <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:${BRAND_DARK};">Bankas pārskaitījuma dati:</p>
      <p style="margin:0;font-size:13px;color:#374151;line-height:1.8;">
        Saņēmējs: <strong>SIA Mobilus</strong><br>
        IBAN: <strong>LV00HABA0000000000000</strong><br>
        Maksājuma mērķis: <strong>Pasūtījums #${order.id}</strong><br>
        Summa: <strong>€${order.total.toLocaleString("lv-LV", { minimumFractionDigits: 2 })}</strong>
      </p>
    </div>` : ""}
    ${divider()}
    ${paragraph(`Ja jums ir jautājumi, rakstiet uz <a href="mailto:info@mobilus.lv" style="color:${BRAND_ORANGE};">info@mobilus.lv</a> vai zvaniet <a href="tel:+37167000000" style="color:${BRAND_ORANGE};">+371 67 000 000</a>.`)}
    ${button("Skatīt mūsu katalogu", "https://mobilus.lv/moto")}
  `);

  await send(order.customerEmail, `Pasūtījuma apstiprinājums #${order.id} — Mobilus`, html);
}

// ─── 2. Order alert (admin) ───────────────────────────────────────────────────

export async function sendOrderAdminAlert(order: OrderEmailData): Promise<void> {
  const html = emailBase(`
    ${badge("Jauns pasūtījums", BRAND_DARK)}
    ${heading(`Pasūtījums #${order.id}`)}
    ${keyValueTable([
      ["Klients", order.customerName],
      ["E-pasts", order.customerEmail],
      ["Tālrunis", order.customerPhone ?? "—"],
      ["Maksājums", paymentMethodLabel(order.paymentMethod)],
      ["Statuss", order.status],
    ])}
    ${divider()}
    ${orderItemsTable(order.items, order.total, order.vat)}
    ${order.notes ? `${divider()}${paragraph(`<strong>Piezīmes:</strong> ${order.notes}`)}` : ""}
    ${divider()}
    ${button("Apskatīt admin panelī", "https://mobilus.lv/admin")}
  `);

  await send(adminEmail(), `🛒 Jauns pasūtījums #${order.id} — ${order.customerName}`, html);
}

// ─── 3. Order status update (customer) ───────────────────────────────────────

const STATUS_LABELS: Record<string, { lv: string; color: string; msg: string }> = {
  paid: { lv: "Apmaksāts", color: "#16a34a", msg: "Jūsu maksājums ir saņemts. Drīzumā sāksim apstrādi." },
  processing: { lv: "Apstrādē", color: BRAND_ORANGE, msg: "Jūsu pasūtījums tiek sagatavots nosūtīšanai." },
  shipped: { lv: "Nosūtīts", color: "#2563eb", msg: "Jūsu pasūtījums ir nodots kurjeram. Sagaidiet piegādi 1–3 darba dienu laikā." },
  ready: { lv: "Gatavs izņemšanai", color: "#7c3aed", msg: "Jūsu pasūtījums ir gatavs. Varat to izņemt mūsu veikalā." },
  completed: { lv: "Pabeigts", color: "#16a34a", msg: "Paldies par pirkumu! Ceram, ka esat apmierināts." },
  cancelled: { lv: "Atcelts", color: "#dc2626", msg: "Jūsu pasūtījums ir atcelts. Sazinieties ar mums, ja uzskatāt, ka tas ir kļūda." },
};

export async function sendOrderStatusUpdate(order: OrderEmailData): Promise<void> {
  const info = STATUS_LABELS[order.status] ?? { lv: order.status, color: BRAND_DARK, msg: `Jūsu pasūtījuma statuss ir mainīts uz: ${order.status}.` };

  const html = emailBase(`
    ${heading("Pasūtījuma statuss atjaunināts")}
    ${paragraph(`Labdien, <strong>${order.customerName}</strong>!`)}
    ${paragraph(info.msg)}
    ${keyValueTable([
      ["Pasūtījuma Nr.", `#${order.id}`],
      ["Jaunais statuss", badge(info.lv, info.color)],
      ["Maksājuma veids", paymentMethodLabel(order.paymentMethod)],
      ["Summa", `€${order.total.toLocaleString("lv-LV", { minimumFractionDigits: 2 })}`],
    ])}
    ${divider()}
    ${paragraph(`Jautājumi? Rakstiet <a href="mailto:info@mobilus.lv" style="color:${BRAND_ORANGE};">info@mobilus.lv</a>`)}
    ${button("Apmeklēt Mobilus", "https://mobilus.lv")}
  `);

  await send(order.customerEmail, `Pasūtījums #${order.id} — ${info.lv} | Mobilus`, html);
}

// ─── 4. Stripe payment receipt (customer) ─────────────────────────────────────

export async function sendStripePaymentReceipt(order: OrderEmailData): Promise<void> {
  const html = emailBase(`
    ${badge("Maksājums saņemts", "#16a34a")}
    ${heading("Paldies! Jūsu maksājums ir apstiprināts.")}
    ${paragraph(`Labdien, <strong>${order.customerName}</strong>!`)}
    ${paragraph("Jūsu maksājums ar bankas karti ir veiksmīgi saņemts. Tuvākajā laikā sāksim jūsu pasūtījuma apstrādi.")}
    ${keyValueTable([
      ["Pasūtījuma Nr.", `#${order.id}`],
      ["Summa", `€${order.total.toLocaleString("lv-LV", { minimumFractionDigits: 2 })}`],
      ["Statuss", badge("Apmaksāts", "#16a34a")],
    ])}
    ${divider()}
    ${orderItemsTable(order.items, order.total, order.vat)}
    ${divider()}
    ${paragraph(`Ja jums ir jautājumi, rakstiet uz <a href="mailto:info@mobilus.lv" style="color:${BRAND_ORANGE};">info@mobilus.lv</a>`)}
    ${button("Turpināt iepirkties", "https://mobilus.lv/moto")}
  `);

  await send(order.customerEmail, `Maksājuma apstiprinājums #${order.id} — Mobilus`, html);
}

// ─── 5. Inquiry acknowledgment (customer) ─────────────────────────────────────

export async function sendInquiryAck(inquiry: InquiryEmailData): Promise<void> {
  const html = emailBase(`
    ${heading("Paldies par jūsu ziņu!")}
    ${paragraph(`Labdien, <strong>${inquiry.customerName}</strong>!`)}
    ${paragraph("Esam saņēmuši jūsu jautājumu un atbildēsim 24 stundu laikā.")}
    ${keyValueTable([
      ["Temats", inquiry.subject ?? "Vispārīgs jautājums"],
      ...(inquiry.productSlug ? [["Produkts", inquiry.productSlug] as [string, string]] : []),
    ])}
    <div style="background:${GRAY_LIGHT};padding:16px;border-left:4px solid ${BRAND_ORANGE};margin:16px 0;">
      <p style="margin:0;font-size:13px;color:#374151;font-style:italic;">"${inquiry.message}"</p>
    </div>
    ${divider()}
    ${paragraph(`Steidzama lieta? Zvaniet <a href="tel:+37167000000" style="color:${BRAND_ORANGE};">+371 67 000 000</a>`)}
    ${button("Apmeklēt Mobilus", "https://mobilus.lv")}
  `);

  await send(inquiry.customerEmail, "Jūsu ziņa ir saņemta — Mobilus", html);
}

// ─── 6. Inquiry admin notification ────────────────────────────────────────────

export async function sendInquiryAdminAlert(inquiry: InquiryEmailData): Promise<void> {
  const html = emailBase(`
    ${badge("Jauns jautājums", BRAND_DARK)}
    ${heading("Jauna iesūtne")}
    ${keyValueTable([
      ["No", inquiry.customerName],
      ["E-pasts", inquiry.customerEmail],
      ["Tālrunis", inquiry.customerPhone ?? "—"],
      ["Temats", inquiry.subject ?? "—"],
      ...(inquiry.productSlug ? [["Produkts", inquiry.productSlug] as [string, string]] : []),
    ])}
    ${divider()}
    <div style="background:${GRAY_LIGHT};padding:16px;border-left:4px solid ${BRAND_ORANGE};margin:16px 0;">
      <p style="margin:0;font-size:14px;color:#374151;">${inquiry.message.replace(/\n/g, "<br>")}</p>
    </div>
    ${divider()}
    ${button("Apskatīt admin panelī", "https://mobilus.lv/admin")}
  `);

  await send(adminEmail(), `💬 Jauns jautājums no ${inquiry.customerName}`, html);
}

// ─── 7. Review moderation alert (admin) ───────────────────────────────────────

export async function sendReviewAdminAlert(review: ReviewEmailData): Promise<void> {
  const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
  const html = emailBase(`
    ${badge("Jauna atsauksme — gaida apstiprinājumu", BRAND_DARK)}
    ${heading("Produkta atsauksme")}
    ${keyValueTable([
      ["Autors", review.reviewerName],
      ["Produkts", review.productSlug],
      ["Vērtējums", `${stars} (${review.rating}/5)`],
    ])}
    ${review.comment ? `
    ${divider()}
    <div style="background:${GRAY_LIGHT};padding:16px;border-left:4px solid ${BRAND_ORANGE};margin:16px 0;">
      <p style="margin:0;font-size:14px;color:#374151;font-style:italic;">"${review.comment}"</p>
    </div>` : ""}
    ${divider()}
    ${paragraph("Atsauksme nav redzama publiskajā lapā, kamēr to neapstiprina admins.")}
    ${button("Apstiprināt admin panelī", "https://mobilus.lv/admin")}
  `);

  await send(adminEmail(), `⭐ Jauna atsauksme: ${review.productSlug} (${review.rating}/5)`, html);
}
