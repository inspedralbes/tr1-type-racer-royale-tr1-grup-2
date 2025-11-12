import {
  asignarCartaJugador,
  startPowerupSpawner, eliminarCartaJugador,
} from "../logic/powerups/powerupLogic.js";
import { calcularPalabrasRestantes } from "../logic/wordLogic.js";
import { getRoom, leaveRoom } from "../logic/roomsManager.js";
import Intento from "../models/Try.js";
import Usuario from "../models/User.js";

export function registerGameEvents(io, socket) {
  //
  // SOCKET QUE ESCUCHA CUANDO UN JUGADOR ESCRIBE UNA PALABRA
  //

  socket.on("word_typed", async (msg) => {
    const {
      wordId,
      completedWords,
      playerId,
      roomId,
      threshold = 3,
    } = msg.data;
    const room = getRoom(roomId);
    console.log(
      "🟢 room obtenida en word_typed:",
      room,
      "para roomId:",
      roomId
    );
    if (!room) return;

    const jugador = room.players.find((p) => p.playerId === playerId);
    console.log(
      "🟢 jugador encontrado:",
      jugador,
      "buscando playerId:",
      playerId
    );
    if (!jugador) return;

    // ✅ Determinar si la palabra fue escrita correctamente
    const palabraEscrita = msg.data.word;
    const correcta = jugador.words.includes(palabraEscrita);

    if (!correcta) {
      io.to(playerId).emit("word_failed", { data: { word: palabraEscrita } });
    }

    if (
      jugador.currentPowerupWord &&
      jugador.currentPowerupWord === msg.data.word
    ) {
      const carta = jugador.pendingPowerup;
      jugador.powerups = jugador.powerups || [];
      jugador.powerups.push(carta);

      jugador.currentPowerupWord = null;
      jugador.pendingPowerup = null;

      io.to(playerId).emit("powerup_claimed", { data: { carta } });
      return;
    }

    // 🔹 Calcular palabras normales
    calcularPalabrasRestantes(
      { [roomId]: room },
      roomId,
      playerId,
      wordId,
      threshold,
      completedWords
    );

    // 📝 Guardar intento en MongoDB
    try {
      await Intento.create({
        playerId,
        word: palabraEscrita,
        correct: correcta,
      });

      // 🔄 Actualizar estadísticas del usuario
      await Usuario.findOneAndUpdate(
        { playerId },
        {
          $inc: {
            totalIntentos: 1,
            aciertos: correcta ? 1 : 0,
            errores: correcta ? 0 : 1,
          },
          $addToSet: correcta
            ? { palabrasFrecuentes: palabraEscrita }
            : { palabrasFalladas: palabraEscrita },
        },
        { upsert: true }
      );
    } catch (err) {
      console.error(
        "❌ Error al registrar intento o actualizar estadísticas:",
        err
      );
    }

    if (jugador.words.length === 0) jugador.status = "finished";
    console.log(
      `📝 [Game] Palabra completada por ${jugador.playerId} en ${roomId} y el status ${jugador.status}`
    );
    console.log(
      "🔹 Emitiendo update_player_words a roomId:",
      roomId,
      "socket.id:",
      socket.id,
      "playerId:",
      playerId
    );
    console.log("🟢 Sockets en room:", io.sockets.adapter.rooms.get(roomId));

    socket.emit("update_player_words", {
      data: {
        playerId,
        remainingWords: jugador.words,
        status: jugador.status,
        completedWords: jugador.completedWords,
        roomId,
      },
    });

    socket.broadcast.to(roomId).emit("update_progress", {
      data: {
        players: room.players.map((p) => ({
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
    startPowerupSpawner(io, roomId, room, 10000);
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
  io.to(roomId).emit("powerup_spawned", { data: {carta, playerId } });

  // Emitir al resto de jugadores que la carta ha sido obtenida por un jugador 
  io.to(roomId).emit("powerup_claimed_global", { data: { carta } });
});


// socket.on("use_powerup", (msg) => {
//   const { roomId, playerId, cartaId } = msg.data;
//   const room = getRoom(roomId);
//   if (!room) return;

//   const jugador = room.players.find(p => p.playerId === playerId);
//   if (!jugador) return;

//   const carta = jugador.powerups.find(c => c.id === cartaId);
//   if (!carta) return;

//   // 🔥 Eliminar carta del jugador
//   eliminarCartaJugador({ [roomId]: room }, roomId, playerId, cartaId);

//   // 🔔 Notificar a todos los jugadores que la carta fue usada
//   // io.to(roomId).emit("powerup_spawned", { data: { carta, playerId} });
// });


socket.on("use_powerup", (msg) => {
  const { roomId, playerId, efecto, cardId } = msg.data;
  const room = getRoom(roomId);
  if (!room) return;

  console.log(`🃏 Powerup recibido: ${efecto} (jugador ${playerId}) en sala ${roomId}`);

  // Emitimos SIEMPRE a todos el mismo evento de powerup
  io.to(roomId).emit("powerup_applied", { 
    data: { efecto, from: playerId } 
  });

  // Eliminamos la carta del jugador
  eliminarCartaJugador({ [roomId]: room }, roomId, playerId, cardId);

  console.log(`💥 Powerup ${efecto} usado por ${playerId}, carta ${cardId} eliminada`);
});




}
