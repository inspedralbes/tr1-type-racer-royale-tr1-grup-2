import { registerLobbyEvents } from "./lobbyEvents.js";
import { registerGameEvents } from "./gameEvents.js";
import { handlePlayerLeave } from "./disconnectHandler.js";

//
// FUNCION QUE INICIALIZA LOS SOCKETS, LOS SOCKETS DE EL JUEGO Y DE LA SALA 
//

export function initializeSocketIO(io) {
  io.on("connection", (socket) => {
    console.log(`🟢 Nuevo jugador conectado: ${socket.id}`);

    registerLobbyEvents(io, socket);
    registerGameEvents(io, socket);

    socket.on("leave_game", ({ playerId }) => handlePlayerLeave(io, socket, playerId));
    socket.on("disconnect", () => {
      console.log(`🔴 Jugador desconectado: ${socket.id} FINAL`);
    });
  });
}
