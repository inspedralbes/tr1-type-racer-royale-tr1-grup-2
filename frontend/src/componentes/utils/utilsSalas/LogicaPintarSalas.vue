<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["unirse-sala"]);

const searchText = ref("");

const salasFiltradas = computed(() => {
  const filtradas = props.modelValue.filter((sala) =>
    sala.roomName.toLowerCase().includes(searchText.value.toLowerCase())
  );
  return filtradas.slice(0, 3);
});
</script>

<template>
  <h3 class="titulo">Salas disponibles</h3>

  <input
    v-model="searchText"
    type="text"
    class="input"
    placeholder="Buscar sala por nombre..."
  />

  <div class="lista-salas">
    <div v-for="sala in salasFiltradas" :key="sala.roomId" class="sala-card">
      <p>
        <strong>{{ sala.roomName }}</strong>
      </p>
      <p>{{ sala.numPlayers }}/{{ sala.maxPlayers }}</p>
      <p>Estado: {{ sala.gameState }}</p>

      <button @click="emit('unirse-sala', sala)">Unirse</button>
    </div>

    <div v-if="!modelValue || modelValue.length === 0">
      No hay salas disponibles en este momento.
    </div>

    <div v-else-if="salasFiltradas.length === 0">
      No se encontraron salas que coincidan con tu búsqueda.
    </div>
  </div>
</template>

<style scoped>
/* Estilo para el nuevo input */

.titulo {
  border: 1ex solid none;
  color: #f1e8e8;
  height: 30px;
  font-size: 17px;
  text-align: center;
  transition: all 1s;
  font-weight: bold;
  font-family: "Courier New", Courier, monospace;
  box-sizing: border-box;
  padding: 0 10px;
}

.input {
  width: 100%;
  padding: 8px 10px;
  border-radius: 4px;
  border: 1px solid #444;
  background-color: #333;
  color: white;
  box-sizing: border-box;
  margin-bottom: 12px;
}

.input {
  background-color: #383838;
  border: 1ex solid none;
  margin: 0;
  padding: 0;
  color: #383838;
  word-wrap: break-word;
  outline: 7px solid #383838;
  height: 30px;
  font-size: 17px;
  text-align: center;
  transition: all 1s;
  max-width: 40%;
  font-weight: bold;
  font-family: "Courier New", Courier, monospace;
}

.input:hover {
  border-top-width: 0.2em;
  background-color: #f1e8e8;
}

.input:focus {
  border-top-width: 0.2em;
  background-color: #f1e8e8;
}

/* GRID lista-salas */
.lista-salas {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 10px;
  font-family: "Courier New", Courier, monospace;
  font-weight: bold;
}
.sala-card {
  background-color: #383838;
  color: #f1e8e8;
  outline: 7px solid #383838;
  border: 1ex solid none;
  box-sizing: border-box;
  padding: 15px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
}

.sala-card p {
  margin: 0;
  font-size: 17px;
  white-space: nowrap;
}

.sala-card strong {
  font-size: 20px;
  color: #fff;
}

.sala-card button {
  background-color: #f1e8e8;
  color: #383838;
  border: none;
  font-family: inherit;
  font-weight: bold;
  font-size: 17px;
  text-align: center;
  transition: all 1s;
  box-sizing: border-box;
  padding: 10px;
  cursor: pointer;
  white-space: nowrap;
  margin-top: 0;
  flex-shrink: 0;
}

.sala-card button:hover {
  background-color: #ffffff;
  transform: scale(1.03);
}

.lista-salas > div:not(.sala-card) {
  grid-column: 1 / -1;
  background-color: #383838;
  color: #f1e8e8;
  outline: 7px solid #383838;
  border: 1ex solid none;
  box-sizing: border-box;
  padding: 30px;
  text-align: center;
  font-size: 17px;
}
</style>
