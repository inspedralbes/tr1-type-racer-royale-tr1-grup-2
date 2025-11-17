import { createRoom, getRoom, getPublicRooms, joinRoom } from "../logic/roomsManager.js";
import { globalPlayers } from "../logic/globalState.js";

//
// FUNCION QUE ENGLOBA TODOS LOS SOCKETS DEL LOBBY
//

export function registerLobbyEvents(io, socket) {

  // SOCKET ESCUCHA LA UNION A UNA SALA 
  socket.on("join_room", ({ roomId, playerId, username }) => {
  try {
    const room = joinRoom(roomId, playerId, username);

    if (!globalPlayers.some(p => p.playerId === playerId)) {
      globalPlayers.push({ playerId, username });
    }

    socket.join(roomId);
    socket.playerId = playerId; 

    socket.emit("player_registered", { playerId, username });

    console.log("🔎 Sockets dentro de la sala", roomId, io.sockets.adapter.rooms.get(roomId));

    io.to(roomId).emit("joined_lobby", {
      roomId: room.roomId,
      playerId,
      isHost: room.host === playerId,
      players: room.players,
    });

    io.emit("rooms_list", getPublicRooms()); 

    console.log(`[🎮 Lobby] Jugador ${username} (${playerId}) unido a ${roomId}`);
  } catch (err) {
    socket.emit("join_error", { message: err.message });
    console.error(`[ERROR] player_join: ${err.message}`);
  }

});

  // SOCKET ESCUCHA LA SEÑAL DE COMIENZO DE JUEGO
  socket.on("start_game_signal", ({ roomId }) => {
    const room = getRoom(roomId);
    if (!room) return;
    room.gameState = "in game"; 
    console.log(room);
    io.to(roomId).emit("start_game_signal");
    io.emit("rooms_list", getPublicRooms());
    console.log(`[🚀] Partida iniciada en ${roomId}`);
  });

  // SOCKET ESCUCHA LA PETICION DE CREACIÓN DE SALA
  socket.on("create_room", ({ roomName, playerId, username }) => {
    try {
      const room = createRoom(playerId, username, roomName);
      console.log("🆕 Sala creada:", room);

      socket.join(room.roomId);

      socket.emit("room_created", {
      roomId: room.roomId,
      playerId: playerId,
      isHost: true,
      gameState: room.gameState,
      players: room.players, 
    });
    
      io.emit("rooms_list", getPublicRooms()); 
    } catch (err) {
      console.error("❌ Error al crear sala:", err.message);
      socket.emit("room_error", { message: err.message });
    }
  });

  // SOCKET ESCUCHA LA PETICIÓN DE SALAS
  socket.on("get_rooms", () => {
    const rooms = getPublicRooms();
    console.log("📜 Enviando lista de salas:", rooms);
    socket.emit("rooms_list", rooms); 
});
}
