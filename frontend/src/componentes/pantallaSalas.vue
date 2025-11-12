<script setup>
import { ref, onMounted, onUnmounted, defineProps } from "vue";
import communicationManager from "../services/communicationManager";
import {
  playerName,
  playerId,
  rooms,
  playerAvatar,
} from "../logic/globalState.js";

// Importar los hijos de Salas (utilsSalas)
import buttomUsuari from "./utils/utilsSalas/buttomUsuari.vue";
import buttomLogout from "./utils/utilsSalas/buttomLogout.vue";
import buttomCreate from "./utils/utilsSalas/buttomCreate.vue";
import renderSalas from "./utils/utilsSalas/renderSalas.vue";

const props = defineProps({ escena: String });

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
    playerId: playerId.value, // host
    isHost: true,
    players: [{ playerId: playerId.value, username: playerName.value }], // solo él por ahora
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
  const roomName = nuevaSala.value.trim() || `Room_${playerName.value}`;

  communicationManager.emit("create_room", {
    roomName: roomName,
    playerId: playerId.value,
    username: playerName.value,
  });

  nuevaSala.value = "";
}

// 🔹 Unirse a una sala
function unirseSala(room) {
  communicationManager.emit("join_room", {
    roomId: room.roomId,
    playerId: playerId.value,
    username: playerName.value,
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
  communicationManager.connect();
  communicationManager.on("rooms_list", handleRoomsList);
  communicationManager.on("room_created", handleRoomCreated);
  communicationManager.on("room_error", handleRoomError);

  // pedir lista inicial
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
                <buttomUsuari
                  :avatar-url="playerAvatar"
                  @ver-perfil="handleVerPerfil"
                />
                <buttomLogout @logout="handleLogout" />
              </div>
              <!--Crear sala-->
              <buttomCreate v-model="nuevaSala" @crear-lobby="crearSala" />
              <!--Listar sala-->
              <renderSalas v-model="rooms" @unirse-sala="unirseSala" />
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

  /* --- FIX 3D (PASO 2) --- */
  /* Deshabilitamos clics en la pared de fondo */
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

  /* --- FIX 3D (PASO 1) --- */
  /* Deshabilitamos clics en las paredes que bloquean */
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

  /* --- FIX 3D (PASO 1) --- */
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

  /* --- FIX 3D (PASO 1) --- */
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

  /* --- FIX 3D (PASO 1) --- */
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
  pointer-events: none; /* Esto ya estaba bien */
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
.lista-salas {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 10px;
  width: 100%;
  max-width: 800px;
}
.sala-card {
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 10px;
  text-align: center;
}

/* --- ESTILOS PARA MEJORAS DE UI --- */
.error-message {
  background-color: #ff3b30;
  color: white;
  padding: 10px 15px;
  border-radius: 8px;
  width: 100%;
  max-width: 800px;
  text-align: center;
  margin-top: -5px;
  margin-bottom: 5px;
  font-weight: bold;
}
.sala-vacia {
  grid-column: 1 / -1;
  text-align: center;
  color: #aaa;
  padding: 30px;
}
.sala-card button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s;
}
.sala-card button:disabled {
  background-color: #555;
  cursor: not-allowed;
  opacity: 0.6;
}
.sala-card button:hover:not(:disabled) {
  background-color: #0056b3;
  transform: translateY(-1px);
}
.crear-sala button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.crear-sala button:hover,
.perfil-btn:hover {
  background-color: #0056b3;
}

#btn-message {
  --text-color: rgb(255, 255, 255);
  --bg-color-sup: #5e5e5e;
  --bg-color: #2b2b2b;
  --bg-hover-color: #161616;
  --online-status: #00da00;
  --font-size: 16px;
  --btn-transition: all 0.2s ease-out;
}

.button-message {
  display: flex;
  justify-content: center;
  align-items: center;
  font: 400 var(--font-size) Helvetica Neue, sans-serif;
  box-shadow: 0 0 2.17382px rgba(0, 0, 0, 0.049),
    0 1.75px 6.01034px rgba(0, 0, 0, 0.07),
    0 3.63px 14.4706px rgba(0, 0, 0, 0.091), 0 22px 48px rgba(0, 0, 0, 0.14);
  background-color: var(--bg-color);
  border-radius: 68px;
  cursor: pointer;
  padding: 6px 10px 6px 6px;
  width: fit-content;
  height: 40px;
  border: 0;
  overflow: hidden;
  position: relative;
  transition: var(--btn-transition);
}

.button-message:hover {
  height: 56px;
  padding: 8px 20px 8px 8px;
  background-color: var(--bg-hover-color);
  transition: var(--btn-transition);
}

.button-message:active {
  transform: scale(0.99);
}

.content-avatar {
  width: 30px;
  height: 30px;
  margin: 0;
  transition: var(--btn-transition);
  position: relative;
}

.button-message:hover .content-avatar {
  width: 40px;
  height: 40px;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  background-color: var(--bg-color-sup);
}

.user-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-user {
  position: absolute;
  width: 6px;
  height: 6px;
  right: 1px;
  bottom: 1px;
  border-radius: 50%;
  outline: solid 2px var(--bg-color);
  background-color: var(--online-status);
  transition: var(--btn-transition);
  animation: active-status 2s ease-in-out infinite;
}

.button-message:hover .status-user {
  width: 10px;
  height: 10px;
  right: 1px;
  bottom: 1px;
  outline: solid 3px var(--bg-hover-color);
}

.notice-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  padding-left: 8px;
  text-align: initial;
  color: var(--text-color);
}

.username {
  letter-spacing: -6px;
  height: 0;
  opacity: 0;
  transform: translateY(-20px);
  transition: var(--btn-transition);
}

.user-id {
  font-size: 12px;
  letter-spacing: -6px;
  height: 0;
  opacity: 0;
  transform: translateY(10px);
  transition: var(--btn-transition);
}

.lable-message {
  display: flex;
  align-items: center;
  opacity: 1;
  transform: scaleY(1);
  transition: var(--btn-transition);
}

.button-message:hover .username {
  height: auto;
  letter-spacing: normal;
  opacity: 1;
  transform: translateY(0);
  transition: var(--btn-transition);
}

.button-message:hover .user-id {
  height: auto;
  letter-spacing: normal;
  opacity: 1;
  transform: translateY(0);
  transition: var(--btn-transition);
}

.button-message:hover .lable-message {
  height: 0;
  transform: scaleY(0);
  transition: var(--btn-transition);
}

.lable-message,
.username {
  font-weight: 600;
}

.number-message {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  margin-left: 8px;
  font-size: 12px;
  width: 16px;
  height: 16px;
  background-color: var(--bg-color-sup);
  border-radius: 20px;
}

/*==============================================*/
@keyframes active-status {
  0% {
    background-color: var(--online-status);
  }

  33.33% {
    background-color: #93e200;
  }

  66.33% {
    background-color: #93e200;
  }

  100% {
    background-color: var(--online-status);
  }
}
.Btn {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 45px;
  height: 45px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition-duration: 0.3s;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.199);
  background-color: rgb(255, 65, 65);
}

/* plus sign */
.sign {
  width: 100%;
  transition-duration: 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sign svg {
  width: 17px;
}

.sign svg path {
  fill: white;
}
/* text */
.text {
  position: absolute;
  right: 0%;
  width: 0%;
  opacity: 0;
  color: white;
  font-size: 1.2em;
  font-weight: 600;
  transition-duration: 0.3s;
}
/* hover effect on button width */
.Btn:hover {
  width: 125px;
  border-radius: 40px;
  transition-duration: 0.3s;
}

.Btn:hover .sign {
  width: 30%;
  transition-duration: 0.3s;
  padding-left: 20px;
}
/* hover effect button's text */
.Btn:hover .text {
  opacity: 1;
  width: 70%;
  transition-duration: 0.3s;
  padding-right: 10px;
}
/* button click effect*/
.Btn:active {
  transform: translate(2px, 2px);
}
</style>