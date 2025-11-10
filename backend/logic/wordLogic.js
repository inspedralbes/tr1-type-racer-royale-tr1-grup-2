// utils/wordLogic.js

import { getRoom } from "./roomsManager.js";

// Array base con 600 palabras (puedes ampliarlo)
export const palabrasBase = [
  "casa",
  "perro",
  "gato",
  "árbol",
  "sol",
  "luna",
  "mar",
  "río",
  "nube",
  "montaña",
  "tren",
  "avión",
  "barco",
  "ciudad",
  "pueblo",
  "plaza",
  "silla",
  "mesa",
  "libro",
  "camisa",
  "pelota",
  "zapato",
  "cielo",
  "reloj",
  "flor",
  "planta",
  "arena",
  "playa",
  "bosque",
  "fruta",
  "ordenador",
  "ratón",
  "teclado",
  "monitor",
  "ventana",
  "puerta",
  "móvil",
  "tormenta",
  "lluvia",
  "viento",
  "estrella",
  "planeta",
  "universo",
  "montaña",
  "fuego",
  "agua",
  "aire",
  "tierra",
  "piedra",
  "oro",
  "plata",
  "cobre",
  "hierro",
  "auto",
  "bicicleta",
  "carretera",
  "puente",
  "edificio",
  "hospital",
  "colegio",
  "universidad",
  "oficina",
  "restaurante",
  "mercado",
  "tienda",
  "cine",
  "teatro",
  "televisión",
  "radio",
  "internet",
  "videojuego",
  "música",
  "película",
  "foto",
  "pintura",
  "escultura",
  "poesía",
  "historia",
  "matemáticas",
  "ciencia",
  "biología",
  "química",
  "física",
  "geografía",
  "idioma",
  "palabra",
  "voz",
  "silencio",
  "ruido",
  "fábrica",
  "trabajo",
  "dinero",
  "banco",
  "tiempo",
  "hora",
  "día",
  "noche",
  "semana",
  "mes",
  "año",
  "siglo",
  "memoria",
  "pensamiento",
  "idea",
  "sueño",
];

const crearPowerUpDesdeCarta = (carta) => {
  switch (carta.palo) {
    case "♠":
      return {
        tipo: "bloqueo", descripcion: "Bloquea a otro jugador por 5 segundos",
      };
    case "♥":
      return { 
        tipo: "curar", descripcion: "Recupera una palabra fallida",
      };
    case "♦":
      return {
        tipo: "doble",
        descripcion: "Duplica tus puntos por 10 segundos",
      };
    case "♣":
      return { 
        tipo: "robo", descripcion: "Roba una palabra a otro jugador",
      };
    default:
      return { 
        tipo: "basico", descripcion: "Power-up genérico",
      };
  }
};

export const generarPalabras = (cantidad) => {
  const palabras = [];
  for (let i = 0; i < cantidad; i++) {
    const palabra =
      palabrasBase[Math.floor(Math.random() * palabrasBase.length)];
    palabras.push(palabra);
  }
  return palabras;
};

export const asignarBloquePalabrasPersonales = (jugador, cantidad = 5) => {
  const nuevasPalabras = generarPalabras(cantidad);
  jugador.words = nuevasPalabras;
  jugador.completedWords = 0;
};

export const seleccionarRandom = (array, cantidad) => {
  const copia = [...array];
  const seleccion = [];
  for (let i = 0; i < cantidad; i++) {
    const index = Math.floor(Math.random() * copia.length);
    seleccion.push(copia[index]);
    copia.splice(index, 1);
  }
  return seleccion;
};

// ✅ ARCHIVO: backend/logic/wordLogic.js
export const calcularPalabrasRestantes = (
  rooms,
  roomId,
  playerId,
  wordId,
  threshold = 3,
  completedWords
) => {
  const room = getRoom(roomId);
  if (!room) return;

  const jugador = room.players.find(
    (p) => p.playerId === playerId || p.id === playerId
  );
  if (!jugador) return;

  if (
    jugador.words.length > 0 &&
    wordId >= 0 &&
    wordId < jugador.words.length
  ) {
    jugador.words.splice(wordId, 1); // ✅ elimina solo una palabra
  }

  jugador.completedWords = completedWords;

  // ✅ Solo asignar nuevo bloque si ya no quedan palabras
  if (jugador.words.length === 0) {
    jugador.words = generarPalabras(5);
    jugador.completedWords = 0;
  }
};

export const añadirPalabraCompletada = (
  rooms,
  roomId,
  playerId,
  palabraEliminada
) => {
  const room = rooms[roomId];
  if (!room || !palabraEliminada) return;

  room.players.forEach((p) => {
    if ((p.playerId || p.id) !== playerId) {
      p.words.push(palabraEliminada);
    }
  });
};

export const procesarRespuesta = (rooms, roomId, playerId, palabraEscrita) => {
  const room = rooms[roomId];
  if (!room || !room.cartaActiva || room.estado === "resolviendo") return;

  const jugador = room.players.find(
    (p) => p.playerId === playerId || p.id === playerId
  );
  if (!jugador) return;

  if (!room.respuestas) room.respuestas = [];

  const yaRespondio = room.respuestas.find((r) => r.playerId === playerId);
  if (yaRespondio) return;

  const palabraCorrecta = room.cartaActiva.palabra[0].toLowerCase();
  const respuesta = palabraEscrita.trim().toLowerCase();

  if (respuesta === palabraCorrecta) {
    room.respuestas.push({ playerId, timestamp: Date.now() });

    if (room.respuestas.length === 1) {
      asignarCartaComoPowerUp(room, playerId);
      return {
        mensaje: "¡Correcto! Has ganado la carta.",
        powerUp: jugador.powerUp,
      };
    } else {
      return { mensaje: "¡Correcto! Pero otro jugador fue más rápido." };
    }
  } else {
    return { mensaje: "❌ Palabra incorrecta." };
  }
};

const asignarCartaComoPowerUp = (room, playerId) => {
  const carta = room.cartaActiva;
  const jugador = room.players.find(
    (p) => p.playerId === playerId || p.id === playerId
  );
  if (!jugador) return;

  const powerUp = crearPowerUpDesdeCarta(carta);

  if (!jugador.powerUp) {
    jugador.powerUp = powerUp;
    jugador.cartasGanadas = [...(jugador.cartasGanadas || []), carta];
  } else {
    const siguiente = room.players.find(
      (p) => !p.powerUp && (p.playerId || p.id) !== playerId
    );
    if (siguiente) {
      siguiente.powerUp = powerUp;
      siguiente.cartasGanadas = [...(siguiente.cartasGanadas || []), carta];
    }
  }

  room.estado = "resolviendo";
  room.cartaActiva.completada = true;
};
