<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import socket from "@/servicios/socket.js";

const listaEntera = ref([]);
const palabraUser = ref("");
const completedWords = ref(0);
const playerId = ref(null);
const roomId = ref(null);

// Limpia una palabra (quita espacios y puntuación al inicio/final)
function cleanWord(raw) {
  return raw.trim().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
}

// Procesa una sola palabra completada
function processSingleWord(raw) {
  const word = cleanWord(raw);
  if (!word) return;

  completedWords.value += 1;

  // Llamamos a la función ya existente para enviar la palabra al servidor
  // marcar isCorrect como true por defecto; la verificación real la podrás añadir luego
  enviarPalabra(
    palabraUser.value,
    true,
    completedWords.value,
    playerId.value,
    roomId.value
  );
}

// Handler para keydown en el input
function onInputKeyDown(e) {
  if (
    e.code === "Space" ||
    e.key === " " ||
    e.key === "Spacebar" ||
    e.key === "Enter"
  ) {
    e.preventDefault();
    const text = palabraUser.value || "";
    const parts = text.trim().split(/\s+/).filter(Boolean);
    console.log("Parts to process:", palabraUser.value);

    if (parts.length === 0) {
      palabraUser.value = "";
      return;
    }

    for (let i = 0; i < parts.length; i++) {
      processSingleWord(parts[i]);
    }
    palabraUser.value = "";
  }
}

// manejo del paste para procesar inmediatamente sin esperar Space
function onInputPaste(e) {
  const paste = (e.clipboardData || window.clipboardData).getData("text");
  if (!paste) return;
  e.preventDefault();
  const parts = paste.trim().split(/\s+/).filter(Boolean);
  for (const p of parts) processSingleWord(p);
  palabraUser.value = "";
}

//Funcion para pillar las palabras iniciales del servidor
onMounted(() => {
  fetch("/palabras/words")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} `);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Palabras recibidas:", data);
      listaEntera.value = data;
    })
    .catch((error) => {
      console.error("Hubo un error al reiniciar el juego:", error);
    });

  socket.on("game_started", (listaPalabras) => {
    console.log("socket -> game_started payload:", listaPalabras);
    if (listaPalabras && Array.isArray(listaPalabras.initialWords)) {
      listaEntera.value = listaPalabras.initialWords;
    }
  });
});

onUnmounted(() => {
  socket.off("game_started");
});

//Funcion para enviar las palabras del usuario
function enviarPalabra(
  palabraUser,
  isCorrect,
  completedWordsCount,
  playerIdVal,
  roomIdVal
) {
  const data = {
    word: palabraUser.value,
    isCorrect,
    completedWords: completedWordsCount,
    playerId: playerIdVal,
    roomId: roomIdVal,
  };
  socket.emit("word_typed", data);
}
</script>
<template>
  <div id="contenedor-juego">
    <div class="contenedor-texto">
      <input
        type="text"
        class="text-input"
        v-model="palabraUser"
        @keydown="onInputKeyDown"
        @paste="onInputPaste"
        placeholder="Comença a escriure..."
      />
    </div>
    <ul>
      <li v-for="(palabra, index) in listaEntera" :key="index">
        {{ palabra }}
      </li>
    </ul>
    <div id="contenedor-mesa">
      <!-- <span>prueba</span> -->
    </div>
  </div>
</template>
<style scoped>
#contenedor-juego {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100vw;
  height: 100vh;
  padding: 20px;
  box-sizing: border-box;
  background-color: rgba(0, 0, 0, 0.5);
}

#contenedor-mesa {
  margin-top: 15%;
  background-image: url(../../public/assets/img/Mesa-sinfondo-nopixel.png);
  background-size: cover;
  display: flex;
  min-width: 1000px;
  min-height: 600px;
}

#contenedor-mesa span {
  color: white;
  font-size: 24px;
  align-self: center;
  margin: auto;
}

.contenedor-texto {
  margin-top: 50px;
}
.text-input {
  font-family: "Courier New", Courier, monospace;
  font-size: 20px;
  min-width: 500px;
  min-height: 30px;
  border-radius: 5px;
  text-align: center;
  border-color: rgba(137, 43, 226, 0);
  background-color: rgba(240, 248, 255, 0);
  color: wheat;
  position: relative;
  z-index: 5;
}
</style>
