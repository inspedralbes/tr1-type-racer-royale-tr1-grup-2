<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import socket from "@/servicios/socket.js";

// 🟩 EDSO – 2025-10-30: Imports nuevos
import pantallaFinal from './pantallaFinal.vue'

// 🟩 EDSO – 2025-10-30: Variables para manejar la pantalla final
const mostrarPantallaFinal = ref(false)
const ganador = ref('')

//Variables reactivas
const listaEntera = ref([]);
const palabraUser = ref("");
const completedWords = ref(0);
const errorCount = ref(0);
const palabraActualIndex = ref(0);
const palabrasCompletadasEnBloque = ref(0);
const palabraInvalida = ref(false);
const playerId = ref("player-123");
const roomId = ref("room-abc");

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
      listaEntera.value = data.data.initialWords;
      console.log("Lista entera cargada correctamente.", listaEntera.value);
    })
    .catch((error) => {
      console.error("Hubo un error al reiniciar el juego:", error);
    });

///// ESTA FUNCION QUEDA POR REVISAR

  socket.on("game_started", (listaPalabras) => {
    console.log("socket -> game_started payload:", listaPalabras);
    if (listaPalabras && Array.isArray(listaPalabras.initialWords)) {
      listaEntera.value = listaPalabras.initialWords;
      palabraActualIndex.value = 0;
      completedWords.value = 0;
      errorCount.value = 0;
      palabraUser.value = "";
    }
  });

socket.on("update_player_words", (msg) => {
  // console.log("Jugador desde servidor:", jugador, "Jugador local:", playerId.value);

  console.log("🧩 [update_player_words] recibido:", msg);

  const { playerId: jugador, remainingWords, status} = msg.data;

  // Si el mensaje es del jugador actual
  if (jugador === playerId.value) {
    listaEntera.value = remainingWords;

    // 🟢 EDSO – 2025-10-30: Si el jugador termina, mostrar pantalla final
    if (status === "finished") {
      ganador.value = jugador; // podrías usar el nombre real si lo tienes
      mostrarPantallaFinal.value = true;
      console.log("🎉 Jugador ha terminado. Mostrando pantalla final.");
    }
  }
});

  // 🟦 EDSO – 2025-10-30: Escucha el progreso general de todos los jugadores
  socket.on("update_progress", (msg) => {
    console.log("🌍 [update_progress] recibido:", msg);

    const { players } = msg.data;

    // Puedes mostrarlo en una tabla o UI si quieres
    players.forEach((p) => {
      console.log(`Jugador ${p.id}: ${p.completedWords} palabras completadas, estado: ${p.status}`);
    });
  });

  });

onUnmounted(() => {
  socket.off("game_started");
  socket.off("update_player_words");
  socket.off("update_progress");
});

// Validación carácter a carácter
function validarInput() {
  const palabraEscrita = palabraUser.value;
  const objetivo = palabraObjetivo.value;

  if (!objetivo) return true;

  // Lógica de validación
  let esValidaAhora = true;
  for (let i = 0; i < palabraEscrita.length; i++) {
    if (palabraEscrita[i] !== objetivo[i]) {
      esValidaAhora = false;
      break;
    }
  }

  if (!esValidaAhora) {
    if (!palabraInvalida.value) {
      errorCount.value++;
      console.warn("Error detectado en tiempo real. Total:", errorCount.value);
      palabraInvalida.value = true;
    }
  } else {
    palabraInvalida.value = false;
  }

  return esValidaAhora;
}

// Maneja la pulsación de tecla, específicamente el ESPACIO
function onInputKeyDown(event) {
  if (event.key === " " && palabraUser.value.length > 0) {
    event.preventDefault();

    if (palabraUser.value === palabraObjetivo.value) {
      completedWords.value++;

      // palabrasCompletadasEnBloque.value++;

      enviarPalabra(palabraUser.value);

      // if (palabrasCompletadasEnBloque.value === 5) {
      //   palabraActualIndex.value += 5;
      //   palabrasCompletadasEnBloque.value = 0;
      // }
    } else {
      console.warn("Palabra incorrecta. Errores:", errorCount.value);
    }

    palabraUser.value = "";
  }
}

// Previene que el usuario pueda pegar texto
function onInputPaste(event) {
  event.preventDefault();
}

// Enviar palabra al servidor via Socket.IO
function enviarPalabra(palabraCompletada) {
  const payload = {
    wordId: 0,
    word: palabraCompletada,
    completedWords: completedWords.value,
    errorCount: errorCount.value,
    playerId: playerId.value,
    roomId: roomId.value,
  };

  const dataParaServidor = {
    data: payload,
  };

  socket.emit("word_typed", dataParaServidor); // <--- ¡CAMBIO AQUÍ!
  console.log("Datos enviados al servidor:", dataParaServidor);
}

//Propiedades computadas
// Para las palabras que se muestren en pantalla (5 palabras)
const palabrasEnVista = computed(() => {
  if (!Array.isArray(listaEntera.value)) {
    return [];
  }

  return listaEntera.value.slice(
    palabraActualIndex.value,
    palabraActualIndex.value + 5
  );
});

// Palabra que el usuario debe escribir ahora
const palabraObjetivo = computed(() => {
  const indexObjetivo = palabrasCompletadasEnBloque.value;

  return palabrasEnVista.value.length > indexObjetivo
    ? palabrasEnVista.value[indexObjetivo]
    : "";
});

// Resultado de la validación carácter a carácter
const esValido = computed(() => validarInput());
</script>
<template>
  <pantallaFinal
  v-if="mostrarPantallaFinal"
  :winner="ganador"
  @go-home="mostrarPantallaFinal = false"
/>
  <div id="contenedor-juego">
    <ul class="lista-palabras">
      <li
        v-for="(palabra, index) in palabrasEnVista"
        :key="index + palabraActualIndex"
        :class="{
          'palabra-actual': index === palabrasCompletadasEnBloque,
          'palabra-completada-bloque': index < palabrasCompletadasEnBloque,
        }"
      >
        <template v-if="index >= palabrasCompletadasEnBloque">
          <template v-if="index === palabrasCompletadasEnBloque">
            <span class="escrita-correcta">{{
              esValido ? palabraUser : ""
            }}</span>
            <span class="restante">{{
              palabra.substring(palabraUser.length)
            }}</span>
          </template>

          <template v-else>
            <span class="restante">{{ palabra }}</span>
          </template>
        </template>
      </li>
    </ul>

    <div class="contenedor-texto">
      <input
        type="text"
        class="text-input"
        :class="{
          'input-error': !esValido && palabraUser.length > 0,
          'input-ok': esValido && palabraUser.length > 0,
        }"
        v-model="palabraUser"
        @keydown="onInputKeyDown"
        @paste="onInputPaste"
        :placeholder="
          palabraObjetivo
            ? `Escribe: ${palabraObjetivo}`
            : 'Cargando palabras...'
        "
        autofocus
      />
    </div>

    <div class="info-juego">
      <p>
        Palabras Completadas: <span>{{ completedWords }}</span>
      </p>
      <p>
        Errores:
        <span :class="{ 'error-count': errorCount > 0 }">{{ errorCount }}</span>
      </p>
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

.lista-palabras {
  list-style: none;
  padding: 0;
  margin-top: 20px;
  font-size: 28px;
  display: flex;
  gap: 15px;
  color: #ffffff;
  white-space: nowrap;
  justify-content: center;
}
.palabra-actual {
  color: #fff;
  font-weight: bold;
}
.escrita-correcta {
  color: yellowgreen;
  font-weight: bold;
}
.restante {
  color: #fff;
  font-weight: normal;
}

.input-error {
  border: 2px solid red !important;
  color: red !important;
}
.input-ok {
  border: 2px solid yellowgreen !important;
}
.info-juego {
  margin-top: 20px;
  color: #fff;
  font-size: 18px;
  display: flex;
  gap: 30px;
}
.error-count {
  color: red;
  font-weight: bold;
}
</style>
