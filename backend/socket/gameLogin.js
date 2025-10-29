const gameLogin = (io, socket) => {
    console.log('a user connected');

    socket.on('player_join', (data) => {
        console.log('player_join event received:', data);
        const { username } = data;

        // For now, let's generate some dummy data
        const playerId = socket.id; // Using socket.id as playerId for simplicity
        const roomId = 'room_1'; // Placeholder room ID
        const isHost = true; // Assuming the first player to join is the host

        const lobbyData = {
            playerId: playerId,
            roomId: roomId,
            isHost: isHost,
            players: [
                { playerId: playerId, username: username, completedWords: 0 }
            ]
        };

        // Emit the joined_lobby event back to the client that just joined
        socket.emit('joined_lobby', lobbyData);
        console.log('Emitted joined_lobby event:', lobbyData);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
};

export default gameLogin;
