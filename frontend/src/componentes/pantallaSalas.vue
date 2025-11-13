<script setup>
import { ref, onMounted, onUnmounted, defineProps, defineEmits } from "vue";
import communicationManager from "../services/communicationManager";

// Importamos 'rooms' desde un estado global.
import { rooms } from "../logic/globalState.js";

// Importar los hijos de Salas (utilsSalas):
import LogicaPerfilUsuario from "./utils/utilsSalas/LogicaPerfilUsuario.vue";
import LogicaSalirSala from "./utils/utilsSalas/LogicaSalirSala.vue";
import LogicaCrearLobby from "./utils/utilsSalas/LogicaCrearLobby.vue";
import LogicaPintarSalas from "./utils/utilsSalas/LogicaPintarSalas.vue";

// Los datos que esperamos recibir del elemento padre (App.vue):
const props = defineProps({
  escena: String,
  jugador: Object,
});

//Emits al padre (App.vue):
const emit = defineEmits(["sala-seleccionada", "ver-perfil", "logout"]);

// Variables internas:
const nuevaSala = ref("");
const mensajeError = ref("");

// Funciones:
function manejarListaSalas(payload) {
  rooms.value = payload;
  console.log("📜 Lista de salas:", payload);
}

function manejarSalasCreadas(payload) {
  console.log("🆕 Sala creada desde backend:", payload);
  const room = {
    roomId: payload.roomId,
    playerId: props.jugador.id,
    isHost: true,
    players: [{ playerId: props.jugador.id, username: props.jugador.username }], // Nos añadimos a la lista
  };
  emit("sala-seleccionada", room); // Emit el evento 'sala-seleccionada' hacia el padre (App.vue).
}

function manejarErrorSalas(payload) {
  console.error("❌ Error:", payload.message);
  mensajeError.value = payload.message;
}

// Emits al servidor (Acciones del Usuario)

//Pide al servidor la lista de salas actualizada:
function actualizarSalas() {
  console.log("📡 Solicitando lista de salas...");
  // Enviamos el evento 'get_rooms' al servidor y responderá enviando 'rooms_list'.
  communicationManager.emit("get_rooms");
}

// Envía una petición al servidor para crear una nueva sala cuando el usuario presiona el botón "CREAR".
function crearSala() {
  if (!props.jugador) return; // Comprobación de que si el jugador existe.
  const roomName = nuevaSala.value.trim() || `Room_${props.jugador.username}`; // Obtenemos el nombre del input. Si está vacío, usamos uno por defecto.

  // Enviamos el evento 'create_room' al servidor, pasando nuestros datos.
  communicationManager.emit("create_room", {
    roomName: roomName,
    playerId: props.jugador.id,
    username: props.jugador.username,
  });

  // Limpiamos el input después de enviar la petición.
  nuevaSala.value = "";
}

function unirseSala(room) {
  if (!props.jugador) return;

  communicationManager.emit("join_room", {
    roomId: room.roomId,
    playerId: props.jugador.id,
    username: props.jugador.username,
  });

  emit("sala-seleccionada", room);
}

// Eventos de Hijos a Padre

function manejarVerPerfil() {
  emit("ver-perfil"); // Emit a App.vue
}

function manejarSalirSalas() {
  emit("logout"); // Emit a App.vue
}

//HOOKS DE CICLO DE VIDA

onMounted(() => {
  console.log(
    "ID:",
    props.jugador.id,
    ", Nombre:",
    props.jugador.username,
    "."
  );

  // 1. Nos conectamos al servidor de Sockets.
  communicationManager.connect();

  // 2. Registramos nuestros "oyentes". Le decimos al 'communicationManager'
  // qué funciones debe ejecutar cuando lleguen estos mensajes del servidor.
  communicationManager.on("rooms_list", manejarListaSalas);
  communicationManager.on("room_created", manejarSalasCreadas);
  communicationManager.on("room_error", manejarErrorSalas);

  actualizarSalas(); // 3. Pedimos la lista de salas por primera vez.
});

// Limpiar
onUnmounted(() => {
  communicationManager.off("rooms_list", manejarListaSalas);
  communicationManager.off("room_created", manejarSalasCreadas);
  communicationManager.off("room_error", manejarErrorSalas);
});
</script>

<template>
  <div class="scene" :class="props.escena">
    <div class="room-scene">
      <div class="wall wall-back">
        <div class="wall-light"></div>
        <div class="door-frame">
          <div class="garage-door">
            <div class="salas-container">
              <div class="header-container">
                <LogicaPerfilUsuario
                  v-if="jugador"
                  :jugador="jugador"
                  @ver-perfil="manejarVerPerfil"
                />
                <LogicaSalirSala @logout="manejarSalirSalas" />
              </div>
              <LogicaCrearLobby
                v-model:valorActual="nuevaSala"
                @crear-lobby="crearSala"
              />
              <LogicaPintarSalas :rooms="rooms" @unirse-sala="unirseSala" />
            </div>
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
