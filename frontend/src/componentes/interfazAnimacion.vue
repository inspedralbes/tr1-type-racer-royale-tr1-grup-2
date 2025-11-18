<script setup>
import { ref, onMounted, onUnmounted, markRaw } from "vue";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const URL_MODELO = "/assets/animacion-entrada.glb";

// --- CONFIGURACIÓN DE ANIMACIÓN PERSONALIZADA ---
const DESPLAZAMIENTO_Z = -3.0;
const ANIMACIONES_PERMITIDAS = ["Action", "Action.001", "Action.002"];

// --- REFERENCIAS DE VUE Y OBJETOS PROTEGIDOS ---
const refContenedor = ref(null);
const refEscena = ref(null);
const refCamara = ref(null);
const refRenderizador = ref(null);
const refMezclador = ref(null);
const refGrupoModelo = ref(null);
let reloj;

// --- ESTADOS REACTIVOS (Controlan la UI) ---
const animacionesDisponibles = ref([]);
const estaListo = ref(false);
const estaReproduciendo = ref(false);

// Definición de evento para notificar al componente padre
const emit = defineEmits(["animationFinished", "animationDurationCalculated"]);

// -------------------------------------------------------------------
// FUNCIONES DE CONTROL DE ANIMACIÓN
// -------------------------------------------------------------------

//Función central que activa solo las animaciones permitidas simultáneamente.

const iniciarAnimacion = () => {
  if (!refMezclador.value || estaReproduciendo.value) {
    return;
  }

  const mezclador = refMezclador.value;

  mezclador.stopAllAction();
  estaReproduciendo.value = true;

  let duracionMaxima = 0;

  if (refGrupoModelo.value) {
    refGrupoModelo.value.position.set(0, 0, DESPLAZAMIENTO_Z);
    refGrupoModelo.value.rotation.set(0, 0, 0);
    refGrupoModelo.value.updateMatrix();
  }

  const animacionesFiltradas = animacionesDisponibles.value.filter((anim) =>
    ANIMACIONES_PERMITIDAS.includes(anim.nombre)
  );

  if (animacionesFiltradas.length === 0) {
    console.warn(
      "ADVERTENCIA: No se encontró ninguna de las animaciones permitidas (Action, Action.001, Action.002)."
    );
    estaReproduciendo.value = false;
    return;
  }

  animacionesFiltradas.forEach((anim) => {
    const accion = mezclador.clipAction(anim.clip);

    accion.setLoop(THREE.LoopOnce);
    accion.clampWhenFinished = true;

    let duracionActual = anim.clip.duration;
    accion.fadeIn(0);
    accion.reset();
    accion.play();

    if (duracionActual > duracionMaxima) {
      duracionMaxima = duracionActual;
    }
  });

  // Configurar un temporizador para desactivar el estado 'estaReproduciendo'
  const duracionMs = duracionMaxima * 1000;

  // Emitir la duración de la animación total para la aparición anticipada de la UI 2D
  emit("animationDurationCalculated", duracionMaxima);

  setTimeout(() => {
    estaReproduciendo.value = false;
    // Emitir evento para que el componente padre sepa que el 3D terminó
    emit("animationFinished", true);
  }, duracionMs + 100);
};

// -------------------------------------------------------------------
// FUNCIONES BÁSICAS DE THREE.JS
// -------------------------------------------------------------------

const manejarRedimensionamiento = () => {
  if (refRenderizador.value && refCamara.value) {
    const ancho = window.innerWidth;
    const alto = window.innerHeight;

    refCamara.value.aspect = ancho / alto;
    refCamara.value.updateProjectionMatrix();

    refRenderizador.value.setSize(ancho, alto);
    refRenderizador.value.setPixelRatio(window.devicePixelRatio);
  }
};

const animar = () => {
  requestAnimationFrame(animar);

  const delta = reloj.getDelta();

  if (refMezclador.value) {
    refMezclador.value.update(delta);
  }

  if (refRenderizador.value && refEscena.value && refCamara.value) {
    refRenderizador.value.render(refEscena.value, refCamara.value);
  }
};

// -------------------------------------------------------------------
// VUE LIFECYCLE HOOKS (Inicialización)
// -------------------------------------------------------------------

onMounted(() => {
  reloj = markRaw(new THREE.Clock());

  const ancho = window.innerWidth;
  const alto = window.innerHeight;

  // --- SETUP DE LA ESCENA ---
  const escena = new THREE.Scene();
  escena.background = null;
  refEscena.value = markRaw(escena);

  // --- SETUP INICIAL DE CÁMARA ---
  const camara = new THREE.PerspectiveCamera(45, ancho / alto, 0.1, 1000);
  camara.position.set(0, 5, 10);
  refCamara.value = markRaw(camara);

  // --- SETUP DEL RENDERIZADOR ---
  const renderizador = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  renderizador.setSize(ancho, alto);
  renderizador.shadowMap.enabled = true;
  renderizador.shadowMap.type = THREE.PCFSoftShadowMap;
  refRenderizador.value = markRaw(renderizador);

  if (refContenedor.value) {
    refContenedor.value.appendChild(renderizador.domElement);
  }

  // --- LUCES ---
  escena.add(new THREE.AmbientLight(0x443300, 1));

  const luzDireccional = new THREE.DirectionalLight(0xffb000, 1.5);
  luzDireccional.position.set(0, 10, 0);
  luzDireccional.castShadow = true;
  escena.add(luzDireccional);

  escena.fog = new THREE.Fog(0x111111, 8, 30);

  // --- CARGA DEL MODELO GLB ---
  const cargador = new GLTFLoader();
  cargador.load(
    URL_MODELO,
    (gltf) => {
      escena.add(gltf.scene);
      refGrupoModelo.value = gltf.scene;

      // Activar sombras en los meshes del modelo
      gltf.scene.traverse((node) => {
        if (node.isMesh) {
          node.castShadow = true;
          node.receiveShadow = false;
        }
      });

      refGrupoModelo.value.position.z = DESPLAZAMIENTO_Z;

      // USAR LA CÁMARA DE BLENDER SI EXISTE
      const camaraGltf = gltf.cameras.find((cam) => cam.parent);
      if (camaraGltf) {
        refCamara.value = camaraGltf;
        refCamara.value.aspect = ancho / alto;
        refCamara.value.updateProjectionMatrix();
      }

      // --- MEZCLADOR DE ANIMACIONES ---
      const mezclador = new THREE.AnimationMixer(gltf.scene);
      refMezclador.value = markRaw(mezclador);

      // --- LLENADO DE ANIMACIONES SIN USAR MAP() ---
      animacionesDisponibles.value = [];

      if (gltf.animations && gltf.animations.length > 0) {
        for (let i = 0; i < gltf.animations.length; i++) {
          const clip = gltf.animations[i];

          animacionesDisponibles.value.push({
            nombre: clip.name || `Action.${i.toString().padStart(3, "0")}`,
            clip: markRaw(clip),
          });
        }
      }

      // PRECOMPILAR SHADERS
      try {
        refRenderizador.value.compile(escena, refCamara.value);
        console.log("Compilación de shaders completada.");
      } catch (e) {
        console.error("Error durante la compilación de shaders:", e);
      }

      estaListo.value = true;

      iniciarAnimacion(); // ⚡ lanza animación inicial
    },
    (xhr) => {
      console.log(
        `Cargando modelo: ${((xhr.loaded / xhr.total) * 100).toFixed(0)}%`
      );
    },
    (error) => {
      console.error("ERROR AL CARGAR GLB:", error);
    }
  );

  // --- INICIAR LOOP Y RESIZE ---
  animar();
  window.addEventListener("resize", manejarRedimensionamiento);
});

onUnmounted(() => {
  window.removeEventListener("resize", manejarRedimensionamiento);
});
</script>

<template>
  <div class="main-container">
    <div ref="refContenedor" class="canvas-container"></div>
  </div>
</template>

<style scoped>
.main-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  font-family: "Inter", sans-serif;
}

.canvas-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
  box-shadow: inset 0 0 100px rgba(50, 0, 0, 0.95);
}
</style>
