<template>
  <div class="slot-machine-container">
    <div class="machine-frame">

      <div class="machine-top">
        <h2 class="machine-title">☠ Máquina del Destino ☠</h2>
      </div>

      <div class="slot-display">
        <div class="slot-reel">
          <div
            class="reel-ticker"
            :style="reelStyle(reel1)"
          >
            <span v-for="symbol in reelSymbols" :key="'r1-'+symbol" class="slot-symbol">{{ symbol }}</span>
            <span v-for="symbol in reelSymbols" :key="'r1dup-'+symbol" class="slot-symbol">{{ symbol }}</span>
          </div>
        </div>
        <div class="slot-reel">
          <div
            class="reel-ticker"
            :style="reelStyle(reel2)"
          >
            <span v-for="symbol in reelSymbols2" :key="'r2-'+symbol" class="slot-symbol">{{ symbol }}</span>
            <span v-for="symbol in reelSymbols2" :key="'r2dup-'+symbol" class="slot-symbol">{{ symbol }}</span>
          </div>
        </div>
        <div class="slot-reel">
          <div
            class="reel-ticker"
            :style="reelStyle(reel3)"
          >
            <span v-for="symbol in reelSymbols3" :key="'r3-'+symbol" class="slot-symbol">{{ symbol }}</span>
            <span v-for="symbol in reelSymbols3" :key="'r3dup-'+symbol" class="slot-symbol">{{ symbol }}</span>
          </div>
        </div>
      </div>

      <div class="machine-details">
        <h1>El elegido es:</h1>
        <span v-if="winner" class="winner-name">{{ winner }}</span>
        <span v-else-if="!canSpin" class="winner-name placeholder">...Calculando Destino...</span>
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
</template>

<script setup>
import { ref, reactive, onMounted, defineEmits, defineProps } from "vue";
// IMPORTANTE: Asegúrate de que las rutas a los archivos de sonido sean correctas en tu proyecto
import soundSpin from "../../public/assets/sonido/sonidoAccion/playful-casino-slot-machine.mp3";
import soundWin from "../../public/assets/sonido/sonidoAccion/slot-machine-coin-payout.mp3";

const props = defineProps({
  winner: { type: String, default: "" },
});

const emit = defineEmits(["go-home"]);

const isPulling = ref(false); 
const canSpin = ref(false); 
const canGoHome = ref(false); 

// Altura del símbolo (150px)
const SYMBOL_HEIGHT = 150; 
const SYMBOL_HEIGHT_HALF = SYMBOL_HEIGHT / 2; 

// Duración del giro antes de frenar (1.5 segundos)
const AUDIO_DURATION_MS = 1500; 

// Definición de símbolos (Palabras)
const reelSymbols = ["Nada", "Muerte", "Estadisticas"];
const reelSymbols2 = ["Muerte", "Nada", "Estadisticas"];
const reelSymbols3 = ["Nada", "Muerte", "Estadisticas"];

const STATS_INDEXES = [2, 2, 2];

const reel1 = reactive({ offset: 0, speed: 0, isSpinning: false, transitionDuration: '0s' });
const reel2 = reactive({ offset: 0, speed: 0, isSpinning: false, transitionDuration: '0s' });
const reel3 = reactive({ offset: 0, speed: 0, isSpinning: false, transitionDuration: '0s' });

const sonidoTragaperras = new Audio(soundSpin);
const sonidoMonedas = new Audio(soundWin);

function reelStyle(reel) {
  return {
    transform: `translateY(${reel.offset}px)`,
    transition: `transform ${reel.transitionDuration} ${reel.speed > 0 ? 'linear' : 'ease-out'}`,
  }
}

let animationFrame;
function animateReels() {
  if (reel1.speed > 0) {
    reel1.offset -= reel1.speed;
    reel1.offset %= (reelSymbols.length * SYMBOL_HEIGHT); 
  }

  if (reel2.speed > 0) {
    reel2.offset -= reel2.speed;
    reel2.offset %= (reelSymbols2.length * SYMBOL_HEIGHT);
  }

  if (reel3.speed > 0) {
    reel3.offset -= reel3.speed;
    reel3.offset %= (reelSymbols3.length * SYMBOL_HEIGHT);
  }

  animationFrame = requestAnimationFrame(animateReels);
}

function stopReel(reel, targetSymbolIndex, symbolCount, delay) {
  return new Promise(resolve => {
    // Cálculo para centrar el símbolo en la ventana de 150px
    let targetOffset = - (targetSymbolIndex * SYMBOL_HEIGHT) + SYMBOL_HEIGHT_HALF;

    let extraTurns = 3; 
    let finalOffset = targetOffset - (symbolCount * SYMBOL_HEIGHT) * extraTurns;

    setTimeout(() => {
      reel.speed = 0; 
      reel.transitionDuration = '2s'; 
      reel.offset = finalOffset; 
      
      setTimeout(() => {
        reel.transitionDuration = '0s'; 
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
  reel1.transitionDuration = reel2.transitionDuration = reel3.transitionDuration = '0s';

  // Posición inicial: El primer símbolo está medio fuera por arriba.
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
        emit("go-home");
    }, 500); 
}

onMounted(() => {
  animateReels(); 
  sonidoTragaperras.volume = 0.2;
  sonidoMonedas.volume = 0.3;

  startSpin();
});
</script>

---

## 🎨 Estilos CSS Actualizados

```css
<style scoped>

/* Colores */
:root {
  --metal-dark: #3b2b2b;
  --metal-rust: #5c4033;
  --wood-old: #5a4030;
  --paper-aged: #d2b48c;
  --light-amber: #bda27e;
  --shadow-deep: rgba(0,0,0,0.8);
  --lever-red: #8b0000; 
  --lever-red-light: #ff3333;
}

/* Contenedor */
.slot-machine-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  background: radial-gradient(circle at center, #3c2a2a 0%, #000 80%);
  font-family: 'Courier New', Courier, monospace; 
}

/* Marco */
.machine-frame {
  position: relative;
  width: 80vw;
  height: 90vh;
  background: linear-gradient(135deg, var(--metal-dark) 0%, var(--wood-old) 100%);
  border: 0.6vw solid var(--metal-rust);
  border-radius: 1vw;
  padding: 2vh 2vw;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: inset 0 0 3vw var(--shadow-deep);
}

/* Cabecera */
.machine-top {
  text-align: center;
  padding-top: 1vh;
}

.machine-title {
  font-size: 4vh;
  color: var(--light-amber);
  text-shadow: 0 0 0.4vh #000;
}

/* Rodillos */
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
  /* Altura para mostrar solo 1 símbolo (150px) */
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
  /* El desplazamiento lo gestiona el JS */
}

.slot-symbol {
  height: 150px; 
  line-height: 150px;
  font-size: 8vh; /* Se redujo ligeramente el tamaño del texto para que quepa mejor */
  text-align: center;
  text-shadow: 0 0 0.5vh var(--shadow-deep);
  color: black;
  
  /* 🔑 CAMBIO CLAVE AQUÍ: Fondo para el texto */
  background-color: rgba(0, 0, 0, 0.4); 
  padding: 0 10px;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.8);
  color: var(--light-amber); /* Cambiamos el color del texto a ámbar para que contraste con el negro */
}

/* Panel inferior y Palanca (sin cambios) */
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

.placeholder { opacity: 0.6; font-style: italic; }


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
  background: radial-gradient(circle at 30% 30%, var(--lever-red-light), var(--lever-red));
  border: 0.3vh solid #2a1b1b;
  border-radius: 50%;
  box-shadow: inset 0 0 0.5vh #000, 0 0 0.5vh var(--lever-red-light);
}

.lever.pulling { transform: rotate(25deg); }
</style>