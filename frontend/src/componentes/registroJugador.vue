<script setup>
import { ref } from "vue";
import { playerName, playerId } from "../logic/globalState.js";

const emit = defineEmits(["registrado"]);
const nomJugador = ref("");
const errorMessage = ref("");

async function registrarJugador() {
  errorMessage.value = "";

  try {
    const res = await fetch("/user/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: nomJugador.value }),
    });

    if (!res.ok) throw new Error("Error al registrar jugador");

    const data = await res.json();

    // Guardar solo los datos del jugador actual en globalState
    playerId.value = data.playerId;
    playerName.value = data.username;

    emit("registrado", data); // pasa al componente de salas
  } catch (err) {
    console.error(err);
    errorMessage.value = "No se pudo registrar el jugador";
  }
}

</script>

<template>
  <div id="contenedor-juego">
    <div class="vista-container">
      <h1>Type Racer Royale</h1>
      <input type="text" v-model="nomJugador" placeholder="Ejemplo: Paco" />
      <button @click="registrarJugador">Entrar</button>
      <p v-if="errorMessage" style="color: red;">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<style scoped></style>
