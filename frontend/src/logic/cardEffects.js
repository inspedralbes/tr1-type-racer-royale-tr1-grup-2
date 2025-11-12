import { ref } from "vue";

// Efectos reactivos
export const efectoUpsideDownActivo = ref(false);
export const slowEnemyActivo = ref(false);
export const escudoActivo = ref(false);

// Funciones de efectos
export function aplicarUpsideDown(duracion = 3000) {
  efectoUpsideDownActivo.value = true;
  setTimeout(() => { efectoUpsideDownActivo.value = false; }, duracion);
}

export function aplicarSlowEnemy(duracion = 2000) {
  slowEnemyActivo.value = true;
  setTimeout(() => { slowEnemyActivo.value = false; }, duracion);
}

export function activarEscudo(duracion = 10000) {
  escudoActivo.value = true;
  setTimeout(() => { escudoActivo.value = false; }, duracion);
}
