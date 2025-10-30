const { Server } = require("socket.io");

// La función para crear lobbies se mantiene, pero no la usamos de momento

function createLobby() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const roomPrefix = "room_";
  const randomLetter = letters[Math.floor(Math.random() * letters.length)];
  const randomNumber = Math.floor(100 + Math.random() * 900);
  return `${roomPrefix}${randomLetter}${randomNumber}`;
}

// Para generar un ID único para el jugador
function generatePlayerId() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const randomLetter = letters[Math.floor(Math.random() * letters.length)];
  const randomNumber = Math.floor(100 + Math.random() * 900);
  return `${randomLetter}${randomNumber}`;
}

// --- CORRECCIÓN IMPORTANTE ---
// Usamos un ID de sala fijo.
const RoomId = "room_1";
console.log(`Servidor iniciado con una única sala: ${RoomId}`);

const rooms = {
  [RoomId]: {
    players: [], // Cada jugador tendrá { playerId, socketId, username, completedWords }
  },
};

// --- Función para inicializar Socket.IO ---

function initializeSocketIO(httpServer, corsOptions) {
  const io = new Server(httpServer, {
    cors: corsOptions,
  });

  io.on("connection", (socket) => {
    console.log(`[IO] Nuevo socket conectado: ${socket.id}`);
    let joinedRoom = null;
    let joinedPlayerId = null;

    // --- Evento: player_join (Pantalla Inicio) ---
    socket.on("player_join", (data) => {
      const { username, playerId } = data;
      console.log(
        `[JOIN] Jugador intentando unirse: ${playerId} - ${username}`
      );
      const roomId = RoomId; // Usar la sala global fija

      if (!rooms[roomId]) {
        console.error(
          `[ERROR] El jugador ${playerId} intentó unirse a una sala inexistente: ${roomId}`
        );
        socket.emit("join_error", { message: "La sala no existe." });
        return;
      }

      // Asignar variables de estado de la conexión
      joinedRoom = roomId;
      joinedPlayerId = playerId;

      // --- Lógica de Reconexión (Básica) ---
      let existingPlayer = rooms[roomId].players.find(
        (p) => p.playerId === playerId
      );

      if (existingPlayer) {
        console.log(`[RECONN] Jugador ${playerId} se ha reconectado.`);
        existingPlayer.socketId = socket.id;
      } else {
        // --- CORRECCIÓN ---
        // Añadido 'completedWords' para coincidir con tu comentario/schema
        const newPlayer = {
          playerId: playerId,
          socketId: socket.id,
          username: username,
          completedWords: [],
        };
        rooms[roomId].players.push(newPlayer);
        console.log(`[NEW] Nuevo jugador ${playerId} añadido a la sala.`);
      }

      socket.join(roomId);

      const isHost = rooms[roomId].players[0].playerId === playerId;

      // --- Respuesta: joined_lobby ---
      const responsePayload = {
        playerId: playerId,
        roomId: roomId,
        isHost: isHost,
        players: rooms[roomId].players,
      };

      socket.emit("joined_lobby", responsePayload);
      console.log(`[EMIT] 'joined_lobby' enviado a ${playerId}`);

      // --- Notificación a los demás ---
      io.to(roomId).emit("player_list_updated", {
        players: rooms[roomId].players,
      });
      console.log(`[EMIT] 'player_list_updated' enviado a sala ${roomId}`);
    });

    // --- Evento: disconnect ---
    socket.on("disconnect", () => {
      console.log(`[DISCONN] Socket desconectado: ${socket.id}`);
      if (joinedRoom && rooms[joinedRoom] && joinedPlayerId) {
        const room = rooms[joinedRoom];
        const playerIndex = room.players.findIndex(
          (p) => p.playerId === joinedPlayerId
        );

        if (playerIndex === -1) return;

        const wasHost = playerIndex === 0;

        // Remove the player from the array
        room.players.splice(playerIndex, 1);
        console.log(
          `[DISCONN] Jugador ${joinedPlayerId} eliminado de la sala.`
        );

        if (wasHost) {
          // Host disconnected, assign a new host
          console.log(
            `[DISCONN] El host se ha desconectado. Asignando nuevo host.`
          );

          if (room.players.length > 0) {
            // Notify all remaining players of the change and their new host status
            room.players.forEach((player) => {
              if (player.socketId) {
                // Ensure player is connected
                const isNewHost = room.players[0].playerId === player.playerId;
                io.to(player.socketId).emit("host_changed", {
                  isHost: isNewHost,
                  players: room.players,
                });
              }
            });
          }
        } else {
          // Non-host player disconnected, just notify others
          io.to(joinedRoom).emit("player_list_updated", {
            players: room.players,
          });
        }

        console.log(
          `[EMIT] Notificación de desconexión enviada a la sala ${joinedRoom}`
        );
      }
    });
  });

  console.log("[IO] Servidor Socket.IO inicializado y listo.");
  return io;
}

// Exportamos la función principal Y el generador de IDs para el test
module.exports = { initializeSocketIO, generatePlayerId };
