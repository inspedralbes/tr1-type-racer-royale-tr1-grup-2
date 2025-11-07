<!-- <script setup>
import { ref, onMounted, onUnmounted } from "vue";
import RegistroJugador from "./componentes/registroJugador.vue";
import Lobby from "./componentes/Lobby.vue";
import Juego from "./componentes/interfazJuego.vue";
import PantallaFinal from "./componentes/pantallaFinal.vue";
import PuertaGaraje from "./componentes/puertaGaraje.vue";
import communicationManager from "./services/communicationManager";
</script>

<template>
  <!-- <InterfazJuego>   </InterfazJuego> -->
<!-- <RegistroJugador
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
</style> -->
<script setup>
import { ref, onMounted } from "vue";
import communicationManager from "./services/communicationManager";
import RegistroJugador from "./componentes/registroJugador.vue";
import PantallaSalas from "./componentes/pantallaSalas.vue";
import Lobby from "./componentes/Lobby.vue";
import Juego from "./componentes/interfazJuego.vue";
import PantallaFinal from "./componentes/pantallaFinal.vue";

const vistaActual = ref("registro"); // registro | salas | lobby | juego | final
const jugador = ref(null);
const lobbyState = ref(null);
const roomSeleccionada = ref(null);
const ganador = ref(null);

// onMounted(() => {
//   communicationManager.on("joined_lobby_info", handleRoomJoined);
//   communicationManager.on("room_error", (err) => {
//     console.error("Error al unirse a sala:", err.message);
//   });
// });

// 🔹 Evento: jugador registrado
function onJugadorRegistrado(data) {
  jugador.value = data;
  vistaActual.value = "salas"; // vamos a PantallaSalas
}

// 🔹 Evento: jugador entra a sala
function onSalaSeleccionada(room) {
  roomSeleccionada.value = room;
  vistaActual.value = "lobby";
}

// 🔹 Evento: partida iniciada
function onJuegoIniciado(payload) {
  vistaActual.value = "juego";
}

// 🔹 Evento: juego terminado
function onJuegoFinalizado(winner) {
  ganador.value = winner;
  vistaActual.value = "final";
}

function handleGoHome() {
  try {
    communicationManager.reset(); // desconecta y limpia todo
  } catch (e) {
    console.error("Error al desconectar socket:", e);
  }

  console.log("🔹 Cambiando vistaActual a 'registro'");
  // Cambiar la vista al registro
  vistaActual.value = "registro";
  // Limpiar variables si quieres
  jugador.value = null;
  roomSeleccionada.value = null;
  ganador.value = null;
}

// FUNCIONES QUE MANEJAN EL CAMBIO DE PANTALLA CON SOCKETS
// function handleRoomJoined(lobbyData) {
//   console.log("🏠 Datos recibidos para el lobby:", lobbyData);
//   lobbyState.value = lobbyData;      // guardar info de sala
//   vistaActual.value = "lobby";       // cambiar vista automáticamente
// }
</script>

<template>
  <RegistroJugador
    v-if="vistaActual === 'registro'"
    @registrado="onJugadorRegistrado"
  />

  <PantallaSalas
    v-if="vistaActual === 'salas'"
    :jugador="jugador"
    @sala-seleccionada="onSalaSeleccionada"
  />

  <Lobby
    v-if="vistaActual === 'lobby'"
    :jugador="jugador"
    :room="roomSeleccionada"
    @juego-iniciado="onJuegoIniciado"
  />

  <Juego
    v-if="vistaActual === 'juego'"
    :jugador="jugador"
    :room="roomSeleccionada"
    @juego-finalizado="onJuegoFinalizado"
  />
  <p>Vista actual: {{ vistaActual }}</p>
  <PantallaFinal
    v-if="vistaActual === 'final'"
    :winner="ganador"
    @go-home="handleGoHome"
  />
</template>
