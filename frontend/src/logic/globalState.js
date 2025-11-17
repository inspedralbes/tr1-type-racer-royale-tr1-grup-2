import { ref } from "vue";

export const playerId = ref(""); 
export const playerName = ref(""); 
export const roomId = ref(""); 
export const globalPlayers = ref([]); 
export const rooms = ref([]); 

// Player statistics
export const gamesPlayed = ref(0);
export const averageWPM = ref(0);
export const accuracy = ref(100);

// Logica imagen
export const playerAvatar = ref(null); 
