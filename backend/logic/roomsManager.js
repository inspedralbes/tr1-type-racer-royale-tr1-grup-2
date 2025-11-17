const rooms = {}; // roomId -> { host, maxPlayers, roomName, settings, numPlayers, gameState, players[], initialWords }

/// AQUI SE MANEJAN TODAS LAS FORMAS DE CONEXIÓN CON LAS SALAS 

//
// FUNCION PARA GENERAR LA ID RANDOM DE LA SALA
//

export const generateRoomId = (length = 6) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id;
  do {
    id = "";
    for (let i = 0; i < length; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  } while (rooms[id]); 
  return id;
};



//
// FUNCION QUE CREA UNA SALA
//

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
  if (!rooms[roomId]) {
    rooms[roomId] = {
      roomId,
      host: playerId,
      roomName,
      maxPlayers,
      settings,
      numPlayers: 1,
      gameState: "waiting", 
      players: [
        {
          playerId,
          username: playerName,
          words: [...initialWords],
          completedWords: 0,
          status: "waiting", 
          
        },
      ],
      initialWords: [...initialWords],
      createdAt: Date.now(),
    };
  } else {
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


//
// FUNCION PARA OBTENER UNA SALA POR ID 
//

export const getRoom = (roomId) => rooms[roomId] || null;



//
// FUNCION PARA OBTENER TODAS LAS SALAS
//

export const getAllRooms = () => rooms;



//
// FUNCION PARA OBTENER TODAS LAS SALAS(DATOS PUBLICOS)
//


// FUNCION DE ARRAY - ALTO NIVEL

// export const getPublicRooms = () => {
//   return Object.values(rooms)
//     .filter(r => r.numPlayers > 0)  
//     .map((r) => ({
//       roomId: r.roomId,
//       roomName: r.roomName,
//       host: r.host,
//       numPlayers: r.numPlayers,
//       maxPlayers: r.maxPlayers,
//       gameState: r.gameState,
//     }));
// };

// SUSTITUTO DE .filter() Y .map() 
export const getPublicRooms = () => {
  const result = [];

  const allRooms = Object.values(rooms);

  for (let i = 0; i < allRooms.length; i++) {
    const r = allRooms[i];

    if (r.numPlayers > 0) {
      const roomInfo = {
        roomId: r.roomId,
        roomName: r.roomName,
        host: r.host,
        numPlayers: r.numPlayers,
        maxPlayers: r.maxPlayers,
        gameState: r.gameState,
      };

      result.push(roomInfo);
    }
  }

  return result;
};


//
// FUNCION QUE SACA DE LA SALA AL JUGADOR
//

export const leaveRoom = (roomId, playerId) => {
  const room = rooms[roomId];
  if (!room) return;

  // FUNCION DE ARRAY - ALTO NIVEL
  // room.players = room.players.filter((p) => p.playerId !== playerId);

  // SUSTITUTO DE .filter()
  const nuevosJugadores = [];

  for (let i = 0; i < room.players.length; i++) {
    const p = room.players[i];
    if (p.playerId !== playerId) {
      nuevosJugadores.push(p);
    }
  }

  room.players = nuevosJugadores;

  room.numPlayers = room.players.length;
  console.log(`🚪 Jugador ${playerId} ha abandonado la sala ${roomId} en el roomsManager`);
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

  if (room.numPlayers === 0) {
    delete rooms[roomId];
  }
};


//
// FUNCION PARA BORRAR LA SALA
//

export const deleteRoom = (roomId) => {
  delete rooms[roomId];
  console.log(`🗑️ Sala ${roomId} eliminada.`);
};



//
// FUNCION PARA EMPEZAR EL JUEGO
//

export const startGame = (roomId) => {
  const room = rooms[roomId];
  if (!room) throw new Error("Sala no encontrada.");
  room.gameState = "in_progress";

  // FUNCION DE ARRAY - NIVEL ALTO
  // room.players.forEach((p) => (p.status = "playing"));

  // SUSTITUTO DE .forEach()
  for (let i = 0; i < room.players.length; i++) {
    room.players[i].status = "playing";
  }
};



// 
// FUNCION QUE CAMBIA EL ESTADO DE LA PARTIDA 
//

export const finishGame = (roomId) => {
  const room = rooms[roomId];
  if (!room) return;
  room.gameState = "finished";

  // FUNCION DE ARRAY - NIVEL ALTO
  // room.players.forEach((p) => (p.status = "finished"));

  // SUSTITUTO DE .forEach()
  for (let i = 0; i < room.players.length; i++) {
    room.players[i].status = "finished";
  }
};


//
// FUNCION QUE UNE A UN JUGADOR A UNA SALA
//

export const joinRoom = (roomId, playerId, username) => {
  const room = rooms[roomId];
  if (!room) throw new Error("Sala no encontrada.");

  if (room.numPlayers >= room.maxPlayers) {
    throw new Error("La sala está llena.");
  }

  // FUNCION DE ARRAY - ALTO NIVEL
  // const existingPlayer = room.players.find(p => p.playerId === playerId);

  // SUSTITUTO DE .find()
  let existingPlayer = null;
  for (let i = 0; i < room.players.length; i++) {
    if (room.players[i].playerId === playerId) {
      existingPlayer = room.players[i];
      break;
    }
  }


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
