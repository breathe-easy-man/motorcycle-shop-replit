import { Router } from "express";
import { db } from "@workspace/db";
import { settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();
const ADMIN_KEY = process.env.ADMIN_SECRET ?? "mobilus-admin-2024";

function requireAdmin(req: import("express").Request, res: import("express").Response): boolean {
  const key = req.headers["x-admin-key"] ?? req.query.adminKey;
  if (key !== ADMIN_KEY) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}

router.get("/settings", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const rows = await db.select().from(settingsTable);
    const result: Record<string, string> = {};
    for (const row of rows) result[row.key] = row.value;
    res.json(result);
  } catch {
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

router.put("/settings/:key", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const { key } = req.params;
  const { value } = req.body as { value?: string };
  if (typeof value !== "string") {
    res.status(400).json({ error: "value is required" });
    return;
  }
  const ALLOWED_KEYS = ["admin_email", "from_email", "store_name"];
  if (!ALLOWED_KEYS.includes(key)) {
    res.status(400).json({ error: "Unknown setting key" });
    return;
  }
  try {
    await db
      .insert(settingsTable)
      .values({ key, value })
      .onConflictDoUpdate({ target: settingsTable.key, set: { value, updatedAt: new Date() } });
    res.json({ key, value });
  } catch {
    res.status(500).json({ error: "Failed to update setting" });
  }
});

export async function getSetting(key: string, fallback: string): Promise<string> {
  try {
    const [row] = await db.select().from(settingsTable).where(eq(settingsTable.key, key)).limit(1);
    return row?.value ?? fallback;
  } catch {
    return fallback;
  }
}

export default router;
