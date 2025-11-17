<script setup>
import { ref, computed } from "vue";
import { playerName, playerId, playerAvatar } from "../logic/globalState.js";

// Importar los hijos de Perfil (utilsPerfil)
import PerfilCampoNombre from "./utils/utilsPerfil/PerfilCampoNombre.vue";
import PerfilAvatarSelector from "./utils/utilsPerfil/PerfilAvatarSelector.vue";

const emit = defineEmits(["go-home", "guardar-perfil"]);

const guardado = ref(false);

// --- Lógica de Avatares  ---
const avataresDisponibles = ref([
  "assets/img/imgAvatares/avatar1.png",
  "assets/img/imgAvatares/avatar2.png",
  "assets/img/imgAvatares/avatar3.png",
  "assets/img/imgAvatares/avatar4.png",
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
      formData.value.avatar = e.target.result;
    };

    reader.readAsDataURL(file);
  }
}

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

      <PerfilCampoNombre
        v-model="formData.nombre"
        :editando="editando.nombre"
        @toggle-edit="toggleEdit('nombre')"
      />

      <PerfilAvatarSelector
        v-model="formData.avatar"
        :avatares-disponibles="avataresDisponibles"
        :avatar-es-personalizado="avatarEsPersonalizado"
        @file-change="onFileChange"
      />

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
/* --- Estilos del contenedor principal y acciones --- */
.perfil-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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

/* Estilo base para los botones de acciones */
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

.acciones {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  border-top: 1px solid #555;
  padding-top: 20px;
}

/* Clases específicas para los botones de acción */
.btn-secundario {
  background-color: #555;
  color: #f1e8e8;
}
.btn-secundario:hover {
  background-color: #666;
  transform: scale(1.03);
}

.feedback-guardado {
  grid-column: 1 / -1;
  background-color: #aee0ae;
  color: #383838;
  outline: 7px solid #aee0ae;
  border: 1ex solid none;
  box-sizing: border-box;
  padding: 20px;
  text-align: center;
  font-size: 17px;
  margin-bottom: 20px;
}
</style>
