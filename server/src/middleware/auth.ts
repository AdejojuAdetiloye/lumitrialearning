import type { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { verifyToken } from "../lib/jwt.js";

export type AuthedRequest = Request & {
  userId?: string;
  role?: Role;
};

export function authRequired(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const payload = verifyToken(token);
    req.userId = payload.sub;
    req.role = payload.role;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

export function requireRole(...roles: Role[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.role || !roles.includes(req.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}
