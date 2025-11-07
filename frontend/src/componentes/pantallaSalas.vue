<!-- components/PantallaSalas.vue -->
<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import communicationManager from "../services/communicationManager";
import { playerName, playerId, rooms } from "../logic/globalState.js";

const emit = defineEmits(["sala-seleccionada"]);
const nuevaSala = ref("");
const errorMessage = ref("");

// 🔹 Recibir lista de salas del servidor
const handleRoomsList = (payload) => {
  rooms.value = payload;
  console.log("📜 Lista de salas:", payload);
};

// 🔹 Cuando una sala se crea correctamente
function handleRoomCreated(payload) {
  console.log("🆕 Sala creada desde backend:", payload);
  // Emitimos solo los datos necesarios a App.vue

  const room = {
    roomId: payload.roomId,
    playerId: playerId.value, // host
    isHost: true,
    players: [{ playerId: playerId.value, username: playerName.value }], // solo él por ahora
  };
  emit("sala-seleccionada", room);
}

// 🔹 Error al crear o unirse
const handleRoomError = (payload) => {
  console.error("❌ Error:", payload.message);
  errorMessage.value = payload.message;
};

// 🔹 Solicitar lista de salas al servidor
function actualizarSalas() {
  console.log("📡 Solicitando lista de salas...");
  communicationManager.emit("get_rooms");
}

// 🔹 Crear una nueva sala
function crearSala() {
  if (!nuevaSala.value.trim()) {
    errorMessage.value = "Debes introducir un nombre para la sala.";
    return;
  }

  communicationManager.emit("create_room", {
    roomName: nuevaSala.value.trim(),
    playerId: playerId.value,
    username: playerName.value,
  });
  nuevaSala.value = "";
}

// 🔹 Unirse a una sala
function unirseSala(room) {
  communicationManager.emit("join_room", {
    roomId: room.roomId,
    playerId: playerId.value,
    username: playerName.value,
  });

  emit("sala-seleccionada", room);
}


onMounted(() => {
  communicationManager.connect();
  communicationManager.on("rooms_list", handleRoomsList);
  communicationManager.on("room_created", handleRoomCreated);
  communicationManager.on("room_error", handleRoomError);

  // pedir lista inicial
  actualizarSalas();
});

onUnmounted(() => {
  communicationManager.off("rooms_list", handleRoomsList);
  communicationManager.off("room_created", handleRoomCreated);
  communicationManager.off("room_error", handleRoomError);
});
</script>

<template>
  <div class="salas-container">
    <h2>Bienvenido, {{ playerName }}</h2>

   <!-- Crear nueva sala -->
    <div class="crear-sala">
      <input
        v-model="nuevaSala"
        placeholder="Nombre de la nueva sala"
      />
      <button @click="crearSala">Crear sala</button>
    </div>

    <h3>Salas disponibles</h3>
    <div class="lista-salas">
      <div
        v-for="sala in rooms"
        :key="sala.roomId"
        class="sala-card"
      >
        <p><strong>{{ sala.roomName }}</strong></p>
        <p>{{ sala.numPlayers }}/{{ sala.maxPlayers }}</p>
        <p>Estado: {{ sala.gameState }}</p>
        <button @click="unirseSala(sala)">Unirse</button>
      </div>
    </div>

    <p v-if="errorMessage" style="color: red;">{{ errorMessage }}</p>
  </div>
</template>

<style scoped>
.salas-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}
.lista-salas {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 10px;
  width: 100%;
  max-width: 800px;
}
.sala-card {
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 10px;
  text-align: center;
}
</style>
