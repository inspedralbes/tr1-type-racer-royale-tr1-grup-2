<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from "vue";
import communicationManager from "../services/CommunicationManager.js";
import { playerName, playerId } from "../logic/globalState.js";
import AnimacionJuego from "./interfazAnimacion.vue";

// Variables para manejar 3D / crupier / ambiente
const crupierState = ref("normal");
const dialogText = ref("Os doy la bienvenida a todos.");
const show2DUI = ref(false);
const animationDuration = ref(0);
const audioPlayer = ref(null);

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
const playerIdActual = playerId.value;
const playerNameActual = playerName.value;
const otrosJugadores = ref([]);
const comenzar = ref(false);

const emit = defineEmits(["juego-finalizado"]);

const props = defineProps({
  jugador: {
    type: Object,
    required: true,
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
      emit("juego-finalizado", ganador.value);
      console.log(
        `🎉 Has terminado todas las palabras. Eres el ganador: ${ganador.value}`
      );
    }
  }
}

//
function onUpdateProgress(msg) {
  const { players } = msg.data;
  otrosJugadores.value = [];

  let ganadorJugador = null;

  for (const p of players) {
    console.log(
      `Jugador ${p.id}: ${p.completedWords} palabras completadas, estado: ${p.status}`
    );

    if (p.id === playerId.value) {
      completedWords.value = p.completedWords;
    } else {
      otrosJugadores.value.push({
        id: p.id,
        name: p.username || `Player ${p.id.substring(0, 4)}`,
        completedWords: p.completedWords || 0,
      });
    }
    if (p.status === "finished") {
      ganadorJugador = p;
    }
  }

  if (ganadorJugador) {
    ganador.value = ganadorJugador.username;
    emit("juego-finalizado", ganador.value);
    console.log(`🎉 La partida terminó. Ganador: ${ganadorJugador.playerId}`);
  }
}

// 🟩 MOUNT / UNMOUNT
onMounted(() => {
  // Conectar socket
  communicationManager.connect(); // 🔹 Fetch palabras iniciales usando endpoint dinámico

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
    }); // Escuchar eventos del servidor

  communicationManager.on("update_player_words", onUpdatePlayerWords);
  communicationManager.on("update_progress", onUpdateProgress);
});

onUnmounted(() => {
  // Desregistrar eventos
  communicationManager.off("update_player_words", onUpdatePlayerWords);
  communicationManager.off("update_progress", onUpdateProgress); // Desconectar socket

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
      crupierState.value = "confundido";
    }
  } else {
    if (palabraInvalida.value) {
      crupierState.value = "normal";
    }
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

function empiezaJuego() {
  comenzar.value = true;
  console.log("El valor de mostrar es:", comenzar.value);
  if (audioPlayer.value) {
    audioPlayer.value.volume = 0.4;
    audioPlayer.value
      .play()
      .then(() => {
        console.log("Música de fondo iniciada por la interacción del usuario.");
      })
      .catch((error) => {
        console.error("Error al reproducir el audio después del clic:", error);
      });
  }
}

// 🧮 Computadas
const palabrasEnVista = computed(() => {
  if (!Array.isArray(listaEntera.value)) return []; // 🔹 SIEMPRE muestra las primeras 5 palabras del array
  return listaEntera.value.slice(0, 5);
});

const palabraObjetivo = computed(() => {
  // 🔹 La palabra objetivo es siempre la primera del array que viene del servidor
  return palabrasEnVista.value.length > 0 ? palabrasEnVista.value[0] : "";
});

const esValido = computed(() => validarInput());

// --- MANEJADORES DE EVENTO DE ANIMACIÓN 3D (TRAÍDO DEL ANTIGUO juego.vue) ---

/**
 * Captura la duración total de la animación 3D y programa la aparición de la UI 2D.
 */
const handleAnimationDuration = (durationInSeconds) => {
  animationDuration.value = durationInSeconds; // UI 2D (Crupier y juego) aparece 2 segundos antes del final.

  const delayBeforeEnd = 2;
  const delayMs = Math.max(100, (durationInSeconds - delayBeforeEnd) * 1000);

  setTimeout(() => {
    show2DUI.value = true; // nextTick para asegurar que la animación CSS se aplique.
    nextTick(() => {
      console.log("Crupier y Diálogo 2D/UI de juego mostrados con nextTick.");
    });
  }, delayMs);
};

/**
 * Se llama cuando el componente 3D emite 'animationFinished' (al final real).
 */
const handleAnimationFinished = () => {
  console.log("Animación 3D oficialmente terminada. El juego comienza.");
};

// 🧮 Computadas de Estética
const showConfusedImage = computed(() => crupierState.value === "confundido");
const showPowerupImage = computed(() => crupierState.value === "powerup");

const reboteClass = computed(() => ({
  "rebote-entrada": show2DUI.value,
}));

const slideInUpClass = computed(() => ({
  "slide-in-up": show2DUI.value,
}));
</script>

<template>
  <pantallaFinal
    v-if="mostrarPantallaFinal"
    :winner="ganador"
    @go-home="mostrarPantallaFinal = false"
  />
  <audio
    ref="audioPlayer"
    src="../../public/assets/sonido/musica_ambiente.mp3"
    loop
    preload="auto"
  ></audio>

  <div class="player-container-exterior" v-if="show2DUI">
    <div
      v-for="(jugador, index) in otrosJugadores"
      :key="jugador.id"
      class="other-player-stat"
      :class="`player-pos-${index}`"
    >
      <div class="player-name-chip">{{ jugador.name }}</div>

      <div class="player-stats-chip">
        <span> {{ jugador.completedWords }}</span>
      </div>
    </div>
  </div>

  <div class="bottom-ui-container" :class="slideInUpClass">
    <ul class="lista-palabras">
      <li
        v-for="(palabra, index) in palabrasEnVista"
        :key="index"
        :class="{ 'palabra-actual': index === 0 }"
      >
        <template v-if="index === 0">
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

    <div class="input-stats-row">
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
      <div class="stats-right">
        <p>
          <img src="/assets/img/iconos/ficha.png" alt="" />
          <span>{{ completedWords }}</span>
        </p>

        <p>
          <img src="/assets/img/iconos/calavera.jpg" alt="" />
          <span :class="{ 'error-count': errorCount > 0 }">{{
            errorCount
          }}</span>
        </p>
      </div>
    </div>
  </div>

  <div class="game-background">
    <AnimacionJuego
      @animationFinished="handleAnimationFinished"
      @animationDurationCalculated="handleAnimationDuration"
    />

    <div id="contenedor-juego">
      <div id="crupier-entero" :class="reboteClass">
        <div
          id="crupier-normal"
          :style="{ display: crupierState === 'normal' ? 'flex' : 'none' }"
        >
          <img
            src="/assets/img/crupier-normal_oficial.png"
            alt="Crupier Normal"
          />
        </div>

        <div
          id="crupier-confundido"
          :style="{ display: showConfusedImage ? 'flex' : 'none' }"
        >
          <img
            src="/assets/img/crupier-confundido_oficial.png"
            alt="Crupier Confundido"
          />
        </div>

        <div
          id="crupier-carta"
          :style="{ display: showPowerupImage ? 'flex' : 'none' }"
        >
          <img
            src="/assets/img/crupier-carta_oficial.png"
            alt="Crupier Carta"
          />
        </div>
      </div>

      <div class="input-dialog-container" :class="reboteClass" v-if="!comenzar">
        <div class="input__container">
          <div class="shadow__input"></div>

          <p style="font-size: 2.5rem; margin-top: 15px; padding: 0">
            {{ dialogText }}
          </p>

          <a
            @click="empiezaJuego()"
            class="siguiente"
            style="pointer-events: auto"
          >
            >
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Fuentes */

@font-face {
  font-family: Font1;
  src: url(../../public/assets/fuente/Stranger\ back\ in\ the\ Night.ttf);
}

@font-face {
  font-family: Font2;
  src: url(../../public/assets/fuente/macabre/The\ Macabre.otf)
    format("opentype");
}

/* ------------------------------------------------ */
/* --- ESTILOS DE FONDO Y ESTRUCTURA (CREEPY) --- */
/* ------------------------------------------------ */

.game-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #050505;
  z-index: 0;
  font-family: "Inter", sans-serif;
}

/* Contenedor principal de la UI 2D (por encima del 3D) */
#contenedor-juego {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 2;
}

/* ------------------------------------------------ */
/* --- ESTILOS DE UI DE JUEGO (SLIDE-IN-UP) --- */
/* ------------------------------------------------ */

.bottom-ui-container {
  position: fixed;
  bottom: 5vh;
  width: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 0;
  pointer-events: auto;
  z-index: 3;
  opacity: 0;
  transition: transform 0.8s cubic-bezier(0.23, 1, 0.32, 1),
    opacity 0.5s ease-out;
}

.bottom-ui-container.slide-in-up {
  transform: translateX(-50%) translateY(0);
  opacity: 1;
}

.bottom-ui-container img {
  width: 30px;
  margin-top: 5px;
}

.input-stats-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 900px;
  padding: 20px 30px;
  margin-top: 20px;
  box-sizing: border-box;
  border-radius: 12px;
  position: relative;
  z-index: 10;
  overflow: hidden;
  background: linear-gradient(
    to bottom,
    rgba(10, 0, 0, 0.9) 0%,
    rgba(20, 0, 0, 0.7) 70%,
    rgba(0, 0, 0, 0) 100%
  );

  border: 1px solid rgba(139, 90, 43, 0.4);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.7), 0 0 15px rgba(139, 90, 43, 0.3);
}

.input-stats-row::before {
  content: none;
}

.contenedor-texto {
  flex-grow: 1;
  display: flex;
  justify-content: flex-start;
  margin: 0;
}

.text-input {
  font-family: Font2;
  font-size: 40px;
  width: 350px;
  max-width: 350px;
  min-width: 250px;
  min-height: 30px;
  border-radius: 6px;
  text-align: center;
  border: 2px solid #8b5a2b;
  background-color: rgba(20, 5, 5, 0.9);
  color: #f0e68c;
  position: relative;
  z-index: 5;
  padding: 10px;
  box-shadow: inset 0 0 8px rgba(139, 90, 43, 0.6), 0 0 5px rgba(0, 0, 0, 0.5);
}

.input-error {
  border: 2px solid #ff4500 !important;
  color: #ffd700 !important;
  box-shadow: 0 0 8px rgba(255, 69, 0, 0.8), inset 0 0 8px rgba(255, 69, 0, 0.5);
}

.input-ok {
  border: 2px solid #32cd32 !important;
  box-shadow: 0 0 8px rgba(50, 205, 50, 0.6),
    inset 0 0 8px rgba(50, 205, 50, 0.4);
}

.stats-right {
  font-family: Font2;
  color: #f0e68c;
  font-size: 25px;
  white-space: nowrap;
  text-align: right;
  padding-left: 30px;
  text-shadow: 0 0 5px rgba(240, 230, 140, 0.3);
}

.stats-right p {
  margin: 5px 0;
}

.stats-right span {
  font-weight: bold;
}

.error-count {
  color: #ff4500;
  font-weight: bold;
  text-shadow: 0 0 8px rgba(255, 69, 0, 0.5);
}

.lista-palabras {
  list-style: none;
  padding: 30px 40px;
  margin-top: 0;
  margin-bottom: 20px;
  font-family: monospace;
  font-size: 28px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 250px;
  height: 370px;
  color: #333333;
  justify-content: flex-start;
  text-shadow: none;
  background-image: url(../../public/assets/img/carta.jpg);
  background-size: cover;
  border: 3px;
  border-radius: 15px;
  box-shadow: 6px 6px 12px rgba(0, 0, 0, 0.45);
  margin-left: auto;
  margin-right: auto;
  text-align: center;
  justify-content: center;
  filter: drop-shadow(0 0 15px rgba(0, 0, 0, 0.9)) brightness(0.7) sepia(0.2)
    hue-rotate(340deg) saturate(1.5);
}

.palabra-actual {
  color: #ffffff;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.6);
}

.escrita-correcta {
  color: #32cd32;
  font-weight: bold;
  text-shadow: 0 0 8px rgba(50, 205, 50, 0.5);
}

.restante {
  color: #555555;
  font-weight: normal;
}

/* ------------------------------------------------ */
/* --- AJUSTES DEL CRUPIER Y DIÁLOGO (CASINO CREEPY) --- */
/* ------------------------------------------------ */

#crupier-entero {
  position: fixed;
  left: 50%;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  z-index: 4;
  width: 100%;
  height: 100%;
  overflow: hidden;
  opacity: 0;
  transform: translateX(-50%) translateY(70vh);
  transition: opacity 0.5s ease-out 0.1s,
    transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.1s;
}

#crupier-entero.rebote-entrada {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

#crupier-entero img {
  max-height: 70vh;
  filter: drop-shadow(0 0 15px rgba(0, 0, 0, 0.9)) brightness(0.5) sepia(0.5)
    hue-rotate(340deg) saturate(1.5);
}

#crupier-normal,
#crupier-caarta {
  position: relative;
  height: 100%;
  width: 100%;
  justify-content: center;
}

.input-dialog-container {
  position: fixed;
  top: 25%;
  margin-left: 20%;
  padding-left: 30px;
  z-index: 3;
  opacity: 0;
  transform: translateY(calc(-50% + 70vh));
  transition: opacity 0.5s ease-out 0.1s,
    transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.1s;
  pointer-events: auto;
}

.input-dialog-container.rebote-entrada {
  opacity: 1;
  transform: translateY(-50%);
}

.input__container {
  position: relative;
  background: #330000;
  padding: 20px;
  border: 4px solid #8b5a2b;
  max-width: 350px;
  box-shadow: 8px 8px 0 #000;
  pointer-events: auto;
  font-family: Font2;
  color: #f0e68c;
}

.shadow__input {
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  bottom: 0;
  z-index: -1;
  transform: translateZ(-50px);
  background: linear-gradient(
    45deg,
    rgba(0, 0, 0, 0.6) 0%,
    + rgba(0, 0, 0, 0.3) 100%
  );
  filter: blur(30px);
}

.input__container::before {
  content: "?XÇ#?";
  position: absolute;
  top: -15px;
  left: 20px;
  background: #8b5a2b;
  color: #000000;
  font-weight: bold;
  padding: 5px 10px;
  font-size: 25px;
  transform: translateZ(50px);
  z-index: 4;
  border: 2px solid #000000;
}

.siguiente {
  position: absolute;
  z-index: 15;
  pointer-events: auto;
  width: 50px;
  height: 50px;
  font-size: 30px;
  font-weight: bold;
  border: 3px solid #8b5a2b;
  border-radius: 50%;
  background-color: #5a0000;
  color: #f0e68c;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;

  z-index: 15;
  pointer-events: auto;
  transition: background-color 0.2s;
}
.siguiente:hover {
  background-color: #2c0000;
}

/* ------------------------------------------------ */
/* --- 🆕 ESTILOS DE OTROS JUGADORES (ALREDEDOR) --- */
/* ------------------------------------------------ */

.player-container-exterior {
  position: fixed;
  bottom: 15vh;
  left: 50%;
  transform: translateX(-50%);
  width: 80vw;
  max-width: 1200px;
  height: 60vh;
  z-index: 3;
}

.other-player-stat {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 15px;
  border-radius: 15px;
  background-color: rgba(0, 0, 0, 0.75);
  border: 2px solid #5a0000;
  box-shadow: 0 0 10px rgba(255, 0, 0, 0.3),
    inset 0 0 5px rgba(255, 255, 255, 0.1);
  font-family: "Inter", sans-serif;
  color: #fff;
  transition: all 0.5s ease;
  width: 150px;
}

.player-name-chip {
  font-size: 14px;
  font-weight: bold;
  color: #d4af37;
  margin-bottom: 4px;
  text-shadow: 0 0 5px rgba(212, 175, 55, 0.5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.player-stats-chip span {
  font-size: 16px;
  font-weight: 600;
  color: #7fbf7f;
}

.player-pos-0 {
  top: 0%;
  left: 90%;
  transform: translateX(-50%);
}

.player-pos-1 {
  top: 20%;
  left: 90%;
  transform: translateX(-50%);
}

.player-pos-2 {
  top: 40%;
  left: 90%;
  transform: translateX(-50%);
}

.player-pos-3 {
  top: 60%;
  left: 90%;
  transform: translateX(-50%);
}
</style>
