<script setup>
import { ref, onMounted } from "vue";
import RegistroJugador from "./componentes/registroJugador.vue";
import Lobby from "./componentes/Lobby.vue";
import Juego from "./componentes/interfazJuego.vue"; // tu componente del juego
import PantallaFinal from "./componentes/pantallaFinal.vue";
import communicationManager from "./services/communicationManager";

const vistaActual = ref("registroJugador"); // "registroJugador" | "lobby" | "juego" | "final"
const lobbyState = ref(null);
const gameState = ref(null);
const ganador = ref(""); 
const playerId = ref(""); // se generará en RegistroJugador
const roomId = ref(""); // se genera o recibe en RegistroJugador

// RegistroJugador → Lobby
function handleRegistration(payload) {
  lobbyState.value = payload;
  playerId.value = payload.playerId;
  roomId.value = payload.roomId;
  vistaActual.value = "lobby";
}

// Lobby → Juego
function handleGameStarted(payload) {
  gameState.value = payload;
  vistaActual.value = "juego";
}

// Actualización del host
function handleHostChanged(payload) {
  if (lobbyState.value) {
    lobbyState.value.isHost = payload.isHost;
    lobbyState.value.players = payload.players;
  }
}

// Actualización de lista de jugadores
function handlePlayerListUpdate(payload) {
  if (lobbyState.value) {
    lobbyState.value.players = payload.players;
  }
}

// Juego → PantallaFinal
onMounted(() => {
  communicationManager.on("game_started", handleGameStarted);
  communicationManager.on("host_changed", handleHostChanged);
  communicationManager.on("player_list_updated", handlePlayerListUpdate);

  communicationManager.on("game_finished", (payload) => {
    ganador.value = payload.winnerName || payload.winnerId;
    vistaActual.value = "final";
  });
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
  />

  <pantallaFinal
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
