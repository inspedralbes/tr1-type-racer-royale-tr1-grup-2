import { calcularPalabrasRestantes } from "../logic/wordLogic.js";
import { getRoom } from "../logic/roomsManager.js";
import { verificarCartaCompletada, asignarCartaAJugador } from "../logic/cardsManager.js";

export function registerGameEvents(io, socket) {
  socket.on("word_typed", (msg) => {
    const { wordId, completedWords, playerId, roomId, threshold = 3 } = msg.data;
    const room = getRoom(roomId);
    if (!room) return;

const jugador = room.players.find(p => p.playerId === playerId);
console.log("🟢 jugador encontrado:", jugador, "buscando playerId:", playerId);
if (!jugador) return;

    calcularPalabrasRestantes({ [roomId]: room }, roomId, playerId, wordId, threshold, completedWords);

if (verificarCartaCompletada(jugador)) {
  io.to(roomId).emit("carta_completada", {
    data: {
      playerId,
      carta: jugador.cartaActiva,
      powerUps: jugador.powerUps,
    },
  });

  asignarCartaAJugador(jugador);
}

    if (jugador.words.length === 0) jugador.status = "finished";
    console.log(`📝 [Game] Palabra completada por ${jugador.playerId} en ${roomId} y el status ${jugador.status}`);
    console.log("🟢 jugador encontradoFIEHIER:", jugador, "buscando playerId:", playerId);
    console.log("🔹 Emitiendo update_player_words a roomId:", roomId, "socket.id:", socket.id, "playerId:", playerId);
  console.log("🟢 Sockets en room:", io.sockets.adapter.rooms.get(roomId));

    io.to(roomId).emit("update_player_words", {
      data: {
        playerId,
        remainingWords: jugador.words,
        status: jugador.status,
        completedWords: jugador.completedWords,
        roomId,
      },
    });

    // io.to(roomId).emit("update_progress", {
    //   data: {
    //     roomId,
    //     players: room.players.map(p => ({
    //       playerId: p.playerId,
    //       username: p.username,
    //       remainingWords: p.words,
    //       status: p.status,
    //       completedWords: p.completedWords,
    //     })),
    //   },
    // });

    socket.broadcast.to(roomId).emit("update_progress", {
      data: { roomId, players: room.players },
    });

    console.log(`✅ [Game] ${jugador.playerId} completó palabra en ${roomId}`);
  });
}
