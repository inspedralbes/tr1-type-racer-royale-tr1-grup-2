<script setup>
import { ref, onMounted } from "vue";
import communicationManager from "./services/communicationManager";

import RegistroJugador from "./componentes/PantallaLogin.vue";
import PantallaSalas from "./componentes/pantallaSalas.vue";
import Lobby from "./componentes/Lobby.vue";
import Juego from "./componentes/interfazJuego.vue";
import PantallaFinal from "./componentes/pantallaFinal.vue";
import PantallaPerfil from "./componentes/pantallaPerfil.vue";
import { getApiUrl } from "./logic/getUrl.js";

const vistaActual = ref("registro"); 
const jugador = ref(null);
const lobbyState = ref(null);
const roomSeleccionada = ref(null);
const ganador = ref(null);

onMounted(async () => {
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const response = await fetch(getApiUrl("/api/user/user"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        }
      );

      if (response.ok) {
        const userData = await response.json();
        jugador.value = { ...userData, token };
        vistaActual.value = "salas";
      } else {
        localStorage.removeItem("token");
      }
    } catch (error) {
      console.error("Error al verificar el token:", error);
      localStorage.removeItem("token");
    }
  }
});

function onJugadorRegistrado(data) {
  jugador.value = data;
  vistaActual.value = "salas";
}

function onSalaSeleccionada(room) {
  roomSeleccionada.value = room;
  vistaActual.value = "lobby";
}

function onJuegoIniciado(payload) {
  vistaActual.value = "juego";
}

// FUNCION QUE INDICA EL FINAL DEL JUEGO
function onJuegoFinalizado(winner) {
  ganador.value = winner;
  vistaActual.value = "final";
}

// FUCNION QUE MANEJA LA SALIDA DE LA LOBBY
function handleLobbyLeave() {
  console.log("APP: Recibido 'leave-lobby'. Volviendo a pantalla de salas.");

  if (jugador.value && jugador.value.playerId) {
    communicationManager.emit("leave_game", {
      playerId: jugador.value.playerId,
    });
  }

  vistaActual.value = "salas";
  roomSeleccionada.value = null; 
}


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

  handlePerfilVolver();
}

function handleGoHome() {


  console.log("🔹 Cambiando vistaActual a 'perfil'");

  vistaActual.value = "perfil";

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
    @registrado="onJugadorRegistrado"
  />
</template>
