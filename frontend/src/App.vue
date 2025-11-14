<script setup>
import { ref, onMounted } from "vue";
import communicationManager from "./services/communicationManager";

import RegistroJugador from "./componentes/PantallaLogin.vue";
import PantallaSalas from "./componentes/pantallaSalas.vue";
import Lobby from "./componentes/Lobby.vue";
import Juego from "./componentes/interfazJuego.vue";
import PantallaFinal from "./componentes/pantallaFinal.vue";
import PantallaPerfil from "./componentes/pantallaPerfil.vue";

const vistaActual = ref("registro"); // registro | salas | lobby | juego | final
const jugador = ref(null);
const lobbyState = ref(null);
const roomSeleccionada = ref(null);
const ganador = ref(null);

// Se ejecuta al montar el componente.
onMounted(async () => {
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const response = await fetch("http://typebet.daw.inspedralbes.cat:3000/api/user/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        const userData = await response.json();
        // Guardamos los datos del usuario y el token para futuras peticiones
        jugador.value = { ...userData, token };
        vistaActual.value = "salas";
      } else {
        // Si el token es inválido o expiró, limpiamos localStorage
        localStorage.removeItem("token");
      }
    } catch (error) {
      console.error("Error al verificar el token:", error);
      localStorage.removeItem("token");
    }
  }
});

function onJugadorRegistrado(data) {
  // data ya contiene el token y los datos del usuario desde el backend
  jugador.value = data;
  vistaActual.value = "salas";
}

// 🔹 Evento: jugador entra a sala
function onSalaSeleccionada(room) {
  roomSeleccionada.value = room;
  vistaActual.value = "lobby";
}

// 🔹 Evento: partida iniciada
function onJuegoIniciado(payload) {
  vistaActual.value = "juego";
}

// 🔹 Evento: juego terminado
function onJuegoFinalizado(winner) {
  ganador.value = winner;
  vistaActual.value = "final";
}

// ✅ 1. AÑADE ESTA NUEVA FUNCIÓN
// 🔹 Evento: Salir del Lobby (de Lobby.vue)
function handleLobbyLeave() {
  console.log("APP: Recibido 'leave-lobby'. Volviendo a pantalla de salas.");

  if (jugador.value && jugador.value.playerId) {
    communicationManager.emit("leave_game", { playerId: jugador.value.playerId });
  }
  
  vistaActual.value = "salas";
  roomSeleccionada.value = null; // Limpiamos la sala seleccionada
}

// Evento: ver-perfil (PantallaSalas-PantallaPerfil)

function irAPerfil() {
  vistaActual.value = "perfil";
}

function handlePerfilVolver() {
  if (jugador.value) {
    vistaActual.value = "salas";
  } else {
    vistaActual.value = "registro";
  }
}

function guardarPerfil(payload) {
  console.log("Guardando perfil:", payload);

  if (jugador.value) {
    jugador.value.username = payload.newName;
    jugador.value.avatar = payload.newAvatar;
  }

  // Volver a la pantalla anterior (registro o salas)
  handlePerfilVolver();
}

function handleGoHome() {
  try {
    communicationManager.reset(); // desconecta y limpia todo
  } catch (e) {
    console.error("Error al desconectar socket:", e);
  }

  localStorage.clear();
  sessionStorage.clear();

  console.log("🔹 Cambiando vistaActual a 'registro'");

  vistaActual.value = "registro";

  jugador.value = null;
  roomSeleccionada.value = null;
  ganador.value = null;
}
</script>

<template>
  <PantallaSalas
    v-if="vistaActual === 'salas'"
    :jugador="jugador"
    @sala-seleccionada="onSalaSeleccionada"
    @ver-perfil="irAPerfil"
    @logout="handleGoHome"
    :escena="vistaActual"
  />

  <RegistroJugador
    v-if="vistaActual === 'registro'"
    @registrado="onJugadorRegistrado"
  />

  <PantallaPerfil
    v-if="vistaActual === 'perfil'"
    @go-home="handlePerfilVolver"
    @guardar-perfil="guardarPerfil"
  />

  <Lobby
    v-if="vistaActual === 'lobby'"
    :jugador="jugador"
    :room="roomSeleccionada"
    @juego-iniciado="onJuegoIniciado"
    @leave-lobby="handleLobbyLeave"
  />

  <Juego
    v-if="vistaActual === 'juego'"
    :jugador="jugador"
    :room="roomSeleccionada"
    @juego-finalizado="onJuegoFinalizado"
  />
  <PantallaFinal
    v-if="vistaActual === 'final'"
    :winner="ganador"
    @go-home="handleGoHome"
  />
</template>
