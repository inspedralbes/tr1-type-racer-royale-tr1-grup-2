import { obtenerPalabras, generarPalabraPowerup } from "../wordLogic.js";
import { generarPowerup } from "../powerups/powerupGenerator.js";

const powerupTimers = {}; 

export function resetGame(cantidadPalabras = 30) {
  return obtenerPalabras(cantidadPalabras);
}

//
// FUNCION QUE ASIGNA UNA CARTA A UN JUGADOR CUANDO LA GANA 
//

export function asignarCartaJugador(rooms, roomId, playerId, carta) {
  const room = rooms[roomId];
  if (!room) return;

  const jugador = room.players.find((p) => p.playerId === playerId);
  console.log(jugador);
  if (!jugador) return;

  if (!jugador.powerups) jugador.powerups = [];

  if (jugador.powerups.length >= 2) {
    // FUNCION DE ARRAY - ALTO NIVEL
    //// jugador.powerups.shift();

    // SUSTITUCIÓN DEL .shift()
    for (let i = 1; i < jugador.powerups.length; i++) {
      jugador.powerups[i - 1] = jugador.powerups[i];
    }

    jugador.powerups.length = jugador.powerups.length - 1;
  }

  console.log("el jugador ", playerId, "ha ganado la carta y se la ha asignado")
  jugador.powerups.push(carta);
  console.log(jugador);
}


//
// FUNCION QUE ELIMINA UNA CARTA DE UN JUGADOR (DESPUÉS DE USARLA)
//

export function eliminarCartaJugador(rooms, roomId, playerId, cartaId) {
  const room = rooms[roomId];
  if (!room) return;

  const jugador = room.players.find((p) => p.playerId === playerId);
  if (jugador?.powerups) return;

  // Filtrar por id en lugar de efecto
  jugador.powerups = jugador.powerups.filter((carta) => carta.id !== cartaId);
}


//
// FUNCION QUE ENVIA POWERUPS CADA X TIEMPO
//

export function startPowerupSpawner(io, roomId, room, intervalo = 17000) {
  if (powerupTimers[roomId]) return; 

  powerupTimers[roomId] = setInterval(() => {
    console.log("10 segundos despues");
    const carta = generarPowerup();
    const palabraExtra = generarPalabraPowerup();
    carta.palabra = palabraExtra;

    // FUNCION DE ARRAY - ALTO NIVEL
    // room.players.forEach(p => {
    //   p.currentPowerupWord = palabraExtra; 
    // });

    // SUSTITUTO DEL .forEach()
    for (const player of room.players) {
      player.currentPowerupWord = palabraExtra;
    }

    io.to(roomId).emit("powerup_available", { data: { carta, palabra: palabraExtra } });

    console.log("💥 Powerup enviado:", carta, "Palabra:", palabraExtra);
  }, intervalo);
}


//
// FUNCION QUE PARA EL ENVIO DE POWERUPS CADA X TIEMPO
//

export function stopPowerupSpawner(roomId) {
  if (powerupTimers[roomId]) {
    clearInterval(powerupTimers[roomId]);
    delete powerupTimers[roomId];
  }
}



