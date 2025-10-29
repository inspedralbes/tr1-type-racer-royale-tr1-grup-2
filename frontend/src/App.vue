<script setup>
import { ref } from 'vue';
import RegistroJugador from './componentes/registroJugador.vue';
import Lobby from './components/Lobby.vue';
import InetrfazJuego from './componentes/interfazJuego.vue';
import FiPartida from './components/FiPartida.vue';

const vistaActual = ref('registroJugador');
</script>

<template>
  <RegistroJugador v-if="vistaActual === 'registroJugador'" @registrado="vistaActual = 'lobby'" />
  <Lobby v-if="vistaActual === 'lobby'" @iniciarJuego="vistaActual = 'juego'" />
  <InetrfazJuego v-if="vistaActual === 'juego'" @finJuego="vistaActual = 'fiPartida'" />
  <FiPartida v-if="vistaActual === 'fiPartida'" @reiniciar="vistaActual = 'salaEspera'" />
</template>

<style scoped></style>
