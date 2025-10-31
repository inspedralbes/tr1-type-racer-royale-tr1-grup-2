import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'url'   // <- asegúrate de usar 'url' y no 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
<<<<<<< HEAD
<<<<<<< HEAD
  plugins: [vue()],
=======
  plugins: [
    vue(),
    vueDevTools(),
  ],
=======
  plugins: [vue()],
>>>>>>> origin/f18.-Back-de-pantalla-de-joc
  server: {
    proxy: {
      "/palabras": "http://localhost:3000",
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
<<<<<<< HEAD
>>>>>>> origin/F18.ConexiónServer
=======
>>>>>>> origin/f18.-Back-de-pantalla-de-joc
})
