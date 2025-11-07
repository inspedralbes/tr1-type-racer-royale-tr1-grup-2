import { getAllRooms, leaveRoom, getPublicRooms } from "../logic/roomsManager.js";

export function handleDisconnect(io, socket) {
  const playerId = socket.playerId;
  if (!playerId) return;

  const allRooms = getAllRooms();
  for (const roomId in allRooms) {
    const room = allRooms[roomId];
    const player = room.players.find(p => p.playerId === playerId);

    if (player) {
      leaveRoom(roomId, playerId);
      io.emit("rooms_list", getPublicRooms());
      io.to(roomId).emit("update_players", room.players);
      console.log(`[👋] Jugador ${playerId} ha salido de la sala ${roomId}`);
      break; 
    }
  }
  console.log(`🔴 Jugador desconectado: ${socket.id}`);
}