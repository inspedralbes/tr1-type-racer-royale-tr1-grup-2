// gameManager.js
import { generarPalabras, seleccionarRandom } from "../logic/wordLogic.js";
import { calcularPalabrasRestantes } from "../logic/wordLogic.js";
// --- LISTA DE SALAS ---
const rooms = {}; // { roomId: { host: "socketId", players: [{ id, name, words: [], completedWords }], initialWords: [] } }
const players = {}; // { id, playerName } }
// --- PALABRAS BASE ---

// --- EVENTOS DEL JUEGO ---
export const registerGameEvents = (io) => {
  io.on("connection", (socket) => {
    console.log(`🟢 Nuevo jugador conectado: ${socket.id}`);

    // CREAR SALA
    // socket.on("create_room", (msg) => {
    //   const { roomId, playerName } = msg.data;

    //   if (!rooms[roomId]) {
    //     const todasPalabras = generarPalabras(600);
    //     const initialWords = seleccionarRandom(todasPalabras, 50);

    //     rooms[roomId] = {
    //       host: socket.id,
    //       players: [{ id: socket.id, name: playerName }],
    //       initialWords,
    //     };

    //     socket.join(roomId);
    //     socket.emit("room_created", { roomId, initialWords });
    //     console.log(`🟢 Sala creada: ${roomId} por ${playerName}`);
    //   }
    // });

    // UNIRSE A SALA
    // socket.on("join_room", (msg) => {
    //   const { roomId, playerName } = msg.data;
    //   const room = rooms[roomId];
    //   if (room) {
    //     room.players.push({ id: socket.id, name: playerName });
    //     socket.join(roomId);
    //     io.to(roomId).emit("update_players", room.players);
    //     console.log(`🟢 ${playerName} se unió a la sala ${roomId}`);
    //   }
    // });

    // INICIAR PARTIDA
    socket.on("start_game", (msg) => {
      const { roomId } = msg.data;
      const room = rooms[roomId];
      if (room && room.players.length <= 2) {
        io.to(roomId).emit("game_started", {
          data: {
            initialWords: room.initialWords,
            wordLimit: 60,
            roomId,
          },
          __comment__: "Envío de palabras iniciales al iniciar la partida",
        });
        console.log(`🚀 Partida iniciada en sala ${roomId}`);
      }
    });


    socket.on("letter_typed", (msg) => {
      const { wordId, isCorrect, playerId, roomId } = msg.data;
      const room = rooms[roomId];
      if (room && room.players.find((p) => p.id === playerId)) {
        io.to(roomId).emit("server_message", {
          event: "game_started",
          data: {
            initialWords: room.initialWords,
            wordLimit: 50,
            roomId,
          },
          __comment__: "Envío de palabras iniciales al iniciar la partida",
        });
        console.log(`🚀 Partida iniciada en sala ${roomId}`);
      }
    });

    socket.on("word_typed", (msg) => {
      const { wordId, isCorrect, playerId, roomId } = msg.data;
      const room = rooms[roomId];
      if (room && room.players.find((p) => p.id === playerId)) {
        const jugadorActual = room.players[playerId-1];
        const palabrasRestantes = calcularPalabrasRestantes(jugadorActual.initialWords, wordId);
        io.to(roomId).emit("update_player_words", {
          data: {
            remainingWords: palabrasRestantes,
            completedWords: room.players[playerId-1].completedWords,
            roomId,
          },
          __comment__: "Envío de palabras iniciales al iniciar la partida",
        });
        console.log(`🚀 Partida iniciada en sala ${roomId}`);

        io.to(roomId).broadcast.emit("update_progress", {
          data: {
            remainingWords: palabrasRestantes,
            completedWords: room.players[playerId-1].completedWords,
            roomId,
          },
          __comment__: "Envío de palabras iniciales al iniciar la partida",
        });
    }
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
