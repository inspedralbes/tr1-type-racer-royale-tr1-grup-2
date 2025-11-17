<script setup>
import { ref } from "vue";
import { playerName, playerId } from "../../../logic/globalState.js";
import { getApiUrl } from "../../../logic/getUrl.js";

const emit = defineEmits(["success", "error"]); 

const username = ref(""); 
const password = ref(""); 

async function manejoLogin() {
  if (!username.value || !password.value) {
    emit("error", "Ambos campos son obligatorios."); 
    return; 
  }

  try {
    const respuesta = await fetch(getApiUrl("/api/user/login"),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.value,
          password: password.value,
        }),
      }
    );

    const data = await respuesta.json();

    if (respuesta.ok) {
      localStorage.setItem("token", data.token); 
      playerId.value = data.id;
      emit("success", data); 
    } else {
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

.card-content {
  display: flex;
  flex-direction: column;
  align-items: center; 
  width: 90%; 
  max-width: 15em; 
  margin: 0 auto; 
  box-sizing: border-box;
}

h2 {
  font-size: 0.8em;
  font-weight: bold;
  color: #ff9800; 
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
  margin-bottom: 0.6em; 
}

/* Etiqueta (ej: "Usuario") */
label {
  font-size: 0.5em;
  font-weight: bold;
  color: white;
  margin-bottom: 0.25em; 
  text-align: left; 
}

/* Campos de texto y contraseña */
input[type="text"],
input[type="password"] {
  background: rgba(255, 255, 255, 0.9);
  color: black;
  border: none;
  border-radius: 3px;
  padding: 5px 8px; 
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
  margin-top: 0.5em; 
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
