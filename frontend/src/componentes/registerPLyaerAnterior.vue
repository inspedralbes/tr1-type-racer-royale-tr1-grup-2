<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import communicationManager from "../services/communicationManager";
import { playerName, playerId } from "../logic/globalState.js";

const emit = defineEmits(["registrado"]);
const nomJugador = ref("");
const errorMessage = ref("");

// Función para generar un ID de jugador simple


// NOS AHORRMAMOS ESTO AQUI YA QUE EN EL BACK YA MANEJAMOS LA GENERACIÓN DE ID 
// function generatePlayerId() {
//   const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
//   const randomLetter = letters[Math.floor(Math.random() * letters.length)];
//   const randomNumber = Math.floor(100 + Math.random() * 900);
//   return `${randomLetter}${randomNumber}`;
// }

const handleJoinedLobby = (payload) => {
  console.log("Successfully joined lobby:", payload);
  emit("registrado", payload);
};

const handlePlayerRegistered = (payload) => {
  console.log("Jugador registrado:", payload);
  playerId.value = payload.playerId;    // tu ID único
  playerName.value = payload.username;  // tu nombre
};

const handleJoinError = (payload) => {
  console.error("Join error:", payload.message);
  errorMessage.value = payload.message;
};

function connectarAlServidor() {
  errorMessage.value = ""; // Reset error message
  communicationManager.connect();
  
  communicationManager.emit("player_join", {
    username: nomJugador.value,
  });
}

onMounted(() => {
  communicationManager.on("player_registered", handlePlayerRegistered);
  communicationManager.on("joined_lobby", handleJoinedLobby);
  communicationManager.on("join_error", handleJoinError);
});

onUnmounted(() => {
  communicationManager.off("player_registered", handlePlayerRegistered);
  communicationManager.off("joined_lobby", handleJoinedLobby);
  communicationManager.off("join_error", handleJoinError);
});

</script>
<template>
  <div id="contenedor-juego">
    <div class="vista-container">
      <h1>Type Racer Royale</h1>
      <input type="text" v-model="nomJugador" placeholder="Exemple: Paco" />
      <button @click="connectarAlServidor">Entra al Lobby</button>
      <p v-if="errorMessage" style="color: red;">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<style scoped></style>
