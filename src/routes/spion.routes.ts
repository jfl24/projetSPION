import { Router, type Request, type Response } from "express";
import prisma from "../../utils/prisma.js";
import axios from "axios";
import { authentifier, exigerRole } from "../middleware/auth.js";
import { spionapi } from "../api/spionapi.js";
import bcrypt from "bcryptjs";

const routerSpion = Router();

// Une fonction pour aller chercher un profil dans l'API
async function recupererAgent() {
  try {
    const { data } = await spionapi.get("/");
    const premierAgent = data.results[0];

    if (!premierAgent) return null;
    console.log("Mot de passe généré : ", premierAgent.login.password);
    const pass_hash = await bcrypt.hash(premierAgent.login.password, 10);
    return {
      id: premierAgent.login.uuid,
      email: premierAgent.email,
      password: pass_hash,
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

// La route pour amener l'Agent de l'API
async function getAgent() {
  const { data } = await spionapi.get("/");
}
// localhost:3000/

// Une fonction pour envoyer un agent de l'API à la base de données
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

// Une fonction pour obtenir le profil d'un agent en entrant son nom
routerSpion.get(
  "/espions/:nom",
  authentifier,
  async (req: Request, res: Response) => {
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
  },
);

// Une fonction pour supprimer un agent de la BDD.  Seuls ceux qui ont le role CHEF peuvent le faire
routerSpion.delete(
  "/espions/:id",
  authentifier,
  exigerRole("CHEF"),
  async (req: Request, res: Response) => {
    const id = String(req.params.id);
    try {
      const agent = await prisma.agent.delete({
        where: { id },
      });
      if (!agent) {
        res.status(404).json({ erreur: "L'agent est introuvable." });
      }
      res.status(200).json({ message: "Agent supprimé avec succès." });
    } catch (e) {
      console.error("Erreur lors de la récupération des espions :", e);
      res.status(500).json({ erreur: "Une erreur interne est survenue." });
    }
  },
);

// Une fonction pour modifier un agent dans la BDD.  Seuls ceux qui ont le role CHEF peuvent le faire
routerSpion.patch(
  "/espions/:id",
  authentifier,
  exigerRole("CHEF"),
  async (req: Request, res: Response) => {
    const id = String(req.params.id);

    try {
      const agent = await prisma.agent.update({
        where: { id },
        data: req.body,
      });
      res.json(agent);
    } catch (e) {
      res.status(404).json({ erreur: "Agent n'existe pas" });
    }
  },
);

// Une fonction pour ajouter une mission dans la BDD
routerSpion.post(
  "/mission/:titre",
  authentifier,
  exigerRole("CHEF"),
  async (req: Request, res: Response) => {
    try {
      const titreMission = String(req.params.nom);
      const missionBody = req.body;
      const {
        titre,
        description,
        niveau_confidentialite,
        recompense,
        agentId,
      } = missionBody;
      const newMission = await prisma.mission.create({
        data: {
          titre: titre,
          description: description,
          niveau_confidentialite: niveau_confidentialite,
          recompense: recompense,
          agentId: agentId,
        },
      });
      res.status(201).json({ message: "Mission créée avec succès !" });
    } catch (e) {
      console.error("Erreur lors de la création de la mission : ", e);
      res.status(500).json({ erreur: "La création de la missions a échoué." });
    }
  },
);

// Une fonction pour obtenir la liste des missions
routerSpion.get(
  "/missionliste",
  authentifier,
  async (req: Request, res: Response) => {
    try {
      const missions = await prisma.mission.findMany({
        orderBy: { recompense: "desc" },
      });
      if (!missions) {
        res.status(404).json({ message: "Aucune mission trouvée." });
      }
      res.json(missions);
    } catch (e) {
      console.error("Erreur lors de la récupération des missions :", e);
      res.status(404).json({ erreur: "Une erreur interne est survenue." });
    }
  },
);

// Une fonction pour supprimer une mission.  Encore une fois, seuls ceux qui ont le rôle CHEF peuvent le faire.
routerSpion.delete(
  "/mission/:titre",
  authentifier,
  exigerRole("CHEF"),
  async (req: Request, res: Response) => {
    const titre = String(req.params.nom);
    try {
      const mission = await prisma.mission.delete({
        where: { titre },
      });
      if (!mission) {
        res.status(404).json({ erreur: "La mission est introuvable." });
      }
      res.status(200).json({ message: "Mission supprimée avec succès." });
    } catch (e) {
      console.error("Erreur lors de la récupération des missions :", e);
      res.status(500).json({ erreur: "Une erreur interne est survenue." });
    }
  },
);

// Une fonction pour modifier une mission, réservée aux CHEF
routerSpion.patch(
  "/mission/:titre",
  authentifier,
  exigerRole("CHEF"),
  async (req: Request, res: Response) => {
    const titre = String(req.params.titre);

    try {
      const mission = await prisma.mission.update({
        where: { titre },
        data: req.body,
      });
      res.json(mission);
    } catch (e) {
      res.status(404).json({ erreur: "Mission n'existe pas" });
    }
  },
);

export default routerSpion;
