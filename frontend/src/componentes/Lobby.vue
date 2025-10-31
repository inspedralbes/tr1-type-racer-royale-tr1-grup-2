<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import communicationManager from '../services/communicationManager';

const players = ref([]);
const gameStarted = ref(false);
const gameState = ref(null); // Estado inicial de la partida

const props = defineProps({
  lobbyState: {
    type: Object,
    required: true
  }
});

const joEsticLlest = ref(false);

function marcarComLlest() {
  joEsticLlest.value = true;
  communicationManager.emit('player_ready', {
    playerId: props.lobbyState.playerId,
    isReady: true
  });
}

const allPlayersReady = computed(() => {
  if (!props.lobbyState || !props.lobbyState.players || props.lobbyState.players.length < 2) {
    return false;
  }
  return props.lobbyState.players.every((player, index) => {
    if (index === 0) return true; // Host no necesita ready
    return player.isReady;
  });
});

function iniciarJuego() {
  communicationManager.emit('start_game', {
    roomId: props.lobbyState.roomId,
    playerId: props.lobbyState.playerId
  });
}

onMounted(() => {
  players.value = props.lobbyState.players;

  communicationManager.on("joined_lobby", (data) => {
    console.log("📥 joined_lobby recibido:", data);
    players.value = data.players;
  });

  // Escuchar cuando la partida comienza
  communicationManager.on("game_started", (data) => {
    console.log("🚀 game_started recibido:", data);
    gameStarted.value = true;
    gameState.value = data;
    players.value = data.players;
    // Aquí puedes cambiar de vista o activar la UI del juego
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
            - {{ jugador.isReady ? 'Listo' : 'No listo' }}
          </span>
        </li>
      </ul>

      <button v-if="!lobbyState.isHost" @click="marcarComLlest" :disabled="joEsticLlest">
        Estic llest
      </button>
      
      <button v-if="lobbyState.isHost" @click="iniciarJuego" :disabled="!allPlayersReady">
        Comença la partida
      </button>
      <p v-if="lobbyState.isHost && !allPlayersReady">
        Tots els jugadors han d'estar llestos per començar.
      </p>
    </div>

    <div class="vista-container" v-else>
      <h1>Partida Iniciada!</h1>
      <h2>Jugadores:</h2>
      <ul>
        <li v-for="p in players" :key="p.playerId">
          {{ p.username }} - Palabras completadas: {{ p.completedWords }}
        </li>
      </ul>
      <!-- Aquí puedes añadir la UI del juego real -->
    </div>
  </div>
</template>
