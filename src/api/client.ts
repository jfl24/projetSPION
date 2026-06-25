import axios from "axios";
import { spionapi } from "./spionapi.js";

export const api = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 5000,
});

async function demo() {
  // GET : combien de pokemon dans le pokedex
  const { data: agents } = await api.get("/");
  console.log("Agent : ", agents.length, " agents.");

  // POST : Ajouter un pokemon a partir de PokeAPI
  // POST http://localhost:3000/
  const { data: engager } = await api.post("/engager");
  console.log("Agent : ", engager.message);

  const id = engager.agent.id;

  // PATCH : ameliorer notre pokemon!
  //   const { data: maj } = await api.patch(`/pokedex/${id}`, {
  //     rarete: "LEGENDAIRE",
  //   });
  //   console.log("Nouvelle  rarete : ", maj.rarete);
}

demo().catch((e) => {
  if (axios.isAxiosError(e)) {
    console.log("Erreur API : ", e.response?.status, e.response?.data);
  } else {
    console.log("Erreur de serveur ou timeout.");
  }
});
