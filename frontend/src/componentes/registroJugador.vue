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

<!--
Emite el mensaje cuando la sala esta llena
-->
      <p v-if="errorMensaje" class="mensaje-error">{{ errorMensaje }}</p>
      <label for="nomJugador">Nom de l'usuari:</label>
      <input
        id="nomJugador"
        type="text"
        v-model="nomJugador"
        placeholder="Exemple: Paco"
      />

<!--
Boton que te manda al lobby
-->
      <button @click="connectarAlServidor">Entra al Lobby</button>
      <p v-if="errorMessage" style="color: red;">{{ errorMessage }}</p>
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
  margin-bottom: 30px;
  font-size: 32px;
  color: #ff3333;
  text-shadow: 1px 1px 2px black;
}

label {
  display: block;
  font-size: 18px;
  margin-bottom: 10px;
  color: #ff9999;
}

input[type="text"] {
  font-size: 20px;
  width: 100%;
  padding: 12px;
  border-radius: 6px;
  border: none;
  background-color: #990000;
  color: #ffe6e6;
  text-align: center;
  margin-bottom: 25px;
  box-shadow: inset 0 0 5px rgba(255, 0, 0, 0.4);
}

input::placeholder {
  color: #ffcccc;
}

button {
  background-color: #660000;
  color: #ffe6e6;
  border: none;
  padding: 12px 24px;
  font-size: 18px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  box-shadow: 0 0 10px rgba(255, 0, 0, 0.3);
}

button:hover {
  background-color: #990000;
}

.mensaje-error {
  color: white;
  font-weight: bold;
  margin-bottom: 20px;
}

</style>
