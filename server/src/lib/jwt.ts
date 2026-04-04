import jwt from "jsonwebtoken";
import type { Role } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.warn("JWT_SECRET is not set — set it in server/.env");
}

export type JwtPayload = { sub: string; role: Role };

export function signToken(userId: string, role: Role): string {
  if (!JWT_SECRET) throw new Error("JWT_SECRET missing");
  return jwt.sign({ sub: userId, role }, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload {
  if (!JWT_SECRET) throw new Error("JWT_SECRET missing");
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
