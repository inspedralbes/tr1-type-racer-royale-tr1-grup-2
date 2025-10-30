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
  communicationManager.connect();

  communicationManager.on("joined_lobby", (payload) => {
    console.log("Successfully joined lobby:", payload);
    emit("registrado", payload);
  });

  const newPlayerId = generatePlayerId();

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
      <label for="nomJugador">Nom de l'usuari:</label>
      <input
        id="nomJugador"
        type="text"
        v-model="nomJugador"
        placeholder="Exemple: Paco"
      />
      <button @click="connectarAlServidor">Entra al Lobby</button>
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
</style>
