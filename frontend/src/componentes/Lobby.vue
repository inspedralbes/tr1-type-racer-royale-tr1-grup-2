<script setup>
import { ref, computed } from "vue";
import communicationManager from '../services/communicationManager';

const props = defineProps({
  lobbyState: {
    type: Object,
    required: true
  }
});

const joEsticLlest = ref(false);

function marcarComLlest() {
  joEsticLlest.value = true;
  communicationManager.emit('player_ready', {
    playerId: props.lobbyState.playerId,
    isReady: true
  });
}

const allPlayersReady = computed(() => {
  if (!props.lobbyState || !props.lobbyState.players || props.lobbyState.players.length < 2) {
    // Not enough players to start
    return false;
  }
  // Check if all players *except the host* are ready
  return props.lobbyState.players.every((player, index) => {
    if (index === 0) return true; // Host doesn't need a ready status
    return player.isReady;
  });
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
        <li v-for="(jugador, index) in lobbyState.players" :key="jugador.playerId">
          {{ jugador.username }}
          <span v-if="index > 0">
            - {{ jugador.isReady ? 'Listo' : 'No listo' }}
          </span>
        </li>
      </ul>

      <button v-if="!lobbyState.isHost" @click="marcarComLlest" :disabled="joEsticLlest">
        Estic llest
      </button>
      
      <button v-if="lobbyState.isHost" @click="iniciarJuego" :disabled="!allPlayersReady">
        Comença la partida
      </button>
      <p v-if="lobbyState.isHost && !allPlayersReady">Tots els jugadors han d'estar llestos per començar.</p>
    </div>
  </div>
</template>

<style scoped></style>
