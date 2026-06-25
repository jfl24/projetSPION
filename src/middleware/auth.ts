import { type Request, type Response, type NextFunction } from "express";
import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import { dot } from "node:test/reporters";

export function authentifier(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization; // Bearer xxx.yyy.zzz
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ erreur: "Token manquant" });
  }
  const token = header.split(" ")[1];
  if (!token) {
    return res.status(401).json({ erreur: "Token manquant ou invalide." });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    (req as any).user = payload;
    next();
  } catch {
    res.status(401).json({ erreur: "Token invalide / expire" });
  }
}

// authZ
export function exigerRole(role: String) {
  return (req: Request, res: Response, next: NextFunction) => {
    if ((req as any).user.role !== role) {
      return res.status(403).json({ erreur: "acces refuse" });
    }
    next();
  };
}
