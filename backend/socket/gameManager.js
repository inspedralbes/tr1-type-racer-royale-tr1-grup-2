// gameManager.js
import { calcularPalabrasRestantes } from "../logic/wordLogic.js";
import { getRoom, createRoom, getAllRooms, deleteRoom } from "../logic/roomsManager.js";

// Crear sala inicial con un jugador
export const registerGameEvents = (io) => {
  io.on("connection", (socket) => {
    console.log(`🟢 Nuevo jugador conectado: ${socket.id}`);

    socket.on("word_typed", (msg) => {
      const { wordId, completedWords, playerId, roomId, threshold = 3 } = msg.data;
      const room = getRoom(roomId);
      if (!room) return;
        console.log(`Jugador ${playerId} en sala ${roomId} ha tipeado palabra ID ${wordId}`);
      socket.join(roomId);
      // Actualizar palabras del jugador
      calcularPalabrasRestantes({ [roomId]: room }, roomId, playerId, wordId, threshold, completedWords);

      const jugadorActual = room.players.find(p => p.id === playerId);
      if (!jugadorActual) return;
      
      console.log(`📝 Palabra completada por ${jugadorActual.words} en sala ${roomId}`);

      // Marcar como finished si ya no tiene palabras
      if (jugadorActual.words.length === 0) {
        console.log(jugadorActual);
        jugadorActual.status = "finished";
      }

      // Emitir estado actualizado del jugador
      io.to(roomId).emit("update_player_words", {
        data: {
          playerId,
          remainingWords: jugadorActual.words,
          status: jugadorActual.status,
          completedWords: jugadorActual.completedWords,
          roomId,
        },
      });

      // Emitir progreso general a los demás jugadores
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
      const allRooms = getAllRooms(); // devuelve un objeto con todas las salas
      for (const rId in allRooms) {
        const room = getRoom(rId);
        if (!room) continue;

        // Eliminar jugador de la sala
        room.players = room.players.filter(p => p.id !== socket.id);

        if (room.players.length === 0) {
          deleteRoom(rId);
          console.log(`🗑️ Sala eliminada: ${rId}`);
        } else {
          io.to(rId).emit("update_players", room.players);
        }
      }
      console.log(`🔴 Jugador desconectado: ${socket.id}`);
    });
  });
};
