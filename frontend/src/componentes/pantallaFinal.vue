<template>
  <div
    class="final-screen"
    role="dialog"
    aria-labelledby="winner-title"
    aria-modal="true"
  >
    <div class="card">
      <h2 id="winner-title" class="title">¡PARTIDA TERMINADA!</h2>

      <p class="winner-name" v-if="winner">{{ winner }} ¡GANADOR! 🎉</p>
      <p class="winner-name placeholder" v-else>— Sin ganador claro —</p>

      <hr class="stats-separator" v-if="!loading && !error" />

      <div class="stats-area">
        <p v-if="loading">Cargando tus estadísticas...</p>
        <p v-else-if="error" class="error-message">
          ❌ Error al cargar estadísticas: {{ error }}
        </p>

        <div v-else>
          <h4 class="stats-title">Tus Resultados (ID: {{ playerId }})</h4>

          <div class="stats-section">
            <h5 class="stats-subtitle">
              ✅ Acertadas ({{ correctWords.length }})
            </h5>
            <div class="word-list">
              <span
                v-for="word in correctWords"
                :key="'c-' + word"
                class="word-tag word-correct"
              >
                {{ word }}
              </span>
            </div>
          </div>

          <div class="stats-section">
            <h5 class="stats-subtitle">
              ❌ Falladas ({{ failedWords.length }})
            </h5>
            <div class="word-list">
              <span
                v-for="word in failedWords"
                :key="'f-' + word"
                class="word-tag word-failed"
              >
                {{ word }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div class="controls">
        <button class="btn" @click="goHome" aria-label="Volver al inicio">
          Volver al inicio
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineEmits, defineProps, ref, onMounted } from "vue";
import communicationManager from "../services/communicationManager.js";
import { playerId, roomId } from "../logic/globalState.js"; // tu estado global

// --- PROPS & EMITS ---
const props = defineProps({
  winner: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["go-home"]);

// --- ESTADO DE ESTADÍSTICAS ---
const correctWords = ref([]);
const failedWords = ref([]);
const loading = ref(true);
const error = ref(null);

// --- LÓGICA DE FETCH ---
const fetchStats = async () => {
  loading.value = true;
  error.value = null;

  // Asegúrate de usar la URL base correcta de tu backend (si es localhost:3000)
  // Para desarrollo, usa la ruta relativa si el proxy está configurado,
  // o la ruta completa si es necesario (ej: 'http://localhost:3000/stats/')
  const url = `/stats/${playerId.value}`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      // Intenta leer el mensaje de error del servidor
      const errorData = await res.json();
      throw new Error(
        errorData.message || `Error ${res.status}: No se encontraron datos.`
      );
    }

    const data = await res.json();

    // Asignamos los arrays del objeto Usuario devuelto por la API
    correctWords.value = data.palabrasFrecuentes || [];
    failedWords.value = data.palabrasFalladas || [];
  } catch (err) {
    console.error("Fallo al obtener estadísticas:", err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

// --- CICLO DE VIDA ---
onMounted(() => {
  // Solo cargamos estadísticas si el jugador tiene una ID
  if (playerId.value) {
    fetchStats();
  } else {
    error.value =
      "No se pudo obtener la ID del jugador para cargar estadísticas.";
    loading.value = false;
  }
});

// --- FUNCIÓN DE NAVEGACIÓN ---
function goHome() {
  communicationManager.emit("leave_game", {
    playerId: playerId.value,
    roomId: roomId.value,
  });
  communicationManager.disconnect();
  emit("go-home");
}
</script>

<style scoped>
/* Estilos existentes */
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
  box-shadow: 0 10px 30px rgba(2, 6, 23, 0.4);
  text-align: center;
  min-width: 380px; /* Aumentado para las estadísticas */
  max-width: 90%;
  animation: pop 240ms ease;
}

/* Estilos de estadísticas AÑADIDOS */
.stats-separator {
  margin: 1.5rem 0 1rem 0;
  border: none;
  border-top: 1px solid #e0e7ff;
}

.stats-area {
  margin-bottom: 1.5rem;
  text-align: left;
}

.stats-title {
  font-size: 1rem;
  color: #334155;
  margin: 0 0 1rem 0;
  text-align: center;
  font-weight: 500;
}

.stats-subtitle {
  font-size: 0.9rem;
  margin: 0.8rem 0 0.5rem 0;
  color: #0b1220;
  font-weight: 600;
}

.word-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-height: 100px; /* Limita la altura para no hacer el modal gigante */
  overflow-y: auto;
  padding: 4px;
  border: 1px solid #f1f5f9;
  border-radius: 4px;
}

.word-tag {
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 4px;
  line-height: 1;
  word-break: break-word; /* Útil para palabras largas */
}

.word-correct {
  color: #16a34a; /* Tailwind green-600 */
  background-color: #f0fdf4; /* Tailwind green-50 */
}

.word-failed {
  color: #dc2626; /* Tailwind red-600 */
  background-color: #fef2f2; /* Tailwind red-50 */
}

.error-message {
  color: #dc2626;
  font-weight: 600;
  margin-top: 1rem;
}

/* Estilos de botones existentes */
.btn {
  background: #0f62fe;
  color: white;
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}

.btn:active {
  transform: translateY(1px);
}

.btn:focus {
  outline: 3px solid rgba(15, 98, 254, 0.18);
  outline-offset: 2px;
  box-shadow: 0 6px 18px rgba(15, 98, 254, 0.16);
}
</style>
