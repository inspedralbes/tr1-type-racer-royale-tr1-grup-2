<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import communicationManager from "../services/communicationManager";
import GameScreen from "./interfazJuego.vue"; // Pantalla de juego

const showGameScreen = ref(false);
const players = ref([]);

const props = defineProps({
  lobbyState: {
    type: Object,
    required: true,
  },
});

// 🔹 El host solo puede iniciar si hay al menos 2 jugadores
const canStartGame = computed(() => players.value.length >= 2);

// 🔹 Iniciar juego → montar la pantalla de juego
function iniciarJuego() {
  console.log("⏳ Host inicia la partida...");

  // Avisamos al servidor que la partida empieza
  communicationManager.emit("start_game_signal", {
    roomId: props.lobbyState.roomId,
    hostId: props.lobbyState.playerId,
  });
}


onMounted(() => {
  // Inicializar jugadores desde props
  players.value = props.lobbyState.players || [];

  // 🔸 Escuchar actualizaciones del lobby (nuevos jugadores)
  communicationManager.on("joined_lobby", (data) => {
    console.log("📥 joined_lobby recibido:", data);
    players.value = data.players;
  });

  communicationManager.on("start_game_signal", () => {
    showGameScreen.value = true; // Cambia la vista de todos los jugadores
  });
});

onUnmounted(() => {
  communicationManager.off("joined_lobby");
  communicationManager.off("start_game_signal");
});
</script>

<template>
  <div v-if="!showGameScreen">
    <h1>Lobby de la Sala: {{ lobbyState.roomId }}</h1>

    <h2>Jugadores Conectados:</h2>
    <ul>
      <li v-for="jugador in players" :key="jugador.playerId">
        {{ jugador.username }}
      </li>
    </ul>

    <button
      v-if="lobbyState.isHost"
      @click="iniciarJuego"
      :disabled="!canStartGame"
    >
      Comença la partida
    </button>

    <p v-if="lobbyState.isHost && !canStartGame">
      🕓 Es necesiten almenys 2 jugadors per començar.
    </p>
  </div>

  <div v-else>
    <!-- Monta la pantalla de juego (fetch de palabras se hace ahí) -->
    <GameScreen :playerId="lobbyState.playerId" :roomId="lobbyState.roomId" />
  </div>
</template>
