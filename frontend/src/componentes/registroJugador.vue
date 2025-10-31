<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import communicationManager from "../services/communicationManager";

const emit = defineEmits(["registrado"]);
const nomJugador = ref("");
const errorMessage = ref("");

// Función para generar un ID de jugador simple
function generatePlayerId() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const randomLetter = letters[Math.floor(Math.random() * letters.length)];
  const randomNumber = Math.floor(100 + Math.random() * 900);
  return `${randomLetter}${randomNumber}`;
}

const handleJoinedLobby = (payload) => {
  console.log("Successfully joined lobby:", payload);
  emit("registrado", payload);
};

const handleJoinError = (payload) => {
  console.error("Join error:", payload.message);
  errorMessage.value = payload.message;
};

function connectarAlServidor() {
  errorMessage.value = ""; // Reset error message
  communicationManager.connect();
  
  const newPlayerId = generatePlayerId();

  communicationManager.emit("player_join", {
    username: nomJugador.value,
    playerId: newPlayerId,
  });
}

onMounted(() => {
  communicationManager.on("joined_lobby", handleJoinedLobby);
  communicationManager.on("join_error", handleJoinError);
});

onUnmounted(() => {
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
