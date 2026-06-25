import express from "express";
import dotenv from "dotenv";
import routerSpion from "./routes/spion.routes.js";
// import routerAuth from "./routes/auth.routes.js";

dotenv.config();

const app = express();

app.use(express.json());

// app.use("/auth", routerAuth);
app.use("/spion", routerSpion);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur lance sur le http://localhost:${PORT}/`);
});
