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
    const { wordId, isCorrect, playerId, roomId } = msg.data;
    const room = rooms[roomId];
    if (!room) return;

    // 1️⃣ Eliminar palabra completada y obtenerla
    const palabraEliminada = calcularPalabrasRestantes(rooms, roomId, playerId, wordId);

    // 2️⃣ Añadir la palabra completada al resto de jugadores
    if (palabraEliminada) {
    añadirPalabraCompletada(rooms, roomId, playerId, palabraEliminada);
    }

    // 3️⃣ Buscar al jugador actual
    const jugadorActual = room.players.find(p => p.id === playerId);
    if (!jugadorActual) return;

    // 4️⃣ Si se queda sin palabras, marcarlo como "finished"
    if (jugadorActual.words.length === 0) {
        jugadorActual.status = "finished";
    }

    // 5️⃣ Enviar actualización al front (a todos en la sala)
    io.to(roomId).emit("update_player_words", {
        data: {
        playerId,
        remainingWords: jugadorActual.words,
        completedWords: jugadorActual.completedWords,
        status: jugadorActual.status,
        roomId,
        }
    });

    // 6️⃣ Si quieres actualizar progreso general también (opcional)
    socket.broadcast.to(roomId).emit("update_progress", {
        data: {
        roomId,
        players: room.players,
        }
    });

    console.log(`✅ Jugador ${jugadorActual.name} completó "${palabraEliminada}" en sala ${roomId}`);
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
