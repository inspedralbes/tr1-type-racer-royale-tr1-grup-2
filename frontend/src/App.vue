<script setup>
import { ref, onMounted } from "vue";
import RegistroJugador from "./componentes/registroJugador.vue";
import Lobby from "./componentes/Lobby.vue";
import communicationManager from "./services/communicationManager";

const vistaActual = ref("registroJugador");
const lobbyState = ref(null);
const gameState = ref(null);

function handleRegistration(payload) {
  lobbyState.value = payload;
  vistaActual.value = "lobby";
}

function handleGameStarted(payload) {
  gameState.value = payload;
  vistaActual.value = "juego";
}

function handleHostChanged(payload) {
  if (lobbyState.value) {
    lobbyState.value.isHost = payload.isHost;
    lobbyState.value.players = payload.players;
  }
}

function handlePlayerListUpdate(payload) {
  if (lobbyState.value) {
    lobbyState.value.players = payload.players;
  }
}

onMounted(() => {
  communicationManager.on("game_started", handleGameStarted);
  communicationManager.on("host_changed", handleHostChanged);
  communicationManager.on("player_list_updated", handlePlayerListUpdate);
});
</script>

<template>
  <RegistroJugador
    v-if="vistaActual === 'registroJugador'"
    @registrado="handleRegistration"
  />
  <Lobby v-if="vistaActual === 'lobby'" :lobby-state="lobbyState" />
</template>

<style scoped></style>
