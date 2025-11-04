import { registerLobbyEvents } from "./lobbyEvents.js";
import { registerGameEvents } from "./gameEvents.js";
import { handleDisconnect } from "./disconnectHandler.js";

export function initializeSocketIO(io) {
  io.on("connection", (socket) => {
    console.log(`🟢 Nuevo jugador conectado: ${socket.id}`);

    // Registrar grupos de eventos
    registerLobbyEvents(io, socket);
    registerGameEvents(io, socket);

    // Manejo común de desconexión
    socket.on("disconnect", () => handleDisconnect(io, socket));
  });
}
