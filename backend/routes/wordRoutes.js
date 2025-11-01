import express from "express";
import { generarPalabras, seleccionarRandom } from "../logic/wordLogic.js";
import { createRoom, getRoom } from "../logic/roomsManager.js";

const router = express.Router();

router.get("/words", (req, res) => {
  try {
    const roomId = req.query.roomId || "room-abc";
    const playerId = req.query.playerId || "player-123";
    const playerName =   "Jugador 1";
    console.log(`🔹 Generando palabras para sala ${roomId}, jugador ${playerId} (${playerName})`);
    const count = parseInt(req.query.count) || 5;

    let room = getRoom(roomId);

    let selected;
    if (!room) {
      const allWords = generarPalabras(600);
      selected = seleccionarRandom(allWords, count);
      console.log(`🆕 Creando sala ${roomId} con jugador ${playerId} (${playerName})`);
      createRoom(roomId, playerId, playerName || "Jugador 1", selected);
    } else {
      const jugador = room.players.find(p => p.id === playerId);
      if (jugador) selected = [...jugador.words];
      else {
        selected = generarPalabras(count);
        room.players.push({
          id: playerId,
          name: playerName || `Jugador ${room.players.length + 1}`,
          words: [...selected],
          completedWords: 0,
          status: "playing",
        });
      }
    }

    res.json({
      data: {
        initialWords: selected,
        wordLimit: 60,
        roomId,
        playerId,
      },
    });
  } catch (error) {
    console.error("❌ Error generando palabras:", error);
    res.status(500).json({ success: false, error: "Error interno del servidor" });
  }
});

export default router;
