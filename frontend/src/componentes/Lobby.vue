<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import communicationManager from "../services/communicationManager";
import { playerId } from "../logic/globalState.js";

// Importamos los hijos de Lobby (utilsLobby)
import LobbyScreen from "./utils/utilsLobby/LobbyScreen.vue";
import LobbyControls from "./utils/utilsLobby/LobbyControls.vue";

const props = defineProps({
  room: {
    type: Object,
    required: true,
  },
});
const players = ref(props.room.players || []);

const emit = defineEmits(["juego-iniciado", "leave-lobby"]);

const canStartGame = computed(() => players.value.length >= 2);

function iniciarJuego() {
  console.log("⏳ El host inicia la partida...");

  communicationManager.emit("start_game_signal", {
    roomId: props.room.roomId,
    hostId: props.room.playerId, // Asumo que room.playerId es el ID del host
  });

  emit("juego-iniciado", props.room);
}

// ✅ 2. Esta es la función que se llama cuando el HIJO emite
function handleExit() {
  console.log(`🚪 Saliendo del lobby ${props.room.roomId}...`);

  // 1. Notificar al backend que nos vamos
  communicationManager.emit("leave_lobby_signal", {
    roomId: props.room.roomId,
    playerId: playerId.value, // Usamos .value porque es un ref importado
  });

  // 2. Emitir a App.vue (el "abuelo") para que cambie la vista
  emit("leave-lobby");
}

onMounted(() => {
  // Este evento es para cuando ALGUIEN (incluyéndote a ti) SE UNE
  communicationManager.on("joined_lobby", (data) => {
    console.log("📥 joined_lobby recibido:", data);
    if (data.roomId === props.room.roomId) {
      players.value = data.players;
    }
  });

  // ✅ 3. AÑADIMOS ESTE LISTENER:
  // Este evento es para cuando OTRA PERSONA SE VA
  // Tu backend debe emitir "player_left_lobby" a todos en la sala cuando alguien usa "leave_lobby_signal"
  communicationManager.on("player_left_lobby", (data) => {
    console.log("📥 player_left_lobby recibido:", data);
    if (data.roomId === props.room.roomId) {
      // Simplemente actualizamos la lista de jugadores con la nueva lista del servidor
      players.value = data.players;
    }
  });

  communicationManager.on("start_game_signal", () => {
    emit("juego-iniciado", props.room);
  });
});

onUnmounted(() => {
  communicationManager.off("joined_lobby");
  communicationManager.off("start_game_signal");
  // ✅ 4. Limpiamos el nuevo listener
  communicationManager.off("player_left_lobby");
});
</script>

<template>
  <div class="flip-phone-container">
    <div class="phone-top-wrapper">
      <div class="speaker"></div>

      <LobbyScreen
        :room-id="props.room.roomId"
        :players="players"
        :is-host="props.room.isHost"
        :can-start-game="canStartGame"
      />

      <div class="phone-face phone-back"></div>
      <div class="phone-face phone-top-edge"></div>
      <div class="phone-face phone-left-edge"></div>
      <div class="phone-face phone-right-edge"></div>
    </div>

    <div class="hinge"></div>

    <div class="phone-bottom">
      <LobbyControls
        :is-host="props.room.isHost"
        :can-start-game="canStartGame"
        @start-game-requested="iniciarJuego"
        @leave-lobby="handleExit"
      />
    </div>
  </div>
</template>

<style scoped>
/* --- ESTILOS DEL CONTENEDOR --- */

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

.flip-phone-container {
  --phone-thickness: 18px;
  --phone-plastic-dark: #222222;
  --phone-plastic-medium: #3a3a3a;
  --phone-plastic-light: #555555;
  --accent-red: #d32f2f;
  --accent-green: #4caf50;

  width: 280px;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.5), 0 5px 10px rgba(0, 0, 0, 0.3);
  font-family: "Roboto", sans-serif;
  perspective: 1200px;
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  background-color: transparent;
  border-radius: 15px;
}

/* --- ESTILOS DE LA PARTE SUPERIOR DEL TELÉFONO --- */
.phone-top-wrapper {
  background: linear-gradient(
    to bottom,
    var(--phone-plastic-light) 0%,
    var(--phone-plastic-medium) 30%,
    var(--phone-plastic-dark) 100%
  );
  padding: 15px 18px 10px 18px;
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
  border: 2px solid rgba(0, 0, 0, 0.8);
  border-bottom: none;
  animation: open-flip 0.7s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards;
  transform-origin: bottom center;
  position: relative;
  transform-style: preserve-3d;
  box-shadow: inset 0 3px 6px rgba(0, 0, 0, 0.3),
    inset 0 -1px 2px rgba(255, 255, 255, 0.1);
}

/* === ESTILOS PARA LAS NUEVAS CARAS 3D === */
.phone-face {
  position: absolute;
  box-sizing: border-box;
  background: linear-gradient(
    to right,
    var(--phone-plastic-dark) 0%,
    var(--phone-plastic-medium) 50%,
    var(--phone-plastic-dark) 100%
  );
  border: 1px solid rgba(0, 0, 0, 0.7);
}

.phone-back {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: translateZ(calc(-1 * var(--phone-thickness))) rotateY(180deg);
  backface-visibility: hidden;
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
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.4);
}

.phone-top-edge {
  top: 0;
  left: 0;
  width: 100%;
  height: var(--phone-thickness);
  transform: rotateX(90deg) translateZ(calc(var(--phone-thickness) / 2));
  transform-origin: top center;
  background: var(--phone-plastic-dark);
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  box-shadow: inset 0 2px 5px rgba(255, 255, 255, 0.1),
    inset 0 -2px 5px rgba(0, 0, 0, 0.5);
}

.phone-left-edge {
  top: 0;
  left: 0;
  width: var(--phone-thickness);
  height: 100%;
  transform: rotateY(-90deg) translateZ(calc(var(--phone-thickness) / 2));
  transform-origin: left center;
  background: linear-gradient(
    to bottom,
    var(--phone-plastic-medium),
    var(--phone-plastic-dark)
  );
  box-shadow: inset 2px 0 5px rgba(255, 255, 255, 0.05),
    inset -2px 0 5px rgba(0, 0, 0, 0.4);
}

.phone-right-edge {
  top: 0;
  right: 0;
  width: var(--phone-thickness);
  height: 100%;
  transform: rotateY(90deg) translateZ(calc(var(--phone-thickness) / 2));
  transform-origin: right center;
  background: linear-gradient(
    to bottom,
    var(--phone-plastic-medium),
    var(--phone-plastic-dark)
  );
  box-shadow: inset -2px 0 5px rgba(255, 255, 255, 0.05),
    inset 2px 0 5px rgba(0, 0, 0, 0.4);
}

.speaker {
  width: 70px;
  height: 10px;
  background-color: #1a1a1a;
  border-radius: 5px;
  margin: 0 auto 12px auto;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.9),
    0 1px 0 rgba(255, 255, 255, 0.15);
  background-image: radial-gradient(
    circle at 3px 3px,
    #333 1px,
    transparent 1px
  );
  background-size: 6px 6px;
}

/* --- BISAGRA --- */
.hinge {
  height: 20px;
  background: linear-gradient(to top, #1a1a1a, #333333, #1a1a1a);
  border-top: 3px solid #666;
  border-bottom: 3px solid #111;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.6),
    inset 0 2px 4px rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 10;
}

/* --- ESTILOS DE LA PARTE INFERIOR DEL TELÉFONO --- */
.phone-bottom {
  background: linear-gradient(
    to bottom,
    var(--phone-plastic-dark) 0%,
    var(--phone-plastic-medium) 70%,
    var(--phone-plastic-light) 100%
  );
  padding: 15px;
  border-bottom-left-radius: 15px;
  border-bottom-right-radius: 15px;
  border: 2px solid rgba(0, 0, 0, 0.8);
  border-top: none;
  box-shadow: inset 0 -3px 6px rgba(0, 0, 0, 0.3),
    inset 0 1px 2px rgba(255, 255, 255, 0.1);
}
</style>
