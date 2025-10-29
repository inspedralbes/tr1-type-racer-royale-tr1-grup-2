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

export const calcularPalabrasRestantes = (initialWords, wordId) => {
  // Hacemos una copia para no mutar el array original
  const copia = [...initialWords];

  // Validamos que el índice exista
  if (wordId >= 0 && wordId < copia.length) {
    copia.splice(wordId, 1); // eliminamos 1 elemento en la posición wordId
  }

  return copia;
};