import { asignarCartaJugador, startPowerupSpawner } from "../logic/powerups/powerupLogic.js";
import { getRoom } from "../logic/roomsManager.js";
import { calcularPalabrasRestantes } from "../logic/wordLogic.js";
import { getRoom, leaveRoom } from "../logic/roomsManager.js";

export function registerGameEvents(io, socket) {

  //
  // SOCKET QUE ESCUCHA CUANDO UN JUGADOR ESCRIBE UNA PALABRA
  //
  socket.on("word_typed", (msg) => {
    const { wordId, completedWords, playerId, roomId, threshold = 3 } = msg.data;
    const room = getRoom(roomId);
    console.log("🟢 room obtenida en word_typed:", room, "para roomId:", roomId);
    if (!room) return;

    const jugador = room.players.find(p => p.playerId === playerId);
    console.log("🟢 jugador encontrado:", jugador, "buscando playerId:", playerId);
    if (!jugador) return;

    calcularPalabrasRestantes({ [roomId]: room }, roomId, playerId, wordId, threshold, completedWords);

    if (jugador.words.length === 0) jugador.status = "finished";
    console.log(`📝 [Game] Palabra completada por ${jugador.playerId} en ${roomId} y el status ${jugador.status}`);
    console.log("🟢 jugador encontradoFIEHIER:", jugador, "buscando playerId:", playerId);
    console.log("🔹 Emitiendo update_player_words a roomId:", roomId, "socket.id:", socket.id, "playerId:", playerId);
    console.log("🟢 Sockets en room:", io.sockets.adapter.rooms.get(roomId));

    // ENVIAR LA ACTUALIZACIÓN SOLO AL JUGADOR QUE HA ESCRITO LA PALABRA
    socket.emit("update_player_words", {
      data: {
        playerId,
        remainingWords: jugador.words,
        status: jugador.status,
        completedWords: jugador.completedWords,
        roomId,
      },
    });

    //ENVIAR LA ACTUALIZACIÓN A TODOS LOS DEMÁS JUGADORES EN LA SALA
    socket.broadcast.to(roomId).emit("update_progress", {
      data: {
        players: room.players.map(p => ({
          roomId,
          playerId: p.playerId,
          username: p.username,
          remainingWords: p.words,
          status: p.status,
          completedWords: p.completedWords,
        })),
      },
    });

    console.log(`✅ [Game] ${jugador.playerId} completó palabra en ${roomId}`);
  });


  socket.on("leave_game", ({ playerId, roomId }) => {
  const room = getRoom(roomId);
  if (!room) return;

  leaveRoom(roomId, playerId);

  // Notificar a los jugadores restantes
  if (room.players.length > 0) {
    io.to(roomId).emit("update_players", room.players);
  }

    console.log(`👋 Jugador ${playerId} salió de la sala ${roomId}`);
  });

  socket.on("claim_powerup", (msg) => {
  const { roomId, playerId, carta } = msg.data;
  const room = getRoom(roomId);
  if (!room) return;

  // Asignar carta al jugador que la reclama
  asignarCartaJugador({ [roomId]: room }, roomId, playerId, carta);

  // Emitir al jugador su nueva carta
  io.to(playerId).emit("powerup_spawned", { carta });
});
}
