<script setup>
import { ref, onMounted, onUnmounted, defineProps } from "vue";
import communicationManager from "../services/communicationManager";
import { rooms } from "../logic/globalState.js";

// Importar los hijos de Salas (utilsSalas)
import LogicaPerfilUsuario from "./utils/utilsSalas/LogicaPerfilUsuario.vue";
import LogicaSalirSala from "./utils/utilsSalas/LogicaSalirSalas.vue";
import LogicaCrearLobby from "./utils/utilsSalas/LogicaCrearLobby.vue";
import LogicaPintarSalas from "./utils/utilsSalas/LogicaPintarSalas.vue";

const props = defineProps({
  escena: String,
  jugador: Object,
});

// 🔹 AÑADIMOS 'ver-perfil' y 'logout' a los eventos que este componente puede emitir
const emit = defineEmits(["sala-seleccionada", "ver-perfil", "logout"]);
const nuevaSala = ref("");
const errorMessage = ref("");

// 🔹 Recibir lista de salas del servidor
const handleRoomsList = (payload) => {
  rooms.value = payload;
  console.log("📜 Lista de salas:", payload);
};

// 🔹 Cuando una sala se crea correctamente
function handleRoomCreated(payload) {
  console.log("🆕 Sala creada desde backend:", payload);
  // Emitimos solo los datos necesarios a App.vue

  const room = {
    roomId: payload.roomId,
    playerId: props.jugador.id, // host
    isHost: true,
    players: [{ playerId: props.jugador.id, username: props.jugador.username }], // solo él por ahora
  };
  emit("sala-seleccionada", room);
}

// 🔹 Error al crear o unirse
const handleRoomError = (payload) => {
  console.error("❌ Error:", payload.message);
  errorMessage.value = payload.message;
};

// 🔹 Solicitar lista de salas al servidor
function actualizarSalas() {
  console.log("📡 Solicitando lista de salas...");
  communicationManager.emit("get_rooms");
}

// 🔹 Crear una nueva sala
function crearSala() {
  if (!props.jugador) return;
  const roomName = nuevaSala.value.trim() || `Room_${props.jugador.username}`;

  communicationManager.emit("create_room", {
    roomName: roomName,
    playerId: props.jugador.id,
    username: props.jugador.username,
  });

  nuevaSala.value = "";
}

// 🔹 Unirse a una sala
function unirseSala(room) {
  if (!props.jugador) return;
  communicationManager.emit("join_room", {
    roomId: room.roomId,
    playerId: props.jugador.id,
    username: props.jugador.username,
  });

  emit("sala-seleccionada", room);
}

// --- 🔹 LÓGICA DE NAVEGACIÓN (CORREGIDA) ---

function handleVerPerfil() {
  emit("ver-perfil");
}

function handleLogout() {
  emit("logout");
}

onMounted(() => {
  // El componente ahora solo se monta cuando 'jugador' existe.
  console.log("onMounted: PantallaSalas montada. Conectando socket...");
  console.log("ID del jugador:", props.jugador.id);
  console.log("Username del jugador:", props.jugador.username);

  communicationManager.connect();
  communicationManager.on("rooms_list", handleRoomsList);
  communicationManager.on("room_created", handleRoomCreated);
  communicationManager.on("room_error", handleRoomError);
  actualizarSalas();
});

onUnmounted(() => {
  communicationManager.off("rooms_list", handleRoomsList);
  communicationManager.off("room_created", handleRoomCreated);
  communicationManager.off("room_error", handleRoomError);
});
</script>

<template>
  <div class="scene" :class="props.escena">
    <div class="room-scene">
      <div class="wall wall-back">
        <div class="wall-light"></div>
        <div class="door-frame">
          <div class="garage-door">
            <!--Contenido principal-->
            <div class="salas-container">
              <div class="header-container">
                <LogicaPerfilUsuario
                  v-if="jugador"
                  :jugador="jugador"
                  @ver-perfil="handleVerPerfil"
                />
                <LogicaSalirSala @logout="handleLogout" />
              </div>
              <!--Crear sala
              <buttomCreate v-model="nuevaSala" @crear-lobby="crearSala" />
              -->
              <!--Listar salaS
              <renderSalas v-model="rooms" @unirse-sala="unirseSala" />
              -->
            </div>
            <!--FIN-->
          </div>
        </div>
      </div>
      <div class="wall wall-floor"></div>

      <div class="wall wall-left"></div>
      <div class="wall wall-right"></div>

      <div class="wall wall-top"></div>
    </div>
    <div class="illuminated-area"></div>
  </div>
</template>

<style scoped>
/* La escena 3D */
.scene {
  --room-width: 100vw;
  --room-height: 100vh;
  --room-depth: 30vw;

  width: 100vw;
  height: 100vh;
  position: absolute;
  top: 0;
  left: 0;
  overflow: hidden;
  background-color: black;

  /* Perspectiva para la "cámara" */
  perspective: 700px;
  transition: transform 1s ease-in-out;
}

.scene.registro {
  transform: translateZ(500px) scale(1);
}

.scene.salas {
  transform: translateY(-100px) scale(2);
}

.room-scene {
  width: 100%;
  height: 100%;
  position: relative;
  /* Activa el espacio 3D */
  transform-style: preserve-3d;

  pointer-events: none;
}
.wall {
  position: absolute;
  box-sizing: border-box;
}

.wall-back {
  width: var(--room-width);
  height: var(--room-height);
  background-image: url(../../public/assets/img/fondo-con-textura-de-pared-de-ladrillo-moderno.jpg);
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  transform: translateZ(calc(var(--room-depth) * -1));
  pointer-events: none;
}

.wall-floor {
  width: calc(var(--room-width));
  height: calc(var(--room-depth));
  background-image: url(../../public/assets/img/Gemini_Generated_Image_88n9iy88n9iy88n9.png);
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  bottom: 0;
  transform-origin: bottom;
  transform: rotateX(90deg);
  pointer-events: none;
}

.wall-left {
  width: var(--room-depth);
  height: var(--room-height);
  left: 0;
  transform-origin: left;
  transform: rotateY(90deg);
  background-image: url(../../public/assets/img/fondo-con-textura-de-pared-de-ladrillo-moderno.jpg);
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  pointer-events: none;
}

.wall-right {
  width: var(--room-depth);
  height: var(--room-height);
  right: 0;
  transform-origin: right;
  transform: rotateY(-90deg);
  background-image: url(../../public/assets/img/fondo-con-textura-de-pared-de-ladrillo-moderno.jpg);
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  pointer-events: none;
}

.wall-top {
  width: calc(var(--room-width));
  height: calc(var(--room-depth));
  background-image: url(../../public/assets/img/coloridas-luces-del-horizonte-en-el-cielo.jpg);
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  top: 0;
  transform-origin: top;
  transform: rotateX(-90deg);
  pointer-events: none;
}

.door-frame {
  position: absolute;
  top: 30%;
  left: 50%;
  width: 80vw;
  height: 80vh;
  box-sizing: border-box;
  transform: translateX(-50%) translateZ(2px);
  z-index: 1;
  pointer-events: auto;
}

.garage-door {
  width: 100%;
  height: 100%;
  background-color: #383838;
  position: relative;
  background-image: linear-gradient(
      to top,
      rgba(255, 255, 255, 0.05) 0%,
      transparent 10%
    ),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.2) 0%, transparent 10%),
    url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="2" height="2"><rect width="1" height="1" fill="%23303030"/><rect x="1" y="1" width="1" height="1" fill="%23303030"/></svg>');
  background-size: 100% 10%, 100% 10%, 2px 2px;
  background-position: 0% 0%, 0% 0%, 0px 0px;
  background-repeat: repeat-y, repeat-y, repeat;
  box-shadow: inset 0px 1px 2px rgba(255, 255, 255, 0.05),
    inset 0px -1px 2px rgba(0, 0, 0, 0.3);
  transition: transform 1s ease-out;
  transform-origin: top center;
}

.garage-door.open {
  transform: translateY(-100%);
}

/*Iluminación pagina*/
.illuminated-area {
  pointer-events: none;
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: radial-gradient(
    ellipse at center,
    transparent 5%,
    rgba(0, 0, 0, 1) 90%,
    black 100%
  );
}

.wall-light::before {
  content: "";
  position: absolute;
  top: -0.5vh;
  left: -1%;
  width: 102%;
  height: 2.5vh;
  background-color: black;
  border-radius: 0.8vh;
  z-index: 3;
}

.wall-light {
  position: absolute;
  top: 20vh;
  left: 50vw;
  width: 50vw;
  height: 5vh;
  transform: translateX(-25vw);
  background-color: #f7f0e3;
  border-radius: 2.5vh;
  z-index: 2; /* Por encima de la puerta (pero .door-frame ahora es 10) */

  /* --- FIX Z-INDEX LÁMPARA (PASO 2) --- */
  /* Por si acaso, le quitamos los clics a la lámpara también */
  pointer-events: none;
}

.wall-light::after {
  content: "";
  position: absolute;
  top: 3vh;
  left: -15vw;
  width: 80vw;
  height: 75vh;
  background: radial-gradient(
    ellipse at 50% 0%,
    rgba(255, 255, 220, 0.35) 0%,
    transparent 80%
  );
  filter: blur(15px);
  z-index: -1;
  pointer-events: none; /* Esto ya estaba bien */
}

.salas-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  z-index: 10;
}
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 80%;
  padding: 4vh 4vw;
}
.perfil-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
}
</style>
