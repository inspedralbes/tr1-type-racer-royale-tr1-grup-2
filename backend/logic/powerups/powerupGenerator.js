// backend/game/powerups/powerupGenerator.js
import { baseEffects, suits } from "./powerupTypes.js";
import { resetGame } from "./powerupLogic.js";


export function generarPowerup(cantidadPalabrasReset = 10) {
  // Elegir palo aleatorio
  const palos = Object.values(suits);
  const paloIndex = Math.floor(Math.random() * palos.length);
  const palo = palos[paloIndex];

  // Número aleatorio entre 1 y 4 (solo identificador)
  const numero = Math.floor(Math.random() * 4) + 1;

  const base = baseEffects[palo];

  const carta = {
    id: `${numero}_${palo}`,
    palo,
    numero,
    nombre: base.nombre,         // <-- nombre del power-up
    efecto: base.efecto,
    descripcion: base.descripcion,
  };

  // Si es reset_game, generar nuevas palabras
  if (base.efecto === "reset_game") {
    carta.palabrasReset = resetGame(cantidadPalabrasReset);
  }

  return carta;
}
