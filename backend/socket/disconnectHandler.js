import { getAllRooms, getRoom, deleteRoom } from "../logic/roomsManager.js";

export function handleDisconnect(io, socket) {
  const allRooms = getAllRooms();
  for (const roomId in allRooms) {
    const room = getRoom(roomId);
    if (!room) continue;

    room.players = room.players.filter(p => p.id !== socket.id);

    if (room.players.length === 0) {
      deleteRoom(roomId);
      console.log(`🗑️ Sala eliminada: ${roomId}`);
    } else {
      io.to(roomId).emit("update_players", room.players);
    }
  }
  console.log(`🔴 Jugador desconectado: ${socket.id}`);
}
