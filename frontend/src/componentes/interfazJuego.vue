<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import communicationManager from "../services/CommunicationManager.js"; 
import pantallaFinal from "./pantallaFinal.vue";
import { playerName, playerId } from "../logic/globalState.js";

// 🟩 Variables para manejar la pantalla final
const mostrarPantallaFinal = ref(false);
const ganador = ref("");

// 🟩 Variables reactivas
const listaEntera = ref([]);
const palabraUser = ref("");
const completedWords = ref(0);
const errorCount = ref(0);
const palabraActualIndex = ref(0);
const palabrasCompletadasEnBloque = ref(0);
const palabraInvalida = ref(false);
const playerIdActual = playerId.value;   // Cambiar dinámicamente si lo tienes desde login
// const roomId = ref("room-abc");
const playerNameActual = playerName.value;       // Cambiar dinámicamente si lo tienes desde lobby

const emit = defineEmits(['juego-finalizado'])

const props = defineProps({
  jugador: {
    type: Object,
    required: true
  },
  room: {
    type: Object,
    required: true,
  },
});

const roomId = ref(props.room.roomId);

// 🟦 FUNCIONES DE SOCKET ADAPTADAS A COMMUNICATION MANAGER


// FUNCION QUE MANEJA LA ACTUALIZACION DE PALABRAS DEL JUGADOR
function onUpdatePlayerWords(msg) {
  const { playerId: jugador, remainingWords, status } = msg.data;

  console.log("📤 playerId front:", playerId.value, typeof playerId.value);
console.log("📥 playerId backend:", jugador, typeof jugador);

  if (jugador === playerId.value) {
    console.log("🔴 ANTES - listaEntera:", listaEntera.value);
    console.log("🔴 NUEVAS remainingWords:", remainingWords);
    listaEntera.value = remainingWords;
    console.log("🔴 DESPUÉS - listaEntera:", listaEntera.value);
    console.log("🔤 Palabras status actualizadas:", status);
    if (status === "finished") {
      ganador.value = playerNameActual || playerIdActual;
      emit('juego-finalizado', ganador.value);
      console.log(`🎉 Has terminado todas las palabras. Eres el ganador: ${ganador.value}`);
    }
  }
}


// FUNCION QUE MANEJA LA ACTUALIZACION DEL PROGRESO DE TODOS LOS JUGADORES
function onUpdateProgress(msg) {
  const { players } = msg.data;
  players.forEach((p) => {
    console.log(`Jugador ${p.id}: ${p.completedWords} palabras completadas, estado: ${p.status}`);
  });

  const ganadorJugador = players.find(p => p.status === "finished");
  if (ganadorJugador) {
    ganador.value = ganadorJugador.username;
    emit('juego-finalizado', ganador.value);
    console.log(`🎉 La partida terminó. Ganador: ${ganadorJugador.playerId}`);
  }
}



// 🟩 MOUNT / UNMOUNT
onMounted(() => {
  // Conectar socket
  communicationManager.connect();

  // 🔹 Fetch palabras iniciales usando endpoint dinámico
  const count = 10; 
  const payload = {
    roomId: roomId.value,
    playerId: playerId.value,
    playerName: playerName.value, 
    count,
  };

  fetch("/palabras/words", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
    .then((response) => {
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
      return response.json();
    })
    .then((data) => {
      console.log("✅ Palabras recibidas:", data);
      listaEntera.value = data.data.initialWords;
    })
    .catch((error) => {
      console.error("❌ Hubo un error al obtener las palabras:", error);
    });


  // Escuchar eventos del servidor
  communicationManager.on("update_player_words", onUpdatePlayerWords);
  communicationManager.on("update_progress", onUpdateProgress);
});


onUnmounted(() => {
  // Desregistrar eventos
  communicationManager.off("update_player_words", onUpdatePlayerWords);
  communicationManager.off("update_progress", onUpdateProgress);

  // Desconectar socket
  communicationManager.disconnect();
});


// 🧩 FUNCION QUE VALIDA SI CADA CARÁCTER ESTA BIEN ESCRITO
function validarInput() {
  const palabraEscrita = palabraUser.value;
  const objetivo = palabraObjetivo.value;
  if (!objetivo) return true;

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
      palabraInvalida.value = true;
    }
  } else {
    palabraInvalida.value = false;
  }
  return esValidaAhora;
}

// 🧠 MANEJA LA PULSACIÓN DE LA TECLA ESPACIO
function onInputKeyDown(event) {
  if (event.key === " " && palabraUser.value.length > 0) {
    event.preventDefault();

    if (palabraUser.value === palabraObjetivo.value) {
      completedWords.value++;
     enviarPalabra(palabraUser.value);
      
    } else {
      console.warn("Palabra incorrecta. Errores:", errorCount.value);
    }
    palabraUser.value = "";
  }
}

// 🛡️ Bloquea pegado
function onInputPaste(event) {
  event.preventDefault();
}

//
// FUNCION QUE ENVIA LA PALABRA COMPLETADA AL SERVIDOR
//
function enviarPalabra(palabraCompletada) {
  const payload = {
    wordId: 0,
    word: palabraCompletada,
    completedWords: completedWords.value,
    errorCount: errorCount.value,
    playerId: playerId.value,
    roomId: roomId.value,
  };

  communicationManager.emit("word_typed", { data: payload });
  console.log("📤 Datos enviados al servidor:", payload);
}

// 🧮 Computadas
const palabrasEnVista = computed(() => {
  if (!Array.isArray(listaEntera.value)) return [];
  // 🔹 SIEMPRE muestra las primeras 5 palabras del array
  return listaEntera.value.slice(0, 5);
});


const palabraObjetivo = computed(() => {
  // 🔹 La palabra objetivo es siempre la primera del array que viene del servidor
  return palabrasEnVista.value.length > 0 ? palabrasEnVista.value[0] : "";
});

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
