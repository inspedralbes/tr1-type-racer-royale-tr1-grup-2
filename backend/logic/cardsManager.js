import { seleccionarRandom } from "./wordLogic.js";
import respuestaRoutes from "./routes/cardRoutes.js";
app.use("/", respuestaRoutes);


// Palos y valores de cartas
const PALOS = ["♠", "♥", "♦", "♣"];
const VALORES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

// Tiempo de espera entre que se acaba una carta y la siguiente
let tiempoEsperaCarta=Math.random(15,30);

// 🔹 Genera una carta con 1 palabra igual para todos los jugadores
export const generarCartaPoker = () => {
  const palo = PALOS[Math.floor(Math.random() * PALOS.length)];
  const valor = VALORES[Math.floor(Math.random() * VALORES.length)];
  const palabra = seleccionarRandom(palabrasBase, 1);

  return {
    id: `${valor}${palo}-${Date.now()}`,
    palo,
    valor,
    palabra,
    completada: false,
  };
};

// 🔹 Asigna una nueva carta al jugador
export const asignarCartaAJugador = (jugador) => {
  const carta = generarCartaPoker();
  jugador.cartaActiva = carta;
  jugador.words = [...carta.palabra];
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
    //aplicarPowerUp(jugador, jugador.cartaActiva);
    return true;
  }
  return false;
};

// 🔹 Power-up básico (puedes personalizarlo)
//const aplicarPowerUp = (jugador, carta) => {
//  console.log(`🎉 Power-up aplicado a ${jugador.name || jugador.id} por completar la carta ${carta.id}`);
  // Aquí puedes añadir lógica real de bonificación
//};



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
