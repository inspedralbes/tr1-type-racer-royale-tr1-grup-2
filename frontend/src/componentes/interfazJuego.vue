<script setup>
import { ref, onMounted, onUnmounted } from "vue";

//Funciones y variables de el teclado
const filesDelTeclat = ref([
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
]);
const teclaDada = ref("");

function presionarTecla(event) {
  teclaDada.value = event.key.toUpperCase();
  setTimeout(() => {
    teclaDada.value = "";
  }, 100);
}
onMounted(() => {
  window.addEventListener("keydown", presionarTecla);
});
onUnmounted(() => {
  window.removeEventListener("keydown", presionarTecla);
});



</script>
<template>
  <div id="contenedor-juego">
    <li></li>
    <div class="contenedor-texto">
      <input
        type="text"
        class="text-input"
        placeholder="Comença a escriure..."
      />
    </div>
    <div
      v-for="(fila, indexFila) in filesDelTeclat"
      :key="indexFila"
      class="fila-teclado"
    >
      <button
        v-for="(letra, indexLetra) in fila"
        :key="indexLetra"
        class="teclado"
        :class="{ 'tecla-premuda': letra === teclaDada }"
      >
        {{ letra }}
      </button>
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

.teclado.tecla-premuda {
  color: rgb(37, 37, 37);
  background-color: rgb(248, 252, 43);
  border-color: rgb(248, 252, 43);
}

.fila-teclado {
  display: flex;
  column-gap: 10px;
  margin-top: 10px;
  width: 100%;
  justify-content: center;
  flex-wrap: wrap;
}

.teclado {
  margin-top: 10px;
  min-width: 44px;
  min-height: 44px;
  border-radius: 5px;
  font-family: Arial, Helvetica, sans-serif;
  color: white;
  box-shadow: 2px 2px 2px 1px rgba(0, 0, 0, 0.2);
  background-color: rgba(0, 0, 0, 0);
  border-color: yellow;
}
</style>
