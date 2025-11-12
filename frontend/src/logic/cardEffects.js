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

export function aplicarSlowEnemy(duracion = 5000) { // duración por defecto 5s
  slowEnemyActivo.value = true;
  console.log(`🐢 Slow Enemy activado por ${duracion / 1000} segundos`);

  setTimeout(() => {
    slowEnemyActivo.value = false;
    console.log("⌨️ Teclado reactivado tras slow_enemy");
  }, duracion);
}

export function activarEscudo(duracion = 10000) {
  escudoActivo.value = true;
  setTimeout(() => { escudoActivo.value = false; }, duracion);
}
