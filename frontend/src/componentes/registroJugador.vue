<script setup>
import { ref } from "vue";

const vistaActual = ref("salaEspera");

const nomJugador = ref("");
const jugadors = ref([]);

function connectarAlServidor() {
  /*communicationManager.connect();

  communicationManager.emit('player_join', {
    username: nomJugador.value
  });
  vistaActual.value = 'lobby';*/
}
</script>
<template>
  <div id="contenedor-juego">
    <div v-if="vistaActual === 'salaEspera'" class="vista-container">
      <h1>Type Racer Royale</h1>
      <input type="text" v-model="nomJugador" placeholder="Exemple: Paco" />
      <button @click="connectarAlServidor">Entra al Lobby</button>
    </div>
  </div>
</template>

<style scoped>
#contenedor-juego {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin: 5% auto;
  min-width: 900px;
  min-height: 500px;
  border-radius: 10px;
  padding: 20px;
  box-sizing: border-box;
}

.contenedor-texto {
  margin-top: 50px;
}
.text-input {
  font-family: "Courier New", Courier, monospace;
  font-size: 20px;
  min-width: 500px;
  min-height: 30px;
  border-radius: 5px;
  text-align: center;
  border-color: rgba(137, 43, 226, 0);
  background-color: rgba(240, 248, 255, 0);
  color: wheat;
}
</style>
