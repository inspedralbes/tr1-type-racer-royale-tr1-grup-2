<script setup>
import { ref } from "vue";

// --- Emits ---
// Emitirá 'authenticated' cuando el login sea exitoso
const emit = defineEmits(["authenticated"]);

// --- Estado del Componente ---
const isLoginView = ref(true);

// Controla la animación de volteo de la tarjeta
const isFlipped = ref(false);

// Controla la animación de desaparición al autenticarse
const estaDesapareciendo = ref(false);

// Datos del formulario, enlazados con v-model
const username = ref("");
const password = ref("");

// Para mostrar mensajes de error o éxito
const message = ref("");

// --- Lógica ---

/**
 * Cambia entre la vista de Login y la de Registro
 */
function toggleView() {
  isLoginView.value = !isLoginView.value;
  isFlipped.value = !isFlipped.value;
  // Limpiar campos y mensajes al voltear
  username.value = "";
  password.value = "";
  message.value = "";
}

/**
 * Se ejecuta al enviar el formulario.
 * Decide si llamar a la función de login o de registro.
 */
async function handleSubmit() {
  if (isLoginView.value) {
    await handleLogin();
  } else {
    await handleRegister();
  }
}

/**
 * Lógica de Registro
 * Envía los datos al ENDPOINT /api/register del backend
 */
async function handleRegister() {
  message.value = "Registrando...";
  if (!username.value || !password.value) {
    message.value = "Error: Ambos campos son obligatorios.";
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
      message.value = data.message || "¡Registro exitoso! Ahora puedes entrar.";
      // Éxito, esperamos un segundo y cambiamos a la vista de login
      setTimeout(toggleView, 1500);
    } else {
      // El backend nos da un error (ej: "Usuario ya existe")
      message.value = `Error: ${data.message}`;
    }
  } catch (error) {
    console.error("Error de conexión:", error);
    message.value = "Error: No se pudo conectar con el servidor.";
  }
}

/**
 * Lógica de Login
 * Envía los datos al ENDPOINT /api/login del backend
 */
async function handleLogin() {
  message.value = "Entrando...";
  if (!username.value || !password.value) {
    message.value = "Error: Ambos campos son obligatorios.";
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
      message.value = "¡Bienvenido!";
      // Aquí guardarías el token de sesión, etc.
      // ej: localStorage.setItem('token', data.token);

      // Activamos la animación de desaparecer
      estaDesapareciendo.value = true;
      setTimeout(() => {
        // Emitimos el evento al componente padre
        emit("authenticated", data);
      }, 600); // Coincide con la duración de la animación
    } else {
      // El backend nos da un error (ej: "Contraseña incorrecta")
      message.value = `Error: ${data.message}`;
    }
  } catch (error) {
    console.error("Error de conexión:", error);
    message.value = "Error: No se pudo conectar con el servidor.";
  }
}
</script>

<template>
  <div class="flip-card" :class="{ desapareciendo: estaDesapareciendo }">
    <div class="flip-card-inner" :class="{ 'esta-girada': isFlipped }">
      <div class="flip-card-front">
        <div class="card-content">
          <h2>Entrar</h2>
          <form @submit.prevent="handleSubmit">
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

          <button @click="toggleView" type="button" class="btn-toggle">
            ¿No tienes cuenta? Regístrate
          </button>

          <p
            v-if="message && isLoginView"
            class="message"
            :class="{ error: message.startsWith('Error') }"
          >
            {{ message }}
          </p>
        </div>
      </div>

      <div class="flip-card-back">
        <div class="card-content">
          <h2>Registrarse</h2>

          <form @submit.prevent="handleSubmit">
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

          <button @click="toggleView" type="button" class="btn-toggle">
            ¿Ya tienes cuenta? Entra
          </button>

          <p
            v-if="message && !isLoginView"
            class="message"
            :class="{ error: message.startsWith('Error') }"
          >
            {{ message }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* --- Estructura y Animación de la Tarjeta --- */
/* (Basado en los estilos del "padre") */

.flip-card {
  background-color: transparent;
  width: 320px; /* Ancho ajustado para el formulario */
  height: 400px; /* Alto ajustado para el formulario */
  perspective: 1000px;
  color: white;
  transition: transform 0.6s ease-in, opacity 1.2s ease-in;
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 10;
  transform: translate(-50%, -50%) scale(1.5); /* Escala ajustada */
}

.flip-card.desapareciendo {
  transform: translate(-50%, -50%) scale(1.2) translateY(200px);
  opacity: 0;
}

.flip-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.8s;
  transform-style: preserve-3d;
}

.flip-card-inner.esta-girada {
  transform: rotateY(180deg);
}

.flip-card-front,
.flip-card-back {
  box-shadow: 0 8px 14px 0 rgba(0, 0, 0, 0.2);
  position: absolute;
  display: flex; /* Usamos flex para centrar el contenido */
  flex-direction: column;
  justify-content: center; /* Centra verticalmente */
  align-items: center; /* Centra horizontalmente */
  width: 100%;
  height: 100%;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  border-radius: 1rem;
  background-color: #171717;
  box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 2px,
    rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -1px 0px inset;
  padding: 20px;
  box-sizing: border-box; /* Asegura que el padding no afecte al tamaño */
}

.flip-card-back {
  transform: rotateY(180deg);
}

/* --- Estilos del Formulario --- */
/* (Nuevos estilos para el "hijo") */

.card-content {
  width: 100%;
}

h2 {
  font-weight: bold;
  font-size: 1.5em; /* 24px */
  margin-bottom: 1.2em;
  color: #ff9800;
  letter-spacing: 0.1em;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1.2em;
  width: 100%;
}

.input-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
}

label {
  font-size: 0.8em; /* 12.8px */
  margin-bottom: 0.5em;
  font-weight: bold;
  color: #aaa;
}

input {
  width: 100%;
  background: rgba(255, 255, 255, 0.9);
  color: black;
  border-radius: 3px;
  border: none;
  padding: 0.8em 0.6em; /* 12.8px 9.6px */
  font-size: 0.9em; /* 14.4px */
  font-weight: bold;
  box-sizing: border-box; /* Asegura que el padding no afecte al ancho */
}

input::placeholder {
  color: #555;
}

.btn-submit {
  font-size: 1em; /* 16px */
  font-weight: bold;
  background: #ff9800;
  color: black;
  border: none;
  border-radius: 3px;
  padding: 0.8em;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 0.5em;
}

.btn-submit:hover {
  background: #ffb74d;
}

.btn-toggle {
  background: none;
  border: none;
  color: #aaa;
  font-size: 0.8em; /* 12.8px */
  cursor: pointer;
  margin-top: 1.5em;
  text-decoration: underline;
}
.btn-toggle:hover {
  color: #ff9800;
}

.message {
  margin-top: 1.2em;
  font-size: 0.9em; /* 14.4px */
  font-weight: bold;
  color: #4caf50; /* Verde para éxito */
}

.message.error {
  color: #ff5252; /* Rojo para error (del estilo .error-frontal) */
}

/* Quita el 'outline' por defecto del input y los botones cuando se seleccionan */
input:focus,
.btn-submit:focus,
.btn-toggle:focus {
  outline: 2px ridge red;
  border-radius: 3px;
}
</style>
