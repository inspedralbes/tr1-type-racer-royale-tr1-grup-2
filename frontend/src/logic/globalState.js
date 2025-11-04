// front/src/logic/globalState.js
import { ref } from "vue";

export const playerId = ref("");      // ID único asignado por el backend
export const playerName = ref("");    // Nombre de jugador dinámico
export const roomId = ref("");        // Sala donde está el jugador
export const globalPlayers = ref([]); // Lista de todos los jugadores
