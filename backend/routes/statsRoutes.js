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
    { $limit: 10 }
  ]);
  res.json(topFallos);
});

export default router;
