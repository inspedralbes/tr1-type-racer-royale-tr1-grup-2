<template>
  <div class="final-screen-layout">
    <div class="stats-column">
      <h2 class="stats-title">🏆 Estadísticas Finales</h2>
      <div class="player-info">
        <p><strong>Jugador:</strong> {{ playerName }}</p>
      </div>
      <div class="stats-details-list">
        <div v-if="playerStats" class="stats-list-inner">
          <div class="stat-item">
            <span>Aciertos:</span>
            <span class="stat-value">{{ playerStats.aciertos }}</span>
          </div>
          <div class="stat-item">
            <span>Errores:</span>
            <span class="stat-value">{{ playerStats.errores }}</span>
          </div>
          <div class="stat-item">
            <span>Intentos Totales:</span>
            <span class="stat-value">{{ playerStats.totalIntentos }}</span>
          </div>
          <div class="stat-item">
            <span>Palabras Frecuentes:</span>
            <span class="stat-value">{{
              playerStats.palabrasFrecuentes.length
            }}</span>
          </div>
        </div>
        <p v-else class="loading-stats">Cargando estadísticas...</p>
      </div>
      <small class="disclaimer">¡El destino te espera!</small>
    </div>

    <div class="slot-machine-container">
      <div class="machine-frame">
        <div class="machine-top">
          <h2 class="machine-title">☠ Máquina del Destino ☠</h2>
        </div>

        <div class="slot-display">
          <div class="slot-reel">
            <div class="reel-ticker" :style="reelStyle(reel1)">
              <span
                v-for="symbol in reelSymbols"
                :key="'r1-' + symbol"
                class="slot-symbol"
                >{{ symbol }}</span
              >
              <span
                v-for="symbol in reelSymbols"
                :key="'r1dup-' + symbol"
                class="slot-symbol"
                >{{ symbol }}</span
              >
            </div>
          </div>
          <div class="slot-reel">
            <div class="reel-ticker" :style="reelStyle(reel2)">
              <span
                v-for="symbol in reelSymbols2"
                :key="'r2-' + symbol"
                class="slot-symbol"
                >{{ symbol }}</span
              >
              <span
                v-for="symbol in reelSymbols2"
                :key="'r2dup-' + symbol"
                class="slot-symbol"
                >{{ symbol }}</span
              >
            </div>
          </div>
          <div class="slot-reel">
            <div class="reel-ticker" :style="reelStyle(reel3)">
              <span
                v-for="symbol in reelSymbols3"
                :key="'r3-' + symbol"
                class="slot-symbol"
                >{{ symbol }}</span
              >
              <span
                v-for="symbol in reelSymbols3"
                :key="'r3dup-' + symbol"
                class="slot-symbol"
                >{{ symbol }}</span
              >
            </div>
          </div>
        </div>

        <div class="machine-details">
          <h1>El elegido es:</h1>
          <span v-if="winner" class="winner-name">{{ winner }}</span>
          <span v-else-if="!canSpin" class="winner-name placeholder"
            >...Calculando Destino...</span
          >
          <span v-else class="winner-name placeholder">— Nadie aún —</span>
        </div>

        <div class="lever-housing">
          <div
            class="lever"
            :class="{ pulling: isPulling }"
            @click="goHomeAction"
            :style="{ cursor: canGoHome ? 'pointer' : 'default' }"
          >
            <div class="lever-ball"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, onMounted, defineEmits, defineProps } from "vue";
import communicationManager from "../services/communicationManager.js";
import { playerName, playerId, roomId } from "../logic/globalState.js";
import axios from "axios";

import soundSpin from "/public/assets/sonido/sonidoAccion/playful-casino-slot-machine.mp3";
import soundWin from "/public/assets/sonido/sonidoAccion/slot-machine-coin-payout.mp3";

const props = defineProps({
  winner: { type: String, default: "" },
});

const playerStats = ref(null);

const emit = defineEmits(["go-home"]);

const isPulling = ref(false);
const canSpin = ref(false);
const canGoHome = ref(false);

const SYMBOL_HEIGHT = 150;
const SYMBOL_HEIGHT_HALF = SYMBOL_HEIGHT / 2;

const AUDIO_DURATION_MS = 1500;

const reelSymbols = ["Nada", "Muerte", "Estadisticas"];
const reelSymbols2 = ["Muerte", "Nada", "Estadisticas"];
const reelSymbols3 = ["Nada", "Muerte", "Estadisticas"];

const STATS_INDEXES = [2, 2, 2];

const reel1 = reactive({
  offset: 0,
  speed: 0,
  isSpinning: false,
  transitionDuration: "0s",
});
const reel2 = reactive({
  offset: 0,
  speed: 0,
  isSpinning: false,
  transitionDuration: "0s",
});
const reel3 = reactive({
  offset: 0,
  speed: 0,
  isSpinning: false,
  transitionDuration: "0s",
});

const sonidoTragaperras = new Audio(soundSpin);
const sonidoMonedas = new Audio(soundWin);

function reelStyle(reel) {
  return {
    transform: `translateY(${reel.offset}px)`,
    transition: `transform ${reel.transitionDuration} ${
      reel.speed > 0 ? "linear" : "ease-out"
    }`,
  };
}

let animationFrame;
function animateReels() {
  if (reel1.speed > 0) {
    reel1.offset -= reel1.speed;
    reel1.offset %= reelSymbols.length * SYMBOL_HEIGHT;
  }

  if (reel2.speed > 0) {
    reel2.offset -= reel2.speed;
    reel2.offset %= reelSymbols2.length * SYMBOL_HEIGHT;
  }

  if (reel3.speed > 0) {
    reel3.offset -= reel3.speed;
    reel3.offset %= reelSymbols3.length * SYMBOL_HEIGHT;
  }

  animationFrame = requestAnimationFrame(animateReels);
}

function stopReel(reel, targetSymbolIndex, symbolCount, delay) {
  return new Promise((resolve) => {
    let targetOffset =
      -(targetSymbolIndex * SYMBOL_HEIGHT) + SYMBOL_HEIGHT_HALF;

    let extraTurns = 3;
    let finalOffset = targetOffset - symbolCount * SYMBOL_HEIGHT * extraTurns;

    setTimeout(() => {
      reel.speed = 0;
      reel.transitionDuration = "2s";
      reel.offset = finalOffset;

      setTimeout(() => {
        reel.transitionDuration = "0s";
        reel.offset = targetOffset;
        resolve();
      }, 2000);
    }, delay);
  });
}

function startSpin() {
  canSpin.value = false;
  canGoHome.value = false;

  sonidoTragaperras.pause();
  sonidoTragaperras.currentTime = 0;
  sonidoTragaperras.loop = false;
  sonidoTragaperras.play();

  reel1.speed = reel2.speed = reel3.speed = 40;
  reel1.transitionDuration =
    reel2.transitionDuration =
    reel3.transitionDuration =
      "0s";

  reel1.offset = SYMBOL_HEIGHT_HALF;
  reel2.offset = SYMBOL_HEIGHT_HALF;
  reel3.offset = SYMBOL_HEIGHT_HALF;

  setTimeout(() => {
    Promise.resolve()
      .then(() => stopReel(reel1, STATS_INDEXES[0], reelSymbols.length, 0))
      .then(() => stopReel(reel2, STATS_INDEXES[1], reelSymbols2.length, 500))
      .then(() => stopReel(reel3, STATS_INDEXES[2], reelSymbols3.length, 500))
      .then(() => {
        if (props.winner) {
          sonidoMonedas.play();
        }
        canGoHome.value = true;
      });
  }, AUDIO_DURATION_MS);
}

function goHomeAction() {
  if (!canGoHome.value) return;

  isPulling.value = true;
  sonidoTragaperras.pause();

  setTimeout(() => {
    isPulling.value = false;

    communicationManager.emit("leave_game", {
      playerId: playerId.value,
      roomId: roomId.value,
    });

    communicationManager.disconnect();

    emit("go-home");
  }, 500);
}

async function loadPlayerStats() {
  const currentId = playerId.value;

  if (!currentId) {
    console.error("ID del jugador no disponible para cargar estadísticas.");
    return;
  }

  try {
    // Asegúrate de que esta URL coincida con la ruta de tu API de Express/MongoDB
    const response = await axios.get(
      `http://localhost:3000/api/user/stats/${currentId}`
    );

    playerStats.value = response.data;
  } catch (error) {
    console.error("Error al cargar estadísticas:", error);
    // Fallback a valores por defecto en caso de error
    playerStats.value = {
      aciertos: 0,
      errores: 0,
      totalIntentos: 0,
      palabrasFrecuentes: [],
    };
  }
}

onMounted(() => {
  loadPlayerStats();

  animateReels();
  sonidoTragaperras.volume = 0.2;
  sonidoMonedas.volume = 0.3;

  startSpin();
});
</script>

<style scoped>
/* Colores */
:root {
  --metal-dark: #3b2b2b;
  --metal-rust: #5c4033;
  --wood-old: #5a4030;
  --paper-aged: #d2b48c;
  --light-amber: #bda27e;
  --shadow-deep: rgba(0, 0, 0, 0.8);
  --lever-red: #8b0000;
  --lever-red-light: #ff3333;
  --stats-frame: #4a342a;
  --stats-text: #f0e6d2;
}

/* ------------------------------------------- */
/* NUEVO: Contenedor Principal (Layout Flex) */
/* ------------------------------------------- */
.final-screen-layout {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 3vw;
  width: 100vw;
  height: 100vh;
  background: radial-gradient(circle at center, #3c2a2a 0%, #000 80%);
  font-family: "Courier New", Courier, monospace;
}

/* ------------------------------------------- */
/* NUEVO: Columna de Estadísticas */
/* ------------------------------------------- */
.stats-column {
  width: 25vw;
  max-width: 300px;
  min-width: 200px;
  height: 70vh;
  padding: 3vh 1.5vw;

  background: var(--metal-dark);
  border: 0.4vw solid var(--metal-rust);
  border-radius: 0.8vw;
  box-shadow: inset 0 0 1.5vw var(--shadow-deep);
  color: var(--stats-text);

  align-self: center;

  display: flex;
  flex-direction: column;
}

.stats-title {
  font-size: 3vh;
  color: var(--light-amber);
  text-shadow: 0 0 0.2vh #000;
  text-align: center;
  margin-bottom: 2vh;
  padding-bottom: 1vh;
  border-bottom: 0.2vh solid var(--metal-rust);
}

.player-info {
  margin-bottom: 1.5vh;
  padding-bottom: 1vh;
  border-bottom: 0.1vh solid var(--metal-rust);
  font-size: 1.8vh;
  color: var(--stats-text);
}

.stats-details-list {
  flex-grow: 1;
  background: var(--stats-frame);
  padding: 1.5vh;
  border-radius: 0.5vw;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.6);
}

.stats-list-inner {
  display: flex;
  flex-direction: column;
  gap: 1.5vh;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  font-size: 1.7vh;
  color: var(--paper-aged);
  border-bottom: 0.1vh dashed var(--wood-old);
  padding-bottom: 0.5vh;
}

.stat-value {
  font-weight: bold;
  color: var(--light-amber);
  text-shadow: 0 0 0.1vh #000;
}

.loading-stats,
.disclaimer {
  text-align: center;
  margin-top: 2vh;
  font-size: 1.5vh;
  color: var(--paper-aged);
  opacity: 0.7;
}

/* ------------------------------------------- */
/* ESTILOS ORIGINALES DE LA MÁQUINA */
/* ------------------------------------------- */

.slot-machine-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.machine-frame {
  position: relative;
  width: 50vw;
  max-width: 400px;
  height: 90vh;
  background: linear-gradient(
    135deg,
    var(--metal-dark) 0%,
    var(--wood-old) 100%
  );
  border: 0.6vw solid var(--metal-rust);
  border-radius: 1vw;
  padding: 2vh 2vw;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: inset 0 0 3vw var(--shadow-deep);
}

.machine-top {
  text-align: center;
  padding-top: 1vh;
}

.machine-title {
  font-size: 4vh;
  color: var(--light-amber);
  text-shadow: 0 0 0.4vh #000;
}

.slot-display {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: var(--metal-dark);
  border: 0.4vw solid var(--metal-rust);
  border-radius: 0.8vw;
  box-shadow: inset 0 0 2vw #000;
  padding: 2vh 1vw;
  flex-grow: 1;
}

.slot-reel {
  width: 28%;
  height: 150px;
  background: var(--paper-aged);
  border: 0.2vw solid #3e2f1d;
  border-radius: 0.5vw;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.reel-ticker {
  display: flex;
  flex-direction: column;
}

.slot-symbol {
  height: 150px;
  line-height: 150px;
  font-size: 8vh;
  text-align: center;
  text-shadow: 0 0 0.5vh var(--shadow-deep);
  color: black;
  background-color: rgba(0, 0, 0, 0.4);
  padding: 0 10px;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.8);
  color: var(--light-amber);
}

.machine-details {
  background: var(--metal-dark);
  border: 0.3vw solid var(--metal-rust);
  border-radius: 0.8vw;
  box-shadow: inset 0 0 2vw #000;
  text-align: center;
  padding: 2vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.machine-details h1 {
  font-size: 3vh;
  color: var(--light-amber);
  margin: 0;
  text-shadow: 0 0 0.2vh #000;
}

.winner-name {
  display: block;
  margin-top: 1vh;
  font-size: 3.5vh;
  color: #d4c093;
  text-shadow: 0 0.3vh 0.6vh #000;
}

.placeholder {
  opacity: 0.6;
  font-style: italic;
}

.lever-housing {
  position: absolute;
  right: -5vh;
  top: 45%;
  width: 6vh;
  height: 18vh;
  background: #1e1a1a;
  border-radius: 2vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 1vh;
  border: 0.2vh solid var(--metal-rust);
}

.lever {
  width: 1.8vh;
  height: 12vh;
  background: linear-gradient(to bottom, #6e5842, #3c2e24);
  border-radius: 1vh;
  position: relative;
  transform-origin: top center;
  transition: transform 0.1s ease-out;
  box-shadow: inset 0 0 0.4vh #000;
}

.lever-ball {
  position: absolute;
  bottom: -2.2vh;
  left: 50%;
  transform: translateX(-50%);
  width: 3.5vh;
  height: 3.5vh;
  background: radial-gradient(
    circle at 30% 30%,
    var(--lever-red-light),
    var(--lever-red)
  );
  border: 0.3vh solid #2a1b1b;
  border-radius: 50%;
  box-shadow: inset 0 0 0.5vh #000, 0 0 0.5vh var(--lever-red-light);
}

.lever.pulling {
  transform: rotate(25deg);
}
</style>
