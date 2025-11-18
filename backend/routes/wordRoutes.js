import express from "express";
import { obtenerPalabras, seleccionarRandom } from "../logic/wordLogic.js";
import { createRoom, getRoom } from "../logic/roomsManager.js";

const router = express.Router();


// 
// ENDPOINT DE API REST - CREACION DE PALABRAS Y SALA - METODO POST
//

router.post("/words", async (req, res) => {
  try {
    const { roomId, playerId, playerName, count } = req.body;
    console.log(`🔹 Generando palabras para sala ${roomId}, jugador ${playerId} (${playerName})`);

    let room = getRoom(roomId);
    let selected = [];



    if (room) {
      const jugador = room.players.find(p => p.playerId === playerId);
      console.log("🟡 room.players actuales:", room.players.map(p => p.playerId));
      console.log("🔍 Buscando playerId:", playerId);
      console.log("🔍 Buscando player de p:", jugador.playerId);

      if (jugador) {
        selected = await obtenerPalabras(count);
        console.log(selected)
        jugador.words = [...selected];
      } else {
        console.log(`🆕 Nuevo jugador ${playerId}, añadiendo a la sala.`);
        selected = await obtenerPalabras(count);
        room.players.push({
          playerId,
          username: playerName || `Jugador ${room.players.length + 1}`,
          words: [...selected],
          completedWords: 0,
          status: "playing",
        });
      }
    } else {
      const allWords = await obtenerPalabras(count);
      selected = seleccionarRandom(allWords, count);
      console.log(`🆕 Creando sala ${roomId} con jugador ${playerId} (${playerName})`);
      createRoom(roomId, playerId, playerName || "Jugador 1", selected);
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
