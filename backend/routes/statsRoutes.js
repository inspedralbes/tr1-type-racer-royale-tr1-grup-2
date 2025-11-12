import express from "express";
import Usuario from "../models/User.js";
import Intento from "../models/Try.js";

const router = express.Router();

// Estadísticas personales
router.get("/user/:userId", async (req, res) => {
  try{
    const userStats = await Usuario.findById(req.params.userId);
    if (!userStats) return res.status(404).json({ error: "Usuario no encontrado" });

  res.json(userStats);
} catch (err) {
  res.status(500).json({ error: "Error al obtener estadísticas" });
}
});

// Estadísticas globales
router.get("/global", async (req, res) => {
  try {
    const topFallos = await Intento.aggregate([
      { $match: { correct: false } },
      { $group: { _id: "$word", fallos: { $sum: 1 } } },
      { $sort: { fallos: -1 } },
      { $limit: 10 }
    ]);
    res.json({ topFallos });
  } catch (err) {
    res.status(500).json({ error: "Error al obtener estadísticas globales" });
  }
});

export default router;

