import { Router, type Request, type Response } from "express";
import prisma from "../../utils/prisma.js";
import axios from "axios";
// import { authentifier, exigerRole } from "../middleware/auth.js";
import { spionapi } from "../api/spionapi.js";

const routerSpion = Router();

async function recupererAgent() {
  try {
    const { data } = await spionapi.get("/");
    const premierAgent = data.results[0];

    if (!premierAgent) return null;
    return {
      id: premierAgent.login.uuid,
      email: premierAgent.email,
      password: premierAgent.login.password,
      cover_name: premierAgent.login.username,
    };
  } catch (e) {
    if (axios.isAxiosError(e) && e.response) {
      console.log("Statut HTTP : ", e.response.status);
    } else {
      console.log("Erreur de reseau ou timeout");
    }
    return null;
  }
}

async function getAgent() {
  const { data } = await spionapi.get("/");
}
// localhost:3000/
routerSpion.post("/engager", async (req: Request, res: Response) => {
  const donnee = await recupererAgent();
  if (!donnee) {
    return res.status(404).json({ erreur: "Agent impossible à trouver" });
  }

  try {
    const agent = await prisma.agent.create({ data: donnee as any });
    res
      .status(201)
      .json({ message: `${agent.cover_name} a ete engagé!`, agent });
  } catch (e) {
    res
      .status(400)
      .json({ erreur: "Agent deja existant dans la base de donnees" });
  }
});

routerSpion.get("/:nom", async (req: Request, res: Response) => {
  try {
    const cover_name = String(req.params.nom);
    const agent = await prisma.agent.findFirst({
      where: { cover_name },
    });
    if (!agent) {
      return res.status(404).json({ erreur: "Agent introuvable." });
    }
    res.json(agent);
  } catch (e) {
    console.error("Erreur lors de la récupération de l'agent :", e);
    res.status(500).json({ erreur: "Une erreur interne est survenue." });
  }
});

export default routerSpion;
