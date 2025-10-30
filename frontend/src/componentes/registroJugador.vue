<script setup>
import { ref } from "vue";
import communicationManager from "../services/communicationManager";

const emit = defineEmits(["registrado"]);
const nomJugador = ref("");

// Función para generar un ID de jugador simple
function generatePlayerId() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const randomLetter = letters[Math.floor(Math.random() * letters.length)];
  const randomNumber = Math.floor(100 + Math.random() * 900);
  return `${randomLetter}${randomNumber}`;
}

function connectarAlServidor() {
  // 1. Conectar al servidor
  communicationManager.connect();

  // 2. Preparar un listener para cuando el servidor confirme que nos hemos unido
  communicationManager.on("joined_lobby", (payload) => {
    console.log("Successfully joined lobby:", payload);
    // 4. Emitir el evento al padre (App.vue) para cambiar de vista
    emit("registrado", payload);
  });

  const newPlayerId = generatePlayerId();

  // 3. Enviar la petición para unirse
  communicationManager.emit("player_join", {
    username: nomJugador.value,
    playerId: newPlayerId,
  });
}
</script>
<template>
  <div id="contenedor-juego">
    <div class="vista-container">
      <h1>Type Racer Royale</h1>
      <input type="text" v-model="nomJugador" placeholder="Exemple: Paco" />
      <button @click="connectarAlServidor">Entra al Lobby</button>
    </div>
  </div>
</template>

<style scoped></style>
