<script setup>
import { ref } from "vue";

// --- Emits ---
const emit = defineEmits(["success", "error"]);

// --- Estado del Componente ---
// Datos del formulario, enlazados con v-model
const username = ref("");
const password = ref("");

// --- Lógica ---

/**
 * Lógica de Login
 * Envía los datos al ENDPOINT /api/login del backend
 */
async function handleLogin() {
  if (!username.value || !password.value) {
    emit("error", "Ambos campos son obligatorios.");
    return;
  }

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username.value,
        password: password.value,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("token", data.token);
      emit("success", data);
    } else {
      // El backend nos da un error (ej: "Contraseña incorrecta")
      emit("error", data.message);
    }
  } catch (error) {
    console.error("Error de conexión:", error);
    emit("error", "No se pudo conectar con el servidor.");
  }
}
</script>

<template>
  <div class="login-container">
    <div class="card-content">
      <h2>Entrar</h2>
      <form @submit.prevent="handleLogin">
        <div class="input-group">
          <label for="login-username">Usuario</label>
          <input
            type="text"
            id="login-username"
            v-model="username"
            required
            placeholder="tu-usuario"
          />
        </div>

        <div class="input-group">
          <label for="login-password">Contraseña</label>
          <input
            type="password"
            id="login-password"
            v-model="password"
            required
            placeholder="••••••••"
          />
        </div>

        <button type="submit" class="btn-submit">Entrar</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.card-container {
  z-index: 1;
}
</style>
