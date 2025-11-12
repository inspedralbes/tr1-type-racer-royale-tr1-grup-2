import { registerLobbyEvents } from "./lobbyEvents.js";
import { registerGameEvents } from "./gameEvents.js";
import { handlePlayerLeave } from "./disconnectHandler.js";

export function initializeSocketIO(io) {
  io.on("connection", (socket) => {
    console.log(`🟢 Nuevo jugador conectado: ${socket.id}`);

    // Registrar grupos de eventos
    registerLobbyEvents(io, socket);
    registerGameEvents(io, socket);

    // Manejo común de desconexión
    socket.on("leave_game", ({ playerId }) => handlePlayerLeave(io, socket, playerId));
    socket.on("disconnect", () => {
      console.log(`🔴 Jugador desconectado: ${socket.id} FINAL`);
    });
  });
}
