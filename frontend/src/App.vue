<template>
  <div class="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
    <h1 class="text-3xl font-bold mb-6">🧠 Prueba de Endpoint /api/words</h1>

    <div class="flex items-center gap-4 mb-4">
      <input
        v-model.number="count"
        type="number"
        min="1"
        max="600"
        class="p-2 rounded bg-gray-800 border border-gray-700 text-white w-24 text-center"
      />
      <button
        @click="getWords"
        class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold"
      >
        Obtener Palabras
      </button>
    </div>

    <div v-if="loading" class="text-gray-400 mt-4">Cargando...</div>
    <p v-if="error" class="text-red-400 mt-4">{{ error }}</p>

    <ul v-if="words.length" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mt-6">
      <li
        v-for="(word, index) in words"
        :key="index"
        class="bg-gray-800 rounded p-2 text-center shadow-md"
      >
        {{ word }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from "vue";

const words = ref([]);
const count = ref(50);
const loading = ref(false);
const error = ref("");

const getWords = async () => {
  error.value = "";
  words.value = [];

  const res = await fetch(`/palabras/words?count=${count.value}`);

const data = await res.json();
words.value = data.data.initialWords;
};
</script>

<style>
body {
  font-family: "Inter", sans-serif;
}
</style>
