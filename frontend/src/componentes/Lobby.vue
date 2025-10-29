<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const vistaActual = ref('lobby')
const joEsticLlest = ref(false);

onMounted(() => {
  communicationManager.on('updatePlayerList', (llistaDeJugadors) => {
    jugadors.value = llistaDeJugadors;
  });
});

function marcarComLlest() {
  communicationManager.emit('player_ready', {
    username: nomJugador.value
  });
  joEsticLlest.value = true;
}


</script>
<template>
  <div id="contenedor-juego">
      <div v-if="vistaActual === 'lobby'" class="vista-container">
      <h1>Type Racer Royale</h1>
      <input type="text" v-model="nomJugador" placeholder="Exemple: Paco" />
      <button @click="marcarComLlest" :disabled="joEsticLlest">Estic llest</button>
      <button @click="connectarAlServidor">Comença la parida</button>
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