// logic/roomsManager.js

const rooms = {};

export const createRoom = (roomId, playerId, playerName, initialWords = []) => {
  if (!rooms[roomId]) {
    rooms[roomId] = {
      host: playerId,
      players: [
        {
          playerId: playerId,
          username: playerName,
          words: [...initialWords],
          completedWords: 0,
          status: "playing",
        },
      ],
      initialWords: [...initialWords],
    };
  } else {
    rooms[roomId].players.push({
      id: playerId,
      name: playerName,
      words: [...initialWords],
      completedWords: 0,
      status: "playing",
    });
  }
};

export const getRoom = (roomId) => {
  return rooms[roomId] || null;
};

export const getAllRooms = () => {
  return rooms;
};

export const deleteRoom = (roomId) => {
  delete rooms[roomId];
};
