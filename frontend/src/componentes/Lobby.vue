<script setup>
import { ref, computed, watchEffect, onMounted } from "vue";
import communicationManager from "../services/communicationManager";

const props = defineProps({
  lobbyState: {
    type: Object,
    required: true,
  },
});

// Estado local reactivo para los jugadores
const jugadores = ref([...props.lobbyState.players]);

// Estado local del jugador actual
const estoyPreparado = ref(false);

// Emitir evento al backend para cambiar estado de preparación
function togglePreparado() {
  estoyPreparado.value = !estoyPreparado.value;
  console.log(
    "Emit player_ready:",
    props.lobbyState.playerId,
    estoyPreparado.value
  );
  communicationManager.emit("player_ready", {
    playerId: props.lobbyState.playerId,
    isReady: estoyPreparado.value,
  });
}

// Sincronizar cambios en props.lobbyState.players
watchEffect(() => {
  jugadores.value = [...props.lobbyState.players];
});

// Escuchar actualizaciones desde el backend
onMounted(() => {
  communicationManager.on("player_list_updated", (data) => {
    jugadores.value = [...data.players];
  });
});

// Verificar si todos los jugadores (excepto el host) están listos
const todosListos = computed(() => {
  return jugadores.value.every((jugador, index) => {
    if (index === 0) return true;
    return jugador.isReady;
  });
});

function iniciarJuego() {
  communicationManager.emit("start_game", {
    roomId: props.lobbyState.roomId,
    playerId: props.lobbyState.playerId,
  });
}
</script>

<template>
  <div id="contenedor-juego">
    <div class="vista-container">
      <h1>Lobby de la Sala: {{ lobbyState.roomId }}</h1>

      <h2>Jugadores Conectados:</h2>
      <ul>
        <li v-for="jugador in jugadores" :key="jugador.playerId">
          {{ jugador.username }}
          <span
            class="estado-jugador"
            :class="{ 'preparado': jugador.isReady, 'no-preparado': !jugador.isReady }"
          >
             — {{ jugador.isReady ? "Preparat" : "No preparat" }}
          </span>
        </li>
      </ul>

      <!-- Botón para cambiar tu estado -->
      <div>
        <button @click="togglePreparado">
          {{ estoyPreparado ? "Cancel·la preparació" : "Estic preparat" }}
        </button>
      </div>

      <!-- Botón para iniciar partida solo si todos están listos -->
      <button
        v-if="lobbyState.isHost"
        :disabled="!todosListos"
        @click="iniciarJuego"
      >
        Comença la partida
      </button>
    </div>
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
