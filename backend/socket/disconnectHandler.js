import { getAllRooms, leaveRoom, getPublicRooms } from "../logic/roomsManager.js";
import { stopPowerupSpawner } from "../logic/powerups/powerupLogic.js"; // importa tu función

export function handlePlayerLeave(io, socket, playerId) {
  const allRooms = getAllRooms();

  for (const roomId in allRooms) {
    const room = allRooms[roomId];
    if (!room) continue;
    console.log("🔍 Comprobando sala:", roomId, "para jugador:", playerId);
    // Comprueba si el jugador estaba en esa sala
    const isInRoom = room.players.some(p => p.playerId === playerId);
    if (isInRoom) {
      leaveRoom(roomId, playerId);

      // Si aún existe la sala, actualiza a los jugadores
      if (allRooms[roomId]) {
        io.to(roomId).emit("update_players", allRooms[roomId].players);

        if (allRooms[roomId].players.length === 0) {
          console.log(`🛑 Sala ${roomId} vacía, deteniendo powerup spawner`);
          stopPowerupSpawner(roomId);
        }
      }

      io.emit("rooms_list", getPublicRooms());

      console.log(`👋 Jugador ${playerId} salió de la sala ${roomId}`);
      break;
    }
  }
}
