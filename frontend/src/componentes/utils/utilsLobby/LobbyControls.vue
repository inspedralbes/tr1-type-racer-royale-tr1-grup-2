<script setup>
defineProps({
  isHost: {
    type: Boolean,
    required: true,
  },
  canStartGame: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["startGameRequested", "leave-lobby"]);
</script>

<template>
  <div class="keypad">
    <div class="soft-keys">
      <button class="call-red" @click="emit('leave-lobby')">⏻ Salir</button>
    </div>

    <div class="nav-pad">
      <div class="nav-ring">
        <button
          class="nav-ok"
          v-if="isHost"
          @click="emit('startGameRequested')"
          :disabled="!canStartGame"
          :class="{ 'can-start': canStartGame }"
        >
          Iniciar
        </button>

        <button v-else class="nav-ok is-waiting" disabled>OK</button>
      </div>
    </div>

    <div class="dummy-keys">
      <button>1</button>
      <button>2</button>
      <button>3</button>
    </div>
  </div>
</template>

<style scoped>

:root {
  --accent-red: #d32f2f;
  --accent-green: #4caf50;
}

.keypad button {
  background: linear-gradient(to bottom, #333333, #1a1a1a);
  border: 1px solid #0a0a0a;
  border-top-color: #666;
  color: white;
  border-radius: 6px;
  font-family: "Roboto", sans-serif;
  cursor: pointer;
  transition: all 0.1s ease-out;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.6),
    inset 0 2px 3px rgba(255, 255, 255, 0.1),
    inset 0 -2px 3px rgba(0, 0, 0, 0.4);
  transform: translateZ(0);
}

.keypad button:hover {
  background: linear-gradient(to bottom, #444444, #2a2a2a);
  box-shadow: 0 5px 8px rgba(0, 0, 0, 0.7),
    inset 0 2px 4px rgba(255, 255, 255, 0.15),
    inset 0 -2px 4px rgba(0, 0, 0, 0.5);
  transform: translateY(-1px) translateZ(1px);
}
.keypad button:active {
  background: linear-gradient(to bottom, #2a2a2a, #1a1a1a);
  transform: translateY(1.5px) translateZ(-1px);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.4), inset 0 0 5px rgba(0, 0, 0, 0.6);
}

/* Botón de Salir */
.soft-keys {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 15px;
}
.soft-keys button {
  width: 45%;
  padding: 8px 0;
  font-size: 1rem;
  font-weight: bold;
}
.soft-keys .call-red {
  background: linear-gradient(
    to bottom,
    #f44336,
    #d32f2f
  ); /* Usando var(--accent-red) puede fallar aquí, mejor valor directo */
  color: white;
  font-size: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.6),
    inset 0 2px 3px rgba(255, 255, 255, 0.2);
}
.soft-keys .call-red:hover {
  background: linear-gradient(to bottom, #ff5722, #e53935);
}
.soft-keys .call-red:active {
  background: linear-gradient(to bottom, #d32f2f, #c02828);
}

/* Pad de Navegación */
.nav-pad {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
}

.nav-ring {
  width: 85px;
  height: 85px;
  border: 4px solid #111;
  background: linear-gradient(to bottom, #4a4a4a, #222222);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.7), 0 3px 8px rgba(0, 0, 0, 0.5);
}

.nav-ok {
  width: 55px;
  height: 55px;
  border-radius: 50%;
  background: linear-gradient(to bottom, #555, #333);
  border: 2px solid #777;
  font-weight: bold;
  font-size: 1rem;
  color: #ddd;
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.5),
    inset 0 2px 2px rgba(255, 255, 255, 0.15);
}

/* Estado: Esperando (Jugador) */
.nav-ok.is-waiting {
  cursor: not-allowed;
  font-size: 1.6rem;
  line-height: 1;
  color: #aaa;
  background: linear-gradient(to bottom, #3a3a3a, #2a2a2a);
  border-color: #555;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
}

/* Estado: Listo para Iniciar (Host) */
.nav-ok.can-start {
  background: linear-gradient(
    to bottom,
    #8bc34a,
    #4caf50
  ); /* Usando var(--accent-green) */
  border-color: #aed581;
  color: white;
  font-size: 1.1rem;
  animation: pulse-green 1.5s infinite;
  box-shadow: 0 5px 8px rgba(0, 0, 0, 0.6),
    inset 0 2px 3px rgba(255, 255, 255, 0.2);
}

/* Estado: Deshabilitado */
.nav-ok:disabled {
  background: linear-gradient(to bottom, #333, #222);
  color: #666;
  cursor: not-allowed;
  opacity: 0.8;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
}

/* Botones decorativos (más sutiles) */
.dummy-keys {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  opacity: 0.8;
}
.dummy-keys button {
  height: 40px;
  font-size: 1.1rem;
  background: linear-gradient(to bottom, #2a2a2a, #111111);
  border-color: #000;
  border-top-color: #333;
  box-shadow: 0 3px 4px rgba(0, 0, 0, 0.5),
    inset 0 1px 2px rgba(255, 255, 255, 0.08);
}

/* Animación para el botón de Iniciar */
@keyframes pulse-green {
  0% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
  }
  70% {
    box-shadow: 0 0 0 12px rgba(76, 175, 80, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
  }
}
</style>
