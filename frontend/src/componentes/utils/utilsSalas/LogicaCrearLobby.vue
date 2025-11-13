<script setup>
defineProps({
  modelValue: String,
});

const emit = defineEmits(["update:modelValue", "crear-lobby"]);

function onInput(event) {
  emit("update:modelValue", event.target.value);
}
</script>

<template>
  <div class="crear-sala">
    <input
      class="nombre-sala"
      :value="modelValue"
      @input="onInput"
      placeholder="Nombre de sala"
    />
    <button class="button-sala" @click="emit('crear-lobby')">Crear sala</button>
  </div>
</template>

<style scoped>
.crear-sala {
  display: flex;
  align-items: center;
  margin-top: 0.8em;
  gap: 10px;
  justify-content: center;
}

.button-sala {
  background-color: #383838;
  border: 1ex solid none;
  margin: 0;
  outline: 7px solid #383838;
  color: #f1e8e8;
  height: 30px;
  font-size: 17px;
  text-align: center;
  transition: all 1s;
  font-weight: bold;
  font-family: "Courier New", Courier, monospace;
  box-sizing: border-box;
  padding: 0 10px;
  cursor: pointer;
}

.nombre-sala {
  background-color: #383838;
  border: 1ex solid none;
  margin: 0;
  color: #f1e8e8;
  word-wrap: break-word;
  outline: 7px solid #383838;
  height: 30px;
  font-size: 17px;
  text-align: center;
  transition: all 1s;
  max-width: 190px;
  font-weight: bold;
  font-family: "Courier New", Courier, monospace;
  box-sizing: border-box;
  padding: 0 10px;
}

.nombre-sala:hover,
.nombre-sala:focus {
  border-top-width: 0.2em;
  background-color: #f1e8e8;
  color: #383838;
}
</style>
