<script setup>
import { ref } from "vue";
import { playerName, playerId, playerAvatar } from "../logic/globalState.js";

const emit = defineEmits(["go-home", "guardar-perfil"]);

const nuevoNombre = ref(playerName.value);
const guardado = ref(false);

// --- Lógica de Avatares ---
const avataresDisponibles = ref([
  "../../public/assets/img/imgAvatares/avatar1.png",
  "../../public/assets/img/imgAvatares/avatar2.png",
  "../../public/assets/img/imgAvatares/avatar3.png",
  "../../public/assets/img/imgAvatares/avatar4.png",
]);

const avatarSeleccionado = ref(
  playerAvatar.value || avataresDisponibles.value[0]
);

function seleccionarAvatar(avatar) {
  avatarSeleccionado.value = avatar;
}

// --- Acciones ---
function guardarCambios() {
  playerName.value = nuevoNombre.value;
  playerAvatar.value = avatarSeleccionado.value;

  // Emitir  guardar-perfil a App.vue
  emit("guardar-perfil", {
    newName: nuevoNombre.value,
    newAvatar: avatarSeleccionado.value,
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
      <div v-if="guardado" class="feedback-guardado">¡Cambios guardados!</div>

      <div class="campo">
        <label for="nombre">Nombre de Jugador:</label>
        <input
          type="text"
          id="nombre"
          v-model="nuevoNombre"
          placeholder="Escribe tu nombre"
        />
      </div>

      <div class="campo">
        <label>Elige tu Avatar:</label>
        <div class="avatares">
          <img
            v-for="avatarSrc in avataresDisponibles"
            :key="avatarSrc"
            :src="avatarSrc"
            alt="Opción de avatar"
            class="avatar-option"
            :class="{ selected: avatarSrc === avatarSeleccionado }"
            @click="seleccionarAvatar(avatarSrc)"
          />
        </div>
      </div>

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
:root {
  --color-primario: #007bff;
  --color-secundario: #6c757d;
  --color-fondo-card: #ffffff;
  --color-fondo-main: #f4f7f6;
  --color-texto: #333;
  --color-borde: #dee2e6;
  --color-verde-exito: #28a745;
  --sombra-card: 0 4px 12px rgba(0, 0, 0, 0.08);
  --radio-borde: 8px;
}

.perfil-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  background-color: var(--color-fondo-main);
  min-height: 100vh;
  box-sizing: border-box;
}

h2 {
  color: var(--color-texto);
  margin-bottom: 24px;
}

.perfil-card {
  background: var(--color-fondo-card);
  border-radius: var(--radio-borde);
  box-shadow: var(--sombra-card);
  padding: 24px;
  width: 100%;
  max-width: 500px;
  box-sizing: border-box;
}

.campo {
  margin-bottom: 20px;
}

.campo label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--color-texto);
}

.campo input[type="text"] {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-borde);
  border-radius: var(--radio-borde);
  font-size: 1rem;
  box-sizing: border-box; /* Asegura que el padding no afecte el ancho */
  transition: border-color 0.2s, box-shadow 0.2s;
}

.campo input[type="text"]:focus {
  outline: none;
  border-color: var(--color-primario);
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}

/* --- Estilos de Avatares --- */
.avatares {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 10px;
}

.avatar-option {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 3px solid transparent;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease;
  object-fit: cover; /* Asegura que la imagen llene el círculo */
}

.avatar-option:hover {
  transform: scale(1.05);
  border-color: var(--color-borde);
}

.avatar-option.selected {
  border-color: var(--color-primario);
  transform: scale(1.1);
  box-shadow: 0 0 10px rgba(0, 123, 255, 0.5);
}

/* --- Estilos de Acciones --- */
.acciones {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  border-top: 1px solid var(--color-borde);
  padding-top: 20px;
}

button {
  padding: 10px 16px;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: var(--radio-borde);
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
}

button:active {
  transform: scale(0.98);
}

.btn-primario {
  background-color: var(--color-primario);
  color: white;
}

.btn-primario:hover {
  background-color: #0056b3;
}

.btn-secundario {
  background-color: var(--color-secundario);
  color: white;
}

.btn-secundario:hover {
  background-color: #5a6268;
}

/* --- Feedback --- */
.feedback-guardado {
  background-color: #e9f7ef; /* Fondo verde claro */
  color: var(--color-verde-exito);
  padding: 12px;
  border-radius: var(--radio-borde);
  text-align: center;
  margin-bottom: 20px;
  font-weight: 600;
  border: 1px solid var(--color-verde-exito);
}
</style>
