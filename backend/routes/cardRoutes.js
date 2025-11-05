// cardRoutes.js

import express from "express";
import { procesarRespuesta } from "../logic/wordLogic.js";
import { getRoom } from "../logic/roomsManager.js";

const router = express.Router();

router.post("/respuesta", (req, res) => {
  try {
    const { roomId, playerId, palabra } = req.body;
    const rooms = {}; // Si usas un objeto global de salas, pásalo aquí correctamente

    const resultado = procesarRespuesta(rooms, roomId, playerId, palabra);
    res.json({ success: true, ...resultado });
  } catch (error) {
    console.error("❌ Error procesando respuesta:", error);
    res.status(500).json({ success: false, error: "Error interno del servidor" });
  }
});

export default router;

