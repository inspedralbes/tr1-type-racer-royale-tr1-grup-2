// Archivo: test-client.js

const { io } = require("socket.io-client");

// Importamos el generador de IDs para crear IDs de jugador consistentes
const { generatePlayerId } = require("./socket/gameLogin.js");

const URL = "http://localhost:3000";
const ROOM_ID = "room_1"; // Debe coincidir con el RoomId fijo del servidor

// Generamos IDs únicos para nuestros jugadores de prueba
const player1_Id = generatePlayerId();
const player2_Id = generatePlayerId();

console.log(
  `[TEST] Iniciando prueba con Host (${player1_Id}) y Jugador2 (${player2_Id})`
);

// --- Cliente 1: El Host ---
const client1 = io(URL, { autoConnect: false });

client1.on("connect", () => {
  console.log(`[CLIENT 1] Conectado: ${client1.id}`);
  console.log(`[CLIENT 1] Enviando 'player_join' como Host...`);
  client1.emit("player_join", {
    username: "Host",
    playerId: player1_Id,
  });
});

client1.on("joined_lobby", (data) => {
  console.log(`[CLIENT 1] ✅ Evento 'joined_lobby' recibido.`);
  console.log(`[CLIENT 1] Soy host: ${data.isHost}`); // Debería ser true
  console.log(`[CLIENT 1] Jugadores en sala: ${data.players.length}`); // Debería ser 1
});

client1.on("player_list_updated", (data) => {
  console.log(
    `[CLIENT 1] 🔄 Evento 'player_list_updated' recibido. Total jugadores: ${data.players.length}`
  );
  // console.log(data.players); // Descomenta para ver la lista completa
});

// --- Cliente 2: El Jugador 2 ---
const client2 = io(URL, { autoConnect: false });

client2.on("connect", () => {
  console.log(`[CLIENT 2] Conectado: ${client2.id}`);
  console.log(`[CLIENT 2] Enviando 'player_join' como Jugador2...`);
  client2.emit("player_join", {
    username: "Jugador2",
    playerId: player2_Id,
  });
});

client2.on("joined_lobby", (data) => {
  console.log(`[CLIENT 2] ✅ Evento 'joined_lobby' recibido.`);
  console.log(`[CLIENT 2] Soy host: ${data.isHost}`); // Debería ser false
  console.log(`[CLIENT 2] Jugadores en sala: ${data.players.length}`); // Debería ser 2
});

client2.on("disconnect", () => {
  console.log(`[CLIENT 2] ❌ Desconectado intencionalmente.`);
});

// --- Flujo de la Prueba ---

async function runTest() {
  // 1. Conectar Host
  client1.connect();
  await sleep(1000); // Esperar 1 seg

  // 2. Conectar Jugador 2
  client2.connect();
  await sleep(1000); // Esperar 1 seg

  // 3. Desconectar Jugador 2
  console.log(`[TEST] Desconectando a Jugador 2...`);
  client2.disconnect();
  await sleep(1000); // Esperar 1 seg (El server debería notificar a Client 1)

  // 4. Reconectar Jugador 2
  console.log(`[TEST] Reconectando a Jugador 2...`);
  client2.connect(); // Se reconectará y enviará 'player_join' automáticamente
  await sleep(1000);

  // 5. Finalizar prueba
  console.log("[TEST] Prueba completada.");
  client1.disconnect();
  client2.disconnect();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

runTest();
