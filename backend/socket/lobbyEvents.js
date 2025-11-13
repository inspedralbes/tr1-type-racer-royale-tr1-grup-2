import {
  createRoom,
  getRoom,
  getPublicRooms,
  joinRoom,
} from "../logic/roomsManager.js";
import { globalPlayers } from "../logic/globalState.js";

export function registerLobbyEvents(io, socket) {
  socket.on("join_room", async ({ roomId, playerId, username }) => {
    try {
      const room = await joinRoom(roomId, playerId, username);

      // Añadir a globalPlayers si no estaba
      if (!globalPlayers.some((p) => p.playerId === playerId)) {
        globalPlayers.push({ playerId, username });
      }

      socket.join(roomId);
      socket.playerId = playerId; // Guardar el playerId en el socket

      // Info solo al jugador actual para que le envie un mensaje personalizado
      socket.emit("player_registered", { playerId, username });

      console.log(
        "🔎 Sockets dentro de la sala",
        roomId,
        io.sockets.adapter.rooms.get(roomId)
      );

      // Info de la sala a todos los jugadores de la sala para mensaje general de unión
      io.to(roomId).emit("joined_lobby", {
        roomId: room.roomId,
        host: room.host,
        players: room.players,
        numPlayers: room.numPlayers,
        maxPlayers: room.maxPlayers,
        gameState: room.gameState,
      });

      io.emit("rooms_list", getPublicRooms()); // actualizar lista global

      console.log(
        `[🎮 Lobby] Jugador ${username} (${playerId}) unido a ${roomId}`
      );
    } catch (err) {
      socket.emit("join_error", { message: err.message });
      console.error(`[ERROR] player_join: ${err.message}`);
    }
  });

  // socket.on("player_ready", ({ playerId, isReady }) => {
  //   const room = getRoom("room-abc");
  //   if (!room) return;

  //   const player = room.players.find(p => p.playerId === playerId);
  //   if (player) player.isReady = isReady;

  //   io.to("room-abc").emit("joined_lobby", { players: room.players });
  //   // console.log(`[✅ READY] ${playerId} está ${isReady ? "listo" : "no listo"}`);
  // });

  socket.on("start_game_signal", ({ roomId }) => {
    const room = getRoom(roomId);
    if (!room) return;
    room.gameState = "in game"; // actualizamos el estado de la sala
    console.log(room);
    io.to(roomId).emit("start_game_signal");
    io.emit("rooms_list", getPublicRooms());
    console.log(`[🚀] Partida iniciada en ${roomId}`);
  });

  // SOCKETS DE LA SALA
  socket.on("create_room", async ({ roomName, playerId, username }) => {
    try {
      const room = await createRoom(playerId, username, roomName);
      console.log("🆕 Sala creada:", room);

      socket.join(room.roomId);

      socket.emit("room_created", {
        roomId: room.roomId,
        playerId: playerId,
        isHost: true,
        gameState: room.gameState,
        players: room.players, // aquí ya incluye al host
      });

      io.emit("rooms_list", getPublicRooms()); // actualizar lista global
    } catch (err) {
      console.error("❌ Error al crear sala:", err.message);
      socket.emit("room_error", { message: err.message });
    }
  });

  // socket que recibe petición de lista de salas
  socket.on("get_rooms", () => {
    const rooms = getPublicRooms();
    console.log("📜 Enviando lista de salas:", rooms);
    socket.emit("rooms_list", rooms); // 👈 solo al cliente que hizo la petición
  });
}
