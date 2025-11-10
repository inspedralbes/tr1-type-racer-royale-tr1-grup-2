<template>
  <div class="slot-machine-container">
    <div class="machine-frame">
      <div class="ornate-border top-border"></div>
      <div class="ornate-border bottom-border"></div>

      <div class="slot-display">
        <div class="slot-reel">
          <span class="slot-symbol skull"> Aquí van las estadisticas</span>
        </div>
        <div class="slot-reel">
          <span class="slot-symbol ace-spade">Aquí van las estadisticas</span>
        </div>
        <div class="slot-reel">
          <span class="slot-symbol skull">Aquí van las estadisticas</span>
        </div>
      </div>

      <div class="machine-details">
        <h1>EL GANADOR ES:</h1>
        <span v-if="winner">{{ winner }}</span>
        <span class="winner-name placeholder" v-else>— Sin nombre —</span>
        <button class="btn" @click="goHome" aria-label="Volver al inicio">
          Volver al inicio
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineEmits, defineProps } from "vue";
import communicationManager from "../services/communicationManager";
import sound from "../../public/assets/sonido/sonidoAccion/playful-casino-slot-machine.mp3";
import sound1 from "../../public/assets/sonido/sonidoAccion/slot-machine-coin-payout.mp3";

const sonidoTragaperras = new Audio(sound);
const sonidoMonedas = new Audio(sound1);

// Prop para recibir el nombre del ganador
const props = defineProps({
  winner: {
    type: String,
    default: "",
  },
});

// Evento que se emite cuando el usuario quiere volver al inicio
const emit = defineEmits(["go-home"]);

function goHome() {
  emit("go-home");
}
</script>

<style>
.slot-machine-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  margin: 0;
  background-color: #222;
  font-family: "Times New Roman", serif;
  overflow: hidden;
}

.machine-frame {
  width: 80vw;
  height: 90vh;
  background-color: var(--gold-worn);
  border: 1.5vw solid var(--gold-old);
  border-radius: 2vw;
  box-shadow: inset 0 0 2vw rgba(0, 0, 0, 0.9), 0 0 3vw rgba(0, 0, 0, 0.6);
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}

.ornate-border {
  position: absolute;
  left: 2%;
  right: 2%;
  height: 6vh;
  background-color: var(--red-dirty);
  border: 0.3vw solid var(--gold-old);
  box-shadow: inset 0 0 1vh rgba(0, 0, 0, 0.9);
}

.top-border {
  top: 1.5vh;
  border-radius: 0.5vw 0.5vw 0 0;
}

.bottom-border {
  bottom: 18vh;
  border-radius: 0 0 0.5vw 0.5vw;
}

.slot-display {
  display: flex;
  justify-content: space-around;
  align-items: center;
  position: absolute;
  top: 10vh;
  left: 5%;
  right: 5%;
  height: 45vh;
  background-color: var(--black-deep);
  border: 0.5vw solid var(--gold-old);
  border-radius: 1vw;
  box-shadow: inset 0 0 2vw rgba(0, 0, 0, 1), 0 0 1vw rgba(255, 255, 255, 0.05);
  padding: 1vh 0.5vw;
}

.slot-reel {
  width: 30%;
  height: 40vh;
  background-color: var(--paper-old);
  border: 0.2vw solid #706a62;
  border-radius: 0.3vw;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  box-shadow: inset 0 0 0.5vw rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.slot-symbol {
  font-size: 8vh;
  color: #333;
  text-shadow: 0.1vh 0.1vh 0.2vh rgba(0, 0, 0, 0.7);
}

.machine-details {
  position: absolute;
  bottom: 2vh;
  left: 5%;
  right: 5%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2vh;
  background-color: var(--black-deep);
  border-radius: 1vw;
  border: 0.3vw solid var(--gold-old);
  box-shadow: 0 0.5vw 1vw rgba(0, 0, 0, 0.5);
}

.button {
  padding: 2vh 4vw;
  background-color: var(--red-dark);
  font-size: 2.5vh;
  border-radius: 0.5vw;
}

.lever-housing {
  position: absolute;
  right: -5vh;
  top: 50%;
  transform: translateY(-50%);
  width: 5vh;
  height: 15vh;
}

.lever {
  width: 3vh;
  height: 12vh;
  background-color: var(--gold-old);
  border-radius: 1.5vh;
}

.lever::before {
  content: "";
  position: absolute;
  top: -2vh;
  left: -1vh;
  width: 6vh;
  height: 6vh;
  background-color: var(--red-dark);
}

.machine-details h1 {
  color: #fff;
  font-size: 4vh;
  text-transform: uppercase;
  letter-spacing: 0.2vh;
  margin: 0;
  padding: 0;
  animation: neon-flicker 1.5s infinite alternate;
}

.machine-details span {
  color: #ffcc00;
  font-size: 5vh;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.3vh;
  margin-top: 1vh;
  animation: neon-flicker-gold 2s infinite alternate;
}

@keyframes neon-flicker {
  0% {
    text-shadow: 0 0 0.5vh #fff, 0 0 1vh #fff, 0 0 2vh #00f, 0 0 3vh #00f,
      0 0 4vh #00f, 0 0 5vh #00f;
    opacity: 1;
  }

  20% {
    opacity: 0.8;
  }

  40% {
    opacity: 1;
    text-shadow: 0 0 0.5vh #fff, 0 0 1vh #fff, 0 0 2vh #00f, 0 0 3vh #00f,
      0 0 4vh #00f, 0 0 5vh #00f;
  }

  60% {
    opacity: 0.6;
    text-shadow: none;
  }

  80% {
    opacity: 1;
    text-shadow: 0 0 0.5vh #fff, 0 0 1vh #fff, 0 0 2vh #00f, 0 0 3vh #00f,
      0 0 4vh #00f, 0 0 5vh #00f;
  }

  100% {
    text-shadow: 0 0 0.5vh #fff, 0 0 1vh #fff, 0 0 2vh #00f, 0 0 3vh #00f,
      0 0 4vh #00f, 0 0 5vh #00f;
    opacity: 1;
  }
}

@keyframes neon-flicker-gold {
  0% {
    text-shadow: 0 0 0.5vh #fff, 0 0 1vh #ffcc00, 0 0 2vh #ffaa00,
      0 0 3vh #ffaa00, 0 0 4vh #ffaa00, 0 0 5vh #ffaa00;
    opacity: 1;
  }

  25% {
    opacity: 0.7;
    text-shadow: none;
  }

  50% {
    opacity: 1;
    text-shadow: 0 0 0.5vh #fff, 0 0 1vh #ffcc00, 0 0 2vh #ffaa00,
      0 0 3vh #ffaa00, 0 0 4vh #ffaa00, 0 0 5vh #ffaa00;
  }

  75% {
    opacity: 0.9;
  }

  100% {
    text-shadow: 0 0 0.5vh #fff, 0 0 1vh #ffcc00, 0 0 2vh #ffaa00,
      0 0 3vh #ffaa00, 0 0 4vh #ffaa00, 0 0 5vh #ffaa00;
    opacity: 1;
  }
}

.machine-details {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.lever-housing {
  right: -8vh;
}
</style>
