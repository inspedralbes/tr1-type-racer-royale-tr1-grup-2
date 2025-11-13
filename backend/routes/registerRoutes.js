// backend/routes/registerRouter.js
import express from "express";
import pool from '../db.js';

const router = express.Router();

let playerCounter = 1; // Podrías quitar esto y usar el ID autoincremental de la tabla

// Usa async/await para manejar la consulta a la BD
router.post("/register", async (req, res) => {
  const { username } = req.body;
  const playerId = `u${playerCounter++}`; // O usa un UUID

  if (!username || username.trim() === "") {
    return res.status(400).json({ message: "Nombre inválido" });
  }

  try {

    const [result] = await pool.query(
      'INSERT INTO players (playerId, username) VALUES (?, ?)',
      [playerId, username]
    );

    const player = { playerId, username, id: result.insertId }; 

    console.log(`[🧍 Registro DB] Nuevo jugador: ${username} (${playerId})`);
    res.status(201).json(player); 

  } catch (error) {
    console.error("❌ Error al registrar en la BD:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

export default router;



// // backend/routes/register.js
// import express from "express";

// // IMPORTAR EL ESTADO GLOBAL DE JUGADORES
// import { globalPlayers } from "../logic/globalState.js";

// const router = express.Router();

// let playerCounter = 1;

// router.post("/register", (req, res) => {
//   const { username } = req.body;
//   const playerId = `u${playerCounter++}`;

//   if (!username || username.trim() === "") {
//     return res.status(400).json({ message: "Nombre inválido" });
//   }

//   // backend/routes/register.js o tu controlador de registro
//     const player = { playerId, username };
//     globalPlayers.push(player); // ✅ ahora se hace aquí


//   console.log(`[🧍 Registro] Nuevo jugador: ${username} (${playerId})`);
//   res.json(player);
// });

// export default router;
