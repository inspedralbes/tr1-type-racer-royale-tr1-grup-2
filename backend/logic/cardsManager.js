import { seleccionarRandom } from "./wordLogic.js";

// Palos y valores de cartas
const PALOS = ["♠", "♥", "♦", "♣"];
const VALORES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

// Genera una carta con 5 palabras únicas
export const generarCartaPoker = () => {
  const palo = PALOS[Math.floor(Math.random() * PALOS.length)];
  const valor = VALORES[Math.floor(Math.random() * VALORES.length)];
  const palabras = seleccionarRandom(palabrasBase, 5);

  return {
    id: `${valor}${palo}-${Date.now()}`,
    palo,
    valor,
    palabras,
    completada: false,
  };
};

// Asigna una nueva carta al jugador
export const asignarCartaAJugador = (jugador) => {
  const carta = generarCartaPoker();
  jugador.cartaActiva = carta;
  jugador.words = [...carta.palabras];
  jugador.completedWords = 0;
};

// 🔹 Verifica si el jugador completó su carta
export const verificarCartaCompletada = (jugador) => {
  if (
    jugador.cartaActiva &&
    jugador.words.length === 0 &&
    !jugador.cartaActiva.completada
  ) {
    jugador.cartaActiva.completada = true;
    aplicarPowerUp(jugador, jugador.cartaActiva);
    return true;
  }
  return false;
};

// Aplica un power-up según el palo de la carta
// export const aplicarPowerUp = (jugador, carta) => {
//  let efecto = null;
//
//  switch (carta.palo) {
//    case "♠":
//      efecto = "velocidad"; // Reduce tiempo entre palabras
//      break;
//    case "♥":
//      efecto = "vida_extra"; // Permite un error sin penalización
//      break;
//    case "♦":
//      efecto = "doble_puntos"; // Duplica puntos por palabras siguientes
//      break;
//    case "♣":
//      efecto = "robar_palabra"; // Añade palabra aleatoria a otro jugador
//      break;
//  }

//  jugador.powerUps.push({
//    tipo: efecto,
//    carta: `${carta.valor}${carta.palo}`,
//    activadoEn: Date.now(),
//  });

//  console.log(`🎁 Power-up "${efecto}" aplicado a ${jugador.name || jugador.id}`);
//};
