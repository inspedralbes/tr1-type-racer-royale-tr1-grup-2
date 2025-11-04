// import { Server } from "socket.io";
// import { createRoom, getRoom } from "../logic/roomsManager.js";

// // No se usa de momento, Actual: unica sala fija

// const globalPlayers = []; // [{ playerId, username }]


// function createLobbyId() {
//   const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
//   const roomPrefix = "room_";
//   const randomLetter = letters[Math.floor(Math.random() * letters.length)];
//   const randomNumber = Math.floor(100 + Math.random() * 900);
//   return `${roomPrefix}${randomLetter}${randomNumber}`;
// }

// // Para generar un ID único para el jugador
// export function generatePlayerId() {
//   const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
//   const randomLetter = letters[Math.floor(Math.random() * letters.length)];
//   const randomNumber = Math.floor(100 + Math.random() * 900);
//   return `${randomLetter}${randomNumber}`;
// }

// // Usamos un ID de sala fijo, ¡Hay que quitarlo más adelante!.
// const roomId = "room_abc";
// let playerCounter = 1;
// // Inicializar Socket.IO

// // export function initializeSocketIO(io) {
//   io.on("connection", (socket) => {
//     let joinedRoom = null;
//     let joinedPlayerId = null;

//     // Evento: player_join (Pantalla Login)
//     socket.on("player_join", (data) => {
//       console.log(`[C -> S] Evento: player_join:`);
//       const { username } = data;

//       const playerId = `u${playerCounter++}`;

//       let room = getRoom(roomId); // Sala fija, más adelante se implantará createLobbyId()
//       console.log(`Sala: ${roomId}`);

//       if (!room) {
//       createRoom(roomId, playerId, username);
//       room = getRoom(roomId);
//       } else {
//         room.players.push({
//         playerId,
//         username,
//         completedWords: 0,
//         });
//       }

//       // Lógica de Reconexión y Límite de Sala
//       const existingPlayer = room.players.find(
//         (p) => p.playerId === playerId
//       );

//       if (!existingPlayer && room.players.length >= 4) {
//         console.error(
//           `[ERROR] La sala ${roomId} está llena. No se pudo unir ${playerId}.`
//         );
//         socket.emit("join_error", { message: "La sala está llena." });
//         console.log(
//           `[S -> C] Evento: join_error, Datos: ${JSON.stringify({
//             message: "La sala está llena.",
//           })}`
//         );
//         return;
//       }

//       // 3️⃣ Añadir jugador al array global de players
//       globalPlayers.push([playerId, username]);
//       // Pendiente validación de sala.
//       const isHost = room.host === playerId;


//       socket.join(roomId);

//       const responsePayload = {
//         playerId,
//         roomId,
//         isHost,
//         players: room.players.map((p) => ({
//           playerId: p.playerId,
//           username: p.username,
//           completedWords: p.completedWords,
//         })),
//       };
//       io.to(roomId).emit("joined_lobby", responsePayload);
//       console.log(`[S -> C] Evento: joined_lobby enviado a ${playerId}`, responsePayload);

//     });

//     socket.on("start_game_signal", (data) => {
//   const { roomId } = data;
//   io.to(roomId).emit("start_game_signal");
//   console.log(`[S -> C] start_game_signal emitido a la sala ${roomId}`);
// });


//     // --- Evento: player_ready (Pantalla Lobby) ---
//     socket.on("player_ready", (data) => {
//   console.log(`[C -> S] Evento: player_ready, Datos: ${JSON.stringify(data)}`);
//   const { playerId, isReady } = data;

//   const roomId = "room_1"; // o donde realmente esté el jugador
//   const room = getRoom(roomId);

//   if (!room) {
//     console.error(`[ERROR] No se encontró la sala del jugador ${playerId}`);
//     return;
//   }

//   const player = room.players.find((p) => p.playerId === playerId);
//   if (player) {
//     player.isReady = isReady;
//     console.log(`[READY] El jugador ${playerId} ha cambiado su estado a ${isReady}`);

//     const responsePayload = {
//       playerId,
//       roomId,
//       isHost: room.host === playerId,
//       players: room.players.map((p) => ({
//         playerId: p.playerId,
//         username: p.username,
//         completedWords: p.completedWords || 0,
//         isReady: p.isReady || false,
//       })),
//     };

//     io.to(roomId).emit("joined_lobby", responsePayload);
//     console.log(`[S -> C] Evento: joined_lobby emitido a sala ${roomId}`);
//   }
// });


//     // --- Evento: disconnect ---
//     socket.on("disconnect", () => {
//       console.log(`[C -> S] Evento: disconnect`);
//       console.log(`[DISCONN] Socket desconectado: ${socket.id}`);
//       if (joinedRoom && rooms[joinedRoom] && joinedPlayerId) {
//         const room = rooms[joinedRoom];
//         const playerIndex = room.players.findIndex(
//           (p) => p.playerId === joinedPlayerId
//         );

//         if (playerIndex === -1) return;

//         const wasHost = playerIndex === 0;

//         // Remove the player from the array
//         room.players.splice(playerIndex, 1);
//         console.log(
//           `[DISCONN] Jugador ${joinedPlayerId} eliminado de la sala.`
//         );

//         if (wasHost) {
//           // Host disconnected, assign a new host
//           console.log(
//             `[DISCONN] El host se ha desconectado. Asignando nuevo host.`
//           );

//           if (room.players.length > 0) {
//             // Notify all remaining players of the change and their new host status
//             room.players.forEach((player) => {
//               if (player.socketId) {
//                 // Ensure player is connected
//                 const isNewHost = room.players[0].playerId === player.playerId;
//                 io.to(player.socketId).emit("host_changed", {
//                   isHost: isNewHost,
//                   players: room.players,
//                 });
//                 console.log(
//                   `[S -> C] Evento: host_changed, Datos: ${JSON.stringify({
//                     isHost: isNewHost,
//                     players: room.players,
//                   })}`
//                 );
//               }
//             });
//           }
//         } else {
//           // Non-host player disconnected, just notify others
//           io.to(joinedRoom).emit("player_list_updated", {
//             players: room.players,
//           });
//           console.log(
//             `[S -> C] Evento: player_list_updated, Datos: ${JSON.stringify({
//               players: room.players,
//             })}`
//           );
//         }

//         console.log(
//           `[EMIT] Notificación de desconexión enviada a la sala ${joinedRoom}`
//         );
//       }
//     });
//   });

//   return io;
// }

