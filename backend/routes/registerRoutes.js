// backend/routes/register.js
import express from "express";

// IMPORTAR EL ESTADO GLOBAL DE JUGADORES
import { globalPlayers } from "../logic/globalState.js";

const router = express.Router();

let playerCounter = 1;

router.post("/register", (req, res) => {
  const { username } = req.body;
  const playerId = `u${playerCounter++}`;

  if (!username || username.trim() === "") {
    return res.status(400).json({ message: "Nombre inválido" });
  }

  // backend/routes/register.js o tu controlador de registro
  const player = { playerId, username };

  // !!!!!!! BASE DE DATOS INSERT
  globalPlayers.push(player); // ✅ ahora se hace aquí

  console.log(`[🧍 Registro] Nuevo jugador: ${username} (${playerId})`);
  res.json(player);
});

export default router;
