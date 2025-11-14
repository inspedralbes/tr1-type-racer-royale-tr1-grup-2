// utils/wordsManager.js
import { count } from "console";
import { getRoom } from "./roomsManager.js";

import fs from "fs/promises";

const apiUrlBase = "https://random-word-api.herokuapp.com/word";

export async function obtenerPalabras(cantidad = 10) {

  const apiUrl = `${apiUrlBase}?number=${cantidad}&lang=es`;

  // Función para controlar timeout
  const fetchConTimeout = (url, ms) =>
    Promise.race([
      fetch(url),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms))
    ]);

  try {
    const res = await fetchConTimeout(apiUrl, 2000); // espera máximo 3 segundos
    if (!res.ok) throw new Error("Error en la API");

    let palabrasAPI = await res.json();
    console.log("✅ Palabras obtenidas desde API:", palabrasAPI);

    // Filtrar solo palabras individuales (sin espacios)
    palabrasAPI = palabrasAPI
      .filter(p => !p.includes(" "))
      .map(p => p.toLowerCase());

    // Si hay menos palabras que la cantidad pedida, completar con locales
    if (palabrasAPI.length < cantidad) {
      const data = await fs.readFile("./logic/palabras.json", "utf8");
      const palabrasLocales = JSON.parse(data);
      palabrasAPI = palabrasAPI
        .concat(palabrasLocales)
        .slice(0, cantidad);
    }

    return palabrasAPI;
    
  } catch (err) {
    console.warn("⚠️ No se pudieron obtener palabras de la API:", err.message);
    console.log("🔁 Usando palabras locales desde JSON...");

    // Lee el JSON local (asegúrate de que tenga un array de palabras)
    const data = await fs.readFile("./logic/palabras.json", "utf8");
    const palabrasLocales = JSON.parse(data);

    return seleccionarRandom(palabrasLocales, cantidad); 
  }
}



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

// 🔹 Función que elimina la palabra completada de la lista del jugador que la responde
// y devuelve la palabra eliminada para añadirla al resto
export const calcularPalabrasRestantes = (rooms, roomId, playerId, wordId, threshold = 3, completedWords) => {
  const room = getRoom(roomId);
  if (!room) return;
  const jugador = room.players.find(p => p.playerId === playerId);
  console.log("🟢 PRECAMBIO -- room.players:", room.players);
  if (!jugador) return;

  const copia = [...jugador.words];
  console.log(`Calculando palabras restantes para ${jugador.name || playerId} en sala ${roomId}`);

  const palabraCompletada = wordId >= 0 && wordId < copia.length ? copia[wordId] : null;

  // ✅ Eliminar palabra completada
  if (wordId >= 0 && wordId < copia.length) {
    copia.splice(wordId, 1);
  }

  // ✅ Actualizar datos del jugador
  jugador.words = copia;
  jugador.completedWords = completedWords;
  console.log(completedWords);
  console.log("🟢 POSTCAMBIO -- room.players:", room.players);

  // ⚡ Si alcanza múltiplo del threshold → enviar palabra a los demás
  if (completedWords % threshold === 0) {
    console.log(
      `⚡ ${jugador.name || playerId} ha completado ${jugador.completedWords} palabras — enviando "${completedWords}" a los demás`
    );
    añadirPalabraCompletada(rooms, roomId, playerId, palabraCompletada);
  }
};

// 🔹 Función que añade la palabra completada al resto de jugadores
export const añadirPalabraCompletada = (rooms, roomId, playerId, palabraEliminada) => {
  const room = rooms[roomId];
  if (!room) return;

  room.players.forEach(p => {
    if (p.playerId !== playerId) {
      p.words.push(palabraEliminada);
    }
  });
};

// 🔹 Array de palabras especiales para powerups
// export const palabrasPowerup = [
//   "desafortunadamente",
//   "incomprensible",
//   "extraordinario",
//   "electrodoméstico",
//   "contemporáneo",
//   "trascendental",
//   "ininteligible",
//   "paralelepípedo",
//   "hipopótamo",
//   "otorrinolaringólogo"
// ];

export const palabrasPowerup = [
  "abismo", "acantilado", "albergue", "almácigo", "antorcha", "apogeo", "arcano", "atolón",
  "bastión", "brújula", "caballete", "calzada", "camafeo", "candil", "cántico", "caparazón",
  "caverna", "cenit", "cetro", "ciruela", "cobijo", "cometa", "conjuro", "coral", "cráter",
  "crepúsculo", "débil", "desván", "diáfano", "dócil", "efímero", "élixir", "emanación",
  "enigma", "ensueño", "época", "espectro", "estela", "estigma", "fábula", "fénix", "fragor",
  "galerna", "glaciar", "golfo", "hélice", "horizonte", "ímpetu", "incógnita", "invernadero",
  "iris", "jaula", "jeroglífico", "laberinto", "lánguido", "lienzo", "lucero", "luminaria",
  "malecón", "mástil", "mazmorra", "mirador", "mosaico", "núcleo", "ocaso", "océano",
  "oquedad", "oráculo", "palimpsesto", "parapeto", "parque", "penumbra", "pergamino",
  "piélago", "plácido", "poliedro", "portón", "quimera", "rastro", "reverberar", "senda",
  "sepulcro", "silueta", "sílex", "solsticio", "sótano", "tormenta", "trébol", "umbráculo",
  "vástago", "vereda", "vértice", "vórtice", "zenit", "zócalo"
];


export const generarPalabraPowerup = () => {
  const index = Math.floor(Math.random() * palabrasPowerup.length);
  return palabrasPowerup[index];
};
