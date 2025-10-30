// gameManager.js
import { calcularPalabrasRestantes, añadirPalabraCompletada } from "../logic/wordLogic.js";
// --- LISTA DE SALAS ---
const rooms = {}; // { roomId: { host: "socketId", players: [{ id, name, words: [], completedWords }], initialWords: [] } }
const players = {}; // { id, playerName } }
// --- PALABRAS BASE ---

// --- EVENTOS DEL JUEGO ---
export const registerGameEvents = (io) => {
  io.on("connection", (socket) => {
    console.log(`🟢 Nuevo jugador conectado: ${socket.id}`);

    socket.on("word_typed", (msg) => {
    const { wordId, isCorrect, playerId, roomId, threshold = 3 } = msg.data;
    const room = rooms[roomId];
    if (!room || !isCorrect) return;

    // ✅ 1️⃣ Actualiza el estado del jugador y maneja internamente si debe añadir palabra
    calcularPalabrasRestantes(rooms, roomId, playerId, wordId, threshold);

    // ✅ 2️⃣ Buscar al jugador actual
    const jugadorActual = room.players.find(p => p.id === playerId);
    if (!jugadorActual) return;

    // ✅ 3️⃣ Si se queda sin palabras, marcarlo como "finished"
    if (jugadorActual.words.length === 0) {
        jugadorActual.status = "finished";
    }

    // ✅ 4️⃣ Notificar a todos el nuevo estado del jugador
    io.to(roomId).emit("update_player_words", {
        data: {
        playerId,
        remainingWords: jugadorActual.words,
        status: jugadorActual.status,
        completedWords: jugadorActual.completedWords,
        roomId,
        },
    });

    // ✅ 5️⃣ Emitir progreso general (opcional)
    socket.broadcast.to(roomId).emit("update_progress", {
        data: {
        roomId,
        players: room.players,
        },
    });

    console.log(`✅ Jugador ${jugadorActual.name} completó palabra en sala ${roomId}`);
    });


    // DESCONECTAR
    socket.on("disconnect", () => {
      for (const roomId in rooms) {
        const room = rooms[roomId];
        room.players = room.players.filter((p) => p.id !== socket.id);

        if (room.players.length === 0) {
          delete rooms[roomId];
          console.log(`🗑️ Sala eliminada: ${roomId}`);
        } else {
          io.to(roomId).emit("update_players", room.players);
        }
      }
      console.log(`🔴 Jugador desconectado: ${socket.id}`);
    });
  });
};
