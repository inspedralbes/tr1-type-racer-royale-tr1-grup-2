<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { io } from 'socket.io-client';


//Funciones 


onMounted(() => {
  socket.on('game_started', (data) => {
    
  });
});

</script>
<template>
  <div id="contenedor-juego">
    <li></li>

    <div id="contenedor-mesa">
      <span>hola
      </span>
    </div>
    <div class="contenedor-texto">
      <input
        type="text"
        class="text-input"
        placeholder="Comença a escriure..."
      />
    </div>
  </div>
</template>
<style scoped>
#contenedor-juego {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100vw;
  height: 100vh;
  padding: 20px;
  box-sizing: border-box;
  background-color: rgba(0, 0, 0, 0.5);
}

#contenedor-mesa{
  background-image: url(../../public/assets/img/Mesa-sinfondo-nopixel.png);
  background-size: cover;
  display: flex;
  min-width: 500px;
  min-height: 300px;
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
