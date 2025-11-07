<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import RegistroJugador from "./componentes/registroJugador.vue";
import Lobby from "./componentes/Lobby.vue";
import Juego from "./componentes/interfazJuego.vue";
import PantallaFinal from "./componentes/pantallaFinal.vue";
import PuertaGaraje from "./componentes/puertaGaraje.vue";
import communicationManager from "./services/communicationManager";
</script>

<template>
  <PuertaGaraje />
</template>

<style></style>
