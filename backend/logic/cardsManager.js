import { seleccionarRandom, palabrasBase } from "./wordLogic.js";

// 🔹 Genera una carta de póker con una palabra aleatoria
export const generarCartaPoker = () => {
  const palos = ["♠", "♥", "♦", "♣"];
  const valores = [
    "A",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
  ];
  const palabra = seleccionarRandom(palabrasBase, 1);
  const palo = palos[Math.floor(Math.random() * palos.length)];
  const valor = valores[Math.floor(Math.random() * valores.length)];

  return {
    id: `${valor}${palo}-${Date.now()}`,
    palo,
    valor,
    palabra,
    completada: false,
  };
};

// 🔹 Asigna una carta personal al jugador
export const asignarCartaAJugador = (jugador) => {
  const carta = generarCartaPoker();
  jugador.cartaActiva = carta;
  jugador.words = [...carta.palabra]; // ✅ asigna palabra personal
  jugador.completedWords = 0;
};

// 🔹 Verifica si el jugador completó su carta personal
export const verificarCartaCompletada = (jugador) => {
  return jugador.words.length === 0 && !jugador.cartaActiva?.completada;
};
