// backend/game/powerups/powerupLogic.js
import { obtenerPalabras, generarPalabraPowerup } from "../wordLogic.js";
import { generarPowerup } from "../powerups/powerupGenerator.js";

const powerupTimers = {}; // timers por sala

export function resetGame(cantidadPalabras = 10) {
  return obtenerPalabras(cantidadPalabras);
}


// FUNCION QUE ASIGNA UNA CARTA A UN JUGADOR
export function asignarCartaJugador(rooms, roomId, playerId, carta) {
  const room = rooms[roomId];
  if (!room) return;

  const jugador = room.players.find((p) => p.playerId === playerId);
  console.log(jugador);
  if (!jugador) return;

  if (!jugador.powerups) jugador.powerups = [];

  // Limitar máximo 2 cartas
  if (jugador.powerups.length >= 2) {
    // Reemplaza la carta más antigua
    jugador.powerups.shift();
  }

  console.log("el jugador ", playerId, "ha ganado la carta y se la ha asignado")
  jugador.powerups.push(carta);
  console.log(jugador);
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
    console.log("10 segundos despues");
    const carta = generarPowerup();
    const palabraExtra = generarPalabraPowerup();
    carta.palabra = palabraExtra;

    room.players.forEach(p => {
      p.currentPowerupWord = palabraExtra; // NUEVO ATRIBUTO
    });
    // Emitir carta disponible a todos los jugadores
    io.to(roomId).emit("powerup_available", { data: { carta, palabra: palabraExtra } });

    console.log("💥 Powerup enviado:", carta, "Palabra:", palabraExtra);
  }, intervalo);
}

export function stopPowerupSpawner(roomId) {
  if (powerupTimers[roomId]) {
    clearInterval(powerupTimers[roomId]);
    delete powerupTimers[roomId];
  }
}



