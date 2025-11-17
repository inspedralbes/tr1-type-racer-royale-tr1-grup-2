import { baseEffects, suits } from "./powerupTypes.js";
import { resetGame } from "./powerupLogic.js";



// FUNCION QUE GENERA EL POWERUP SEGUN LOS TIPOS DE POWERUP
export function generarPowerup() {
  const palos = Object.values(suits);
  const paloIndex = Math.floor(Math.random() * palos.length);
  const palo = palos[paloIndex];

  const numero = Math.floor(Math.random() * 4) + 1;

  const base = baseEffects[palo];

  const carta = {
    id: `${numero}_${palo}`,
    palo,
    numero,
    nombre: base.nombre,       
    efecto: base.efecto,
    descripcion: base.descripcion,
  };

  // Si es reset_game, generar nuevas palabras
  if (base.efecto === "reset_game") {
    carta.palabrasReset = resetGame();
  }

  return carta;
}
