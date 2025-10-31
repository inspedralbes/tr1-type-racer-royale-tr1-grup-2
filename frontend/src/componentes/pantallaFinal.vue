<template>
  <div class="final-screen" role="dialog" aria-labelledby="winner-title" aria-modal="true">
    <div class="card">
      <h2 id="winner-title" class="title">¡GANADOR!</h2>
      <p class="winner-name" v-if="winner">{{ winner }}</p>
      <p class="winner-name placeholder" v-else>— Sin nombre —</p>

      <div class="controls">
        <button class="btn" @click="goHome" aria-label="Volver al inicio">
          Volver al inicio
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineEmits, defineProps } from 'vue'


// Prop para recibir el nombre del ganador
const props = defineProps({
  winner: {
    type: String,
    default: ''
  }
})

// Evento que se emite cuando el usuario quiere volver al inicio
const emit = defineEmits(['go-home'])

function goHome() {
  emit('go-home')
}
</script>

<style scoped>
.final-screen {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(6, 10, 20, 0.6);
  backdrop-filter: blur(2px);
  z-index: 1000;
  padding: 1rem;
}

.card {
  background: white;
  color: #0b1220;
  padding: 2rem 2.5rem;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(2,6,23,0.4);
  text-align: center;
  min-width: 320px;
  max-width: 90%;
  animation: pop 240ms ease;
}

@keyframes pop {
  from { transform: translateY(8px) scale(0.98); opacity: 0; }
  to   { transform: translateY(0) scale(1); opacity: 1; }
}

.title {
  font-size: 1.25rem;
  letter-spacing: 0.08em;
  margin: 0 0 0.5rem 0;
  color: #0f1724;
}

.winner-name {
  font-size: 2rem;
  font-weight: 700;
  margin: 0.25rem 0 1.25rem 0;
  word-break: break-word;
}

.winner-name.placeholder {
  color: #9aa6b2;
  font-weight: 600;
  font-size: 1rem;
}

.controls {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.btn {
  background: #0f62fe;
  color: white;
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: transform .12s ease, box-shadow .12s ease;
}

.btn:active { transform: translateY(1px); }
.btn:focus { 
  outline: 3px solid rgba(15,98,254,0.18); 
  outline-offset: 2px; 
  box-shadow: 0 6px 18px rgba(15,98,254,0.16); 
}
</style>
