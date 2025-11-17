import { ref } from "vue";

export const efectoUpsideDownActivo = ref(false);
export const slowEnemyActivo = ref(false);
export const escudoActivo = ref(false);

//
//// FUNCIONES DE LOS EFECTOS DE LOS POWERUPS QUE PROVOCARAN A LA GENTE
//



// FUNCION QUE PONDRA LAS PALABRAS DE ARRIBA PARA ABAJO
export function aplicarUpsideDown(duracion = 3000) {
  efectoUpsideDownActivo.value = true;
  console.log("mundo al reves");
  setTimeout(() => {
    efectoUpsideDownActivo.value = false;
  }, duracion);
}


// FUNCION QUE APLICA A LOS ENEMIGOS EL BLOQUEO DEL TECLADO
export function aplicarSlowEnemy(duracion = 5000) {
  slowEnemyActivo.value = true;
  console.log(`🐢 Slow Enemy activado por ${duracion / 1000} segundos`);

  setTimeout(() => {
    slowEnemyActivo.value = false;
    console.log("⌨️ Teclado reactivado tras slow_enemy");
  }, duracion);
}



// FUNCION QUE ACTIVA LA INMUNIDAD
export function activarEscudo(duracion = 5000) {
  escudoActivo.value = true;
  console.log("escudo activo");
  setTimeout(() => {
    console.log("contador false");
    escudoActivo.value = false;
  }, duracion);
}
