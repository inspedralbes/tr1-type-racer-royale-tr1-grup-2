<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import socket from "@/servicios/socket.js";

const listaEntera = ref([]);
const palabraUser = ref("");

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
function enviarPalabra(word, isCorrect, completedWords, playerId, roomId) {
  const data = {
    word,
    isCorrect,
    completedWords,
    playerId,
    roomId,
  };
  socket.emit("word_typed", data);
}
</script>
<template>
  <div id="contenedor-juego">
    <ul>
      <li v-for="(palabra, index) in listaEntera" :key="index">
        {{ palabra }}
      </li>
    </ul>

    <div id="contenedor-mesa">
      <button class="letras"></button>

      <!-- <span>prueba</span> -->
    </div>
    <div class="contenedor-texto">
      <input
        type="text"
        class="text-input"
        v-model="palabraUser"
        placeholder="Comença a escriure..."
      />
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
}
</style>
