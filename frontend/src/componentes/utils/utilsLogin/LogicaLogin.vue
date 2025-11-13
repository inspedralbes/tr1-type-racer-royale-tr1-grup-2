<script setup>
import { ref } from "vue";
import { playerName, playerId } from "../../../logic/globalState.js";

// Emits al elemento padre este caso PantallaLogin.vue:
const emit = defineEmits(["success", "error"]); // "success" si el login es correcto, "error" si falla.

// Refs:
const username = ref(""); // Almacena el valor del input de usuario (enlazado con v-model).
const password = ref(""); // Almacena el valor del input de contraseña (enlazado con v-model).

// Funciones:

// Lógica de Login al enviar el formulario --> Envía los datos al ENDPOINT /api/login del backend:
async function manejoLogin() {
  // Comprueba si los campos no están vaciós:
  if (!username.value || !password.value) {
    emit("error", "Ambos campos son obligatorios."); // Si falla la validación, emite un error al padre.
    return; // Detiene la ejecución.
  }

  // Manejo de errores de red o del fetch (try/catch):
  try {
    // Petición POST al backend con las credenciales:
    const respuesta = await fetch("http://localhost:3000/api/user/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username.value,
        password: password.value,
      }),
    });

    // La respuesta JSON del servidor:
    const data = await respuesta.json();

    // Comprobamos si la respuesta es exitosa o no:
    if (respuesta.ok) {
      localStorage.setItem("token", data.token); // Almacena el token en el localStorage para persistir la sesión.
      playerId.value = data.id;
      emit("success", data); // Emite el evento "success" con el usuario/token.
    } else {
      emit("error", data.message); // Emite el mensaje de error.
    }
  } catch (error) {
    // Error de conexión:
    console.error("Error de conexión:", error);
    emit("error", "No se pudo conectar con el servidor.");
  }
}
</script>

<template>
  <div class="login-container">
    <div class="card-content">
      <h2>Entrar</h2>
      <!--Formulario de login-->
      <form @submit.prevent="manejoLogin">
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
/* Contenedor principal del formulario */
.card-content {
  display: flex;
  flex-direction: column;
  align-items: center; /* Centra el contenido */
  width: 90%; /* Un poco de margen a los lados */
  max-width: 15em; /* Ancho máximo para el formulario */
  margin: 0 auto; /* Centrado horizontal */
  box-sizing: border-box;
}

/* Título (ej: "Entrar") */
h2 {
  font-size: 0.8em;
  font-weight: bold;
  color: #ff9800; /* Color naranja de acento */
  margin-top: 0;
  margin-bottom: 0.5em;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* Formulario */
form {
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* Agrupador de label + input */
.input-group {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 0.6em; /* Espacio entre campos */
}

/* Etiqueta (ej: "Usuario") */
label {
  font-size: 0.5em;
  font-weight: bold;
  color: white;
  margin-bottom: 0.25em; /* Espacio entre label e input */
  text-align: left; /* Alinea texto a la izquierda */
}

/* Campos de texto y contraseña */
input[type="text"],
input[type="password"] {
  background: rgba(255, 255, 255, 0.9);
  color: black;
  border: none;
  border-radius: 3px;
  padding: 5px 8px; /* Más cómodo que el original */
  font-size: 0.5em;
  font-weight: bold;
  box-sizing: border-box;
  width: 100%;
}

/* Estilo del texto de placeholder */
input::placeholder {
  color: #555;
  font-weight: bold;
}

/* Botón de envío (Entrar / Registrarse) */
.btn-submit {
  background: #ff9800;
  color: black;
  border: none;
  border-radius: 3px;
  padding: 6px 10px;
  font-size: 0.5em;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  width: 100%;
  margin-top: 0.5em; /* Espacio sobre el botón */
  text-transform: uppercase;
}

.btn-submit:hover {
  background: #ffb74d;
}

/* Estilos de Focus (opcional pero recomendado) */
input[type="text"]:focus,
input[type="password"]:focus,
.btn-submit:focus {
  outline: 2px ridge #ffb74d;
  border-radius: 3px;
}
</style>
