import express from "express";
import { asignarCartaAJugador } from "../logic/cardsManager.js";
import { createRoom, getRoom } from "../logic/roomsManager.js";

const router = express.Router();

router.post("/words", (req, res) => {
  try {
    const { roomId, playerId, playerName, count } = req.body;
    console.log(`🔹Generando carta para sala ${roomId}, jugador ${playerId} (${playerName})`);

    let room = getRoom(roomId);
    let selected;

    if (!room) {
      // 🆕 Crear sala con jugador inicial y su carta
      const jugadorInicial = {
        id: playerId,
        name: playerName || "Jugador 1",
        words: [],
        completedWords: 0,
        status: "playing",
      };

      asignarCartaAJugador(jugadorInicial);
      selected = [...jugadorInicial.words];

      createRoom(roomId, jugadorInicial.id, jugadorInicial.name, selected);
    } else {
      // 🔄 Sala ya existe: buscar jugador o agregarlo
      const jugador = room.players.find(p => p.id === playerId);

      if (jugador) {
        selected = [...jugador.words];
      } else {
        const nuevoJugador = {
          id: playerId,
          name: playerName || `Jugador ${room.players.length + 1}`,
          words: [],
          completedWords: 0,
          status: "playing",
        };

        asignarCartaAJugador(nuevoJugador);
        room.players.push(nuevoJugador);
        selected = [...nuevoJugador.words];
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
    console.error("❌ Error generando carta:", error);
    res.status(500).json({ success: false, error: "Error interno del servidor" });
  }
});

export default router;

