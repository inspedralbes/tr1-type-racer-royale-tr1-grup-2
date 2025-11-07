<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import RegistroJugador from "./componentes/registroJugador.vue";
import Lobby from "./componentes/Lobby.vue";
import Juego from "./componentes/interfazJuego.vue";
import PantallaFinal from "./componentes/pantallaFinal.vue";
import PuertaGaraje from "./componentes/puertaGaraje.vue";
import communicationManager from "./services/communicationManager";
// import InterfazJuego from "./componentes/interfazJuego.vue"; // Ya estaba importado arriba

const vistaActual = ref("registroJugador"); // registroJugador | puertaGaraje | lobby | juego | final
const lobbyState = ref(null);
const gameState = ref({
  players: [],
  remainingWords: [],
});
const ganador = ref("");
const playerId = ref("");
const roomId = ref("");
const username = ref("");
const isZoomed = ref(false);

// 🔹 RegistroJugador → PuertaGaraje
function handleRegistration(name) {
  username.value = name;
  isZoomed.value = true;
  // AHORA NO CAMBIAMOS DE VISTA. El registro desaparece por su v-if
  // y su propia animación CSS.
  vistaActual.value = "lobbyTransition"; // Un estado intermedio
}

// 🔹 PuertaGaraje → Lobby
function handleEnterGarage(payload) {
  lobbyState.value = payload;
  playerId.value = payload.playerId;
  roomId.value = payload.roomId;
  vistaActual.value = "lobby";
}

// ... (El resto de tu <script setup> está bien) ...
function handleGameStarted(payload) {
  console.log("🎮 Game started:", payload);
  gameState.value = payload;
  vistaActual.value = "juego";
}

function handleGameFinished(payload) {
  console.log("🏁 Game finished:", payload);
  ganador.value = payload.winnerName || payload.winnerId;
  vistaActual.value = "final";
}

function handlePlayerListUpdate(payload) {
  if (vistaActual.value === "lobby" && lobbyState.value) {
    console.log("👥 Actualización lista jugadores:", payload);
    lobbyState.value.players = payload.players;
  }
}

function handleUpdatePlayerWords(payload) {
  if (vistaActual.value !== "juego") return;

  const { playerId: updatedPlayerId, remainingWords, status } = payload.data;
  console.log("🔤 update_player_words recibido:", payload.data);

  const existingPlayer = gameState.value.players.find(
    (p) => p.id === updatedPlayerId
  );

  if (existingPlayer) {
    existingPlayer.remainingWords = remainingWords;
    existingPlayer.status = status;
  } else {
    gameState.value.players.push({
      id: updatedPlayerId,
      remainingWords,
      status,
    });
  }
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
  <PuertaGaraje
    :is-zoomed="isZoomed"
    :username="username"
    @enter-garage="handleEnterGarage"
  />

  <div class="ui-container">
    <RegistroJugador
      v-if="vistaActual === 'registroJugador'"
      @registrado="handleRegistration"
    />

    <Lobby v-if="vistaActual === 'lobby'" :lobby-state="lobbyState" />

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
  </div>
</template>

<style>
/* El contenedor de la UI (formularios, lobby, etc.) */
.ui-container {
  /* Posicionamiento absoluto para superponerlo */
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;

  /* Para centrar el contenido (el formulario de registro) */
  display: flex;
  align-items: center;
  justify-content: center;

  /* Z-Index ALTO para que esté ENCIMA del garaje */
  z-index: 10;

  /* Evita que el div bloquee clics al garaje cuando esté vacío */
  pointer-events: none;
}

/* Los hijos del contenedor (Registro, Lobby) SÍ deben ser clickables */
.ui-container > * {
  pointer-events: auto;
}
</style>
