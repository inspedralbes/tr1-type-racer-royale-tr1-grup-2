// utils/wordsManager.js

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
export const calcularPalabrasRestantes = (rooms, roomId, playerId, wordId) => {
  const room = rooms[roomId];
  if (!room) return null;

  const jugador = room.players.find(p => p.id === playerId);
  if (!jugador) return null;

  const copia = [...jugador.words];
  let completedWord = null;

  if (wordId >= 0 && wordId < copia.length) {
    completedWord = copia[wordId];
    copia.splice(wordId, 1);
  }

  // 🔹 Actualizamos el jugador directamente en rooms
  jugador.words = copia;
  if (completedWord) {
    jugador.completedWords.push(completedWord);
  }

  // 🔹 Devolvemos la palabra eliminada para que el servidor la use
  return completedWord;
};





// FUNCION QUE AÑADE LA PALABRA  QUE COMPLETA UN JUGADOR 
// AL RESTO DE JUGADORES
export const añadirPalabraCompletada = (rooms, roomId, playerId, palabraEliminada) => {
  const room = rooms[roomId];
  if (!room) return;

  // 1️⃣ Buscar al jugador que la completó
  const jugador = room.players.find(p => p.id === playerId);
  if (!jugador) return;

  // 2️⃣ Añadir la palabra completada al jugador que la escribió
  jugador.completedWords.push(palabraEliminada);

  // 3️⃣ Añadir la misma palabra al resto de jugadores
  room.players.forEach(p => {
    if (p.id !== playerId) {
      p.words.push(palabraEliminada);
    }
  });
};
