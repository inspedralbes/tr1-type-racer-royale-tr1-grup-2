// backend/game/powerups/powerupLogic.js
import { generarPalabras, calcularPalabrasRestantes } from "../wordLogic.js";


export function resetGame(cantidadPalabras = 10) {
  return generarPalabras(cantidadPalabras);
}


// FUNCION QUE ASIGNA UNA CARTA A UN JUGADOR
export function asignarCartaJugador(rooms, roomId, playerId, carta) {
  const room = rooms[roomId];
  if (!room) return;

  const jugador = room.players.find((p) => p.playerId === playerId);
  if (!jugador) return;

  if (!jugador.powerups) jugador.powerups = [];

  // Limitar máximo 2 cartas
  if (jugador.powerups.length >= 2) {
    // Reemplaza la carta más antigua
    jugador.powerups.shift();
  }

  jugador.powerups.push(carta);
}

// FUNCION QUE ELIMINA UNA CARTA DE UN JUGADOR
export function eliminarCartaJugador(rooms, roomId, playerId, cartaId) {
  const room = rooms[roomId];
  if (!room) return;

  const jugador = room.players.find((p) => p.playerId === playerId);
  if (!jugador || !jugador.powerups) return;

  // Filtrar por id en lugar de efecto
  jugador.powerups = jugador.powerups.filter((carta) => carta.id !== cartaId);
}


export function startPowerupSpawner(io, roomId, room, intervalo = 10000) {
  if (powerupTimers[roomId]) return; // ya iniciado

  powerupTimers[roomId] = setInterval(() => {
    const carta = generarPowerup();
    // Emitir carta disponible a todos los jugadores
    io.to(roomId).emit("powerup_available", { carta });
  }, intervalo);
}

export function stopPowerupSpawner(roomId) {
  if (powerupTimers[roomId]) {
    clearInterval(powerupTimers[roomId]);
    delete powerupTimers[roomId];
  }
}



