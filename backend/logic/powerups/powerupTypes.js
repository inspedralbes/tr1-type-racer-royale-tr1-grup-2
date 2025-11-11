// backend/game/powerups/powerupTypes.js

export const suits = {
  DIAMANTES: "diamantes",
  CORAZONES: "corazones",
  PICAS: "picas",
  TREBOLES: "tréboles",
};

// Cada palo define un tipo de efecto base
export const baseEffects = {
  [suits.DIAMANTES]: {
    nombre: "Ataque simultáneo",
    efecto: "word_upside_down",
    descripcion: "Hace que el resto de jugadores tengan las siguientes palabras al revés .",
  },
  [suits.CORAZONES]: {
    nombre: "Escudo temporal",
    efecto: "shield",
    descripcion: "Te protege de los efectos de otros jugadores.",
  },
  [suits.PICAS]: {
    nombre: "Castigo de velocidad",
    efecto: "slow_enemy",
    descripcion: "Te impide escribir durante unos segundos.",
  },
  [suits.TREBOLES]: {
    nombre: "Manipulación del juego",
    efecto: "reset_game",
    descripcion: "El juego se reinicia. Todos los jugadores comienzan desde el principio.",
  },
};
