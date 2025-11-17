import {
  asignarCartaJugador,
  startPowerupSpawner,
  eliminarCartaJugador,
} from "../logic/powerups/powerupLogic.js";
import { calcularPalabrasRestantes } from "../logic/wordLogic.js";
import { getRoom } from "../logic/roomsManager.js";

//
// FUNCION QUE ENGLOBA TODOS LOS EVENTOS SOCKET QUE PASAN EN EL JUEGO
//

export function registerGameEvents(io, socket) {
  // SOCKET ESUCHA PALABRAS ESCRITAS POR EL USUARIO
  socket.on("word_typed", (msg) => {
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

    if (
      jugador.currentPowerupWord &&
      jugador.currentPowerupWord === msg.data.word
    ) {
      const carta = jugador.pendingPowerup;
      jugador.powerups = jugador.powerups || [];
      if (jugador.powerups.length < 2) {
        jugador.powerups.push(carta);

        io.to(playerId).emit("powerup_claimed", { data: { carta } });

        io.in(roomId).emit("powerup_update", {
          data: {
            players: room.players.map((p) => ({
              playerId: p.playerId,
              username: p.username,
              icono: p.icono,
              powerups: p.powerups,
            })),
          },
        });
      } else {
        return;
      }

      // --- CONTADOR DE POWERUPS ---
      room.powerupTurnCounter = (room.powerupTurnCounter || 0) + 1;

      if (room.powerupTurnCounter % 3 === 0) {
        const jugadoresSinCarta = room.players.filter(
          (j) => (j.powerups?.length || 0) === 0
        );
        if (jugadoresSinCarta.length > 0) {
          const jugadorBonus = jugadoresSinCarta[0]; 
          const cartaBonus = generarCarta(); 
          jugadorBonus.powerups = jugadorBonus.powerups || [];
          jugadorBonus.powerups.push(cartaBonus);

          io.to(jugadorBonus.playerId).emit("powerup_claimed", {
            data: { carta: cartaBonus },
          });
          console.log(
            `💡 [Powerup Bonus] Carta otorgada a ${jugadorBonus.playerId} por turno #${room.powerupTurnCounter}`
          );
        }

        // SOCKET EMITE ACUTALIZACIÓN DE POWERUPS DE JUGADORES
        io.in(roomId).emit("powerup_update", {
          data: {
            players: room.players.map((p) => ({
              playerId: p.playerId,
              username: p.username,
              powerups: p.powerups,
            })),
          },
        });
      }

      jugador.currentPowerupWord = null;
      jugador.pendingPowerup = null;
    }

    calcularPalabrasRestantes(
      { [roomId]: room },
      roomId,
      playerId,
      wordId,
      threshold,
      completedWords
    );

    if (jugador.words.length === 0) jugador.status = "finished";
    console.log(
      `📝 [Game] Palabra completada por ${jugador.playerId} en ${roomId} y el status ${jugador.status}`
    );
    console.log(
      "🟢 jugador encontradoFIEHIER:",
      jugador,
      "buscando playerId:",
      playerId
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

    // SOCKET EMITE ENVIAR LA ACTUALIZACIÓN SOLO AL JUGADOR QUE HA ESCRITO LA PALABRA
    socket.emit("update_player_words", {
      data: {
        playerId,
        remainingWords: jugador.words,
        status: jugador.status,
        completedWords: jugador.completedWords,
        roomId,
        username: jugador.username,
      },
    });

    // SOCKET EMITE ENVIAR LA ACTUALIZACIÓN A TODOS LOS DEMÁS JUGADORES EN LA SALA
    io.to(roomId).emit("update_progress", {
      data: {
        players: room.players.map((p) => ({
          roomId,
          playerId: p.playerId,
          username: p.username,
          remainingWords: p.words,
          status: p.status,
          completedWords: p.completedWords,
          powerupsNum: p.powerups?.length || 0,
        })),
      },
    });

    console.log(`✅ [Game] ${jugador.playerId} completó palabra en ${roomId}`);

    startPowerupSpawner(io, roomId, room, 10000);
  });

  // SOCKET ESCUCHA EVENTO DE RECLAMO DE POWERUP
  socket.on("claim_powerup", (msg) => {
    const { roomId, playerId, carta } = msg.data;
    const room = getRoom(roomId);
    if (!room) return;

    // Asignar carta al jugador que la reclama
    asignarCartaJugador({ [roomId]: room }, roomId, playerId, carta);

    // Emitir al jugador su nueva carta
    io.to(roomId).emit("powerup_spawned", { data: { carta, playerId } });

    // Emitir al resto de jugadores que la carta ha sido obtenida por un jugador
    // io.to(roomId).emit("powerup_claimed_global", { data: { carta } });
    io.to(roomId).emit("update_progress", {
      data: {
        players: room.players.map((p) => ({
          roomId,
          playerId: p.playerId,
          username: p.username,
          remainingWords: p.words,
          status: p.status,
          completedWords: p.completedWords,
          powerupsNum: p.powerups?.length || 0,
        })),
      },
    });
  });

  // SOCKET ESCUCHA EL USO DE UN POWERUP
  socket.on("use_powerup", (msg) => {
    const { roomId, playerId, efecto, cardId } = msg.data;
    const room = getRoom(roomId);
    if (!room) return;

    console.log(
      `🃏 Powerup recibido: ${efecto} (jugador ${playerId}) en sala ${roomId}`
    );

    // SOCKET EMITE EL EFECTO DEL POWERUP A JUGADORES
    io.to(roomId).emit("powerup_applied", {
      data: { efecto, from: playerId },
    });

    eliminarCartaJugador({ [roomId]: room }, roomId, playerId, cardId);

    console.log(
      `💥 Powerup ${efecto} usado por ${playerId}, carta ${cardId} eliminada`
    );

    if (efecto === "reset_game") {
      console.log("entra al reset");
      io.to(roomId).emit("powerup_reset_words", {
        data: { from: playerId },
      });
    }
  });
}
