import express from "express";
import Usuario from "../models/User.js";
import Intento from "../models/Try.js";

const router = express.Router();

// Estadísticas personales
router.get("/user/:userId", async (req, res) => {
  const userStats = await Usuario.findById(req.params.userId);
  res.json(userStats);
});

// Estadísticas globales
router.get("/global", async (req, res) => {
  const topFallos = await Intento.aggregate([
    { $match: { correct: false } },
    { $group: { _id: "$word", fallos: { $sum: 1 } } },
    { $sort: { fallos: -1 } },
    { $limit: 10 },
  ]);
  res.json(topFallos);
});

// Palabras acertadas y fallidas por usuario
router.get("/user/:userId/palabras", async (req, res) => {
  const { userId } = req.params;

  try {
    const intentos = await Intento.find({ userId });

    const palabrasAcertadas = intentos
      .filter((i) => i.correct)
      .map((i) => i.word);

    const palabrasFallidas = intentos
      .filter((i) => !i.correct)
      .map((i) => i.word);

    res.json({ palabrasAcertadas, palabrasFallidas });
  } catch (err) {
    console.error("❌ Error al obtener palabras:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;
