<script setup>
import { ref } from "vue";

// --- Emits ---
const emit = defineEmits(["success", "error"]);

// --- Estado del Componente ---
const username = ref("");
const password = ref("");

// --- Lógica ---

/**
 * Lógica de Registro
 * Envía los datos al ENDPOINT /api/register del backend
 */
async function handleRegister() {
  if (!username.value || !password.value) {
    emit("error", "Ambos campos son obligatorios.");
    return;
  }

  try {
    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username.value,
        password: password.value,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      // 200-299
      emit("success", data);
    } else {
      // El backend nos da un error (ej: "Usuario ya existe")
      emit("error", data.message);
    }
  } catch (error) {
    console.error("Error de conexión:", error);
    emit("error", "No se pudo conectar con el servidor.");
  }
}
</script>

<template>
  <div class="register-container">
    <div class="card-content">
      <h2>Registrarse</h2>

      <form @submit.prevent="handleRegister">
        <div class="input-group">
          <label for="reg-username">Elige un usuario</label>
          <input
            type="text"
            id="reg-username"
            v-model="username"
            required
            placeholder="nuevo-usuario"
          />
        </div>

        <div class="input-group">
          <label for="reg-password">Elige una contraseña</label>
          <input
            type="password"
            id="reg-password"
            v-model="password"
            required
            placeholder="••••••••"
          />
        </div>

        <button type="submit" class="btn-submit">Registrarse</button>
      </form>
    </div>
  </div>
</template>
