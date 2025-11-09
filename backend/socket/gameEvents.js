import { calcularPalabrasRestantes } from "../logic/wordLogic.js";
import { getRoom } from "../logic/roomsManager.js";
import { generarCartaPoker } from "../logic/cardsManager.js";
import { obtenerPowerUpAleatorio } from "../logic/powerUpManager.js";

// 🔄 Temporizador global para emitir cartas cada 30 segundos
setInterval(() => {
  const rooms = global.rooms || {};
  Object.entries(rooms).forEach(([roomId, room]) => {
    if (!room || room.estado === "resolviendo") return;

    room.cartaActiva = generarCartaPoker(); // contiene una palabra
    room.estado = "esperando_respuesta";
    room.respuestas = [];

    io.to(roomId).emit("nueva_carta", {
      carta: room.cartaActiva,
    });

    console.log(
      `🃏 Carta enviada a sala ${roomId}: ${room.cartaActiva.palabra[0]}`
    );
  });
}, 30000);

export function registerGameEvents(io, socket) {
  socket.on("word_typed", ({ data }) => {
    if (!data || typeof data.word !== "string") {
      console.warn("⚠️ palabraEscrita inválida:", data?.word);
      return;
    }

    const respuesta = data.word.trim().toLowerCase();
    const { roomId, playerId } = data;

    const room = getRoom(roomId);
    if (!room) return;

    const jugador = room.players.find(
      (p) => p.playerId === playerId || p.id === playerId
    );
    if (!jugador) return;

    const palabraCarta = room.cartaActiva?.palabra[0]?.toLowerCase();

    // 🔹 Si es respuesta a la carta común
    if (
      room.cartaActiva &&
      room.estado === "esperando_respuesta" &&
      respuesta === palabraCarta
    ) {
      const yaRespondio = room.respuestas.find((r) => r.playerId === playerId);
      if (!yaRespondio) {
        room.respuestas.push({ playerId, timestamp: Date.now() });

        if (!jugador.powerUp) {
          jugador.powerUp = obtenerPowerUpAleatorio();
          io.to(roomId).emit("powerup_asignado", {
            playerId,
            powerUp: jugador.powerUp,
          });
        }

        room.estado = "resolviendo";
        room.cartaActiva.completada = true;

        io.to(roomId).emit("carta_completada", {
          playerId,
          carta: room.cartaActiva,
        });

        console.log(`🏆 ${playerId} ganó la carta en sala ${roomId}`);
      }
      return; // ✅ No procesar como palabra personal
    }

    // 🔹 Si es palabra personal
    const wordId = 0; // ✅ siempre eliminar la primera palabra
    const threshold = 3;
    const completedWords = (jugador.completedWords || 0) + 1;

    calcularPalabrasRestantes(
      { [roomId]: room },
      roomId,
      playerId,
      wordId,
      threshold,
      completedWords
    );

    if (jugador.completedWords >= 34) {
      jugador.status = "finished";

      io.to(roomId).emit("jugador_ganador", {
        playerId,
        mensaje: `🎉 ¡${jugador.name || playerId} ha ganado la partida!`,
      });

      console.log(
        `🏁 Jugador ${playerId} ha ganado la partida en sala ${roomId}`
      );
    }

    io.to(roomId).emit("update_player_words", {
      data: {
        playerId,
        remainingWords: jugador.words,
        status: jugador.status,
        completedWords: jugador.completedWords,
        roomId,
      },
    });

    socket.broadcast.to(roomId).emit("update_progress", {
      data: { roomId, players: room.players },
    });

    console.log(
      `✅ [Game] ${
        jugador.playerId || jugador.id
      } completó palabra personal en ${roomId}`
    );
  });
}
