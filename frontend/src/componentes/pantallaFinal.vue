<script setup>

// 1. Importaciones 
// Importaciones de Vue, ref y reactive para el estado, onMounted para el ciclo de vida, defineEmits/defineProps para la comunicación
import { ref, reactive, onMounted, defineEmits, defineProps } from "vue";

// Importaciones de Assets de sonido
import soundSpin from "../../public/assets/sonido/sonidoAccion/playful-casino-slot-machine.mp3";
import soundWin from "../../public/assets/sonido/sonidoAccion/slot-machine-coin-payout.mp3";

// 2. Definir Props y Emits 

// Define las propiedades que el componente padre puede pasarle a este componente.
const props = defineProps({
  // Indica si el usuario ha ganado, luego lo usa para activar el sonido de monedas
  ganador: { type: String, default: "" },
});

// Define los eventos que este componente puede emitir al componente padre
const emit = defineEmits(["ir-a-inicio", "registrado"]);

// 2. Constantes y Configuración
// Configuración de las dimensiones de los símbolos de la tragaperras (en píxeles).
const ALTURA_SIMBOLO = 150;
// Offset para centrar el símbolo en la ventana de visualización.
const MEDIA_ALTURA_SIMBOLO = ALTURA_SIMBOLO / 2;

// Duración del audio de giro (1500ms) para saber cuándo debe comenzar la secuencia de detención de los slots
const DURACION_AUDIO_MS = 1500;

// Definición de el contenido de cada slot 
const simbolosRodillo1 = ["Nada", "Muerte", "Jugamos"];
const simbolosRodillo2 = ["Muerte", "Nada", "Otra"];
const simbolosRodillo3 = ["Nada", "Muerte", "Partida?"];

// Índices de los símbolos a los que deben detenerse los slots (e.g., [2, 2, 0]).
const INDICES_OBJETIVO = [2, 2, 0];

// 3. Estado Reactivo

const estaTirando = ref(false); 
const puedeGirar = ref(false); 
const puedeIrAInicio = ref(false); 
// Cada slot tiene su propio estado de animación.
const rodillo1 = reactive({ desplazamiento: 0, velocidad: 0, estaGirando: false, duracionTransicion: '0s' });
const rodillo2 = reactive({ desplazamiento: 0, velocidad: 0, estaGirando: false, duracionTransicion: '0s' });
const rodillo3 = reactive({ desplazamiento: 0, velocidad: 0, estaGirando: false, duracionTransicion: '0s' });

// 4. Configuración de Audio
const sonidoTragaperras = new Audio(soundSpin);
const sonidoMonedas = new Audio(soundWin);


//  5. Funciones de Lógica de la Tragaperra


//Genera los estilos CSS dinámicos para aplicar el movimiento vertical a un slot
 
function estiloRodillo(rodillo) {
  return {
    transform: `translateY(${rodillo.desplazamiento}px)`,
    transition: `transform ${rodillo.duracionTransicion} ${rodillo.velocidad > 0 ? 'linear' : 'ease-out'}`,
  }
}

let marcoAnimacion;

 //Bucle de animación para el movimiento constante de los rodillos mientras giran.
 //Utiliza `requestAnimationFrame` para optimizar el rendimiento.
function animarRodillos() {
  // Solo actualiza la posición si la velocidad es mayor que cero
  if (rodillo1.velocidad > 0) {
    rodillo1.desplazamiento -= rodillo1.velocidad;
    // Asegura que el desplazamiento sea en bucle para simular vueltas infinitas
    rodillo1.desplazamiento %= (simbolosRodillo1.length * ALTURA_SIMBOLO);
  }

  if (rodillo2.velocidad > 0) {
    rodillo2.desplazamiento -= rodillo2.velocidad;
    rodillo2.desplazamiento %= (simbolosRodillo2.length * ALTURA_SIMBOLO);
  }

  if (rodillo3.velocidad > 0) {
    rodillo3.desplazamiento -= rodillo3.velocidad;
    rodillo3.desplazamiento %= (simbolosRodillo3.length * ALTURA_SIMBOLO);
  }

  // Llama al siguiente fotograma de la animación
  marcoAnimacion = requestAnimationFrame(animarRodillos);
}


//Detiene un rodillo en un símbolo específico con un efecto de frenado y rebote.

function detenerRodillo(rodillo, indiceObjetivo, conteoSimbolos, retraso) {
  return new Promise(resolve => {
    // 1. Calcula la posición final
    let desplazamientoObjetivo = - (indiceObjetivo * ALTURA_SIMBOLO) + MEDIA_ALTURA_SIMBOLO;

    let vueltasExtra = 3; // Define cuántas vueltas "falsas" se usarán para el frenado.
    // 2. Calcula la posición inicial de frenado
    let desplazamientoFinal = desplazamientoObjetivo - (conteoSimbolos * ALTURA_SIMBOLO) * vueltasExtra;

    setTimeout(() => {
      // 3. Inicia el frenado
      rodillo.velocidad = 0; 
      rodillo.duracionTransicion = '2s';
      rodillo.desplazamiento = desplazamientoFinal;

      // 4. Espera a que termine la transición de frenado previa
      setTimeout(() => {
        // 5. Se muestra el resultado
        rodillo.duracionTransicion = '0s'; 
        rodillo.desplazamiento = desplazamientoObjetivo; 
        resolve(); // Resuelve la promesa
      }, 2000);
    }, retraso);
  });
}


//Inicia el proceso de giro de la tragaperras: sonido, animación y secuencia de detención

function iniciarGiro() {
  // Bloquea las interacciones del usuario mientras gira
  puedeGirar.value = false;
  puedeIrAInicio.value = false;

  // Prepara y reproduce el sonido de una tragaperras
  sonidoTragaperras.pause();
  sonidoTragaperras.currentTime = 0;
  sonidoTragaperras.loop = false;
  sonidoTragaperras.play();

  
  rodillo1.velocidad = rodillo2.velocidad = rodillo3.velocidad = 40;
  rodillo1.duracionTransicion = rodillo2.duracionTransicion = rodillo3.duracionTransicion = '0s';
  rodillo1.desplazamiento = MEDIA_ALTURA_SIMBOLO;
  rodillo2.desplazamiento = MEDIA_ALTURA_SIMBOLO;
  rodillo3.desplazamiento = MEDIA_ALTURA_SIMBOLO;

  setTimeout(() => {
    Promise.resolve()
      .then(() => detenerRodillo(rodillo1, INDICES_OBJETIVO[2], simbolosRodillo1.length, 0)) 
      .then(() => detenerRodillo(rodillo2, INDICES_OBJETIVO[2], simbolosRodillo2.length, 500)) 
      .then(() => detenerRodillo(rodillo3, INDICES_OBJETIVO[2], simbolosRodillo3.length, 500)) 
      .then(() => {
        
        if (props.ganador) {
          sonidoMonedas.play(); 
        }
        puedeIrAInicio.value = true; 
      });
  }, DURACION_AUDIO_MS);
}


function accionIrAInicio() {
 
  if (!puedeIrAInicio.value) return;

  estaTirando.value = true;
  sonidoTragaperras.pause();

  setTimeout(() => {
    estaTirando.value = false;
    emit("registrado");
  }, 500);
}

// 6. OnMounted

onMounted(() => {
  animarRodillos();

  sonidoTragaperras.volume = 0.2;
  sonidoMonedas.volume = 0.3;

  iniciarGiro();
});
</script>
<template>
  <div class="slot-machine-container">
    <div class="machine-frame">

      <div class="machine-top">
        <h2 class="machine-title">El Resultdo Final</h2>
      </div>

      <div class="slot-display">
        <div class="slot-reel">
          <div class="reel-ticker" :style="reelStyle(reel1)">
            <span v-for="symbol in reelSymbols" :key="'r1-' + symbol" class="slot-symbol">{{ symbol }}</span>
            <span v-for="symbol in reelSymbols" :key="'r1dup-' + symbol" class="slot-symbol">{{ symbol }}</span>
          </div>
        </div>
        <div class="slot-reel">
          <div class="reel-ticker" :style="reelStyle(reel2)">
            <span v-for="symbol in reelSymbols2" :key="'r2-' + symbol" class="slot-symbol">{{ symbol }}</span>
            <span v-for="symbol in reelSymbols2" :key="'r2dup-' + symbol" class="slot-symbol">{{ symbol }}</span>
          </div>
        </div>
        <div class="slot-reel">
          <div class="reel-ticker" :style="reelStyle(reel3)">
            <span v-for="symbol in reelSymbols3" :key="'r3-' + symbol" class="slot-symbol">{{ symbol }}</span>
            <span v-for="symbol in reelSymbols3" :key="'r3dup-' + symbol" class="slot-symbol">{{ symbol }}</span>
          </div>
        </div>
      </div>

      <div class="machine-details">
        <h1>El elegido es:</h1>
        <span v-if="winner" class="winner-name">{{ winner }}</span>
        <span v-else-if="!canSpin" class="winner-name placeholder">Has ganado</span>
        <span v-else class="winner-name placeholder">— Nadie aún —</span>

      </div>

      <transition name="fade">
        <div v-if="canGoHome" class="go-home-note">
          <p>Ganas de jugar más? <br /> Tira de la palanca</p>
        </div>
      </transition>
      <div class="lever-housing">
        <div class="lever" :class="{ pulling: isPulling }" @click="goHomeAction"
          :style="{ cursor: canGoHome ? 'pointer' : 'default' }">
          <div class="lever-ball"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:root {
  --metal-dark: #3b2b2b;
  --metal-rust: #5c4033;
  --wood-old: #5a4030;
  --paper-aged: #d2b48c;
  --light-amber: #bda27e;
  --shadow-deep: rgba(0, 0, 0, 0.8);
  --lever-red: #8b0000;
  --lever-red-light: #ff3333;
  --metal-plate: #5e5e5e;
  --rust-tone: #a84f3c;
}

.slot-machine-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  background: radial-gradient(circle at center, #3c2a2a 0%, #000 80%);
  font-family: 'Courier New', Courier, monospace;
}

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
  background: radial-gradient(circle at 30% 30%, var(--lever-red-light), var(--lever-red));
  border: 0.3vh solid #2a1b1b;
  border-radius: 50%;
  box-shadow: inset 0 0 0.5vh #000, 0 0 0.5vh var(--lever-red-light);
}

.lever.pulling {
  transform: rotate(25deg);
}

.go-home-note {
  position: absolute;
  right: 8vh;
  top: 10%;
  margin-left: 90%;
  transform: translateY(-50%);
  width: 15vh;
  padding: 1.5vh 0.5vh;
  text-align: center;
  background-color: #5e5e5e7a;
  border: 2px solid var(--rust-tone);
  border-radius: 0.3vh;
  box-shadow: 0 0.5vh 1vh rgba(0, 0, 0, 0.7);
  z-index: 10;
  position: relative;
  overflow: visible;
}

.go-home-note p {
  margin: 0;
  font-size: 1.8vh;
  color: #c9c9c9;
  text-shadow: 0 1px 1px #000;
  line-height: 1.2;
}

.go-home-note::before,
.go-home-note::after {
  content: '';
  position: absolute;
  width: 1.5vh;
  height: 1.5vh;
  background: radial-gradient(circle at 40% 40%, #c2c2c2 0%, #444 100%);
  /* Efecto 3D de cabeza de clavo */
  border-radius: 50%;
  box-shadow: inset 0 0 3px #000, 0 0 2px var(--rust-tone);
  z-index: 11;
}

.go-home-note::before {
  top: -0.75vh;
  left: -0.75vh;
}

/* Remache Inferior Derecho */
.go-home-note::after {
  bottom: -0.75vh;
  right: -0.75vh;
}

/* Animación de Transición */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
