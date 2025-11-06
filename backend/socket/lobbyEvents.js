import { createRoom, getRoom } from "../logic/roomsManager.js";
import { globalPlayers } from "../logic/globalState.js";

let playerCounter = 1;

export function registerLobbyEvents(io, socket) {
  socket.on("player_join", (data) => {
    const { username } = data;
    const roomId = "room-abc"; // futuro: createLobbyId()
    const playerId = `u${playerCounter++}`;

    let room = getRoom(roomId);
    // if (!room) {
    createRoom(roomId, playerId, username);
    room = getRoom(roomId);
    // } else {
    //   room.players.push({
    //     playerId,
    //     username,
    //     completedWords: 0,
    //     status: "playing",
    //   });
    // }

    // Lógica de Reconexión y Límite de Sala
    const existingPlayer = room.players.find((p) => p.playerId === playerId);

    if (!existingPlayer && room.players.length >= 4) {
      console.error(
        `[ERROR] La sala ${roomId} está llena. No se pudo unir ${playerId}.`
      );
      socket.emit("join_error", { message: "La sala está llena." });
      console.log(
        `[S -> C] Evento: join_error, Datos: ${JSON.stringify({
          message: "La sala está llena.",
        })}`
      );
      return;
    }

    //   if (room.players.length > 4) {
    //   socket.emit("join_error", { message: "La sala está llena." });
    //   return;
    // }

    globalPlayers.push({ playerId, username });

    socket.join(roomId);

    // EMITIR DATOS DEL JUGADOR ACTUAL
    socket.emit("player_registered", {
      playerId,
      username,
    });
    console.log(`[🎮 Lobby] Jugador registrado: ${username} (${playerId})`);

    const responsePayload = {
      playerId,
      roomId,
      isHost: room.host === playerId,
      players: room.players,
    };

    io.to(roomId).emit("joined_lobby", responsePayload);
    console.log(
      `[🎮 Lobby] Jugador ${username} (${playerId}) unido a ${roomId}`
    );
  });

  socket.on("player_ready", ({ playerId, isReady }) => {
    const room = getRoom("room-abc");
    if (!room) return;

    const player = room.players.find((p) => p.playerId === playerId);
    if (player) {
      player.isReady = isReady;
      // console.log(`[✅ READY] ${playerId} está ${isReady ? "listo" : "no listo"}`);
    }

    io.to("room-abc").emit("player_list_updated", { players: room.players });
  });

  socket.on("start_game_signal", ({ roomId }) => {
    io.to(roomId).emit("start_game_signal");
    console.log(`[🚀] Partida iniciada en ${roomId}`);
  });
}
