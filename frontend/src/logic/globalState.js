// front/src/logic/globalState.js
import { ref } from "vue";

export const playerId = ref(""); // ID único asignado por el backend
export const playerName = ref(""); // Nombre de jugador dinámico
export const roomId = ref(""); // Sala donde está el jugador
export const globalPlayers = ref([]); // Lista de todos los jugadores
export const rooms = ref([]); // Lista de salas disponibles

// Player statistics
export const gamesPlayed = ref(0);
export const averageWPM = ref(0);
export const accuracy = ref(100);

// Logica imagen
export const playerAvatar = ref(null); // Empezará como nulo
