const { Server } = require("socket.io");

// No se usa de momento, Actual: unica sala fija

function createLobbyId() {
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

// Usamos un ID de sala fijo, ¡Hay que quitarlo más adelante!.
const RoomId = "room_1";

// Estructura de datos para las salas y jugadores, in-memory (Temporal)
const rooms = {
  [RoomId]: {
    players: [], // Cada jugador tendrá { playerId, socketId, username, completedWords }
  },
};

// Inicializar Socket.IO

function initializeSocketIO(httpServer, corsOptions) {
  const io = new Server(httpServer, {
    cors: corsOptions,
  });

  io.on("connection", (socket) => {
    let joinedRoom = null;
    let joinedPlayerId = null;

    // Evento: player_join (Pantalla Login)
    socket.on("player_join", (data) => {
      console.log(`[C -> S] Evento: player_join:`);
      const { username, playerId } = data;

      const roomId = RoomId; // Sala fija, más adelante se implantará createLobbyId()
      console.log(`Sala: ${RoomId}`);

      // Pendiente validación de sala.

      // ...

      // Lógica de Reconexión y Límite de Sala
      const existingPlayer = rooms[roomId].players.find(
        (p) => p.playerId === playerId
      );

      if (!existingPlayer && rooms[roomId].players.length >= 4) {
        console.error(
          `[ERROR] La sala ${roomId} está llena. No se pudo unir ${playerId}.`
        );
        socket.emit("join_error", { message: "La sala está llena." });
        console.log(
          `[S -> C] Evento: join_error, Datos: ${JSON.stringify({
            message: "La sala está llena.",
          })}`
        );
        return;
      }

      // Asignar variables de estado de la conexión
      joinedRoom = roomId;
      joinedPlayerId = playerId;

      if (existingPlayer) {
        existingPlayer.socketId = socket.id;
      } else {
        const newPlayer = {
          playerId: playerId,
          socketId: socket.id,
          username: username,
          completedWords: [],
          isReady: false,
        };
        rooms[roomId].players.push(newPlayer);
        console.log(
          `[JOIN] Jugador ${playerId} - ${username} se unio a la sala ${roomId}.`
        );
      }

      socket.join(roomId);

      const isHost = rooms[roomId].players[0].playerId === playerId;

      // PENDIENTE Revisar -->
      // --- Respuesta: joined_lobby ---
      const responsePayload = {
        playerId: playerId,
        roomId: roomId,
        isHost: isHost,
        players: rooms[roomId].players,
      };

      socket.emit("joined_lobby", responsePayload);
      console.log(
        `[S -> C] Evento: joined_lobby, Datos: ${JSON.stringify(
          responsePayload
        )}`
      );
      console.log(`[EMIT] 'joined_lobby' enviado a ${playerId}`);

      // --- Notificación a los demás ---
      io.to(roomId).emit("player_list_updated", {
        players: rooms[roomId].players,
      });
      console.log(
        `[S -> C] Evento: player_list_updated, Datos: ${JSON.stringify({
          players: rooms[roomId].players,
        })}`
      );
      console.log(`[EMIT] 'player_list_updated' enviado a sala ${roomId}`);
    });

    // --- Evento: player_ready (Pantalla Lobby) ---
    socket.on("player_ready", (data) => {
      console.log(
        `[C -> S] Evento: player_ready, Datos: ${JSON.stringify(data)}`
      );
      const { playerId, isReady } = data;
      const room = Object.values(rooms).find((r) =>
        r.players.some((p) => p.playerId === playerId)
      );
      if (room) {
        const player = room.players.find((p) => p.playerId === playerId);
        if (player) {
          player.isReady = isReady;
          console.log(
            `[READY] El jugador ${playerId} ha cambiado su estado a ${isReady}`
          );
          io.to(RoomId).emit("player_list_updated", { players: room.players });
          console.log(
            `[S -> C] Evento: player_list_updated, Datos: ${JSON.stringify({
              players: room.players,
            })}`
          );
        }
      }
    });

    // --- Evento: start_game (Pantalla Lobby) ---
    socket.on("start_game", ({ roomId, playerId }) => {
      console.log(
        `[C -> S] Evento: start_game, Datos: ${JSON.stringify({
          roomId,
          playerId,
        })}`
      );
      const host = rooms[roomId].players[0];
      if (host.playerId !== playerId) {
        console.error(`[ERROR] El jugador ${playerId} no es el host.`);
        return;
      }

      // Verificar si todos los demás jugadores están listos
      const allReady = rooms[roomId].players.every((player, index) => {
        if (index === 0) return true; // El host no necesita estar listo
        return player.isReady;
      });

      if (!allReady) {
        console.error(`[ERROR] No todos los jugadores están listos.`);
        // Opcional: emitir un error al host
        // socket.emit('start_error', { message: 'No todos los jugadores están listos.' });
        return;
      }

      // TODO: Cargar palabras de un fichero o BBDD
    });

    // --- Evento: disconnect ---
    socket.on("disconnect", () => {
      console.log(`[C -> S] Evento: disconnect`);
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
                console.log(
                  `[S -> C] Evento: host_changed, Datos: ${JSON.stringify({
                    isHost: isNewHost,
                    players: room.players,
                  })}`
                );
              }
            });
          }
        } else {
          // Non-host player disconnected, just notify others
          io.to(joinedRoom).emit("player_list_updated", {
            players: room.players,
          });
          console.log(
            `[S -> C] Evento: player_list_updated, Datos: ${JSON.stringify({
              players: room.players,
            })}`
          );
        }

        console.log(
          `[EMIT] Notificación de desconexión enviada a la sala ${joinedRoom}`
        );
      }
    });
  });

  return io;
}

// Exportamos la función principal Y el generador de IDs para el test
module.exports = { initializeSocketIO, generatePlayerId };
