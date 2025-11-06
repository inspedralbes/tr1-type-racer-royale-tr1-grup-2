// logic/powerUpManager.js

const powerUps = [
  { tipo: "bloqueo", descripcion: "Bloquea a otro jugador por 5 segundos" },
  { tipo: "curar", descripcion: "Recupera una palabra fallida" },
  { tipo: "doble", descripcion: "Duplica tus puntos por 10 segundos" },
  { tipo: "robo", descripcion: "Roba una palabra a otro jugador" },
];

export const obtenerPowerUpAleatorio = () => {
  const index = Math.floor(Math.random() * powerUps.length);
  return powerUps[index];
};
