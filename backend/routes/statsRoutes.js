import express from "express";
import Usuario from "../models/User.js";
import Intento from "../models/Try.js";

const router = express.Router();

// Estadísticas personales (GET /stats/:playerId)
router.get("/:playerId", async (req, res) => {
  try {
    // Buscar el usuario por playerId, no por el _id de MongoDB
    const userStats = await Usuario.findOne({ playerId: req.params.playerId });

    if (!userStats) {
      // Devolver 404 si no se encuentra el documento del jugador
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Devolver las estadísticas del jugador
    res.status(200).json(userStats);
  } catch (err) {
    // Manejar errores de servidor o base de datos
    console.error("Error al obtener estadísticas:", err);
    res.status(500).json({ error: "Error al obtener estadísticas" });
  }
});

// Estadísticas globales (GET /stats/global)
router.get("/global", async (req, res) => {
  try {
    // Aggregation pipeline para encontrar las 10 palabras más falladas
    const topFallos = await Intento.aggregate([
      { $match: { correct: false } }, // Solo intentos fallidos
      { $group: { _id: "$word", fallos: { $sum: 1 } } }, // Contar fallos por palabra
      { $sort: { fallos: -1 } }, // Ordenar de más fallada a menos
      { $limit: 10 }, // Limitar a las 10 principales
    ]);
    res.json({ topFallos });
  } catch (err) {
    res.status(500).json({ error: "Error al obtener estadísticas globales" });
  }
});

export default router;
