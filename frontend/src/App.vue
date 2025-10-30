<script setup>
import { ref } from 'vue';
import InetrfazJuego from './componentes/interfazJuego.vue';
</script>

<template>
  <InetrfazJuego />
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
