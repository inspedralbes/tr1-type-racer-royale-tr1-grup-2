import express from "express";
import { generarPalabras } from "../logic/wordLogic.js"; // ✅ palabras personales
import { createRoom, getRoom } from "../logic/roomsManager.js";

const router = express.Router();

router.post("/words", (req, res) => {
  try {
    const { roomId, playerId, playerName, count = 5 } = req.body;
    console.log(
      `🔹Generando palabras personales para sala ${roomId}, jugador ${playerId} (${playerName})`
    );

    let room = getRoom(roomId);
    let selected;

    if (!room) {
      // 🆕 Crear sala con jugador inicial y sus palabras personales
      const palabrasIniciales = generarPalabras(count);
      const jugadorInicial = {
        id: playerId,
        name: playerName || "Jugador 1",
        words: palabrasIniciales,
        completedWords: 0,
        status: "playing",
      };

      selected = [...palabrasIniciales];
      createRoom(roomId, jugadorInicial.id, jugadorInicial.name, selected);
    } else {
      const jugador = room.players.find(p => p.playerId === playerId);
      console.log("🟡 room.players actuales:", room.players.map(p => p.playerId));
      console.log("🔍 Buscando playerId:", playerId);

      if (jugador) {
        if (!jugador.words || jugador.words.length === 0) {
        selected = generarPalabras(600);
        const selected_ = seleccionarRandom(selected, count)
        jugador.words = [...selected_];
        } else {
          console.log(`🆕 Nuevo jugador ${playerId}, añadiendo a la sala.`);
          selected = generarPalabras(count);
          room.players.push({
            playerId,
            username: playerName || `Jugador ${room.players.length + 1}`,
            words: [...selected],
            completedWords: 0,
            status: "playing",
        });
        }
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
    console.error("❌ Error generando palabras personales:", error);
    res
      .status(500)
      .json({ success: false, error: "Error interno del servidor" });
  }
});

export default router;
