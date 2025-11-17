<script setup>
import { playerId } from "../../../logic/globalState.js";

defineProps({
  roomId: {
    type: String,
    required: true,
  },
  players: {
    type: Array,
    required: true,
  },
  isHost: {
    type: Boolean,
    required: true,
  },
  canStartGame: {
    type: Boolean,
    required: true,
  },
});
</script>

<template>
  <div class="screen">
    <div class="screen-body">
      <div class="room-id">Sala: {{ roomId }}</div>

      <div class="players-header">Jugadores ({{ players.length }}):</div>
      <ul class="player-list">
        <li
          v-for="jugador in players"
          :key="jugador.playerId"
          :class="{ 'is-self': jugador.playerId === playerId }"
        >
          <span>{{ jugador.username }}</span>
          <span v-if="jugador.playerId === playerId" class="tag-self"
            >(Tú)</span
          >
        </li>
      </ul>

      <p class="info-message" v-if="isHost && !canStartGame">
        🕓 Se necesitan 2 jugadores para empezar.
      </p>
      <p class="info-message" v-if="!isHost">
        Esperando a que el host inicie la partida...
      </p>
    </div>
  </div>
</template>

<style scoped>

.screen {
  height: 350px;
  border-radius: 10px;
  border: 2px solid #000;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.8), 0 0 5px rgba(0, 0, 0, 0.5);

  background-color: #a8c4b0;
  color: #223a26;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.2);
  font-family: "Press Start 2P", cursive;

  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative; 

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      to bottom right,
      rgba(255, 255, 255, 0.15) 0%,
      rgba(255, 255, 255, 0) 50%
    );
    pointer-events: none;
    border-radius: 10px;
  }
}

.screen-body {
  flex-grow: 1;
  padding: 12px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #444 #222;
}

.room-id {
  font-size: 1.2rem;
  font-weight: bold;
  text-align: center;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.4);
  padding-bottom: 7px;
  margin-bottom: 10px;
  color: #1a2c1e;
}

.players-header {
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 6px;
  color: #335037;
}

.player-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 230px;
  overflow-y: auto;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.2);
}

.player-list li {
  font-size: 1.05rem;
  padding: 6px 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px dotted rgba(0, 0, 0, 0.15);
}

.player-list li:last-child {
  border-bottom: none;
}

.player-list li.is-self {
  background-color: rgba(0, 0, 0, 0.15);
  font-weight: bold;
  color: #1a2c1e;
}

.tag-self {
  font-size: 0.85rem;
  font-style: italic;
  color: #335037;
}

.info-message {
  font-size: 0.9rem;
  text-align: center;
  margin-top: 15px;
  color: #335037;
  font-style: italic;
  padding: 5px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 5px;
}

.screen-body {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.4) rgba(0, 0, 0, 0.1);
}

.screen-body::-webkit-scrollbar {
  width: 8px;
}

.screen-body::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

.screen-body::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.4);
  border-radius: 10px;
  border: 2px solid rgba(0, 0, 0, 0.1);
}
</style>
