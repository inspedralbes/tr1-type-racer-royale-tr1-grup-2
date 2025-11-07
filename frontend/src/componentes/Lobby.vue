<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import communicationManager from "../services/communicationManager";
import GameScreen from "./interfazJuego.vue";

const showGameScreen = ref(false);
const players = ref([]);

// Recibimos el estado completo del lobby desde App.vue
const props = defineProps({
  room: {
    type: Object,
    required: true,
  },
});

// Emitir al padre cuando la partida debe comenzar
const emit = defineEmits(["juego-iniciado"]);

// Solo el host puede iniciar la partida si hay al menos 2 jugadores
// 🔹 El host solo puede iniciar si hay al menos 2 jugadores (incluido él mismo)
const canStartGame = computed(() => players.value.length >= 2);

// Función para iniciar el juego
function iniciarJuego() {
  console.log("⏳ El host inicia la partida...");

  // Emitimos al backend
  communicationManager.emit("start_game_signal", {
    roomId: props.room.roomId,
    hostId: props.room.playerId,
  });

  // Emitimos a App.vue que la partida empieza (cambio de pantalla)
  emit("juego-iniciado", props.room);
}

onMounted(() => {
  players.value = [];

  communicationManager.on("joined_lobby", (data) => {
    console.log("📥 joined_lobby recibido:", data);
    if (data.roomId === props.room.roomId) {
      players.value = data.players;
    }
  });

  communicationManager.on("start_game_signal", (data) => {
    showGameScreen.value = true; // Cambia la vista de todos los jugadores
  });
});

// Limpiar listeners al desmontar
onUnmounted(() => {
  communicationManager.off("joined_lobby");
  communicationManager.off("start_game_signal");
});
</script>
<template>
  <div class="flip-phone-container" v-if="!showGameScreen">
    <div class="phone-top-wrapper">
      <div class="speaker"></div>
      <div class="screen">
        <div class="screen-body">
          <div class="room-id">Sala: {{ lobbyState.roomId }}</div>

          <div class="players-header">Jugadores ({{ players.length }}):</div>
          <ul class="player-list">
            <li
              v-for="jugador in players"
              :key="jugador.playerId"
              :class="{ 'is-self': jugador.playerId === lobbyState.playerId }"
            >
              <span>{{ jugador.username }}</span>
              <span
                v-if="jugador.playerId === lobbyState.playerId"
                class="tag-self"
                >(Tú)</span
              >
            </li>
          </ul>

          <p class="info-message" v-if="lobbyState.isHost && !canStartGame">
            🕓 Se necesitan 2 jugadores para empezar.
          </p>
          <p class="info-message" v-if="!lobbyState.isHost">
            Esperando a que el host inicie la partida...
          </p>
        </div>
      </div>
      <div class="phone-face phone-back"></div>

      <div class="phone-face phone-top-edge"></div>

      <div class="phone-face phone-left-edge"></div>

      <div class="phone-face phone-right-edge"></div>
    </div>

    <div class="hinge"></div>

    <div class="phone-bottom">
      <div class="keypad">
        <div class="soft-keys">
          <button class="call-red">⏻ Salir</button>
        </div>

        <div class="nav-pad">
          <div class="nav-ring">
            <button
              class="nav-ok"
              v-if="lobbyState.isHost"
              @click="iniciarJuego"
              :disabled="!canStartGame"
              :class="{ 'can-start': canStartGame }"
            >
              Iniciar
            </button>

            <button v-else class="nav-ok is-waiting" disabled>OK</button>
          </div>
        </div>

        <div class="dummy-keys">
          <button>1</button>
          <button>2</button>
          <button>3</button>
        </div>
      </div>
    </div>
  </div>

  <div v-else>
    <GameScreen :roomId="lobbyState.roomId" />
  </div>
</template>

<style scoped>
/* --- ANIMACIÓN DE APERTURA (sin cambios en la animación en sí) --- */

@keyframes open-flip {
  from {
    transform: rotateX(-90deg);
    opacity: 0;
  }
  to {
    transform: rotateX(0deg);
    opacity: 1;
  }
}

/* Contenedor principal del teléfono */
.flip-phone-container {
  /* --- Variables CSS --- */
  --phone-thickness: 18px; /* ¡AUMENTADO EL GROSOR PARA MÁS PRESENCIA! */
  --phone-plastic-dark: #222222; /* Tonos más oscuros para el plástico */
  --phone-plastic-medium: #3a3a3a;
  --phone-plastic-light: #555555;
  --accent-red: #d32f2f;
  --accent-green: #4caf50;

  width: 280px;
  /* Sombra principal del teléfono, más difusa y suave */
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.5), 0 5px 10px rgba(0, 0, 0, 0.3);
  font-family: "Roboto", sans-serif; /* Fuente más moderna */
  perspective: 1200px; /* Aumentado para un efecto 3D más sutil */
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  background-color: transparent;
  border-radius: 15px; /* Bordes suaves para el contorno general */
}

/* --- ESTILOS DE LA PARTE SUPERIOR DEL TELÉFONO --- */
.phone-top-wrapper {
  /* Gradiente más complejo para simular un material pulido */
  background: linear-gradient(
    to bottom,
    var(--phone-plastic-light) 0%,
    var(--phone-plastic-medium) 30%,
    var(--phone-plastic-dark) 100%
  );
  padding: 15px 18px 10px 18px;
  border-top-left-radius: 15px; /* Ajuste a los nuevos radios */
  border-top-right-radius: 15px;
  border: 2px solid rgba(0, 0, 0, 0.8); /* Borde más oscuro y definido */
  border-bottom: none;
  animation: open-flip 0.7s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards; /* Curva de animación más "elástica" */
  transform-origin: bottom center;
  position: relative;
  transform-style: preserve-3d;
  /* Sombra interna para dar la sensación de un borde elevado alrededor de la tapa */
  box-shadow: inset 0 3px 6px rgba(0, 0, 0, 0.3),
    inset 0 -1px 2px rgba(255, 255, 255, 0.1);
}

/* === ESTILOS PARA LAS NUEVAS CARAS 3D === */

/* Estilo base para todas las caras (Laterales del teléfono) */
.phone-face {
  position: absolute;
  box-sizing: border-box;
  /* Gradiente para simular la luz y sombra en los laterales */
  background: linear-gradient(
    to right,
    var(--phone-plastic-dark) 0%,
    var(--phone-plastic-medium) 50%,
    var(--phone-plastic-dark) 100%
  );
  border: 1px solid rgba(0, 0, 0, 0.7); /* Borde sutil para definir los lados */
}

/* --- CARA TRASERA (Parte trasera de la tapa superior) --- */
.phone-back {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: translateZ(calc(-1 * var(--phone-thickness))) rotateY(180deg);
  backface-visibility: hidden;
  /* Gradiente y sombra para la parte trasera, ligeramente diferente a la frontal */
  background: linear-gradient(
    to bottom,
    var(--phone-plastic-dark) 0%,
    var(--phone-plastic-medium) 50%,
    var(--phone-plastic-dark) 100%
  );
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
  border: 2px solid rgba(0, 0, 0, 0.8);
  border-bottom: none;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.4); /* Sombra interna para profundidad */
}

/* --- BORDE SUPERIOR --- */
.phone-top-edge {
  top: 0;
  left: 0;
  width: 100%;
  height: var(--phone-thickness);
  transform: rotateX(90deg) translateZ(calc(var(--phone-thickness) / 2)); /* Ajuste Z para centrarlo */
  transform-origin: top center;
  background: var(
    --phone-plastic-dark
  ); /* Color más oscuro para el borde superior */
  border-top-left-radius: 10px; /* Bordes suaves */
  border-top-right-radius: 10px;
  box-shadow: inset 0 2px 5px rgba(255, 255, 255, 0.1),
    inset 0 -2px 5px rgba(0, 0, 0, 0.5);
}

/* --- BORDE IZQUIERDO --- */
.phone-left-edge {
  top: 0;
  left: 0;
  width: var(--phone-thickness);
  height: 100%;
  transform: rotateY(-90deg) translateZ(calc(var(--phone-thickness) / 2)); /* Ajuste Z para centrarlo */
  transform-origin: left center;
  background: linear-gradient(
    to bottom,
    var(--phone-plastic-medium),
    var(--phone-plastic-dark)
  );
  box-shadow: inset 2px 0 5px rgba(255, 255, 255, 0.05),
    inset -2px 0 5px rgba(0, 0, 0, 0.4);
}

/* --- BORDE DERECHO --- */
.phone-right-edge {
  top: 0;
  right: 0;
  width: var(--phone-thickness);
  height: 100%;
  transform: rotateY(90deg) translateZ(calc(var(--phone-thickness) / 2)); /* Ajuste Z para centrarlo */
  transform-origin: right center;
  background: linear-gradient(
    to bottom,
    var(--phone-plastic-medium),
    var(--phone-plastic-dark)
  );
  box-shadow: inset -2px 0 5px rgba(255, 255, 255, 0.05),
    inset 2px 0 5px rgba(0, 0, 0, 0.4);
}

/* --- Estilo del altavoz (más relieve) --- */
.speaker {
  width: 70px; /* Más ancho */
  height: 10px; /* Más alto */
  background-color: #1a1a1a; /* Más oscuro */
  border-radius: 5px; /* Más redondo */
  margin: 0 auto 12px auto;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.9),
    /* Sombra más pronunciada */ 0 1px 0 rgba(255, 255, 255, 0.15); /* Brillo sutil */
  background-image: radial-gradient(
    circle at 3px 3px,
    #333 1px,
    transparent 1px
  );
  background-size: 6px 6px; /* Puntos más grandes */
}

/* --- Pantalla (más contraste y reflejo sutil) --- */
.screen {
  height: 350px;
  border-radius: 10px; /* Bordes más suaves */
  border: 2px solid #000;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.8),
    /* Sombra interna más fuerte */ 0 0 5px rgba(0, 0, 0, 0.5); /* Reflejo suave externo */

  /* --- LOOK LCD ANTIGUO (más auténtico) --- */
  background-color: #a8c4b0;
  color: #223a26;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.2); /* Sombra sutil para el texto */
  font-family: "Press Start 2P", cursive; /* Fuente pixelada si la cargas, sino Courier */

  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Asegura que el contenido no se salga */

  /* Reflejo sutil en la pantalla */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      to bottom right,
      rgba(255, 255, 255, 0.15) 0%,
      rgba(255, 255, 255, 0) 50%
    );
    pointer-events: none; /* Permite clics a través del reflejo */
    border-radius: 10px;
  }
}

.screen-body {
  flex-grow: 1;
  padding: 12px; /* Más padding */
  overflow-y: auto;
  scrollbar-width: thin; /* Estilo de scrollbar */
  scrollbar-color: #444 #222; /* Color de scrollbar */
}

/* Contenido del Lobby */
.room-id {
  font-size: 1.2rem;
  font-weight: bold;
  text-align: center;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.4); /* Línea punteada más auténtica */
  padding-bottom: 7px;
  margin-bottom: 10px;
  color: #1a2c1e; /* Color más oscuro para el texto principal */
}

.players-header {
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 6px;
  color: #335037;
}

.player-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 230px;
  overflow-y: auto;
  background: rgba(0, 0, 0, 0.1); /* Fondo más oscuro para la lista */
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.2);
}

.player-list li {
  font-size: 1.05rem;
  padding: 6px 10px; /* Más padding */
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px dotted rgba(0, 0, 0, 0.15); /* Bordes punteados */
}

.player-list li:last-child {
  border-bottom: none;
}

.player-list li.is-self {
  background-color: rgba(0, 0, 0, 0.15);
  font-weight: bold;
  color: #1a2c1e;
}

.tag-self {
  font-size: 0.85rem;
  font-style: italic;
  color: #335037;
}

.info-message {
  font-size: 0.9rem;
  text-align: center;
  margin-top: 15px;
  color: #335037;
  font-style: italic;
  padding: 5px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 5px;
}

/* --- BISAGRA (más robusta) --- */
.hinge {
  height: 20px; /* Más alta */
  background: linear-gradient(
    to top,
    #1a1a1a,
    #333333,
    #1a1a1a
  ); /* Gradiente más metálico */
  border-top: 3px solid #666; /* Bordes más gruesos */
  border-bottom: 3px solid #111;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.6),
    /* Sombra más definida */ inset 0 2px 4px rgba(255, 255, 255, 0.1); /* Brillo interno */
  position: relative;
  z-index: 10; /* Asegura que esté por encima de las tapas */
}

/* --- ESTILOS DE LA PARTE INFERIOR DEL TELÉFONO --- */
.phone-bottom {
  /* Mismo estilo de material que la tapa superior */
  background: linear-gradient(
    to bottom,
    /* Cambiado a bottom para reflejar la orientación */
      var(--phone-plastic-dark) 0%,
    var(--phone-plastic-medium) 70%,
    var(--phone-plastic-light) 100%
  );
  padding: 15px;
  border-bottom-left-radius: 15px; /* Bordes más suaves */
  border-bottom-right-radius: 15px;
  border: 2px solid rgba(0, 0, 0, 0.8);
  border-top: none;
  box-shadow: inset 0 -3px 6px rgba(0, 0, 0, 0.3),
    inset 0 1px 2px rgba(255, 255, 255, 0.1);
}

/* --- TECLADO Y BOTONES (más 3D y realismo) --- */
.keypad button {
  background: linear-gradient(
    to bottom,
    #333333,
    #1a1a1a
  ); /* Gradiente más profundo */
  border: 1px solid #0a0a0a;
  border-top-color: #666; /* Borde superior más claro para relieve */
  color: white;
  border-radius: 6px; /* Bordes más suaves */
  font-family: "Roboto", sans-serif;
  cursor: pointer;
  transition: all 0.1s ease-out; /* Transición más rápida */
  /* Sombras para dar volumen y profundidad */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.6),
    /* Sombra principal */ inset 0 2px 3px rgba(255, 255, 255, 0.1),
    /* Brillo superior */ inset 0 -2px 3px rgba(0, 0, 0, 0.4); /* Sombra inferior */
  transform: translateZ(
    0
  ); /* Asegura que los botones tienen su propio plano 3D */
}

.keypad button:hover {
  background: linear-gradient(to bottom, #444444, #2a2a2a);
  box-shadow: 0 5px 8px rgba(0, 0, 0, 0.7),
    inset 0 2px 4px rgba(255, 255, 255, 0.15),
    inset 0 -2px 4px rgba(0, 0, 0, 0.5);
  transform: translateY(-1px) translateZ(1px); /* Ligeramente elevado */
}
.keypad button:active {
  background: linear-gradient(to bottom, #2a2a2a, #1a1a1a);
  transform: translateY(1.5px) translateZ(-1px); /* Hundido */
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.4), inset 0 0 5px rgba(0, 0, 0, 0.6);
}

/* Botón de Salir */
.soft-keys {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 15px;
}
.soft-keys button {
  width: 45%; /* Ligeramente más ancho */
  padding: 8px 0; /* Más padding */
  font-size: 1rem;
  font-weight: bold;
}
.soft-keys .call-red {
  background: linear-gradient(
    to bottom,
    #f44336,
    var(--accent-red)
  ); /* Gradiente de rojo */
  color: white;
  font-size: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.6),
    inset 0 2px 3px rgba(255, 255, 255, 0.2);
}
.soft-keys .call-red:hover {
  background: linear-gradient(to bottom, #ff5722, #e53935);
}
.soft-keys .call-red:active {
  background: linear-gradient(to bottom, var(--accent-red), #c02828);
}

/* Pad de Navegación */
.nav-pad {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
}

.nav-ring {
  width: 85px; /* Más grande */
  height: 85px;
  border: 4px solid #111; /* Borde más grueso */
  background: linear-gradient(
    to bottom,
    #4a4a4a,
    #222222
  ); /* Gradiente más profundo */
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.7),
    /* Sombra interna para profundidad */ 0 3px 8px rgba(0, 0, 0, 0.5); /* Sombra externa */
}

.nav-ok {
  width: 55px; /* Más grande */
  height: 55px;
  border-radius: 50%;
  background: linear-gradient(to bottom, #555, #333);
  border: 2px solid #777;
  font-weight: bold;
  font-size: 1rem;
  color: #ddd;
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.5),
    inset 0 2px 2px rgba(255, 255, 255, 0.15);
}

/* Estado: Esperando (Jugador) */
.nav-ok.is-waiting {
  cursor: not-allowed;
  font-size: 1.6rem;
  line-height: 1;
  color: #aaa; /* Color más tenue */
  background: linear-gradient(to bottom, #3a3a3a, #2a2a2a);
  border-color: #555;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
}

/* Estado: Listo para Iniciar (Host) */
.nav-ok.can-start {
  background: linear-gradient(to bottom, #8bc34a, var(--accent-green));
  border-color: #aed581;
  color: white;
  font-size: 1.1rem;
  animation: pulse-green 1.5s infinite;
  box-shadow: 0 5px 8px rgba(0, 0, 0, 0.6),
    inset 0 2px 3px rgba(255, 255, 255, 0.2);
}

/* Estado: Deshabilitado */
.nav-ok:disabled {
  background: linear-gradient(to bottom, #333, #222);
  color: #666;
  cursor: not-allowed;
  opacity: 0.8;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
}

/* Botones decorativos (más sutiles) */
.dummy-keys {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px; /* Más separación */
  opacity: 0.8; /* Menos opacidad */
}
.dummy-keys button {
  height: 40px; /* Más altos */
  font-size: 1.1rem;
  background: linear-gradient(to bottom, #2a2a2a, #111111);
  border-color: #000;
  border-top-color: #333;
  box-shadow: 0 3px 4px rgba(0, 0, 0, 0.5),
    inset 0 1px 2px rgba(255, 255, 255, 0.08);
}

/* Animación para el botón de Iniciar */
@keyframes pulse-green {
  0% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
  }
  70% {
    box-shadow: 0 0 0 12px rgba(76, 175, 80, 0); /* Pulso más grande */
  }
  100% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
  }
}

/* --- ESTILOS EXTRA PARA SCROLLBAR (para la pantalla) --- */
/* Firefox */
.screen-body {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.4) rgba(0, 0, 0, 0.1);
}

/* Chrome, Edge, Safari */
.screen-body::-webkit-scrollbar {
  width: 8px;
}

.screen-body::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

.screen-body::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.4);
  border-radius: 10px;
  border: 2px solid rgba(0, 0, 0, 0.1);
}
</style>
