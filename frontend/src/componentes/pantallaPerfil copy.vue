<script setup>
import { ref, computed } from "vue";
import { playerName, playerId, playerAvatar } from "../logic/globalState.js";

const emit = defineEmits(["go-home", "guardar-perfil"]);

const guardado = ref(false);

// --- Lógica de Avatares ---
const avataresDisponibles = ref([
  "../../public/assets/img/imgAvatares/avatar1.png",
  "../../public/assets/img/imgAvatares/avatar2.png",
  "../../public/assets/img/imgAvatares/avatar3.png",
  "../../public/assets/img/imgAvatares/avatar4.png",
]);

const formData = ref({
  nombre: playerName.value,
  email: "",
  avatar: playerAvatar.value || avataresDisponibles.value[0],
  tema: "sistema",
  notificaciones: false,
});

const editando = ref({
  nombre: false,
  email: false,
});

function toggleEdit(campo) {
  if (campo in editando.value) {
    editando.value[campo] = !editando.value[campo];
  }
}

function seleccionarAvatar(avatar) {
  formData.value.avatar = avatar;
}

// SUBIR IMAGEN

const avatarEsPersonalizado = computed(() => {
  if (!formData.value.avatar) return false;
  return !avataresDisponibles.value.includes(formData.value.avatar);
});

function onFileChange(event) {
  const file = event.target.files[0];
  if (file && file.type.startsWith("image/")) {
    const reader = new FileReader();

    reader.onload = (e) => {
      // Asigna la imagen leída (como Data URL) directamente
      // al avatar en el formulario.
      formData.value.avatar = e.target.result;
    };

    reader.readAsDataURL(file);
  }
}

// --- Acciones ---

function guardarCambios() {
  playerName.value = formData.value.nombre;
  playerAvatar.value = formData.value.avatar;

  emit("guardar-perfil", {
    newName: formData.value.nombre,
    newAvatar: formData.value.avatar,
  });

  guardado.value = true;
  setTimeout(() => {
    guardado.value = false;
  }, 1500);
}

function handleGoHome() {
  emit("go-home");
}
</script>

<template>
  <div class="perfil-container">
    <h2>Configuración de Perfil</h2>

    <div class="perfil-card">
      <div v-if="guardado" class="feedback-guardado">
        ¡Cambios guardados con éxito!
      </div>

      <fieldset class="perfil-fieldset">
        <div class="campo campo-con-accion">
          <label for="nombre">Nombre de Jugador:</label>
          <div class="input-wrapper">
            <input
              type="text"
              id="nombre"
              v-model="formData.nombre"
              placeholder="Escribe tu nombre"
              :readonly="!editando.nombre"
              class="input-con-accion"
            />
            <button @click="toggleEdit('nombre')" class="btn-editar-campo">
              {{ editando.nombre ? "Bloquear" : "Editar" }}
            </button>
          </div>
        </div>
      </fieldset>

      <fieldset class="perfil-fieldset">
        <legend>Personalización</legend>
        <div class="campo">
          <label>Elige un nuevo Avatar:</label>
          <div class="avatares-seleccion">
            <img
              v-for="avatarSrc in avataresDisponibles"
              :key="avatarSrc"
              :src="avatarSrc"
              alt="Opción de avatar"
              class="avatar-option"
              :class="{ selected: avatarSrc === formData.avatar }"
              @click="seleccionarAvatar(avatarSrc)"
            />

            <img
              v-if="avatarEsPersonalizado"
              :src="formData.avatar"
              alt="Avatar personalizado"
              class="avatar-option"
              :class="{ selected: true }"
              @click="seleccionarAvatar(formData.avatar)"
            />

            <label class="avatar-option avatar-uploader">
              <span>+</span>
              <input
                type="file"
                @change="onFileChange"
                accept="image/*"
                class="input-file-oculto"
              />
            </label>
          </div>
        </div>
      </fieldset>

      <div class="acciones">
        <button @click="handleGoHome" class="btn-secundario">Volver</button>
        <button @click="guardarCambios" class="btn-primario">
          Guardar Cambios
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.perfil-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  font-family: "Courier New", Courier, monospace;
  font-weight: bold;
  background-color: #333;
  color: #f1e8e8;
  min-height: 100vh;
  box-sizing: border-box;
}

h2 {
  border: 1ex solid none;
  color: #f1e8e8;
  height: 30px;
  font-size: 20px;
  text-align: center;
  transition: all 1s;
  font-weight: bold;
  font-family: "Courier New", Courier, monospace;
  box-sizing: border-box;
  padding: 0 10px;
  margin-bottom: 24px;
}

.perfil-card {
  background: #383838;
  outline: 7px solid #383838;
  border: 1ex solid none;
  box-sizing: border-box;
  padding: 24px;
  width: 100%;
  max-width: 600px;
  color: #f1e8e8;
}

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

.campo label,
.campo-toggle label {
  display: block;
  font-weight: bold;
  margin-bottom: 8px;
  color: #f1e8e8;
  font-size: 17px;
}

.input-con-accion,
.select-estilizado,
.campo input[type="text"],
.campo input[type="email"] {
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
.select-estilizado:hover,
.campo input[type="text"]:hover,
.campo input[type="email"]:hover {
  background-color: #f1e8e8;
  color: #383838;
  outline-color: #f1e8e8;
}

.input-con-accion:focus,
.select-estilizado:focus,
.campo input[type="text"]:focus,
.campo input[type="email"]:focus {
  background-color: #f1e8e8;
  color: #383838;
  outline-color: #f1e8e8;
}

.campo-con-accion .input-wrapper {
  display: flex;
  gap: 8px;
}

.input-con-accion {
  flex-grow: 1;
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
  flex-shrink: 1;
  background-color: #555;
  color: #f1e8e8;
  font-size: 16px;
}
.btn-editar-campo:hover {
  background-color: #666;
}

/* Avatares - quitamos el borde redondeado para un look "blocky" */
.avatares-seleccion {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 10px;
}

.avatar-option {
  width: 64px;
  height: 64px;
  border-radius: 0; /* Sin borde redondeado */
  border: 3px solid transparent;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease;
  object-fit: cover;
  box-sizing: border-box;
  background-color: #555; /* Fondo para imágenes rotas */
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

/* Botón de subir adaptado */
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
  border-radius: 0; /* Sin borde redondeado */
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

.acciones {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  border-top: 1px solid #555;
  padding-top: 20px;
}

/* Feedback adaptado al estilo "no-rooms" */
.feedback-guardado {
  grid-column: 1 / -1;
  background-color: #aee0ae; /* Un verde claro */
  color: #383838; /* Texto oscuro */
  outline: 7px solid #aee0ae;
  border: 1ex solid none;
  box-sizing: border-box;
  padding: 20px;
  text-align: center;
  font-size: 17px;
  margin-bottom: 20px;
}

/* Estilos de Cajas de selección y toggles (adaptados) */
.select-estilizado {
  /* El estilo de input ya aplica la mayoría */
  appearance: none;
  background-image: url('data:image/svg+xml;utf8,<svg fill="%23f1e8e8" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>');
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 20px;
  padding-right: 40px;
  cursor: pointer;
}

.campo-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}
.campo-toggle label {
  margin-bottom: 0;
}
.toggle-switch {
  width: 20px;
  height: 20px;
  cursor: pointer;
  /* Estilo simple para el tema oscuro */
  appearance: none;
  background-color: #555;
  border: 1px solid #f1e8e8;
}
.toggle-switch:checked {
  background-color: #f1e8e8;
}
.input-con-accion {
  /* Cambiamos 'flex-grow: 1' por 'flex: 1'.
    Esto le dice que crezca y se encoja uniformemente.
  */
  flex: 1;

  /* Asegúrate de que el resto de estilos del input se mantienen */
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
  width: 100%; /* 'width' será sobrescrito por flex, pero lo dejamos por consistencia */
  padding: 8px 10px;
  box-sizing: border-box;
}

/* ... (Estilos de hover/focus del input) ... */

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
