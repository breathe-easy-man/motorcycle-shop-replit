import type { Request, Response, NextFunction } from "express";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const key = req.headers["x-admin-key"];
  const secret = process.env.ADMIN_SECRET;

  if (!secret) {
    res.status(500).json({ error: "Admin secret not configured" });
    return;
  }

  if (!key || key !== secret) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  next();
}
