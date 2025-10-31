<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import RegistroJugador from "./componentes/registroJugador.vue";
import Lobby from "./componentes/Lobby.vue";
import Juego from "./componentes/interfazJuego.vue";
import PantallaFinal from "./componentes/pantallaFinal.vue";
import communicationManager from "./services/communicationManager";

const vistaActual = ref("registroJugador"); // registroJugador | lobby | juego | final
const lobbyState = ref(null);
const gameState = ref({
  players: [], // lista de jugadores
  remainingWords: [], // palabras del jugador actual
});
const ganador = ref("");
const playerId = ref("");
const roomId = ref("");

// 🔹 RegistroJugador → Lobby
function handleRegistration(payload) {
  lobbyState.value = payload;
  playerId.value = payload.playerId;
  roomId.value = payload.roomId;
  vistaActual.value = "lobby";
}

// 🔹 Lobby → Juego
function handleGameStarted(payload) {
  console.log("🎮 Game started:", payload);
  gameState.value = payload;
  vistaActual.value = "juego";
}

// 🔹 Fin del juego → Pantalla final
function handleGameFinished(payload) {
  console.log("🏁 Game finished:", payload);
  ganador.value = payload.winnerName || payload.winnerId;
  vistaActual.value = "final";
}

// 🔹 Actualizaciones del lobby
function handlePlayerListUpdate(payload) {
  if (vistaActual.value === "lobby" && lobbyState.value) {
    console.log("👥 Actualización lista jugadores:", payload);
    lobbyState.value.players = payload.players;
  }
}

// 🔹 Actualizaciones durante el juego
function handleUpdatePlayerWords(payload) {
  if (vistaActual.value !== "juego") return;

  const { playerId: updatedPlayerId, remainingWords, status } = payload.data;
  console.log("🔤 update_player_words recibido:", payload.data);

  // Actualiza solo al jugador que corresponde
  const existingPlayer = gameState.value.players.find(
    (p) => p.id === updatedPlayerId
  );

  if (existingPlayer) {
    existingPlayer.remainingWords = remainingWords;
    existingPlayer.status = status;
  } else {
    // Si no estaba, lo añade
    gameState.value.players.push({
      id: updatedPlayerId,
      remainingWords,
      status,
    });
  }

  // Si es el jugador actual, también actualiza su lista principal
  if (updatedPlayerId === playerId.value) {
    gameState.value.remainingWords = remainingWords;
  }
}

onMounted(() => {
  communicationManager.on("game_started", handleGameStarted);
  communicationManager.on("game_finished", handleGameFinished);
  communicationManager.on("player_list_updated", handlePlayerListUpdate);
  communicationManager.on("update_player_words", handleUpdatePlayerWords);
});

onUnmounted(() => {
  communicationManager.off("game_started", handleGameStarted);
  communicationManager.off("game_finished", handleGameFinished);
  communicationManager.off("player_list_updated", handlePlayerListUpdate);
  communicationManager.off("update_player_words", handleUpdatePlayerWords);
});
</script>

<template>
  <RegistroJugador
    v-if="vistaActual === 'registroJugador'"
    @registrado="handleRegistration"
  />

  <Lobby
    v-if="vistaActual === 'lobby'"
    :lobby-state="lobbyState"
  />

  <Juego
    v-if="vistaActual === 'juego'"
    :player-id="playerId"
    :room-id="roomId"
    :game-state="gameState"
  />

  <PantallaFinal
    v-if="vistaActual === 'final'"
    :winner="ganador"
    @go-home="vistaActual = 'registroJugador'"
  />
</template>

<style>
body {
  font-family: "Inter", sans-serif;
}
</style>
