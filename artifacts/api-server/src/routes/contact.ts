import { Router } from "express";
import { sendInquiryAck, sendInquiryAdminAlert } from "../lib/email";

const router = Router();

interface ContactBody {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

router.post("/contact", async (req, res) => {
  try {
    const b = req.body as Record<string, unknown>;
    if (typeof b["name"] !== "string" || !b["name"].trim()) {
      res.status(400).json({ error: "name is required" });
      return;
    }
    if (typeof b["email"] !== "string" || !isEmail(b["email"])) {
      res.status(400).json({ error: "Valid email is required" });
      return;
    }
    if (typeof b["message"] !== "string" || !b["message"].trim()) {
      res.status(400).json({ error: "message is required" });
      return;
    }

    const data: ContactBody = {
      name: (b["name"] as string).trim(),
      email: b["email"] as string,
      phone: typeof b["phone"] === "string" ? b["phone"] : undefined,
      subject: typeof b["subject"] === "string" ? b["subject"] : undefined,
      message: (b["message"] as string).trim(),
    };

    // Fire-and-forget both emails
    void Promise.all([
      sendInquiryAck({
        customerName: data.name,
        customerEmail: data.email,
        customerPhone: data.phone,
        subject: data.subject ?? "Vispārīgs jautājums",
        message: data.message,
      }),
      sendInquiryAdminAlert({
        customerName: data.name,
        customerEmail: data.email,
        customerPhone: data.phone,
        subject: data.subject ?? "Vispārīgs jautājums",
        message: data.message,
      }),
    ]);

    res.status(200).json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to send message" });
  }
});

export default router;
