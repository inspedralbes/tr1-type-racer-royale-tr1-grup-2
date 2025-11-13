<script setup>
import { ref, computed } from "vue";
import { playerName, playerId, playerAvatar } from "../logic/globalState.js";

// Importar los hijos de Perfil (utilsPerfil)
import LogicaNombre from "./utils/utilsPerfil/LogicaNombre.vue";
import LogicaAvatar from "./utils/utilsPerfil/LogicaAvatar.vue";

const emit = defineEmits(["go-home", "guardar-perfil"]);

const props = defineProps({ jugador: Object });
const guardado = ref(false);

// --- Lógica de Avatares  ---
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

async function guardarCambios() {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("No se encontró token de autenticación.");
    // Manejar el caso de que no haya token, por ejemplo, redirigiendo al login
    return;
  }

  try {
    const response = await fetch("/api/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        newName: formData.value.nombre,
        newAvatar: formData.value.avatar,
      }),
    });

    const data = await response.json();

    if (response.ok) {
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
    } else {
      console.error("Error al guardar el perfil:", data.message);
      // Aquí podrías emitir un evento de error para mostrar un mensaje al usuario
    }
  } catch (error) {
    console.error("Error de red al guardar el perfil:", error);
    // Manejar errores de red
  }
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

      <LogicaNombre
        v-model="formData.nombre"
        :editando="editando.nombre"
        @toggle-edit="toggleEdit('nombre')"
      />

      <LogicaAvatar
        v-model="formData.avatar"
        :avatares-disponibles="avataresDisponibles"
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
  background-color: #2b2b2b;
  color: #f1e8e8;
  min-height: 100vh;
  box-sizing: border-box;
}

h2 {
  border: 1ex solid none;
  color: #f1e8e8;
  height: 40px;
  font-size: 24px;
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
  height: 40px;
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
.btn-primario {
  background-color: #ff9800;
  color: #2b2b2b;
}
.btn-primario:hover {
  background-color: #ffb74d;
  transform: scale(1.03);
}

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
