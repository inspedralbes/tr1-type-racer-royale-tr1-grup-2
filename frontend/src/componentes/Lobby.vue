<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import communicationManager from "../services/communicationManager";
import GameScreen from "./InterfazJuego.vue"; // Pantalla de juego

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

<style scoped>
#contenedor-juego {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background: linear-gradient(to bottom, #000000, #330000);
  font-family: "Courier New", Courier, monospace;
  color: #ffe6e6;
}

.vista-container {
  background-color: rgba(0, 0, 0, 0.7);
  padding: 40px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 0 20px rgba(255, 0, 0, 0.6);
  width: 90%;
  max-width: 500px;
}

h1 {
  margin-bottom: 20px;
  font-size: 32px;
  color: #ff3333;
  text-shadow: 1px 1px 2px black;
}

h2 {
  margin-bottom: 15px;
  font-size: 24px;
  color: #ff9999;
}

ul {
  list-style: none;
  padding: 0;
  margin-bottom: 25px;
}

li {
  background-color: #660000;
  margin: 6px 0;
  padding: 10px;
  border-radius: 6px;
  color: #ffe6e6;
  box-shadow: 0 0 5px rgba(255, 0, 0, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.estado-jugador {
  font-size: 0.85em;
  color: #bbb;
  margin-left: 8px;
  font-weight: bold;
}

.preparado {
  color: green;
}

.no-preparado {
  color: black;
}

button {
  background-color: #990000;
  color: #ffe6e6;
  border: none;
  padding: 12px 24px;
  font-size: 18px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  box-shadow: 0 0 10px rgba(255, 0, 0, 0.3);
  margin-top: 10px;
}

button:hover {
  background-color: #cc0000;
}

button:disabled {
  background-color: #660000;
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
