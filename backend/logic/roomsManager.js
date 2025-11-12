// logic/roomsManager.js

// 🧩 Estructura global de salas
const rooms = {}; // roomId -> { host, maxPlayers, roomName, settings, numPlayers, gameState, players[], initialWords }


export const generateRoomId = (length = 6) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id;
  do {
    id = "";
    for (let i = 0; i < length; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  } while (rooms[id]); // asegurarnos de que no exista ya una sala con ese id
  return id;
};

/**
 * 🏗️ Crear una sala o unir un jugador si ya existe
 */
export const createRoom = (
  playerId,
  playerName,
  roomName,
  initialWords = [],
  options = {}
) => {
  const {
    maxPlayers = 4,
    settings = { wordCount: 60, timeLimit: 90, language: "es" },
  } = options;

  const roomId = generateRoomId();
  // Si la sala no existe ➜ crearla
  if (!rooms[roomId]) {
    rooms[roomId] = {
      roomId,
      host: playerId,
      roomName,
      maxPlayers,
      settings,
      numPlayers: 1,
      gameState: "waiting", // "waiting" | "in_progress" | "finished"
      players: [
        {
          playerId,
          username: playerName,
          words: [...initialWords],
          completedWords: 0,
          status: "waiting", // esto hay que verlo de quitarlo o no 
          
        },
      ],
      initialWords: [...initialWords],
      createdAt: Date.now(),
    };
  } else {
    // Si ya existe ➜ intentar unir al jugador
    const room = rooms[roomId];
    if (room.numPlayers >= room.maxPlayers) {
      throw new Error("La sala está llena.");
    }

    const alreadyInRoom = room.players.some(p => p.playerId === playerId);
    if (!alreadyInRoom) {
      room.players.push({
        playerId,
        username: playerName,
        words: [...initialWords],
        completedWords: 0,
        status: "waiting",
      });
      room.numPlayers++;
    }
  }

  return rooms[roomId];
};

/**
 * 🔍 Obtener una sala específica
 */
export const getRoom = (roomId) => rooms[roomId] || null;

/**
 * 📜 Obtener TODAS las salas (para debug o lobby)
 */
export const getAllRooms = () => rooms;

/**
 * 🪄 Obtener versión pública (para lobby visual)
 */
export const getPublicRooms = () => {
  return Object.values(rooms)
    .filter(r => r.numPlayers > 0)  // ✅ solo salas con jugadores
    .map((r) => ({
      roomId: r.roomId,
      roomName: r.roomName,
      host: r.host,
      numPlayers: r.numPlayers,
      maxPlayers: r.maxPlayers,
      gameState: r.gameState,
    }));
};


/**
 * 🚪 Un jugador abandona una sala
 */
export const leaveRoom = (roomId, playerId) => {
  const room = rooms[roomId];
  if (!room) return;

  room.players = room.players.filter((p) => p.playerId !== playerId);
  room.numPlayers = room.players.length;
  console.log(`🚪 Jugador ${playerId} ha abandonado la sala ${roomId} en el roomsManager`);
  // Si el host se va ➜ asignar nuevo host o eliminar
  if (room.host === playerId) {
    console.log(`dentro del if que comprueba si el host se va, y longitud de players: ${room.players.length}`);
    if (room.players.length > 0) {
      room.host = room.players[0].playerId;
    } else {
      deleteRoom(rooms[roomId]);
      console.log(`🗑️ Sala eliminada: ${roomId}`);
      return;
    }
  }

  // Si la sala queda vacía ➜ eliminarla
  if (room.numPlayers === 0) {
    delete rooms[roomId];
  }
};

/**
 * 🗑️ Eliminar una sala directamente
 */
export const deleteRoom = (roomId) => {
  delete rooms[roomId];
  console.log(`🗑️ Sala ${roomId} eliminada.`);
};

/**
 * ▶️ Iniciar la partida
 */
export const startGame = (roomId) => {
  const room = rooms[roomId];
  if (!room) throw new Error("Sala no encontrada.");
  room.gameState = "in_progress";
  room.players.forEach((p) => (p.status = "playing"));
};

/**
 * 🏁 Finalizar la partida
 */
export const finishGame = (roomId) => {
  const room = rooms[roomId];
  if (!room) return;
  room.gameState = "finished";
  room.players.forEach((p) => (p.status = "finished"));
};


export const joinRoom = (roomId, playerId, username) => {
  const room = rooms[roomId];
  if (!room) throw new Error("Sala no encontrada.");

  if (room.numPlayers >= room.maxPlayers) {
    throw new Error("La sala está llena.");
  }

  const existingPlayer = room.players.find(p => p.playerId === playerId);
  if (!existingPlayer) {
    room.players.push({
      playerId,
      username,
      words: [],
      completedWords: 0,
      status: "waiting",
    });
    room.numPlayers++;
  }

  return room;
};
