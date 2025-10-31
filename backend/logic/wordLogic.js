// utils/wordsManager.js

import { getRoom } from "./roomsManager.js";

// Array base con 600 palabras (puedes ampliarlo)
const palabrasBase = [
  "casa", "perro", "gato", "árbol", "sol", "luna", "mar", "río", "nube", "montaña",
  "tren", "avión", "barco", "ciudad", "pueblo", "plaza", "silla", "mesa", "libro",
  "camisa", "pelota", "zapato", "cielo", "reloj", "flor", "planta", "arena", "playa",
  "bosque", "fruta", "ordenador", "ratón", "teclado", "monitor", "ventana", "puerta",
  "móvil", "tormenta", "lluvia", "viento", "estrella", "planeta", "universo", "montaña",
  "fuego", "agua", "aire", "tierra", "piedra", "oro", "plata", "cobre", "hierro",
  "auto", "bicicleta", "carretera", "puente", "edificio", "hospital", "colegio",
  "universidad", "oficina", "restaurante", "mercado", "tienda", "cine", "teatro",
  "televisión", "radio", "internet", "videojuego", "música", "película", "foto",
  "pintura", "escultura", "poesía", "historia", "matemáticas", "ciencia", "biología",
  "química", "física", "geografía", "idioma", "palabra", "voz", "silencio", "ruido",
  "fábrica", "trabajo", "dinero", "banco", "tiempo", "hora", "día", "noche",
  "semana", "mes", "año", "siglo", "memoria", "pensamiento", "idea", "sueño"
];

// 🔹 Genera un array con `cantidad` de palabras random (repetidas o no)
export const generarPalabras = (cantidad) => {
  const palabras = [];
  for (let i = 0; i < cantidad; i++) {
    const palabra = palabrasBase[Math.floor(Math.random() * palabrasBase.length)];
    palabras.push(palabra);
  }
  return palabras;
};

// 🔹 Selecciona `cantidad` de palabras distintas de un array dado
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


// funcion que elimina la palabra completada de la lista del jugador que la responde
// y devuelve la palabra eliminada para añadirla al resto
// 🔹 CALCULA LAS PALABRAS RESTANTES Y AÑADE A LOS DEMÁS SI SE CUMPLE EL UMBRAL
export const calcularPalabrasRestantes = (rooms, roomId, playerId, wordId, threshold = 3, completedWords) => {
  const room = getRoom(roomId);
  if (!room) return;
// console.log(`Calculando palabras restantes para ${jugador.name || playerId} en sala ${roomId}`);
  const jugador = room.players.find(p => p.id === playerId);
  if (!jugador) return;

  const copia = [...jugador.words];

  console.log(`Calculando palabras restantes para ${jugador.name || playerId} en sala ${roomId}`);
  // ✅ Eliminar palabra completada
  if (wordId >= 0 && wordId < copia.length) {
    copia.splice(wordId, 1);
  }

  // ✅ Actualizar datos del jugador
  jugador.words = copia;
  jugador.completedWords = completedWords;
    console.log(completedWords);

    // ⚡ Si alcanza múltiplo del threshold → enviar palabra a los demás
    if (completedWords % threshold === 0) {
      console.log(
        `⚡ ${jugador.name || playerId} ha completado ${jugador.completedWords} palabras — enviando "${completedWords}" a los demás`
      );
      añadirPalabraCompletada(rooms, roomId, playerId, completedWords);
    }
};





// FUNCION QUE AÑADE LA PALABRA  QUE COMPLETA UN JUGADOR 
// AL RESTO DE JUGADORES
export const añadirPalabraCompletada = (rooms, roomId, playerId, palabraEliminada) => {
  const room = rooms[roomId];
  if (!room) return;

  // Añadir la palabra completada al resto de jugadores
  room.players.forEach(p => {
    if (p.id !== playerId) {
      p.words.push(palabraEliminada);
    }
  });
};