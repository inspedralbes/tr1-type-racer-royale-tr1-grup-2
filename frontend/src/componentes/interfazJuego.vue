<script setup>

// 1. IMPORTACIONES
// · Core de Vue
import { ref, onMounted, onUnmounted, computed, nextTick, watch } from "vue";

// · Servicios y Lógica Global
import communicationManager from "../services/communicationManager.js";
import { playerName, playerId } from "../logic/globalState.js";
import { getApiUrl } from "../logic/getUrl.js";
import {
  aplicarUpsideDown,
  activarEscudo,
  escudoActivo,
  aplicarSlowEnemy,
  slowEnemyActivo,
} from "../logic/cardEffects.js";

// · Componentes Hijos
import AnimacionJuego from "./interfazAnimacion.vue";
import pantallaFinal from "./pantallaFinal.vue";

// · Assets de sonido
import soundCardDrop from "/assets/sonido/sonidoAccion/carddrop.mp3";
import soundKeyboard from "/assets/sonido/sonidoAccion/mech-keyboard.mp3";


// 2. PROPIEDADES Y EVENTOS
const emit = defineEmits(["juego-finalizado"]);

const props = defineProps({
  jugador: {
    type: Object,
    required: true,
  },
  room: {
    type: Object,
    required: true,
  },
});

const roomId = ref(props.room.roomId);



// 3. VARIABLES DE ESTADO 
// · UI Crupier / Ambiente / 3D
const crupierState = ref("normal");
const mensajeInput = ref("Os doy la bienvenida a todos."); 
const mensajePowerUp = ref(null);
const mostrarDialogoPowerUp = ref(false);
const show2DUI = ref(false);
const animationDuration = ref(0);
const comenzar = ref(false); 

// · Jugadores / Iconos
const otrosJugadores = ref([]);
const todosLosJugadores = ref([]);
const iconosDisponibles = [
  "/assets/img/userIconos/corazon.png",
  "/assets/img/userIconos/trebol.png",
  "/assets/img/userIconos/picas.png",
  "/assets/img/userIconos/rombos.png",
];
const jugadorIcono = ref("/assets/img/userIconos/corazon.png");

// · Estado de Juego Principal
const listaEntera = ref([]);
const palabraUser = ref("");
const completedWords = ref(0);
const palabrasBaseRestantes = ref(0);
const errorCount = ref(0);
const palabraInvalida = ref(false);

// · Las de el jugador.
const playerIdActual = playerId.value;
const playerNameActual = playerName.value;

// · Las de power-Ups
const powerupsDisponibles = ref([]);
const misPowerups = ref([]);
const currentPowerupWord = ref(null);
const cartaActual = ref(null);

// · Para la pantalla Final
const mostrarPantallaFinal = ref(false);
const ganador = ref("");

// · Las de diálogos y Audio Assets
const dialogTextEntrada = ref([
  "Os doy la bienvenida a todos.",
  "Si estáis aquí es porque ya sabeis lo que se viene.",
  "Muy bien, comencemos.",
]);
const dialogTextError = ref(["Eso no esta bien.", "Vuelve a intentarlo."]);
const dialogTextAcierto = ref(["Buen trabajo.", "Bien hecho."]);
const dialogTextPowerUp = ref([
  "Vamos a animar un poco las cosas, te parece?",
  "No la fastidies.",
  "Esta es tu única oportunidad",
]);
const audioDialogoEntrada = [
  "/assets/sonido/vozCrupier/frasesWelcome/mns1_w.mp3",
  "/assets/sonido/vozCrupier/frasesWelcome/mns2_w.mp3",
  "/assets/sonido/vozCrupier/frasesWelcome/mns3_w.mp3",
];
const audioDialogoErrores = [
  "/assets/sonido/vozCrupier/frasesError/mns1_e.mp3",
  "/assets/sonido/vozCrupier/frasesError/mns2_e.mp3",
];
const audioDialogoAciertos = [
  "/assets/sonido/vozCrupier/frasesAcierto/mns1_a.mp3",
  "/assets/sonido/vozCrupier/frasesAcierto/mns2_a.mp3",
];
const audioDialogoPowerUps = [
  "/assets/sonido/vozCrupier/frasesPowerUp/mns1_pu.mp3",
  "/assets/sonido/vozCrupier/frasesPowerUp/mns2_pu.mp3",
  "/assets/sonido/vozCrupier/frasesPowerUp/mns3_pu.mp3",
];
const audioPlayer = new Audio("/assets/sonido/Creepy_Casino.mp3");
const pasarLetra = new Audio(soundCardDrop);
const teclado = new Audio(soundKeyboard);


// 4. PROPIEDADES COMPUTADAS
//La palabra actual que el jugador debe escribir, priorizando la de Power-Up. 
const palabraObjetivo = computed(() => {
  if (currentPowerupWord.value) return currentPowerupWord.value;
  return listaEntera.value.length > 0 ? listaEntera.value[0] : "";
});


//Las palabras visibles en la UI (la de powerup o las 5 siguientes del juego).
const palabrasEnVista = computed(() => {
  if (currentPowerupWord.value) return [currentPowerupWord.value];
  if (!Array.isArray(listaEntera.value)) return [];
  return listaEntera.value.slice(0, 5);
});

// Determina el índice del primer carácter incorrecto.
const indicePrimerError = computed(() => calcularIndiceError());

//Indica si la palabra escrita hasta ahora es válida.
const esValido = computed(() => indicePrimerError.value === -1);

//Número de palabras restantes en la lista principal.
const palabrasRestantes = computed(() => listaEntera.value.length);

//Genera el array de letras para la UI con su estado (correcto, error, pendiente).
const letrasConEstado = computed(() => {
  const objetivo = palabraObjetivo.value || "";
  const escrita = palabraUser.value;
  const errorIndex = indicePrimerError.value;
  const letras = [];

  for (let i = 0; i < objetivo.length; i++) {
    const letraObjetivo = objetivo[i];
    const letraEscrita = escrita[i] || "";
    let estado = "pendiente";

    if (i < escrita.length) {
      if (i < errorIndex || errorIndex === -1) {
        estado = "correcto";
      } else {
        estado = "error";
      }
    }

    letras.push({
      id: i,
      objetivo: letraObjetivo,
      escrita: letraEscrita,
      estado: estado,
    });
  }

  // Letras extra después de la palabra objetivo
  for (let i = objetivo.length; i < escrita.length; i++) {
    letras.push({
      id: i,
      objetivo: "",
      escrita: escrita[i],
      estado: "extra",
    });
  }

  return letras;
});

//Computadas de Estética/UI
const showConfusedImage = computed(() => crupierState.value === "confundido");
const showPowerupImage = computed(() => crupierState.value === "powerup");
const reboteClass = computed(() => ({ "rebote-entrada": show2DUI.value }));
const slideInUpClass = computed(() => ({ "slide-in-up": comenzar.value }));



// 5. OBSERVADORES

watch(palabraUser, (newVal, oldVal) => {
  // Manejo de sonido de teclado
  if (newVal.length > oldVal.length && newVal.length > 0) {
    teclado.currentTime = 0;
    teclado.play().catch((error) => { });
  }

  // Manejo de estado de error e interacción del crupier cuando ocurra el error
  const indiceError = calcularIndiceError();
  const esValidaAhora = indiceError === -1;

  if (!esValidaAhora) {
    if (!palabraInvalida.value) {
      errorCount.value++;
      palabraInvalida.value = true;
      crupierState.value = "confundido";
      hablarCrupierError();
    }
  } else {
    if (palabraInvalida.value) {
      crupierState.value = "normal";
    }
    palabraInvalida.value = false;
  }
});

watch(show2DUI, (newValue) => {
  if (newValue) {
    empiezaJuego();
  }
});

watch(mostrarPantallaFinal, (nuevoValor) => {
  if (nuevoValor) {
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
    console.log("Música detenida al mostrar Pantalla Final");
  }
});


//6. FUNCIONES DE INTERACCIÓN DEL USUARIO


//Valida si cada carácter escrito coincide con el objetivo
function calcularIndiceError() {
  const palabraEscrita = palabraUser.value;
  const objetivo = palabraObjetivo.value;
  if (!objetivo) return -1;

  for (let i = 0; i < palabraEscrita.length; i++) {
    if (palabraEscrita[i] !== objetivo[i]) {
      return i;
    }
  }

  return -1;
}


//Maneja la pulsación de la tecla Espacio y las flechas para Power-Ups
function onInputKeyDown(event) {
  if (slowEnemyActivo.value) {
    event.preventDefault();
    console.warn("⏳ Teclado bloqueado por efecto slowEnemy");
    return;
  }

  // Como se activan tus powerUps
  if (event.key === "ArrowLeft") {
    usarPowerup(0);
    event.preventDefault();
    return;
  }
  if (event.key === "ArrowRight") {
    usarPowerup(1);
    event.preventDefault();
    return;
  }

  // Manejo de la tecla Espacio
  if (event.key === " " && palabraUser.value.length > 0) {
    event.preventDefault();

    if (currentPowerupWord.value) {
      // Valida si es una palabra de powerup o no y si es correcta
      if (palabraUser.value === currentPowerupWord.value) {
        completedWords.value++;
        currentPowerupWord.value = null;

        communicationManager.emit("claim_powerup", {
          data: {
            roomId: roomId.value,
            playerId: playerId.value,
            carta: cartaActual.value,
          },
        });
        console.log("Powerup reclamado:", cartaActual.value);
      } else {
        errorCount.value++;
        console.warn("Palabra de powerup incorrecta.");
      }
    }
    else if (palabraUser.value === palabraObjetivo.value) {
      // Ahora si la palabra de juego normal correcta
      completedWords.value++;
      palabrasBaseRestantes.value--;
      enviarPalabra(palabraUser.value);
      pasarLetra.currentTime = 0;
      pasarLetra.play().catch((error) => console.warn("Error sonido carddrop:", error));
      hablarCrupierAcierto();
    } else {
      // Si no, la palabra del juego normal es incorrecta
      errorCount.value++;
      console.warn("Palabra incorrecta. Errores:", errorCount.value);
      hablarCrupierError();
    }

    palabraUser.value = "";
  }
}


//Previene que el usuario pueda pegar texto
function onInputPaste(event) {
  event.preventDefault();
}


 //Emite el evento para usar un powerup
function usarPowerup(indice) {
  const carta = misPowerups.value[indice];
  if (!carta) return;

  communicationManager.emit("use_powerup", {
    data: {
      playerId: playerId.value,
      roomId: roomId.value,
      cartaId: carta.id,
      efecto: carta.efecto,
    },
  });

  if (carta.efecto === "shield") activarEscudo();

  misPowerups.value.splice(indice, 1);
  console.log("Powerup usado:", carta.nombre);
}



// 7. LÓGICA DE JUEGO Y COMUNICACIÓN

//Envia la palabra completada al servidor una vez el usuario la complete
function enviarPalabra(palabraCompletada) {
  const payload = {
    wordId: 0,
    word: palabraCompletada,
    completedWords: completedWords.value,
    errorCount: errorCount.value,
    playerId: playerId.value,
    roomId: roomId.value,
  };

  communicationManager.emit("word_typed", { data: payload });
  console.log("Datos enviados al servidor:", payload);
}


//Maneja el evento de actualización de palabras del jugador actual  y quien ha ganado
function onUpdatePlayerWords(msg) {
  const { playerId: jugador, remainingWords, status } = msg.data;

  if (jugador === playerId.value) {
    listaEntera.value = remainingWords;
    console.log("Palabras restantes actualizadas:", listaEntera.value);

    if (status === "finished") {
      ganador.value = playerNameActual;
      emit("juego-finalizado", ganador.value);
      mostrarPantallaFinal.value = true;
      audioPlayer.pause();
      audioPlayer.currentTime = 0;
      console.log(`Fin de juego para ${playerNameActual}.`);
    }
  }
}


//Maneja el evento de actualización del progreso de todos los jugadores
function onUpdateProgress(msg) {
  const { players } = msg.data;
  actualizarJugadores(players);

  const ganadorJugador = players.find((p) => p.status === "finished");
  if (ganadorJugador) {
    ganador.value = ganadorJugador.username;
    emit("juego-finalizado", ganador.value);
    mostrarPantallaFinal.value = true;
    console.log(`🎉 Partida terminada. Ganador: ${ganadorJugador.username}`);
  }
}

//Actualiza los arrays de `otrosJugadores` y `todosLosJugadores`.
function actualizarJugadores(players) {
  if (!Array.isArray(players)) return;

  otrosJugadores.value = [];
  todosLosJugadores.value = [];

  let tempId = 0;
  const idPropio = String(playerId.value);

  for (const p of players) {
    const idJugador = String(p.playerId);
    const icono = iconosDisponibles[tempId % iconosDisponibles.length];

    const jugadorData = {
      id: "temp_" + tempId,
      username: p.username || "Jugador",
      icono: icono,
      powerupsNum: p.powerupsNum || 0,
    };
    todosLosJugadores.value.push(jugadorData);

    if (idJugador === idPropio) {
      jugadorIcono.value = icono;
    } else {
      otrosJugadores.value.push({
        ...jugadorData,
        completedWords: p.completedWords || 0,
        status: p.status || "playing",
      });
    }

    tempId++;
  }
}


// 8. FUNCIONES DE AUDIO / UI DEL CRUPIER

//Inicia la reproducción de la música de fondo
function musica() {
  audioPlayer.volume = 0.05;
  audioPlayer.loop = true;

  audioPlayer
    .play()
    .then(() => console.log("Música de fondo iniciada."))
    .catch((error) => console.error("Error al reproducir el audio:", error));
}


//Muestra el diálogo de entrada, tanto el texto como iniciar el audio al mismo tiempo
function empiezaJuego() {
  for (let i = 0; i < dialogTextEntrada.value.length; i++) {
    setTimeout(() => {
      const linea = dialogTextEntrada.value[i];
      mensajeInput.value = linea;
      hablarCrupier(i);

      if (i === dialogTextEntrada.value.length - 1) {
        setTimeout(() => {
          comenzar.value = true;
        }, 2500);
      }
    }, i * 3000);
  }
}

//Reproduce una línea de audio del diálogo de entrada y se activa en la función anterior
function hablarCrupier(index) {
  const audioSrc = audioDialogoEntrada[index];
  if (!audioSrc) return;

  const voz = new Audio(audioSrc);
  voz.volume = 0.09;
  crupierState.value = "normal";
  voz.play().catch((e) => console.warn("No se pudo reproducir el audio:", e));
}


//Se encarga de cambiar el estatus del crupier para que cambie su imagen y reproduce el audio de error, luego vuelve a la 'normalidad'
function hablarCrupierError() {
  const index = Math.floor(Math.random() * dialogTextError.value.length);
  mensajeInput.value = dialogTextError.value[index];

  const audioSrc = audioDialogoErrores[index];
  if (!audioSrc) return;

  const voz = new Audio(audioSrc);
  voz.volume = 0.1;
  crupierState.value = "confundido";

  voz.play().catch((e) => console.warn("No se pudo reproducir voz error:", e));

  setTimeout(() => {
    crupierState.value = "normal";
  }, 2500);
}


//Como en el anterior, cambia el estatus para que muestre otra imagen y reproduce el audio, aunque en este caso se encarga de que este en 'normal'
function hablarCrupierAcierto() {
  const index = Math.floor(Math.random() * dialogTextAcierto.value.length);
  mensajeInput.value = dialogTextAcierto.value[index];

  const audioSrc = audioDialogoAciertos[index];
  if (!audioSrc) return;

  const voz = new Audio(audioSrc);
  voz.volume = 0.1;
  crupierState.value = "normal";

  voz.play().catch((e) => console.warn("No se pudo reproducir voz acierto:", e));
}


// 9.MANEJADORES DE EVENTO DE ANIMACIÓN 3D


//Captura la duración total de la animación 3D y programa la aparición de la UI del crupier
const handleAnimationDuration = (durationInSeconds) => {
  animationDuration.value = durationInSeconds;

  const delayBeforeEnd = 2; // Tiempo en segundos antes del final de la animación 3D
  const delayMs = Math.max(100, (durationInSeconds - delayBeforeEnd) * 1000);

  setTimeout(() => {
    show2DUI.value = true;
    nextTick(() => {
      console.log("Crupier y Diálogo 2D/UI de juego mostrados.");
    });
  }, delayMs);
};


//Se llama cuando el componente 3D emite 'animationFinished', el final real de la animación, no el que le he puesto para mostrar la UI de el crupier
const handleAnimationFinished = () => {
  console.log("Animación 3D oficialmente terminada. El juego comienza.");
};


// 9. OnMounted y UnMounted
onMounted(() => {
  communicationManager.connect();

  // · Fetch Inicial de Palabras
  const payload = {
    roomId: roomId.value,
    playerId: playerId.value,
    playerName: playerName.value,
    count: 10,
  };

  fetch(getApiUrl("/api/palabras/words"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then((res) =>
      res.ok ? res.json() : Promise.reject(`Error HTTP: ${res.status}`)
    )
    .then((data) => {
      listaEntera.value = data.data.initialWords;
      palabrasBaseRestantes.value = listaEntera.value.length;
    })
    .catch((err) => console.error("Error al obtener palabras:", err));

  // · Suscripción a Eventos de Socket
  communicationManager.on("update_player_words", onUpdatePlayerWords);
  communicationManager.on("update_progress", onUpdateProgress);

  // · Los powerUps que aparecen
  communicationManager.on("powerup_available", (msg) => {
    const { carta, palabra } = msg.data;
    currentPowerupWord.value = palabra;
    cartaActual.value = carta;
    powerupsDisponibles.value = [carta];

    mensajePowerUp.value = `${carta.nombre}: ${carta.descripcion}`;
    mostrarDialogoPowerUp.value = true;
    crupierState.value = "powerup";
    mensajeInput.value = mensajePowerUp.value;

    const index = Math.floor(Math.random() * audioDialogoPowerUps.length);
    const voz = new Audio(audioDialogoPowerUps[index]);
    voz.volume = 0.1;
    voz.play().catch((e) => console.warn("No se pudo reproducir voz powerup:", e));

    setTimeout(() => {
      mostrarDialogoPowerUp.value = false;
      crupierState.value = "normal";
    }, 5000);
    palabraUser.value = "";
  });

  // · Activación de el powerUp, es decir que se le ha aplicado el powerUp a ti mismo o a los demás
  communicationManager.on("powerup_applied", (msg) => {
    const { efecto, from } = msg.data;

    // · Como le activamos el powerUp del escudo al jugador, evita los atques de otros jugadores
    if (escudoActivo.value && from !== playerId.value) {
      console.log(`Escudo activo, ignorando efecto ${efecto} de ${from}`);
      return;
    }
    if (from === playerId.value && efecto !== "shield" && efecto !== "reset_game") {
      console.log(`Ignorando mi propio efecto ${efecto}`);
      return;
    }

    switch (efecto) {
      case "word_upside_down":
        aplicarUpsideDown();
        break;
      case "slow_enemy":
        aplicarSlowEnemy();
        break;
      case "shield":
        break;
      case "reset_game":
        break;
    }
    console.log(`Powerup ${efecto} activado por ${from}`);
  });

  // · El powerUp que resetea el juego por así decirlo, ya que reinicia todo, obteniendo nuevas palabras
  communicationManager.on("powerup_reset_words", (msg) => {
    const { from } = msg.data;
    console.log(`Powerup reset recibido de ${from}`);
    palabraUser.value = "";
    listaEntera.value = [];
    completedWords.value = 0;
    palabraInvalida.value = false;
    errorCount.value = 0;

    fetch(getApiUrl("/api/palabras/words"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) =>
        res.ok ? res.json() : Promise.reject(`Error HTTP: ${res.status}`)
      )
      .then((data) => {
        listaEntera.value = data.data.initialWords;
        palabrasBaseRestantes.value = listaEntera.value.length;
        console.log("Palabras reiniciadas.");
      })
      .catch((err) => console.error("❌ Error al reiniciar palabras:", err));
  });

  // · Esto es para cuando has conseguido un powerUp para ti
  communicationManager.on("powerup_spawned", (msg) => {
    const { carta, playerId: ganadorId, powerups } = msg.data;

    if (ganadorId === playerId.value) {
      if (misPowerups.value.length >= 2) {
        const eliminado = misPowerups.value.shift();
        console.log(`Se ha eliminado el powerup más antiguo:`, eliminado);
      }
      misPowerups.value.push(carta);
    }

    // Y si la has cogido tu u otro los values se vuelven null
    if (cartaActual.value && cartaActual.value.id === carta.id) {
      currentPowerupWord.value = null;
      cartaActual.value = null;
    }

    const nuevasPowerupsDisponibles = [];

    for (let i = 0; i < powerupsDisponibles.value.length; i++) {
      const cartaExistente = powerupsDisponibles.value[i];

      if (cartaExistente.id !== carta.id) {
        nuevasPowerupsDisponibles.push(cartaExistente);
      }
    }
    powerupsDisponibles.value = nuevasPowerupsDisponibles;

    console.log(`Jugador ${playerId.value} ha ganado la carta`, carta);
  });

  // · El que se encargaa de anunciar que una carta ha sido reclamada y que se haga lo otro
  communicationManager.on("powerup_claimed", (msg) => {
    const { carta } = msg.data;
    if (cartaActual.value && cartaActual.value.id === carta.id) {
      currentPowerupWord.value = null;
      cartaActual.value = null;
    }
  });
});

onUnmounted(() => {
  // · Le decimmos que cancele las siguientes 'ordenes' y las funcions
  communicationManager.off("update_player_words", onUpdatePlayerWords);
  communicationManager.off("update_progress", onUpdateProgress);
  communicationManager.off("powerup_claimed");
  communicationManager.off("powerup_available");
  communicationManager.off("powerup_spawned");
  communicationManager.off("powerup_reset_words");

  // · El usuario finalmente sale de la Sala
  communicationManager.emit("leave_room", { playerId: playerId.value, roomId: roomId.value });
});
</script>

<template>
  <pantallaFinal v-if="mostrarPantallaFinal" :winner="ganador" @go-home="mostrarPantallaFinal = false" />

  <!-- Audios -->
  <audio ref="keyPlayer" src="/public/assets/sonido/sonidoAccion/mech-keyboard.mp3"></audio>
  <audio src="/public/assets/sonido/sonidoAccion/carddrop.mp3"></audio>
  <button v-on:click="musica()" id="btn_music">
    <img src="/public/assets/img/iconos/musica.jpg" alt="" />
  </button>

  <!-- Lista que muestra usuarios alrededor -->

  <div v-if="comenzar" class="iconos-jugadores-container">
    <div v-for="(jugador, index) in otrosJugadores" :key="jugador.id" class="icono-jugador-item">
      <img :src="jugador.icono" alt="icono" class="icono-jugador-img" />
      <p class="icono-jugador-nombre">{{ jugador.username }}</p>
      <div class="player-stats-chip">
        <span>{{ jugador.completedWords }}</span>
      </div>
      <!-- Cartas de powerup -->
      <div class="powerups-mini">
        <img v-for="i in jugador.powerupsNum" :key="i" src="/assets/img/imgPowerUps/reversoCartas.png" alt="PowerUp"
          class="powerup-mini-card" />
      </div>
    </div>
  </div>
  <!-- Lista de palabras / Input / Estadisticas del usuario que esta jugando -->
  <div v-if="comenzar" class="bottom-ui-container" :class="slideInUpClass">
    <ul class="lista-palabras">
      <li v-for="(palabra, index) in palabrasEnVista" :key="index" :class="{
        'palabra-actual': index === 0,
        'upside-down': efectoUpsideDownActivo,
      }">
        <template v-if="index === 0">
          <span v-for="letra in letrasConEstado" :key="letra.id" :class="[
            'letra-item',
            {
              'letra-correcta': letra.estado === 'correcto',
              'letra-error': letra.estado === 'error' || letra.estado === 'extra',
              'letra-pendiente': letra.estado === 'pendiente',
              'letra-escrita': !!letra.escrita,
            }
          ]">
            {{ letra.escrita || letra.objetivo || ' ' }}
          </span>
        </template>

        <template v-else>
          <span class="restante">{{ palabra }}</span>
        </template>
      </li>
    </ul>

    <!-- Mis Power-Ups -->
    <div class="mis-powerups">
      <h3>Mis cartas</h3>
      <div class="cartas">
        <div v-for="carta in misPowerups" :key="carta.id" class="carta-container">
          <!-- Imagen base de la carta -->
          <div class="carta-imagen">
            <img src="/assets/img/imgPowerUps/carta_joker_oficial.png" alt="Carta Power-Up" />
          </div>
          <!-- Nombre que aparece al hacer hover -->
          <div class="carta-overlay">
            <span>{{ carta.nombre }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="input-stats-row">
      <div class="contenedor-texto">
        <input type="text" class="text-input" :class="{
          'input-error': !esValido && palabraUser.length > 0,
          'input-ok': esValido && palabraUser.length > 0,
        }" v-model="palabraUser" @keydown="onInputKeyDown" @paste="onInputPaste" :placeholder="palabraObjetivo
          ? `Escribe`
          : 'Cargando palabras...'
          " autofocus />
      </div>
      <div class="stats-right">
        <p class="icono-propio">
          <img :src="jugadorIcono" alt="icono propio" class="icono-jugador" />
          <span class="word-count">{{ playerNameActual }}</span>
        </p>
        <p class="">
          <img src="/public/assets/img/imgPowerUps/reina.png" alt="" />
          <span>{{ palabrasRestantes }}</span>
        </p>
        <p>
          <img src="/public/assets/img/iconos/ficha.png" alt="" />
          <span>{{ completedWords }}</span>
        </p>

        <p>
          <img src="/public/assets/img/iconos/calavera.jpg" alt="" />
          <span :class="{ 'error-count': errorCount > 0 }">{{
            errorCount
          }}</span>
        </p>
      </div>
    </div>
  </div>

  <!-- Animacion / Crupier / Dialogo Crupier -->

  <div class="game-background">
    <AnimacionJuego @animationFinished="handleAnimationFinished"
      @animationDurationCalculated="handleAnimationDuration" />

    <div id="contenedor-juego">
      <div id="crupier-entero" :class="reboteClass">
        <div id="crupier-normal" :style="{ display: crupierState === 'normal' ? 'flex' : 'none' }">
          <img src="/public/assets/img/crupier-normal_oficial.png" alt="Crupier Normal" />
        </div>

        <div id="crupier-confundido" :style="{ display: showConfusedImage ? 'flex' : 'none' }">
          <img src="/public/assets/img/crupier-confundido_oficial.png" alt="Crupier Confundido" />
        </div>

        <div id="crupier-carta" :style="{ display: showPowerupImage ? 'flex' : 'none' }">
          <img src="/public/assets/img/crupier-carta_oficial.png" alt="Crupier Carta" />
        </div>
      </div>

      <div class="input-dialog-container" :class="reboteClass" v-if="!comenzar || mostrarDialogoPowerUp">
        <div class="input__container">
          <div class="shadow__input"></div>
          <p v-if="mostrarDialogoPowerUp">{{ mensajePowerUp }}</p>
          <p v-else-if="mensajeInput">{{ mensajeInput }}</p>
        </div>
      </div>

      <!-- Input de el crupier para las cartas -->
    </div>
  </div>
</template>

<style scoped>
/* Fuentes */

@font-face {
  font-family: Font1;
  src: url(../../public/assets/fuente/Stranger\ back\ in\ the\ Night.ttf);
}

@font-face {
  font-family: Font2;
  src: url(../../public/assets/fuente/macabre/The\ Macabre.otf) format("opentype");
}

/* --- ESTILOS DE FONDO Y ESTRUCTURA --- */

.upside-down {
  transform: rotate(180deg);
  display: inline-block;
}

.game-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #050505;
  z-index: 0;
  font-family: "Inter", sans-serif;
}

/* Contenedor principal de la UI 2D (por encima del 3D) */
#contenedor-juego {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 2;
}

/* --- ESTILOS DE UI DE JUEGO (Lista de palabras / Input de el jugador / Estadisticas / Iconos ) --- */

.bottom-ui-container {
  position: fixed;
  bottom: 5vh;
  width: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 0;
  pointer-events: auto;
  z-index: 3;
  opacity: 0;
  transition: transform 0.8s cubic-bezier(0.23, 1, 0.32, 1),
    opacity 0.5s ease-out;
}

.bottom-ui-container.slide-in-up {
  transform: translateX(-50%) translateY(0);
  opacity: 1;
}

.bottom-ui-container img {
  width: 30px;
  margin-top: 5px;
}

.input-stats-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 900px;
  padding: 20px 30px;
  margin-top: 20px;
  box-sizing: border-box;
  border-radius: 12px;
  position: relative;
  z-index: 10;
  overflow: hidden;
  background: linear-gradient(to bottom,
      rgba(10, 0, 0, 0.9) 0%,
      rgba(20, 0, 0, 0.7) 70%,
      rgba(0, 0, 0, 0) 100%);

  border: 1px solid rgba(139, 90, 43, 0.4);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.7), 0 0 15px rgba(139, 90, 43, 0.3);
}

.input-stats-row::before {
  content: none;
}

.contenedor-texto {
  flex-grow: 1;
  display: flex;
  justify-content: flex-start;
  margin: 0;
}

.text-input {
  font-family: Font2;
  font-size: 40px;
  width: 350px;
  max-width: 350px;
  min-width: 250px;
  min-height: 30px;
  border-radius: 6px;
  text-align: center;
  border: 2px solid #8b5a2b;
  background-color: rgba(20, 5, 5, 0.9);
  color: #f0e68c;
  position: relative;
  z-index: 5;
  padding: 10px;
  box-shadow: inset 0 0 8px rgba(139, 90, 43, 0.6), 0 0 5px rgba(0, 0, 0, 0.5);
}

.input-error {
  border: 2px solid #ff4500 !important;
  color: #ffd700 !important;
  box-shadow: 0 0 8px rgba(255, 69, 0, 0.8), inset 0 0 8px rgba(255, 69, 0, 0.5);
}

.input-ok {
  border: 2px solid #32cd32 !important;
  box-shadow: 0 0 8px rgba(50, 205, 50, 0.6),
    inset 0 0 8px rgba(50, 205, 50, 0.4);
}

.stats-right {
  font-family: Font2;
  color: #f0e68c;
  font-size: 25px;
  white-space: nowrap;
  text-align: right;
  padding-left: 30px;
  text-shadow: 0 0 5px rgba(240, 230, 140, 0.3);
}

.stats-right p {
  margin: 5px 0;
}

.stats-right span {
  font-weight: bold;

}

.palabras-restantes {
  font-family: Font2;
  color: #f0e68c;
  font-size: 35px;
  margin-top: -50px;
  text-align: center;
  justify-content: center;
  display: flex;
  gap: 10px;
}

.palabras-restantes img {
  justify-content: center;
  width: 30px;
  height: 40px;
}

.error-count {
  color: #ff4500;
  font-weight: bold;
  text-shadow: 0 0 8px rgba(255, 69, 0, 0.5);
}

.word-count {
  color: #ff4500;
  font-weight: bold;
  text-shadow: 0 0 8px rgba(0, 255, 85, 0.5);
}

.lista-palabras {
  list-style: none;
  padding: 30px 40px;
  font-family: monospace;
  font-size: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 150px;
  min-height: 240px;
  color: #333333;
  text-shadow: none;
  background-image: url(../../public/assets/img/carta.jpg);
  background-size: cover;
  border: 3px;
  border-radius: 15px;
  box-shadow: 6px 6px 12px rgba(0, 0, 0, 0.45);
  text-align: center;
  justify-content: center;
  filter: drop-shadow(0 0 15px rgba(0, 0, 0, 0.9)) brightness(0.7) sepia(0.2) hue-rotate(340deg) saturate(1.5);
  z-index: 15;

  position: absolute;
  bottom: 30px;
  left: 60%;
  transform: translateX(-50%);
}

.powerup-word {
  color: #ddb100;
  font-weight: bold;
  animation: glowPulse 1.2s infinite alternate ease-in-out;
}

@keyframes glowPulse {
  from {
    text-shadow: 0 0 5px #ffcc00, 0 0 10px #ffaa00;
  }

  to {
    text-shadow: 0 0 20px #ffcc00, 0 0 40px #ffaa00;
  }
}

.lista-palabras li {
  /* Aplica solo a los <li> dentro de la lista */
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Base para cada elemento letra generado por v-for */
.letra-item {
  display: inline-block;
  white-space: pre;
  /* Permite mostrar espacios */
  min-width: 0.5em;
  /* Mínimo de ancho para asegurar el espaciado o fondo de error */
  text-align: center;
  color: #555555;
  /* Color por defecto (pendiente) */
  font-weight: normal;
}

/* Letras que ya fueron escritas (base de color más claro) */
.letra-item.letra-escrita {
  color: #ffffff;
  font-weight: bold;
  /* Base de sombra para que el texto resalte, similar a .palabra-actual anterior */
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.6);
}

/* Letras correctas (Verde) */
.letra-item.letra-correcta {
  color: #32cd32;
  text-shadow: 0 0 8px rgba(50, 205, 50, 0.5);
}

/* Letra incorrecta (error) o letras extra (extra) (Rojo) */
.letra-item.letra-error {
  color: #ff4500;
  /* Letra roja */
  background-color: rgba(255, 69, 0, 0.2);
  /* Fondo sutil rojo */
  border-radius: 3px;
  text-shadow: 0 0 8px rgba(255, 69, 0, 0.8);
}

/* --- AJUSTES DEL CRUPIER Y DIÁLOGO --- */

#crupier-entero {
  position: fixed;
  left: 50%;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  z-index: 4;
  width: 100%;
  height: 100%;
  overflow: hidden;
  opacity: 0;
  transform: translateX(-50%) translateY(70vh);
  transition: opacity 0.5s ease-out 0.1s,
    transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.1s;
}

#crupier-entero.rebote-entrada {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

#crupier-entero img {
  max-height: 70vh;
  filter: drop-shadow(0 0 15px rgba(0, 0, 0, 0.9)) brightness(0.5) sepia(0.5) hue-rotate(340deg) saturate(1.5);
}

#crupier-confundido img {
  max-height: 80vh;
  margin-top: -5vh;
  filter: drop-shadow(0 0 15px rgba(0, 0, 0, 0.9)) brightness(0.5) sepia(0.5) hue-rotate(340deg) saturate(1.5);
}

#crupier-normal,
#crupier-caarta,
#crupier-confundido {
  position: relative;
  height: 100%;
  width: 100%;
  justify-content: center;
}

.input-dialog-container {
  position: fixed;
  top: 25%;
  margin-left: 20%;
  z-index: 3;
  opacity: 0;
  transform: translateY(calc(-50% + 70vh));
  transition: opacity 0.5s ease-out 0.1s,
    transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.1s;
  pointer-events: auto;
}

.input-dialog-container.rebote-entrada {
  opacity: 1;
  transform: translateY(-50%);
}

.input__container {
  position: relative;
  background: #330000;
  padding: 10px;
  border: 4px solid #8b5a2b;
  max-width: 350px;
  box-shadow: 8px 8px 0 #000;
  pointer-events: auto;
  font-family: Font2;
  font-size: 30px;
  color: #f0e68c;
}

.shadow__input {
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  bottom: 0;
  z-index: -1;
  transform: translateZ(-50px);
  background: linear-gradient(45deg,
      rgba(0, 0, 0, 0.6) 0%,
      + rgba(0, 0, 0, 0.3) 100%);
  filter: blur(30px);
}

.input__container::before {
  content: "?XÇ#?";
  position: absolute;
  top: -15px;
  left: 10px;
  background: #8b5a2b;
  color: #000000;
  font-weight: bold;
  padding: 5px 10px;
  font-size: 20px;
  transform: translateZ(50px);
  z-index: 4;
  border: 2px solid #000000;
}

/* --- ESTILOS DE OTROS JUGADORES (Estadisticas / Iconos / Posiciones ) --- */

.player-container-exterior {
  position: fixed;
  bottom: 15vh;
  left: 50%;
  transform: translateX(-50%);
  width: 80vw;
  max-width: 1200px;
  height: 60vh;
  z-index: 3;
}

.other-player-stat {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 15px;
  border-radius: 15px;
  font-family: "Inter", sans-serif;
  color: #fff;
  transition: all 0.5s ease;
  width: 150px;
}

.player-name-chip {
  font-size: 14px;
  font-weight: bold;
  color: #d4af37;
  margin-bottom: 4px;
  text-shadow: 0 0 5px rgba(212, 175, 55, 0.5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.player-stats-chip span {
  font-size: 16px;
  font-weight: 600;
  color: #7fbf7f;
}

.player-pos-0 {
  top: 0%;
  left: 105%;
  transform: translate(-50%, -50%);
}

.player-pos-1 {
  top: 10%;
  left: 105%;
  transform: translate(-50%, -50%);
}

.player-pos-2 {
  top: 20%;
  left: 105%;
  transform: translate(-50%, -50%);
}

.player-pos-3 {
  top: 30%;
  left: 105%;
  transform: translate(-50%, -50%);
}

.other-player-stat {
  width: 140px;
  padding: 10px;
  font-size: 14px;
  text-align: center;
}

.iconos-jugadores-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 0;
  height: 0;
  z-index: 1000;
}

.icono-jugador-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transform-origin: bottom center;
}

.icono-jugador-item:nth-child(1) {
  position: absolute;
  transform: translate(-600px, 100px);
}

.icono-jugador-item:nth-child(2) {
  position: absolute;
  transform: translate(500px, 200px);
}

.icono-jugador-item:nth-child(3) {
  position: absolute;
  transform: translate(600px, 100px);
}

.icono-jugador-img {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  border: 2px solid #fff;
  animation: borde-palpitante 2s infinite;
}

.icono-jugador-nombre {
  margin-top: 6px;
  font-size: 14px;
  color: white;
  font-family: Font2;
}

.linea-diagonal,
.linea-diagonal2 {
  position: absolute;
  top: 31%;
  left: 78%;
  width: 150px;
  height: 2px;
  background-color: rgba(255, 255, 255, 0.548);
  z-index: 7;
  transform-origin: center;
}

.linea-diagonal {
  transform: translate(-50%, -50%) rotate(45deg);
}

.linea-diagonal2 {
  transform: translate(-50%, -50%) rotate(-45deg);
}

@keyframes borde-palpitante {
  0% {
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
  }

  50% {
    box-shadow: 0 0 25px rgba(255, 255, 255, 1);
  }

  100% {
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
  }
}

/* --- Musica o sonido de Juego --- */
#btn_music img {
  width: 30px;
  height: 30px;
}

#btn_music {
  position: fixed;
  top: 30px;
  right: 30px;
  width: 10px;
  height: 10px;
  border: none;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  cursor: pointer;
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

/* ESTILO POWERUPS CARTAS */
.powerups-disponibles {
  display: flex;
  left: -100px;
  text-align: center;
}

.powerups-disponibles {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-left: -700px;
}

.mis-powerups {
  text-align: center;
  margin-top: 20px;
  margin-left: -30%;
}

.mis-powerups h3 {
  font-family: Font2;
  font-size: 33px;
  color: #660000;
  text-shadow: 0 0 10px rgba(255, 187, 0, 0.5);
  margin-bottom: 12px;
}

.cartas {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
}

/* --- Cada carta --- */
.carta-container {
  position: relative;
  width: 120px;
  height: 180px;
  cursor: pointer;
  perspective: 1000px;
  transition: transform 0.3s ease;
}

.carta-container:hover {
  transform: translateY(-8px) scale(1.05);
}

.carta-imagen {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
}

.carta-imagen img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: 12px;
}

.carta-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 40%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.85), transparent);
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  opacity: 0;
  transform: translateY(40%);
  transition: all 0.4s ease;
  border-radius: 0 0 12px 12px;
  padding-bottom: 8px;
}

.carta-overlay span {
  font-size: 14px;
  font-weight: bold;
  letter-spacing: 0.5px;
  color: #ffd700;
  text-shadow: 0 0 6px rgba(255, 215, 0, 0.7);
}

.carta-container:hover .carta-overlay {
  opacity: 1;
  transform: translateY(0);
}

.powerups-mini {
  display: flex;
  justify-content: center;
  margin-top: 5px;
  gap: 2px;
}

.powerup-mini-card {
  width: 15px;
  height: 20px;
  border: 1px solid gold;
  border-radius: 2px;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
}
</style>
