import { getRoom } from "./roomsManager.js";

import fs from "node:fs/promises";

const apiUrlBase = "https://random-word-api.herokuapp.com/word";


//
// FUNCION QUE OBTIENE LAS PALABRAS DE UNA API EXTERNA
//

export async function obtenerPalabras(cantidad = 30) {

  const apiUrl = `${apiUrlBase}?number=${cantidad}&lang=es`;

  const fetchConTimeout = (url, ms) =>
    Promise.race([
      fetch(url),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms))
    ]);

  try {
    const res = await fetchConTimeout(apiUrl, 2000); 
    if (!res.ok) throw new Error("Error en la API");

    let palabrasAPI = await res.json();
    console.log("✅ Palabras obtenidas desde API:", palabrasAPI);

    // FUNCION DE ARRAY - ALTO NIVEL
    // palabrasAPI = palabrasAPI
    //   .filter(p => !p.includes(" "))
    //   .map(p => p.toLowerCase());


    // SUSTITUTO DE .filter() Y .map()
    const nuevasPalabrasAPI = [];

    for (const palabra of palabrasAPI) {
      if (!palabra.includes(" ")) {
        nuevasPalabrasAPI.push(palabra.toLowerCase());
      }
    }

    palabrasAPI = nuevasPalabrasAPI;

    if (palabrasAPI.length < cantidad) {
      const data = await fs.readFile("./logic/palabras.json", "utf8");
      const palabrasLocales = JSON.parse(data);

      // FUNCIONES DE ARRAY - ALTO NIVEL 
      // palabrasAPI = palabrasAPI
      //   .concat(palabrasLocales)
      //   .slice(0, cantidad);

      // SUSTITUTO DE .concat() Y .slice()
      const nuevasPalabrasCompletas = [];

      for (let i = 0; i < palabrasAPI.length && nuevasPalabrasCompletas.length < cantidad; i++) {
        nuevasPalabrasCompletas.push(palabrasAPI[i]);
      }

      for (let i = 0; i < palabrasLocales.length && nuevasPalabrasCompletas.length < cantidad; i++) {
        nuevasPalabrasCompletas.push(palabrasLocales[i]);
      }

      palabrasAPI = nuevasPalabrasCompletas;
    }

    return palabrasAPI;
    
  } catch (err) {
    console.warn("⚠️ No se pudieron obtener palabras de la API:", err.message);
    console.log("🔁 Usando palabras locales desde JSON...");

    const data = await fs.readFile("./logic/palabras.json", "utf8");
    const palabrasLocales = JSON.parse(data);

    return seleccionarRandom(palabrasLocales, cantidad); 
  }
}


//
// FUNCION QUE SELECCIONA PALABRAS RANDOM 
//

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


//
// FUNCION QUE CALCULA LAS PALABRAS RESTANTES DE LOS JUGADORES 
//

export const calcularPalabrasRestantes = (rooms, roomId, playerId, wordId, completedWords, threshold = 3) => {
  const room = getRoom(roomId);
  if (!room) return;
  const jugador = room.players.find(p => p.playerId === playerId);
  console.log("🟢 PRECAMBIO -- room.players:", room.players);
  if (!jugador) return;

  const copia = [...jugador.words];
  console.log(`Calculando palabras restantes para ${jugador.name || playerId} en sala ${roomId}`);

  const palabraCompletada = wordId >= 0 && wordId < copia.length ? copia[wordId] : null;

  if (wordId >= 0 && wordId < copia.length) {
    copia.splice(wordId, 1);
  }

  jugador.words = copia;
  jugador.completedWords = completedWords;
  console.log(completedWords);
  console.log("🟢 POSTCAMBIO -- room.players:", room.players);

  if (completedWords % threshold === 0) {
    console.log(
      `⚡ ${jugador.name || playerId} ha completado ${jugador.completedWords} palabras — enviando "${completedWords}" a los demás`
    );
    añadirPalabraCompletada(rooms, roomId, playerId, palabraCompletada);
  }
};


//
// FUNCION QUE AÑADE LA PALABRA COMPLETADA AL RESTO DE JUGADORES
//

export const añadirPalabraCompletada = (rooms, roomId, playerId, palabraEliminada) => {
  const room = rooms[roomId];
  if (!room) return;

  // FUNCION DE ARRAY - ALTO NIVEL
  // room.players.forEach(p => {
  //   if (p.playerId !== playerId) {
  //     p.words.push(palabraEliminada);
  //   }
  // });

  // SUSTITUTO DE .forEach()
  for (const p of room.players) {
    if (p.playerId !== playerId) {
      p.words.push(palabraEliminada);
    }
  }

};


// CONSTANTE DE PALABRAS DE LOS POWERUPS
const palabrasPowerup = [
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


//
//  FUNCION QUE DEVUELVE LA PALBRA ASIGANDA AL POWERUP
//

export const generarPalabraPowerup = () => {
  const index = Math.floor(Math.random() * palabrasPowerup.length);
  return palabrasPowerup[index];
};
