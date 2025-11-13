<script setup>
defineProps({
  modelValue: String, // para v-model:nombre
  editando: Boolean,
});

const emit = defineEmits(["update:modelValue", "toggle-edit"]);

function handleInput(event) {
  emit("update:modelValue", event.target.value);
}

function handleToggle() {
  emit("toggle-edit");
}
</script>

<template>
  <fieldset class="perfil-fieldset">
    <div class="campo campo-con-accion">
      <label for="nombre">Nombre de Jugador:</label>
      <div class="input-wrapper">
        <input
          type="text"
          id="nombre"
          :value="modelValue"
          @input="handleInput"
          placeholder="Escribe tu nombre"
          :readonly="!editando"
          class="input-con-accion"
        />
        <button @click="handleToggle" class="btn-editar-campo">
          {{ editando ? "Bloquear" : "Editar" }}
        </button>
      </div>
    </div>
  </fieldset>
</template>

<style scoped>
/* --- Estilos específicos para este campo --- */
.perfil-fieldset {
  border: 1px solid #555;
  padding: 16px 20px;
  margin-bottom: 24px;
}
.campo {
  margin-bottom: 20px;
}
.campo label {
  display: block;
  font-weight: bold;
  margin-bottom: 8px;
  color: #f1e8e8;
  font-size: 17px;
}
.campo-con-accion .input-wrapper {
  display: flex;
  gap: 8px;
}
.input-con-accion {
  flex: 1;
  background-color: #383838;
  border: 1ex solid none;
  outline: 7px solid #383838;
  color: #f1e8e8;
  word-wrap: break-word;
  height: 30px;
  font-size: 17px;
  text-align: center;
  transition: all 1s;
  font-weight: bold;
  font-family: "Courier New", Courier, monospace;
  width: 100%;
  padding: 8px 10px;
  box-sizing: border-box;
}
.input-con-accion:hover,
.input-con-accion:focus {
  background-color: #f1e8e8;
  color: #383838;
  outline-color: #f1e8e8;
}
.input-con-accion:read-only {
  background-color: #444;
  color: #aaa;
  cursor: not-allowed;
  outline-color: #444;
}
.input-con-accion:read-only:hover,
.input-con-accion:read-only:focus {
  background-color: #444;
  color: #aaa;
  outline-color: #444;
}
button {
  background-color: #f1e8e8;
  color: #383838;
  border: none;
  font-family: inherit;
  font-weight: bold;
  font-size: 17px;
  text-align: center;
  transition: all 1s;
  box-sizing: border-box;
  padding: 10px 16px;
  cursor: pointer;
  white-space: nowrap;
}
button:hover {
  background-color: #ffffff;
  transform: scale(1.03);
}
button:active {
  transform: scale(0.98);
}
.btn-editar-campo {
  flex: 0.5;
  background-color: #555;
  color: #f1e8e8;
  font-size: 15px;
  height: 30px;
  padding: 0;
}
.btn-editar-campo:hover {
  background-color: #666;
  transform: scale(1);
}
</style>
