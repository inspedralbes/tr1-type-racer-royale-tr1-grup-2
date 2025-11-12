<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from "vue";
import communicationManager from "../services/CommunicationManager.js";
import { playerName, playerId } from "../logic/globalState.js";
// 🚨 Importar el componente 3D renombrado
import AnimacionJuego from "./interfazAnimacion.vue";

import {
  aplicarUpsideDown,
  activarEscudo,
  escudoActivo,
  aplicarSlowEnemy,
  efectoUpsideDownActivo,
  slowEnemyActivo,
  // reiniciarPartida
} from "../logic/cardEffects.js";

// --- 3D / CRUPIER ESTADO (TRAÍDO DEL ANTIGUO juego.vue) ---
const crupierState = ref("normal"); // 'normal' o 'powerup'.
const dialogText = ref("Bienvenidos todos."); // Diálogo inicial
const show2DUI = ref(false); // Controla la visibilidad del Crupier y Diálogo
const animationDuration = ref(0); // Duración de la animación 3D

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
const playerIdActual = playerId.value; // Cambiar dinámicamente si lo tienes desde login
const playerNameActual = playerName.value; // Cambiar dinámicamente si lo tienes desde lobby


// powerups 
// 🟩 Power-Ups
const powerupsDisponibles = ref([]); // cartas que aparecen en pantalla para reclamar
const misPowerups = ref([]); // cartas que ya tengo asignadas
const currentPowerupWord = ref(null); // palabra activa de powerup
const cartaActual = ref(null); 

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


// // FUNCION QUE RECLAMA UNA CARTA POWER-UP
// function reclamarCarta(carta) {
//   console.log("Intentando reclamar carta:", carta);
//   communicationManager.emit("claim_powerup", {
//     data: {
//       roomId: roomId.value,
//       playerId: playerId.value,
//       carta,
//     }
//   });
// }


// FUNCION QUE MANEJA EL USO DEL POWERUP 
function usarPowerup(indice) {
  const carta = misPowerups.value[indice];
  if (!carta) return;

  // Emitir al backend para que aplique el efecto a los demás
  communicationManager.emit("use_powerup", {
    data: {
      playerId: playerId.value,
      roomId: roomId.value,
      cartaId: carta.id,
      efecto: carta.efecto
    }
  });

  // Aplicar efecto local solo si te afecta a ti
  if (carta.efecto === "shield") activarEscudo();

  misPowerups.value.splice(indice, 1);
  console.log("Powerup usado:", carta.nombre);
}


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

// FUNCION QUE MANEJA LA ACTUALIZACION DEL PROGRESO DE TODOS LOS JUGADORES
function onUpdateProgress(msg) {
  const { players } = msg.data;
  players.forEach((p) => {
    console.log(
      `Jugador ${p.id}: ${p.completedWords} palabras completadas, estado: ${p.status}`
    );
  });

  const ganadorJugador = players.find((p) => p.status === "finished");
  if (ganadorJugador) {
    ganador.value = ganadorJugador.username;
    emit("juego-finalizado", ganador.value);
    console.log(`🎉 La partida terminó. Ganador: ${ganadorJugador.playerId}`);
  }
}

// 🟩 MOUNT / UNMOUNT
onMounted(() => {
  // Conectar socket
  communicationManager.connect();

  // 🔹 Fetch palabras iniciales
  const payload = {
    roomId: roomId.value,
    playerId: playerId.value,
    playerName: playerName.value,
    count: 10,
  };

  fetch("/palabras/words", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then(res => res.ok ? res.json() : Promise.reject(`Error HTTP: ${res.status}`))
    .then(data => {
      listaEntera.value = data.data.initialWords;
    })
    .catch(err => console.error("❌ Error al obtener palabras:", err));

  // Escuchar eventos
  communicationManager.on("update_player_words", onUpdatePlayerWords);
  communicationManager.on("update_progress", onUpdateProgress);

  // 🔹 Powerup disponible en la sala
  communicationManager.on("powerup_available", (msg) => {
    const { carta, palabra } = msg.data;

    // Mostrar la palabra del powerup en UI y guardarla
    currentPowerupWord.value = palabra;
    cartaActual.value = carta;

    powerupsDisponibles.value = [carta];

    console.log("💥 Powerup disponible:", carta, "Palabra:", palabra);
  });

  communicationManager.on("powerup_applied", (msg) => {
  const { efecto, from } = msg.data;
  console.log(`los valores son de efecto: ${efecto}, from: ${from}, y escudo ${escudoActivo.value}`);
  
  if (escudoActivo.value && from !== playerId.value) {
    console.log(`🛡️ Escudo activo, ignorando efecto ${efecto} de ${from}`);
    return;
  }

  if (from === playerId.value && efecto !== "shield") {
    console.log(`🙈 Ignorando mi propio efecto ${efecto}`);
    return;
  }

  switch (efecto) {
    case "word_upside_down":
      aplicarUpsideDown(); // afecta solo a los demás
      break;
    case "slow_enemy":
      aplicarSlowEnemy();
      break;
    case "shield":
      // No hace nada a otros, es protección
      break;
    // case "reset_game":
    //   reiniciarPartida(); // Este efecto local solo puede resetear algo visual o contadores si quieres
    //   break;
  }

  console.log(`💫 Powerup ${efecto} activado por ${from}`);
});

communicationManager.on("powerup_reset_words", (msg) => {
  const { from } = msg.data;
  console.log(`🔄 Powerup reset recibido de ${from}`);

  // Limpiar input y palabras actuales
  palabraUser.value = "";
  listaEntera.value = []; // vaciar palabras actuales
  completedWords.value = 0;
  palabraInvalida.value = false;
  errorCount.value = 0;

  // Pedir nuevas palabras al servidor
  fetch("/palabras/words", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      roomId: roomId.value,
      playerId: playerId.value,
      playerName: playerName.value,
      count: 10,
    }),
  })
    .then(res => res.ok ? res.json() : Promise.reject(`Error HTTP: ${res.status}`))
    .then(data => {
      listaEntera.value = data.data.initialWords;
      console.log("✅ Palabras reiniciadas:", listaEntera.value);
    })
    .catch(err => console.error("❌ Error al reiniciar palabras:", err));
});


  // 🔹 Powerup reclamado por el jugador
  communicationManager.on("powerup_spawned", (msg) => {
  const { carta, playerId: ganadorId } = msg.data;

  // Si es mi carta, la agrego a misPowerups
  if (ganadorId === playerId.value) {
    misPowerups.value.push(carta);
  }
    // Limpiar palabra activa si coincide
    if (cartaActual.value && cartaActual.value.id === carta.id) {
      currentPowerupWord.value = null;
      cartaActual.value = null;
    }
  
    powerupsDisponibles.value = powerupsDisponibles.value.filter(
    (c) => c.id !== carta.id
  );

  // Mostrar visualmente que se ha ganado una carta (para todos)
  console.log(`🃏 Jugador ${playerId} ha ganado la carta`, carta);
});

  // 🔹 Powerup reclamado por otros jugadores (solo para UI si quieres mostrarlo)
  communicationManager.on("powerup_claimed", (msg) => {
    const { carta, playerId: claimant } = msg.data;
    console.log(`🎁 Powerup reclamado por ${claimant}:`, carta);

    // Eliminarlo de las palabras disponibles si coincidía
    if (cartaActual.value && cartaActual.value.id === carta.id) {
      currentPowerupWord.value = null;
      cartaActual.value = null;
    }
  });
});



onUnmounted(() => {
  // Desregistrar eventos
  communicationManager.off("update_player_words", onUpdatePlayerWords);
  communicationManager.off("update_progress", onUpdateProgress);
  communicationManager.off("powerup_claimed");
  communicationManager.off("powerup_available");
  communicationManager.off("powerup_spawned");                                                                                                                                                                                        

  // Desconectar socket
  // communicationManager.emit("leave_room", { playerId });
  // communicationManager.disconnect();
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
  if (slowEnemyActivo.value) {
    event.preventDefault();
    console.warn("⏳ Teclado bloqueado por efecto slowEnemy");
    return;
  }
  // FLECHA DE LA IZQUIERDA PARA USAR EL POWERUP 1
  if (event.key === "ArrowLeft") {
    usarPowerup(0); // usar carta 1
    event.preventDefault();
    return;
  }

  // FLECHA DE LA DERECHA PARA USAR EL POWERUP2
  if (event.key === "ArrowRight") {
    usarPowerup(1); // usar carta 2
    event.preventDefault();
    return;
  }

  if (event.key === " " && palabraUser.value.length > 0) {
    event.preventDefault();

    // 🔹 Si hay una palabra de powerup activa
    if (currentPowerupWord.value) {
      if (palabraUser.value === currentPowerupWord.value) {
        // ✅ Reclama el powerup
        completedWords.value++; // opcional: contar como completada también
        currentPowerupWord.value = null;

        // Emitir al backend que el jugador ha reclamado la carta
        communicationManager.emit("claim_powerup", {
          data: {
            roomId: roomId.value,
            playerId: playerId.value,
            carta: cartaActual.value, // la carta enviada con la palabra de powerup
          },
        });

        console.log("🎉 Powerup reclamado:", cartaActual.value);
      } else {
        // palabra de powerup incorrecta
        errorCount.value++;
        console.warn("❌ Palabra de powerup incorrecta. Errores:", errorCount.value);
      }
    } 
    // 🔹 Si no hay powerup, se procesa palabra normal
    else if (palabraUser.value === palabraObjetivo.value) {
      completedWords.value++;
      enviarPalabra(palabraUser.value);
    } 
    else {
      errorCount.value++;
      console.warn("Palabra incorrecta. Errores:", errorCount.value);
    }

    // Limpiar input
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
  if (currentPowerupWord.value) {
    return [currentPowerupWord.value]; // mostrar solo la palabra de powerup
  }
  if (!Array.isArray(listaEntera.value)) return [];
  return listaEntera.value.slice(0, 5); // palabras normales
});

const palabraObjetivo = computed(() => {
  const jugador = props.jugador; // o el jugador actual
  if (jugador.currentPowerupWord) return jugador.currentPowerupWord; // PRIORIDAD
  return palabrasEnVista.value.length > 0 ? palabrasEnVista.value[0] : "";
});
const esValido = computed(() => validarInput());

// --- MANEJADORES DE EVENTO DE ANIMACIÓN 3D (TRAÍDO DEL ANTIGUO juego.vue) ---

/**
 * Captura la duración total de la animación 3D y programa la aparición de la UI 2D.
 */
const handleAnimationDuration = (durationInSeconds) => {
  animationDuration.value = durationInSeconds;

  // UI 2D (Crupier y juego) aparece 2 segundos antes del final.
  const delayBeforeEnd = 2;
  const delayMs = Math.max(100, (durationInSeconds - delayBeforeEnd) * 1000);

  setTimeout(() => {
    show2DUI.value = true;
    // nextTick para asegurar que la animación CSS se aplique.
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

  <div class="bottom-ui-container" :class="slideInUpClass">
    <ul class="lista-palabras" :class="{ 'upside-down': efectoUpsideDownActivo }">
      <li
        v-for="(palabra, index) in palabrasEnVista"
        :key="index"
        :class="{ 'palabra-actual': index === 0}"
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

      <!-- 🃏 Power-Ups disponibles para reclamar -->
  <div class="powerups-disponibles">
    <h3>Cartas disponibles</h3>
    <div class="cartas">
      <div 
        v-for="carta in powerupsDisponibles" 
        :key="carta.id" 
        class="carta"
      >
        <strong>{{ carta.nombre }}</strong>
        <p>{{ carta.descripcion }}</p>
      </div>
    </div>
  </div>

  <!-- 🧰 Mis Power-Ups -->
  <div class="mis-powerups">
    <h3>Mis cartas</h3>
    <div class="cartas">
      <div v-for="carta in misPowerups" :key="carta.id" class="carta">
        <strong>{{ carta.nombre }}</strong>
      </div>
    </div>
  </div>

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
          Palabras Completadas: <span>{{ completedWords }}</span>
        </p>
        <p>
          Errores:<span :class="{ 'error-count': errorCount > 0 }">{{
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
          :style="{ display: showPowerupImage ? 'none' : 'flex' }"
        >
          <img
            src="/assets/img/crupier-normal_oficial.png"
            alt="Crupier Normal"
          />
        </div>
        <div
          id="crupier-caarta"
          :style="{ display: showPowerupImage ? 'flex' : 'none' }"
        >
          <img
            src="/assets/img/crupier-carta_oficial.png"
            alt="Crupier Carta"
          />
        </div>
      </div>

      <div class="input-dialog-container" :class="reboteClass">
        <div class="input__container">
          <div class="shadow__input"></div>
          <p style="font-size: 1rem; color: #e0e8f0; margin: 0; padding: 0">
            {{ dialogText }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ------------------------------------------------ */
/* --- ESTILOS DE FONDO Y ESTRUCTURA (CREEPY) --- */
/* ------------------------------------------------ */

.upside-down {
  transform: rotate(180deg);
  display: inline-block;
}


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
  pointer-events: none;
}

/* ------------------------------------------------ */
/* --- ESTILOS DE UI DE JUEGO (SLIDE-IN-UP) --- */
/* ------------------------------------------------ */

.bottom-ui-container {
  position: fixed;
  bottom: 5vh;
  width: 100%;
  left: 5%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 0;
  pointer-events: auto;
  z-index: 3;
  transform: translateY(100%);
  opacity: 0;
  transition: transform 0.8s cubic-bezier(0.23, 1, 0.32, 1),
    opacity 0.5s ease-out;
}

.bottom-ui-container.slide-in-up {
  transform: translateY(0);
  opacity: 1;
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
  font-family: "Georgia", serif;
  font-size: 20px;
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
  font-family: "Georgia", serif;
  color: #f0e68c;
  font-size: 18px;
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
  padding: 0;
  margin-top: 0;
  margin-bottom: 20px;
  font-family: "Georgia", serif;
  font-size: 28px;
  display: flex;
  gap: 15px;
  color: #d4af37;
  white-space: nowrap;
  justify-content: center;
  text-shadow: 0 0 8px rgba(212, 175, 55, 0.4);
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
  pointer-events: none;
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
  pointer-events: none;
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
  pointer-events: none;
  font-family: "Georgia", serif;
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
    rgba(0, 0, 0, 0.3) 100%
  );
  filter: blur(30px);
}

.input__container::before {
  content: "CRUPIER";
  position: absolute;
  top: -15px;
  left: 20px;
  background: #8b5a2b;
  color: #000000;
  font-weight: bold;
  padding: 5px 10px;
  font-size: 14px;
  transform: translateZ(50px);
  z-index: 4;
  border: 2px solid #000000;
}



/* ESTILO POWERUPS CARTAS */
.powerups-disponibles, .mis-powerups {
  margin: 20px 0;
  text-align: center;
}

.powerups-disponibles .cartas,
.mis-powerups .cartas {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.carta {
  background-color: rgba(255, 255, 255, 0.1);
  border: 2px solid #fff;
  border-radius: 5px;
  padding: 10px;
  min-width: 120px;
  cursor: pointer;
  transition: transform 0.2s;
}

.carta:hover {
  transform: scale(1.1);
  border-color: yellowgreen;
}



/* ESTILO POWERUPS CARTAS */
.powerups-disponibles, .mis-powerups {
  margin: 20px 0;
  text-align: center;
}

.powerups-disponibles .cartas,
.mis-powerups .cartas {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.carta {
  background-color: rgba(255, 255, 255, 0.1);
  border: 2px solid #fff;
  border-radius: 5px;
  padding: 10px;
  min-width: 120px;
  cursor: pointer;
  transition: transform 0.2s;
}

.carta:hover {
  transform: scale(1.1);
  border-color: yellowgreen;
}
</style>
