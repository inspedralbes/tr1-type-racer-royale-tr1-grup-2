<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import communicationManager from '../services/communicationManager';

const props = defineProps({
  lobbyState: {
    type: Object,
    required: true
  }
});

function iniciarJuego() {
  communicationManager.emit('start_game', {
    roomId: props.lobbyState.roomId,
    playerId: props.lobbyState.playerId
  });
}
</script>

<template>
  <div id="contenedor-juego">
    <div class="vista-container">
      <h1>Lobby de la Sala: {{ lobbyState.roomId }}</h1>
      
      <h2>Jugadores Conectados:</h2>
      <ul>
        <li v-for="jugador in lobbyState.players" :key="jugador.playerId">
          {{ jugador.username }}
        </li>
      </ul>

      <!-- <button @click="marcarComLlest" :disabled="joEsticLlest">
        Estic llest
      </button> -->
      <button v-if="lobbyState.isHost" @click="iniciarJuego">Comença la partida</button>
    </div>
  </div>
</template>

<style scoped></style>
