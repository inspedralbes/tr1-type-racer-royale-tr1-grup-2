<script setup>
defineProps({
  modelValue: String, // v-model:avatar
  avataresDisponibles: Array,
  avatarEsPersonalizado: Boolean,
});

const emit = defineEmits(["update:modelValue", "file-change"]);

function seleccionarAvatar(avatarSrc) {
  emit("update:modelValue", avatarSrc);
}

function handleFileChange(event) {
  emit("file-change", event);
}
</script>

<template>
  <fieldset class="perfil-fieldset">
    <legend>Personalización</legend>
    <div class="campo">
      <label>Elige un nuevo Avatar:</label>
      <label>
        <input type="text" />
        Elige un nuevo Avatar:
      </label>
      <div class="avatares-seleccion">
        <img
          v-for="avatarSrc in avataresDisponibles"
          :key="avatarSrc"
          :src="avatarSrc"
          alt="Opción de avatar"
          class="avatar-option"
          :class="{ selected: avatarSrc === modelValue }"
          @click="seleccionarAvatar(avatarSrc)"
        />

        <img
          v-if="avatarEsPersonalizado"
          :src="modelValue"
          alt="Avatar personalizado"
          class="avatar-option"
          :class="{ selected: true }"
          @click="seleccionarAvatar(modelValue)"
        />

        <label class="avatar-option avatar-uploader">
          <span>+</span>
          <input
            type="file"
            @change="handleFileChange"
            accept="image/*"
            class="input-file-oculto"
          />
        </label>
      </div>
    </div>
  </fieldset>
</template>

<style scoped>
/* --- Estilos específicos para el selector de avatar --- */
.perfil-fieldset {
  border: 1px solid #555;
  padding: 16px 20px;
  margin-bottom: 24px;
}
legend {
  font-weight: bold;
  padding: 0 8px;
  color: #f1e8e8;
  font-size: 17px;
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
.avatares-seleccion {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 10px;
}
.avatar-option {
  width: 64px;
  height: 64px;
  border-radius: 0;
  border: 3px solid transparent;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease;
  object-fit: cover;
  box-sizing: border-box;
  background-color: #555;
}
.avatar-option:hover {
  transform: scale(1.05);
  border-color: #aaa;
}
.avatar-option.selected {
  border-color: #f1e8e8;
  transform: scale(1.1);
  box-shadow: 0 0 10px rgba(241, 232, 232, 0.5);
}
.input-file-oculto {
  display: none;
}
.avatar-uploader {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2.5rem;
  font-weight: 300;
  color: #aaa;
  background-color: #333;
  border: 3px dashed #555;
  border-radius: 0;
}
.avatar-uploader:hover {
  background-color: #444;
  border-color: #f1e8e8;
  color: #f1e8e8;
}
.avatar-uploader span {
  line-height: 1;
  margin-top: -4px;
}
</style>
