import { Router, type Request, type Response } from "express";

import bcrypt from "bcryptjs";
import prisma from "../../utils/prisma.js";
import jwt from "jsonwebtoken";
import { exigerRole } from "../middleware/auth.js";

const routerAuth = Router();

// POST localhost:3000/auth/register ->¨Créer un compte
routerAuth.post("/register", async (req: Request, res: Response) => {
  const { email, password, cover_name, id } = req.body;
  if (!email || !password) {
    return res.status(400).json({ erreur: "email ou mot de passe manquant !" });
  }
  try {
    const pass_hash = await bcrypt.hash(password, 10);
    const agent = await prisma.agent.create({
      data: { id, cover_name, email, password: pass_hash },
    });
    // JAMAIIIIIIIIIIIIS DE HASH REOURNÉ (ET SURTOUT JAMAIIIIS LE PASSWORD)
    res.status(201).json({
      email: agent.email,
      role: agent.role,
      createdAt: agent.createdAt,
    });
  } catch {
    res.status(400).json({ erreur: "Email existe deja !" });
  }
});

// POST localhost: 3000/auth/login -> Se connecter
routerAuth.post("/login", async (req: Request, res: Response) => {
  const email = String(req.body.email);
  const password = String(req.body.password);
  const agent = await prisma.agent.findFirst({ where: { email } });

  if (!agent)
    return res.status(401).json({ erreur: "Je ne sais pas qui tu es." });
  const ok = await bcrypt.compare(password, agent.password);
  if (!ok) return res.status(401).json({ erreur: "Mot de passe incorrect" });

  const token = jwt.sign(
    { sub: agent.id, role: agent.role },
    process.env.JWT_SECRET!,
    { expiresIn: "1h" },
  );
  res.json({ token });
});

//Une fonction pour donne le rôle CHEF à un agent.  Seul un autre chef peut le faire.
routerAuth.patch(
  "/register_chef",
  exigerRole("CHEF"),
  async (req: Request, res: Response) => {
    const { email, password, id } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ erreur: "email ou mot de passe manquant !" });
    }
    try {
      const pass_hash = await bcrypt.hash(password, 10);
      const agent = await prisma.agent.update({
        where: { id },
        data: { role: "CHEF" },
      });
      // JAMAIIIIIIIIIIIIS DE HASH REOURNÉ (ET SURTOUT JAMAIIIIS LE PASSWORD)
      res.status(201).json({
        email: agent.email,
        role: agent.role,
        createdAt: agent.createdAt,
      });
    } catch {
      res.status(400).json({ erreur: "Email existe deja !" });
    }
  },
);

export default routerAuth;
