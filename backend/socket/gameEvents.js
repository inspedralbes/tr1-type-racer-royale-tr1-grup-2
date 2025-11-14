import { asignarCartaJugador, startPowerupSpawner, eliminarCartaJugador } from "../logic/powerups/powerupLogic.js";
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

    if (jugador.currentPowerupWord && jugador.currentPowerupWord === msg.data.word) {
      // Reclamar el powerup
      const carta = jugador.pendingPowerup; // carta asociada a esa palabra
      jugador.powerups = jugador.powerups || [];
      if (jugador.powerups.length < 2) {
        jugador.powerups.push(carta);

      // Emitir actualización de powerup al jugador
      io.to(playerId).emit("powerup_claimed", { data: { carta } });

      // Después de que alguien reclame un powerup
    io.in(roomId).emit("powerup_update", {
      data: {
        players: room.players.map(p => ({
          playerId: p.playerId,
          username: p.username,
          icono: p.icono,
          powerups: p.powerups
        }))
      }
    });

    } else {
      return;
    }

      // --- CONTADOR DE POWERUPS ---
      room.powerupTurnCounter = (room.powerupTurnCounter || 0) + 1;

      // Cada 3 turnos de powerup, darle carta a quien no tenga ninguna
      if (room.powerupTurnCounter % 3 === 0) {
        const jugadoresSinCarta = room.players.filter(j => (j.powerups?.length || 0) === 0);
        if (jugadoresSinCarta.length > 0) {
          const jugadorBonus = jugadoresSinCarta[0]; // o aleatorio si quieres
          const cartaBonus = generarCarta(); // tu función que crea la carta
          jugadorBonus.powerups = jugadorBonus.powerups || [];
          jugadorBonus.powerups.push(cartaBonus);

      io.to(jugadorBonus.playerId).emit("powerup_claimed", { data: { carta: cartaBonus } });
      console.log(`💡 [Powerup Bonus] Carta otorgada a ${jugadorBonus.playerId} por turno #${room.powerupTurnCounter}`);
    }

    // Después de que alguien reclame un powerup
    io.in(roomId).emit("powerup_update", {
      data: {
        players: room.players.map(p => ({
          playerId: p.playerId,
          username: p.username,
          powerups: p.powerups
        }))
      }
    });

  }

      // Limpiar palabra de powerup
      jugador.currentPowerupWord = null;
      jugador.pendingPowerup = null;
    }

    // 🔹 2️⃣ Calcular palabras normales
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
          powerupsNum: p.powerups?.length || 0,
        })),
      },
    });

    console.log(`✅ [Game] ${jugador.playerId} completó palabra en ${roomId}`);

    startPowerupSpawner(io, roomId, room, 10000);
  });



  // socket.on("leave_game", ({ playerId, roomId }) => {
  // const room = getRoom(roomId);
  // if (!room) return;

  // leaveRoom(roomId, playerId);

  // // Notificar a los jugadores restantes
  // if (room.players.length > 0) {
  //   io.to(roomId).emit("update_players", room.players);
  // }

  //   console.log(`👋 Jugador ${playerId} salió de la sala ${roomId}`);
  // });

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
        players: room.players.map(p => ({
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
