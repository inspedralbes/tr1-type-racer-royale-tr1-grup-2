<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import communicationManager from "../services/communicationManager";
import GameScreen from "./interfazJuego.vue";

const showGameScreen = ref(false);
const players = ref([]);

// Recibimos el estado completo del lobby desde App.vue
const props = defineProps({
  room: {
    type: Object,
    required: true,
  },
});

// 🔹 Solo el host puede iniciar la partida si hay al menos 2 jugadores
const canStartGame = computed(() => players.value.length >= 2);

// 🔹 Función para iniciar el juego
function iniciarJuego() {
  console.log("⏳ El host inicia la partida...");

  communicationManager.emit("start_game_signal", {
    roomId: props.room.roomId,
    hostId: props.room.playerId,
  });
}

// 🔹 Montamos los listeners de socket
onMounted(() => {
  // Inicializamos la lista de jugadores
  players.value = [];

  // Escuchar cuando un jugador se une
  communicationManager.on("joined_lobby", (data) => {
    console.log("📥 joined_lobby recibido:", data);

    // Solo actualizar si es la misma sala
    if (data.roomId === props.room.roomId) {
      players.value = data.players;
    }
  });

  communicationManager.on("start_game_signal", () => {
    showGameScreen.value = true;
  });
});

// Limpiar listeners al desmontar
onUnmounted(() => {
  communicationManager.off("joined_lobby");
  communicationManager.off("start_game_signal");
});
</script>

<template>
  <div v-if="!showGameScreen">
    <h1>Lobby de la Sala: {{ room.roomId }}</h1>

    <h2>Jugadores Conectados:</h2>
    <ul>
      <li v-for="jugador in players" :key="jugador.playerId">
        {{ jugador.username }}
      </li>
    </ul>

    <!-- Botón solo visible para el host -->
    <button
      v-if="room.isHost"
      @click="iniciarJuego"
      :disabled="!canStartGame"
    >
      Comenzar Partida
    </button>

    <p v-if="room.isHost && !canStartGame" style="color: orange;">
      🕓 Se necesitan al menos 2 jugadores para comenzar.
    </p>
  </div>

  <div v-else>
    <GameScreen
      :player-id="room.playerId"
      :room-id="room.roomId"
    />
  </div>
</template>

<style scoped>
ul {
  list-style: none;
  padding: 0;
}

li {
  margin: 5px 0;
}
button {
  margin-top: 10px;
  padding: 8px 12px;
  border-radius: 6px;
  background-color: #4caf50;
  color: white;
  border: none;
  cursor: pointer;
}

button:disabled {
  background-color: #aaa;
  cursor: not-allowed;
}
</style>
