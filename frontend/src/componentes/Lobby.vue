<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import communicationManager from "../services/communicationManager";

const players = ref([]);
const gameStarted = ref(false);
const gameState = ref(null);

const props = defineProps({
  lobbyState: {
    type: Object,
    required: true,
  },
});

const joEsticLlest = ref(false);

// 🔹 Cuando el jugador marca que está listo
function marcarComLlest() {
  if (joEsticLlest.value) return; // evita múltiples clics
  joEsticLlest.value = true;

  console.log("📤 Enviando player_ready al servidor:", {
    playerId: props.lobbyState.playerId,
    isReady: true,
  });

  communicationManager.emit("player_ready", {
    playerId: props.lobbyState.playerId,
    isReady: true,
  });
}

// 🔹 El host solo puede iniciar si todos (menos él) están listos
const allPlayersReady = computed(() => {
  const allPlayers = props.lobbyState?.players || [];
  if (allPlayers.length < 2) return false;

  return allPlayers.every((player, index) => {
    if (index === 0) return true; // el host no necesita ready
    return player.isReady;
  });
});

// 🔹 El host inicia el juego
function iniciarJuego() {
  communicationManager.emit("start_game", {
    roomId: props.lobbyState.roomId,
    playerId: props.lobbyState.playerId,
  });
}

onMounted(() => {
  players.value = props.lobbyState.players;

  // 🔸 Escuchar actualizaciones del lobby (cuando alguien se marca listo)
  communicationManager.on("joined_lobby", (data) => {
    console.log("📥 joined_lobby recibido:", data);
    players.value = data.players;
    props.lobbyState.players = data.players; // sincroniza el estado padre
  });

  // 🔸 Escuchar cuando la partida comienza
  communicationManager.on("game_started", (data) => {
    console.log("🚀 game_started recibido:", data);
    gameStarted.value = true;
    gameState.value = data;
    players.value = data.players;
  });
});

onUnmounted(() => {
  communicationManager.off("joined_lobby");
  communicationManager.off("game_started");
});
</script>

<template>
  <div id="contenedor-juego">
    <div class="vista-container" v-if="!gameStarted">
      <h1>Lobby de la Sala: {{ lobbyState.roomId }}</h1>

      <h2>Jugadores Conectados:</h2>
      <ul>
        <li v-for="(jugador, index) in players" :key="jugador.playerId">
          {{ jugador.username }}
          <span v-if="index > 0">
            - {{ jugador.isReady ? "Listo ✅" : "No listo ❌" }}
          </span>
        </li>
      </ul>

      <button
        v-if="!lobbyState.isHost"
        @click="marcarComLlest"
        :disabled="joEsticLlest"
      >
        Estic llest
      </button>

      <button
        v-if="lobbyState.isHost"
        @click="iniciarJuego"
        :disabled="!allPlayersReady"
      >
        Comença la partida
      </button>

      <p v-if="lobbyState.isHost && !allPlayersReady">
        🕓 Tots els jugadors han d'estar llestos per començar.
      </p>
    </div>

    <div class="vista-container" v-else>
      <h1>🎮 Partida Iniciada!</h1>
      <h2>Jugadores:</h2>
      <ul>
        <li v-for="p in players" :key="p.playerId">
          {{ p.username }} - Palabras completadas: {{ p.completedWords || 0 }}
        </li>
      </ul>
    </div>
  </div>
</template>
